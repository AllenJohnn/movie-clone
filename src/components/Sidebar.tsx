import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Tv, Home } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const currentFilter = searchParams.get('filter') || 'all';

  const handleFilterClick = (filter: 'all' | 'movie' | 'tv') => {
    // Navigate home if we aren't there, and apply the filter query param
    navigate(filter === 'all' ? '/' : `/?filter=${filter}`);
    onClose();
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
                  AETHER
                </span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Group */}
              <div className="flex flex-col gap-2 text-left">
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

            {/* Footer */}
            <div className="text-[10px] text-gray-500 font-light text-center border-t border-white/5 pt-4">
              © {new Date().getFullYear()} Aether Player
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
