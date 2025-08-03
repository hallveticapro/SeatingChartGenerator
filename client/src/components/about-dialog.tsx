import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGithub,
  faInstagram,
  faThreads,
  faTiktok,
} from "@fortawesome/free-brands-svg-icons";
import { Coffee } from "lucide-react";
import { Info } from "lucide-react";

export function AboutDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 sm:flex-none"
          style={{
            opacity: 1,
            visibility: "visible",
            backgroundColor: "white",
            color: "black",
            border: "1px solid #ccc",
          }}
        >
          <Info className="w-4 h-4 mr-2" />
          <span className="mobile-hidden">About</span>
          <span className="sm:hidden">About</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col space-y-6 p-6">
          {/* First CTA - Buy me a coffee */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-4">
              Enjoying Classroom Seating Chart Builder?
            </h3>
            <a
              href="https://buymeacoffee.com/hallveticapro"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
            >
              <Coffee className="w-5 h-5 mr-2" />
              Buy Me a Coffee
            </a>
          </div>

          {/* Second CTA - Social media */}
          <div className="bg-gradient-to-r from-slate-600 to-slate-700 rounded-lg p-6 text-center">
            <h3 className="text-xl font-semibold text-white mb-6">
              Follow Me on Social Media
            </h3>
            <div className="flex justify-center space-x-4">
              <a
                href="https://github.com/hallveticapro/SeatingChartGenerator"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-500 hover:bg-slate-400 rounded-lg flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faGithub}
                  className="w-6 h-6 text-white"
                />
              </a>
              <a
                href="https://www.threads.net/@hallveticapro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-500 hover:bg-slate-400 rounded-lg flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faThreads}
                  className="w-6 h-6 text-white"
                />
              </a>
              <a
                href="https://www.instagram.com/hallveticapro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-500 hover:bg-slate-400 rounded-lg flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faInstagram}
                  className="w-6 h-6 text-white"
                />
              </a>
              <a
                href="https://www.tiktok.com/@hallveticapro"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-slate-500 hover:bg-slate-400 rounded-lg flex items-center justify-center transition-colors"
              >
                <FontAwesomeIcon
                  icon={faTiktok}
                  className="w-6 h-6 text-white"
                />
              </a>
            </div>
          </div>

          {/* Made with love message */}
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Made for educators with love by Andrew Hall using Replit ❤️
            </p>
          </div>

          {/* Copyright */}
          <div className="text-center text-gray-500 text-xs border-t pt-4">
            © 2025 hallveticapro
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
