import React, { useState, useEffect } from 'react';
import { Bookmark, Film } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovieOrShow } from '../types';
import { getWatchlist } from '../lib/watchlist';
import { PosterCard } from '../components/PosterCard';

export const Watchlist: React.FC = () => {
  const [watchlist, setWatchlist] = useState<MovieOrShow[]>([]);

  useEffect(() => {
    setWatchlist(getWatchlist());
    
    // Listen for storage changes to sync across tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'aetherWatchlist') {
        setWatchlist(getWatchlist());
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg-dark pt-24 px-6 md:px-12 pb-16 text-left"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Page Title */}
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Bookmark size={20} fill="currentColor" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              My List
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Titles you've saved to watch later
            </p>
          </div>
        </div>

        {/* Watchlist Grid */}
        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 mt-4">
            {watchlist.map((media) => (
              <PosterCard key={`${media.id}-${media.media_type}`} media={media} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Film size={44} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Your List is Empty</h3>
            <p className="text-sm text-gray-400 max-w-sm font-light">
              Add movies and TV shows to your list while browsing by clicking the bookmark or plus icon, and they will appear here.
            </p>
          </div>
        )}

      </div>
    </motion.div>
  );
};
