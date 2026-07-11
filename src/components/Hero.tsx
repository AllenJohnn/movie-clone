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
    <div className="relative w-full h-[70vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] bg-bg-dark flex items-end select-none overflow-hidden border-b border-white/5">
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
              imageLoaded ? 'opacity-50 sm:opacity-60 md:opacity-75' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-card-dark to-bg-dark opacity-40" />
      )}

      {/* Cinematic Gradient Overlays */}
      {/* Bottom fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/30 to-transparent z-10" />
      {/* Left fade for desktop text legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/60 to-transparent z-10 hidden md:block" />
      {/* General darkening filter */}
      <div className="absolute inset-0 bg-black/30 z-0" />

      {/* Banner Contents */}
      <div className="relative z-20 w-full max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 pb-12 sm:pb-16 md:pb-24 flex flex-col items-start gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="flex flex-col gap-3 max-w-2xl"
        >
          {/* Metadata Badges */}
          <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
            <span className="uppercase tracking-widest text-brand font-extrabold bg-brand/10 border border-brand/20 px-2.5 py-0.5 rounded-md">
              Trending
            </span>
            <span className="uppercase text-gray-300 font-bold px-2 py-0.5 rounded bg-white/10">
              {mediaType === 'tv' ? 'TV Show' : 'Movie'}
            </span>
            {year && <span className="text-gray-300">{year}</span>}
            <div className="flex items-center gap-1 font-semibold text-brand">
              <Star size={14} fill="currentColor" />
              <span>{rating}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-md text-left mt-2 mb-2 line-clamp-2">
            {title}
          </h1>

          {/* Tagline or Overview */}
          <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-light line-clamp-3 drop-shadow text-left max-w-xl">
            {media.tagline ? `"${media.tagline}"` : media.overview}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center gap-3.5 sm:gap-4 w-full sm:w-auto"
        >
          <button
            onClick={onPlay}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-brand/20 cursor-pointer text-sm sm:text-base"
          >
            <Play size={18} fill="currentColor" className="text-white" />
            <span>Play Now</span>
          </button>
          
          <button
            onClick={onMoreInfo}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl glass hover:bg-white/10 text-white font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border border-white/10 shadow-lg cursor-pointer text-sm sm:text-base"
          >
            <Info size={18} />
            <span>More Info</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
