"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="#hero" onClick={(e) => handleNavClick(e, "hero")} className="flex items-center">
            <img 
              src="/assets/images/logo.png" 
              alt="MeCabal" 
              className="h-10 w-auto"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, "features")}
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              How It Works
            </a>
            <a 
              href="#for-whom" 
              onClick={(e) => handleNavClick(e, "for-whom")}
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              For Whom
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleNavClick(e, "faq")}
              className="text-gray-700 hover:text-green-600 transition-colors font-medium"
            >
              FAQ
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <a href="/onboarding" className="px-6 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium">
              Join
            </a>
            <a href="/onboarding" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium">
              Create Neighborhood
            </a>
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
                onClick={(e) => handleNavClick(e, "features")}
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                Features
              </a>
              <a 
                href="#how-it-works" 
                onClick={(e) => handleNavClick(e, "how-it-works")}
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                How It Works
              </a>
              <a 
                href="#for-whom" 
                onClick={(e) => handleNavClick(e, "for-whom")}
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                For Whom
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleNavClick(e, "faq")}
                className="text-gray-700 hover:text-green-600 transition-colors font-medium"
              >
                FAQ
              </a>
              <div className="flex flex-col gap-3 pt-4">
                <a href="/onboarding" className="px-6 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium text-left">
                  Join
                </a>
                <a href="/onboarding" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium text-center">
                  Create Neighborhood
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

