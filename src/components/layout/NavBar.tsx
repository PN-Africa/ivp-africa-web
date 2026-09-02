'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenu, HiX, HiChevronDown } from 'react-icons/hi';
import Logo from '../common/Logo';
import Button from '../common/Button';
import { NAV_LINKS } from '../../utils/constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // FIX 1: Properly close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // FIX 2: Handle scroll state for sticky nav appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20); // lowered threshold for a snappier response
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // FIX 3: Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all lg:gap-8 duration-300 border-b ${
        isScrolled || isOpen
          ? 'bg-white/95 backdrop-blur-md border-black/5 shadow-sm py-3'
          : 'bg-transparent border-transparent py-4 lg:py-3'
      }`}
    >
      <div className="section-container px-8 md:px-16 lg:px-24 xl:px-12">
        <div className="flex items-center justify-between w-full">
          
          {/* Logo - flex-1 pushes middle content to exact center */}
          <div className="flex-1 flex justify-start z-50">
            <Logo variant="dark" size="md" />
          </div>

          {/* Desktop Navigation Links - flex-none keeps it sized to content, gap-8/10 spreads links */}
          <div className="hidden lg:flex flex-none items-center justify-center gap-8 xl:gap-">
            {NAV_LINKS.map((link, index) => {
              const isActive =
                pathname === link.path ||
                (link.subLinks && link.subLinks.some((sub) => pathname === sub.path));

              return (
                <div key={`${link.name}-${index}`} className="relative group">
                  <Link
                    href={link.path}
                    className={`relative flex items-center gap-1.5 py-2 text-base font-medium transition-colors duration-300 ${
                      isActive ? 'text-primary' : 'text-gray-600 group-hover:text-primary'
                    }`}
                  >
                    {link.name}
                    {link.subLinks && (
                      <HiChevronDown
                        className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-180 ${
                          isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'
                        }`}
                      />
                    )}

                    {/* Animated Underline Effect */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ease-out rounded-full ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>

                  {/* Desktop Dropdown Menu */}
                  {link.subLinks && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="w-52 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/50 flex flex-col p-2">
                        {link.subLinks.map((subLink, subIndex) => (
                          <Link
                            key={`${subLink.name}-${subIndex}`}
                            href={subLink.path}
                            className={`px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center ${
                              pathname === subLink.path
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-600 hover:bg-primary/5 hover:text-primary'
                            }`}
                          >
                            {subLink.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right side actions - flex-1 mirrors the logo to maintain perfect centering */}
          <div className="flex-1 flex justify-end items-center gap-4 z-50">
            {/* Increased gap from gap-1 to gap-4 to separate the buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                href="/login"
                variant="outline"
                size="sm"
                className="bg-white text-black border border-black hover:text-white hover:bg-[--foreground] px-6 py-2.5 rounded-full font-semibold transition-all duration-300"
              >
                Sign In
              </Button>
              <Button
                href="/signUp"
                variant="primary"
                size="sm"
                className="bg-primary text-white hover:bg-[#8c52ff] px-6 py-2.5 rounded-full shadow-md font-semibold transition-all duration-300"
              >
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-primary focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <HiX size={28} /> : <HiMenu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-y-auto transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-[85vh] opacity-100 mt-4' : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col gap-2 py-6 border-t border-black/5">
            {NAV_LINKS.map((link, index) => {
              const isActive = pathname === link.path;

              return (
                <div key={`mobile-${link.name}-${index}`} className="flex flex-col">
                  <Link
                    href={link.path}
                    className={`block px-4 py-3 text-lg font-semibold rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>

                  {/* Mobile SubLinks */}
                  {link.subLinks && (
                    <div className="flex flex-col pl-6 pr-4 py-2 mt-1 space-y-1 border-l-2 border-gray-100 ml-6">
                      {link.subLinks.map((subLink, subIndex) => (
                        <Link
                          key={`mobile-${subLink.name}-${subIndex}`}
                          href={subLink.path}
                          className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-colors duration-200 ${
                            pathname === subLink.path
                              ? 'text-primary bg-primary/5'
                              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
                          }`}
                        >
                          {subLink.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Mobile Buttons */}
            <div className="flex flex-col gap-3 mt-6 px-4 pb-6">
              <Button
                href="/login"
                variant="outline"
                size="md"
                className="w-full bg-white text-black hover:bg-black hover:text-white border border-gray-200 hover:border-black py-3 rounded-lg font-semibold flex justify-center text-center transition-colors"
              >
                Sign In
              </Button>
              <Button
                href="/signUp"
                variant="primary"
                size="md"
                className="w-full bg-primary text-white hover:text-white hover:bg-black py-3 rounded-lg font-semibold shadow-md transition-colors duration-300 flex justify-center text-center"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;