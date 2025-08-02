import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
// Conditional imports to avoid loading vite in production

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", async () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // Use dynamic import for log function
      try {
        const logModule =
          process.env.NODE_ENV === "development"
            ? await import("./vite")
            : await import("./static");
        logModule.log(logLine);
      } catch (error) {
        // Fallback console.log if imports fail
        console.log(logLine);
      }
    }
  });

  next();
});

// Health check endpoint for Docker
app.get("/health", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ status: "healthy", timestamp: new Date().toISOString() });
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    try {
      const viteModule = await import("./vite");
      await viteModule.setupVite(app, server);
    } catch (error) {
      console.error("Failed to load Vite in development:", error);
      // Fallback to static serving
      const { serveStatic } = await import("./static");
      serveStatic(app);
    }
  } else {
    const { serveStatic } = await import("./static");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "3000", 10);
  server.listen(
    {
      port,
    },
    async () => {
      // Use dynamic import for log function
      try {
        const logModule =
          process.env.NODE_ENV === "development"
            ? await import("./vite")
            : await import("./static");
        logModule.log(`serving on port ${port}`);
      } catch (error) {
        // Fallback console.log if imports fail
        console.log(`serving on port ${port}`);
      }
    }
  );
})();
