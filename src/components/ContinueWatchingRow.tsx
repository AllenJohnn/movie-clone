import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContinueWatchingItem } from '../types';
import { getContinueWatchingList, removeContinueWatchingItem } from '../lib/vidlink';
import { getBackdropUrl } from '../lib/tmdb';
import { getCachedColor } from '../lib/colors';

interface ContinueWatchingRowProps {
  filter?: 'movie' | 'tv' | null;
  onRefreshNeeded?: () => void;
}

function formatRemainingTime(remainingSecs: number): string {
  if (remainingSecs < 30) {
    return 'Few seconds left';
  }
  
  if (remainingSecs <= 600) { // <= 10 minutes
    const mins = Math.floor(remainingSecs / 60);
    const secs = Math.floor(remainingSecs % 60);
    return `${mins}m ${secs}s left`;
  }
  
  if (remainingSecs <= 3600) { // <= 60 minutes
    const mins = Math.round(remainingSecs / 60);
    return `${mins}m left`;
  }
  
  // > 60 minutes, round remaining minutes to nearest 5 minutes
  const hours = Math.floor(remainingSecs / 3600);
  const remainingMins = Math.round((remainingSecs % 3600) / 60);
  const roundedMins = Math.round(remainingMins / 5) * 5;
  
  if (roundedMins === 60) {
    return `~${hours + 1}h left`;
  }
  if (roundedMins === 0) {
    return `~${hours}h left`;
  }
  return `~${hours}h ${roundedMins}m left`;
}

export const ContinueWatchingRow: React.FC<ContinueWatchingRowProps> = ({ filter, onRefreshNeeded }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ContinueWatchingItem[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const loadItems = useCallback(() => {
    const list = getContinueWatchingList();
    const filtered = filter ? list.filter(item => item.type === filter) : list;
    // Sort by lastUpdated desc
    const sorted = filtered.sort((a, b) => b.lastUpdated - a.lastUpdated);
    setItems(sorted);
  }, [filter]);

  useEffect(() => {
    loadItems();
    
    // Listen for storage changes in other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vidLinkProgress') {
        loadItems();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [filter, loadItems]);

  const handleRemove = (e: React.MouseEvent, tmdbId: string, type: 'movie' | 'tv') => {
    e.stopPropagation();
    removeContinueWatchingItem(tmdbId, type);
    loadItems();
    if (onRefreshNeeded) {
      onRefreshNeeded();
    }
  };

  const handleCardClick = (item: ContinueWatchingItem) => {
    const url = item.type === 'tv'
      ? `/player/tv/${item.tmdbId}?season=${item.season || 1}&episode=${item.episode || 1}&startAt=${item.currentTime}`
      : `/player/movie/${item.tmdbId}?startAt=${item.currentTime}`;
    navigate(url);
  };

  if (items.length === 0) return null;

  return (
    <div className="py-6 px-4 md:px-8 lg:px-12 select-none">
      <h2 className="text-xl md:text-2xl font-bold mb-4 tracking-tight text-white/90 text-left">
        Continue Watching
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
        <AnimatePresence>
          {items.map((item) => {
            const backdropUrl = getBackdropUrl(item.backdropPath);
            const progressPercent = item.progress * 100;
            const remainingText = formatRemainingTime(item.duration - item.currentTime);
            
            // Ambient color lookup
            const cacheKey = `${item.tmdbId}_${item.type}`;
            const accentColor = getCachedColor(cacheKey);

            const isItemHovered = hoveredId === `${item.type}-${item.tmdbId}`;

            return (
              <motion.div
                key={`${item.type}-${item.tmdbId}`}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleCardClick(item)}
                onMouseEnter={() => setHoveredId(`${item.type}-${item.tmdbId}`)}
                onMouseLeave={() => setHoveredId(null)}
                whileHover={{ y: -4 }}
                style={{
                  borderColor: isItemHovered ? accentColor : undefined,
                  boxShadow: isItemHovered ? `0 10px 30px -10px ${accentColor}66` : undefined,
                }}
                className="flex-none w-[240px] sm:w-[280px] md:w-[320px] aspect-video bg-surface-dark/60 rounded-xl overflow-hidden cursor-pointer relative group border border-white/5 shadow-lg flex flex-col justify-between transition-all duration-300"
              >
                {/* Backdrop Image or Fallback */}
                {backdropUrl ? (
                  <img
                    src={backdropUrl}
                    alt={item.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-card-dark to-surface-dark flex flex-col items-center justify-center p-4">
                    <span className="text-sm font-semibold text-gray-400 text-center line-clamp-2">{item.title}</span>
                  </div>
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20 group-hover:via-black/50 transition-colors duration-300" />

                {/* Top Bar: Media Type and Delete Button */}
                <div className="relative z-10 flex items-center justify-between p-3">
                  <span className="uppercase text-[9px] tracking-wider px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-gray-300 font-bold border border-white/5">
                    {item.type === 'tv' ? 'TV Show' : 'Movie'}
                  </span>
                  
                  <button
                    onClick={(e) => handleRemove(e, item.tmdbId, item.type)}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-gray-400 hover:text-white hover:bg-brand/80 transition-all duration-200 border border-white/5 opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Remove from history"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Center Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  <div
                    style={{ backgroundColor: accentColor }}
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
                  >
                    <Play size={20} fill="currentColor" className="text-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Bar: Title, progress and remaining time */}
                <div className="relative z-10 p-3 mt-auto flex flex-col justify-end text-left">
                  <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-1 drop-shadow-md">
                    {item.title}
                  </h3>
                  
                  {item.type === 'tv' && item.season && item.episode && (
                    <p
                      style={{ color: accentColor }}
                      className="text-[10px] font-medium drop-shadow mt-0.5"
                    >
                      S{item.season}:E{item.episode} {item.episodeName ? `• ${item.episodeName}` : ''}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-[9px] text-gray-400 mt-2">
                    <span>{remainingText}</span>
                    <span>{Math.floor(progressPercent)}%</span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative z-10 w-full h-1 bg-white/20">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%`, backgroundColor: accentColor }}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
