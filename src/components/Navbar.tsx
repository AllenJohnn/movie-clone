import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Search, Film, Home, Tv } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-3.5 shadow-lg border-b border-white/5' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group cursor-pointer select-none">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform duration-200">
            <Film size={18} fill="currentColor" className="text-white" />
          </div>
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-white via-white to-brand bg-clip-text text-transparent group-hover:text-brand transition-colors duration-200">
            VID<span className="text-brand">FLIX</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isActive ? 'text-brand' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            <Home size={16} />
            <span className="hidden sm:inline">Home</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm font-semibold tracking-wide transition-colors duration-200 ${
                isActive ? 'text-brand' : 'text-gray-300 hover:text-white'
              }`
            }
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};
