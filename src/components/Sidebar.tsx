import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Tv, Home, Globe, TrendingUp, History } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Español (ES)' },
  { code: 'fr-FR', name: 'Français (FR)' },
  { code: 'de-DE', name: 'Deutsch (DE)' },
  { code: 'hi-IN', name: 'हिन्दी (IN)' },
  { code: 'ja-JP', name: '日本語 (JP)' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const currentFilter = searchParams.get('filter') || 'all';
  const currentLang = localStorage.getItem('flixLanguage') || 'en-US';

  const handleFilterClick = (filter: 'all' | 'movie' | 'tv') => {
    // Navigate home if we aren't there, and apply the filter query param
    navigate(filter === 'all' ? '/' : `/?filter=${filter}`);
    onClose();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLang = e.target.value;
    localStorage.setItem('flixLanguage', selectedLang);
    // Reload the page to refresh all TMDB cached fetch queries with the new language
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
          />

          {/* Left Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 left-0 w-[280px] sm:w-[320px] bg-bg-dark border-r border-white/5 z-55 flex flex-col p-6 shadow-2xl justify-between"
          >
            {/* Header */}
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-2xl tracking-tighter text-brand">
                  VIDFLIX
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Group */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">
                  Navigation
                </span>
                
                {/* Browse All / Home */}
                <button
                  onClick={() => handleFilterClick('all')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    currentFilter === 'all'
                      ? 'bg-brand text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Home size={18} />
                  <span>Browse All</span>
                </button>

                {/* Movies filter */}
                <button
                  onClick={() => handleFilterClick('movie')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    currentFilter === 'movie'
                      ? 'bg-brand text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Film size={18} />
                  <span>Movies</span>
                </button>

                {/* TV Shows filter */}
                <button
                  onClick={() => handleFilterClick('tv')}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    currentFilter === 'tv'
                      ? 'bg-brand text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Tv size={18} />
                  <span>TV Shows</span>
                </button>
              </div>
            </div>

            {/* Language & Settings Footer */}
            <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">
                Preferences
              </span>
              
              {/* Globe Language Selector */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <Globe size={16} />
                </div>
                
                <select
                  value={currentLang}
                  onChange={handleLanguageChange}
                  className="w-full pl-10 pr-8 py-2.5 rounded-lg bg-surface-dark border border-white/5 hover:border-white/10 focus:border-brand/40 text-gray-300 font-medium text-xs tracking-wide focus:outline-none appearance-none cursor-pointer"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">
                  ▼
                </div>
              </div>

              <div className="text-[10px] text-gray-500 font-light px-1">
                Content language updates dynamic metadata from TMDB.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
