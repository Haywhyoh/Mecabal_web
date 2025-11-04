"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/assets/images/logo.png" 
              alt="MeCabal" 
              className="h-10 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Features
            </a>
            <a href="#how-it-works" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              How It Works
            </a>
            <a href="#for-whom" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              For Whom
            </a>
            <a href="#faq" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              FAQ
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-6 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium">
              Join
            </button>
            <button className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium">
              Create Neighborhood
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4 pt-4">
              <a 
                href="#features" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#for-whom" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                For Whom
              </a>
              <a 
                href="#faq" 
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col gap-3 pt-4">
                <button className="px-6 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium text-left">
                  Join
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium">
                  Create Neighborhood
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

