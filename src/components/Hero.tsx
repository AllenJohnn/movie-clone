import React, { useState } from 'react';
import { Play, Info, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovieOrShow } from '../types';
import { getBackdropUrl } from '../lib/tmdb';

interface HeroProps {
  media: MovieOrShow;
  onPlay: () => void;
  onMoreInfo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ media, onPlay, onMoreInfo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const backdropUrl = getBackdropUrl(media.backdrop_path);
  const title = media.title || media.name || media.original_title || media.original_name || 'Featured Title';
  const mediaType = media.media_type || (media.title ? 'movie' : 'tv');
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';

  return (
    <div className="relative w-full h-[65vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] bg-bg-dark flex items-end select-none overflow-hidden border-b border-white/5">
      {/* Background Backdrop Image */}
      {backdropUrl ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-card-dark animate-shimmer" />
          )}
          <img
            src={backdropUrl}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            loading="eager"
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
              imageLoaded ? 'opacity-55 md:opacity-75' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-card-dark to-bg-dark opacity-40" />
      )}

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 backdrop-fade z-10" />
      <div className="absolute inset-0 backdrop-fade-left z-10 hidden md:block" />
      <div className="absolute inset-0 bg-black/10 z-0" />

      {/* Banner Contents */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-6 md:px-12 pb-12 sm:pb-16 md:pb-24 flex flex-col items-start gap-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-col gap-3 max-w-2xl text-left"
        >
          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-gray-300">
            <span className="uppercase tracking-widest text-brand font-black">
              TRENDING
            </span>
            <span>•</span>
            <span className="uppercase tracking-wider font-medium text-gray-300">
              {mediaType === 'tv' ? 'TV Show' : 'Movie'}
            </span>
            <span>•</span>
            {year && <span className="text-gray-300">{year}</span>}
            <span>•</span>
            <div className="flex items-center gap-1 font-semibold text-yellow-500">
              <Star size={14} fill="currentColor" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.05] drop-shadow-md mt-2">
            {title}
          </h1>

          {/* Overview */}
          <p className="text-sm sm:text-base md:text-lg text-gray-400 leading-relaxed font-light mt-2 line-clamp-3 max-w-xl">
            {media.overview}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3 w-full sm:w-auto mt-4"
        >
          {/* Netflix Style White Button */}
          <button
            onClick={onPlay}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-white/90 text-black font-extrabold transition-all duration-200 hover:scale-102 cursor-pointer shadow-lg text-sm sm:text-base"
          >
            <Play size={18} fill="currentColor" className="text-black" />
            <span>Play Now</span>
          </button>
          
          {/* Transparent Gray Button */}
          <button
            onClick={onMoreInfo}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold transition-all duration-200 hover:scale-102 border border-white/5 shadow-lg cursor-pointer text-sm sm:text-base backdrop-blur-sm"
          >
            <Info size={18} />
            <span>Info</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
