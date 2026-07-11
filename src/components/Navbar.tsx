import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-nav py-3' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-10">
          {/* Minimalist Logo */}
          <Link to="/" className="flex items-center gap-2 select-none cursor-pointer">
            <span className="font-extrabold text-2xl tracking-tighter text-brand">
              VIDFLIX
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden sm:flex items-center gap-6">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest font-bold transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              Browse
            </NavLink>
            <NavLink
              to="/search"
              className={({ isActive }) =>
                `text-xs uppercase tracking-widest font-bold transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`
              }
            >
              Search
            </NavLink>
          </div>
        </div>

        {/* Small Profile Avatar / Quick Link */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/search"
            className="text-gray-400 hover:text-white transition-colors sm:hidden text-xs uppercase tracking-widest font-bold"
          >
            Search
          </NavLink>
          <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-brand to-red-400 flex items-center justify-center text-white text-xs font-black select-none shadow-md cursor-pointer hover:scale-105 transition-transform duration-200">
            AJ
          </div>
        </div>
      </div>
    </nav>
  );
};
