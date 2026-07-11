import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Season } from '../types';

interface SeasonEpisodeSelectorProps {
  seasons: Season[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
}

export const SeasonEpisodeSelector: React.FC<SeasonEpisodeSelectorProps> = ({
  seasons,
  selectedSeason,
  onSeasonChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter out Specical seasons (season_number = 0) unless there are only specials
  const filteredSeasons = seasons.filter(s => s.season_number > 0);
  const displaySeasons = filteredSeasons.length > 0 ? filteredSeasons : seasons;

  const currentSeason = displaySeasons.find(s => s.season_number === selectedSeason) || displaySeasons[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative z-20 select-none mb-6" ref={dropdownRef}>
      <label className="block text-xs uppercase font-bold text-gray-500 tracking-wider mb-2">
        Select Season
      </label>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full sm:w-[220px] px-4 py-3 rounded-xl bg-card-dark border border-white/5 text-white hover:border-brand/40 transition-colors duration-200 shadow-md font-medium text-sm text-left"
      >
        <span>{currentSeason?.name || `Season ${selectedSeason}`}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-full sm:w-[220px] max-h-[300px] overflow-y-auto rounded-xl bg-card-dark border border-white/5 shadow-2xl z-30 no-scrollbar"
          >
            <div className="py-1">
              {displaySeasons.map((season) => {
                const isSelected = season.season_number === selectedSeason;
                return (
                  <button
                    key={season.id}
                    onClick={() => {
                      onSeasonChange(season.season_number);
                      setIsOpen(false);
                    }}
                    className={`flex flex-col w-full px-4 py-2.5 text-left text-sm hover:bg-brand/10 transition-colors duration-150 ${
                      isSelected ? 'bg-brand/20 text-brand font-semibold' : 'text-gray-300'
                    }`}
                  >
                    <span>{season.name}</span>
                    <span className="text-[10px] text-gray-500 font-light mt-0.5">
                      {season.episode_count} Episodes
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
