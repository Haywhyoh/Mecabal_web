"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    setOpenDropdown(null);
  };

  const companyLinks = [
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact Us" },
    { href: "#faq", label: "FAQs", onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "faq") }
  ];

  const useCasesLinks = [
    { href: "/use-cases", label: "All Use Cases" },
    { href: "/use-cases/residents", label: "For Residents" },
    { href: "/use-cases/estate-managers", label: "For Estate Managers" },
    { href: "/use-cases/service-providers", label: "For Service Providers" },
    { href: "/use-cases/other", label: "Other Use Cases" }
  ];

  const resourcesLinks = [
    { href: "/resources/blog", label: "Blog" },
    { href: "/resources/videos", label: "Videos" },
    { href: "/resources/knowledgebase", label: "Knowledge Base" },
    { href: "/resources", label: "Links" }
  ];

  const featuresLinks = [
    { href: "#core-features", label: "Estate Management", onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "core-features") },
    { href: "#core-features", label: "Verified Services", onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "core-features") },
    { href: "#core-features", label: "Community", onClick: (e: React.MouseEvent<HTMLAnchorElement>) => handleNavClick(e, "core-features") }
  ];

  const DropdownMenu = ({ title, links, id }: { title: string; links: Array<{ href: string; label: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }>; id: string }) => {
    const isOpen = openDropdown === id;
    return (
      <div className="relative" ref={id === "company" ? dropdownRef : undefined}>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : id)}
          className="flex items-center gap-1 text-gray-700 hover:text-green-600 transition-colors font-medium"
        >
          {title}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
            {links.map((link, index) => (
              link.onClick ? (
                <a
                  key={index}
                  href={link.href}
                  onClick={link.onClick}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={index}
                  href={link.href}
                  onClick={() => setOpenDropdown(null)}
                  className="block px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/assets/images/logo.png" 
              alt="MeCabal" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <DropdownMenu title="Company" links={companyLinks} id="company" />
            <Link href="/pricing" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Pricing
            </Link>
            <DropdownMenu title="Use Cases" links={useCasesLinks} id="use-cases" />
            <DropdownMenu title="Resources" links={resourcesLinks} id="resources" />
            <DropdownMenu title="Features" links={featuresLinks} id="features" />
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/onboarding" className="px-6 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium">
              Get Started
            </Link>
            <Link href="/contact" className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium">
              Book a Demo
            </Link>
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
              <div>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "mobile-company" ? null : "mobile-company")}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Company
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "mobile-company" ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === "mobile-company" && (
                  <div className="pl-4 mt-2 space-y-2">
                    {companyLinks.map((link, index) => (
                      link.onClick ? (
                        <a
                          key={index}
                          href={link.href}
                          onClick={link.onClick}
                          className="block text-gray-600 hover:text-green-600"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={index}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-gray-600 hover:text-green-600"
                        >
                          {link.label}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
              <Link href="/pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Pricing
              </Link>
              <div>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "mobile-use-cases" ? null : "mobile-use-cases")}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Use Cases
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "mobile-use-cases" ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === "mobile-use-cases" && (
                  <div className="pl-4 mt-2 space-y-2">
                    {useCasesLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-gray-600 hover:text-green-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "mobile-resources" ? null : "mobile-resources")}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Resources
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "mobile-resources" ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === "mobile-resources" && (
                  <div className="pl-4 mt-2 space-y-2">
                    {resourcesLinks.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-gray-600 hover:text-green-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <button
                  onClick={() => setOpenDropdown(openDropdown === "mobile-features" ? null : "mobile-features")}
                  className="flex items-center justify-between w-full text-gray-700 hover:text-green-600 transition-colors font-medium"
                >
                  Features
                  <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === "mobile-features" ? 'rotate-180' : ''}`} />
                </button>
                {openDropdown === "mobile-features" && (
                  <div className="pl-4 mt-2 space-y-2">
                    {featuresLinks.map((link, index) => (
                      link.onClick ? (
                        <a
                          key={index}
                          href={link.href}
                          onClick={(e) => { link.onClick!(e); setIsMenuOpen(false); }}
                          className="block text-gray-600 hover:text-green-600"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={index}
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="block text-gray-600 hover:text-green-600"
                        >
                          {link.label}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3 pt-4">
                <Link href="/onboarding" onClick={() => setIsMenuOpen(false)} className="px-6 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium text-left">
                  Get Started
                </Link>
                <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-200 font-medium text-center">
                  Book a Demo
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

