import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Film, Tv, Home, Bookmark, ChevronRight } from 'lucide-react';
import { getMovieGenres } from '../lib/tmdb';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  const currentFilter = searchParams.get('filter') || 'all';
  const activeGenreId = searchParams.get('genre');
  const isWatchlist = location.pathname === '/watchlist';
  const isHome = location.pathname === '/';

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await getMovieGenres();
        // Take the top 12 genres to keep it neat
        setGenres(data.genres?.slice(0, 12) || []);
      } catch (err) {
        console.error('Failed to load genres in sidebar:', err);
      }
    };
    if (isOpen) {
      loadGenres();
    }
  }, [isOpen]);

  const handleFilterClick = (filter: 'all' | 'movie' | 'tv') => {
    navigate(filter === 'all' ? '/' : `/?filter=${filter}`);
    onClose();
  };

  const handleGenreClick = (id: number) => {
    navigate(`/?genre=${id}`);
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
            className="fixed top-0 bottom-0 left-0 w-[280px] sm:w-[320px] bg-bg-dark border-r border-white/5 z-55 flex flex-col p-6 shadow-2xl justify-between overflow-y-auto no-scrollbar"
          >
            {/* Header & Nav Groups */}
            <div className="flex flex-col gap-6">
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
              <div className="flex flex-col gap-1.5 text-left">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">
                  Navigation
                </span>
                
                {/* Browse All */}
                <button
                  onClick={() => handleFilterClick('all')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-l-4 cursor-pointer ${
                    isHome && currentFilter === 'all' && !activeGenreId
                      ? 'bg-brand/10 text-brand border-brand font-bold'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Home size={16} />
                  <span>Browse All</span>
                </button>

                {/* Movies */}
                <button
                  onClick={() => handleFilterClick('movie')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-l-4 cursor-pointer ${
                    isHome && currentFilter === 'movie' && !activeGenreId
                      ? 'bg-brand/10 text-brand border-brand font-bold'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Film size={16} />
                  <span>Movies</span>
                </button>

                {/* TV Shows */}
                <button
                  onClick={() => handleFilterClick('tv')}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-l-4 cursor-pointer ${
                    isHome && currentFilter === 'tv' && !activeGenreId
                      ? 'bg-brand/10 text-brand border-brand font-bold'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Tv size={16} />
                  <span>TV Shows</span>
                </button>

                {/* My List */}
                <button
                  onClick={() => {
                    navigate('/watchlist');
                    onClose();
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-l-4 cursor-pointer ${
                    isWatchlist
                      ? 'bg-brand/10 text-brand border-brand font-bold'
                      : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bookmark size={16} />
                  <span>My List</span>
                </button>
              </div>

              {/* Genre Browse Group */}
              {genres.length > 0 && (
                <div className="flex flex-col gap-1.5 text-left border-t border-white/5 pt-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-3 mb-1">
                    Browse Genres
                  </span>
                  
                  <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
                    {genres.map((genre) => {
                      const isGenreActive = isHome && activeGenreId === String(genre.id);
                      return (
                        <button
                          key={genre.id}
                          onClick={() => handleGenreClick(genre.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all border-l-4 cursor-pointer ${
                            isGenreActive
                              ? 'bg-brand/10 text-brand border-brand font-bold'
                              : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{genre.name}</span>
                          <ChevronRight size={12} className="opacity-45" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="text-[10px] text-gray-500 font-light text-center border-t border-white/5 pt-4 mt-8">
              © {new Date().getFullYear()} Aether Player
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
