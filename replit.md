# Classroom Seating Chart Builder

## Overview

This is a modern web application for creating classroom seating charts with drag-and-drop functionality. The app allows teachers to layout desks on a canvas, import student lists, set seating constraints, and generate optimized seating arrangements with PDF export capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 3, 2025
- Enhanced website SEO with comprehensive metadata including title, description, keywords, and Open Graph tags
- Added structured data (JSON-LD) for better search engine understanding and rich snippets
- Created professional favicon.svg with classroom desk design and blue theme
- Implemented web app manifest for PWA capabilities and mobile installation
- Added sitemap.xml and robots.txt for improved search engine crawling
- Configured browser compatibility files including browserconfig.xml for Windows tiles
- Updated canonical URLs and social media sharing metadata for better link previews

### August 2, 2025
- Completely redesigned PDF export system with professional layout and timestamped filenames
- Fixed PDF text rendering issues by optimizing canvas cloning and text styling in invisible clone
- Reduced PDF file size from 65MB to manageable size using JPEG compression and scale optimization
- Moved timestamp from header to footer with format "Generated using... - Generated on [date/time]"
- Eliminated visible font size flashing during export for professional user experience
- Implemented robust jsPDF library loading with multiple CDN fallbacks
- Enhanced desk text rendering in PDFs with proper sizing and spacing without affecting UI
- Fixed text clipping issue in PDF exports by removing overflow:hidden and setting proper text container layouts
- Added Docker containerization with multi-stage build for production deployment
- Implemented GitHub Actions workflow for automated Docker image builds and GHCR publishing
- Added health check endpoint for container monitoring and deployment verification
- Created comprehensive README.md with project overview, features, setup instructions, and usage guide
- Updated README.md to accurately reflect local storage usage instead of database, and added Replit development attribution

### January 26, 2025
- Fixed desk dragging functionality - desks now properly drag and snap to grid without jumping
- Resolved button visibility issues - all buttons now display correctly without hover requirement
- Implemented responsive design for mobile and tablet devices
- Updated door icon to minimal floorplan style with opening arc
- Changed student list ordering - new students appear at top for easy verification
- Improved desk text handling with fixed dimensions and proper overflow management
- Added reset button to clear all data (students, desks, constraints) with confirmation dialog
- Implemented quick desk arrangement layouts (rows, groups, pairs) for common classroom setups
- Removed round table option and made teacher desk draggable with grid snapping
- Added classroom furniture items (bookshelf, cabinet, counter, closet, refrigerator, printer)
- Implemented JSON export/import functionality for complete layout save/load without database
- Tightened spacing in desk groupings for more realistic classroom arrangements

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with local state management
- **Routing**: Wouter for lightweight client-side routing
- **Data Fetching**: TanStack Query for server state management

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript throughout the stack
- **Architecture Pattern**: RESTful API design (currently minimal implementation)
- **Development**: Hot-reload development server with Vite integration

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Local Storage**: Browser localStorage for persisting seating layouts locally
- **Session Management**: In-memory storage with planned PostgreSQL integration
- **Migrations**: Drizzle Kit for database schema management

## Key Components

### Core Features
1. **Student Management**: Add/remove students, bulk import from text
2. **Desk Layout**: Drag-and-drop desk placement with grid snapping
3. **Constraint System**: Define seating rules (hard seats, keep apart, distance requirements)
4. **Seating Algorithm**: Optimized assignment algorithm with constraint validation
5. **PDF Export**: Generate downloadable seating charts using html2canvas and jsPDF
6. **Auto-save**: Automatic layout persistence to localStorage

### UI Components
- **Draggable Canvas**: Interactive workspace with grid background and desk elements
- **Student List Manager**: Interface for adding and managing student rosters
- **Constraints Builder**: Tools for defining seating rules and restrictions
- **Responsive Design**: Mobile-friendly interface with collapsible panels

### External Libraries
- **interact.js**: Provides drag-and-drop functionality for desk elements
- **html2canvas**: Converts canvas to image for PDF generation
- **jsPDF**: Creates downloadable PDF documents
- **Radix UI**: Accessible component primitives for the UI system

## Data Flow

1. **Student Input**: Users add students via individual input or bulk text import
2. **Desk Placement**: Teachers drag desks onto the canvas with automatic grid alignment
3. **Constraint Definition**: Optional rules are set for specific seating requirements
4. **Algorithm Processing**: The seating algorithm processes constraints and generates assignments
5. **Layout Persistence**: Current state is automatically saved to localStorage
6. **PDF Generation**: Final seating charts can be exported as PDF documents

## External Dependencies

### Runtime Dependencies
- **Database**: Neon serverless PostgreSQL for cloud database hosting
- **CDN Libraries**: External scripts loaded for interact.js, html2canvas, and jsPDF
- **UI Components**: Comprehensive Radix UI component library for accessibility

### Development Dependencies
- **TypeScript**: Type safety across the entire application
- **ESLint/Prettier**: Code quality and formatting tools
- **Vite Plugins**: Development enhancement plugins including error overlay

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild compiles TypeScript server to `dist/index.js`
- **Assets**: Static assets and external scripts served from CDN

### Docker Containerization
- **Multi-stage Build**: Optimized Docker image with production-only dependencies
- **Security**: Non-root user execution with proper signal handling via dumb-init
- **Health Checks**: Built-in health endpoint for container monitoring
- **Multi-platform**: Supports both AMD64 and ARM64 architectures
- **Image Registry**: Automated builds pushed to GitHub Container Registry (GHCR)

### CI/CD Pipeline
- **GitHub Actions**: Automated Docker image building on push to main/master
- **Container Registry**: Images published to ghcr.io with semantic versioning
- **Security**: Artifact attestation and build provenance for supply chain security
- **Caching**: Optimized build times with GitHub Actions cache

### Environment Configuration
- **Development**: Hot-reload development server with Vite middleware
- **Production**: Express server serves static files and API routes via Docker container
- **Database**: Environment-based PostgreSQL connection via DATABASE_URL
- **Port**: Application runs on port 5000 inside container

### Hosting Considerations
- **Container Deployment**: Ready for deployment to any container orchestration platform
- **Health Monitoring**: `/health` endpoint for load balancer and orchestration health checks
- **Static Assets**: Can be served from CDN for better performance
- **Database**: Requires PostgreSQL instance (currently configured for Neon)
- **Scalability**: Stateless container design enables horizontal scaling

The application follows a monorepo structure with shared TypeScript types and clean separation between client and server code. The architecture prioritizes developer experience with hot-reload, type safety, and modern tooling while maintaining production readiness with optimized builds and proper error handling.