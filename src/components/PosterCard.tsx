import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import { MovieOrShow } from '../types';
import { getPosterUrl } from '../lib/tmdb';

interface PosterCardProps {
  media: MovieOrShow;
  fallbackMediaType?: 'movie' | 'tv';
}

export const PosterCard: React.FC<PosterCardProps> = ({ media, fallbackMediaType }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const mediaType = media.media_type || fallbackMediaType || (media.title ? 'movie' : 'tv');
  const title = media.title || media.name || media.original_title || media.original_name || 'Untitled';
  
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const posterPath = getPosterUrl(media.poster_path);

  const handleClick = () => {
    navigate(`/details/${mediaType}/${media.id}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative flex-none w-[160px] sm:w-[180px] md:w-[200px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer group bg-surface-dark/40 border border-white/5 shadow-lg select-none"
      whileHover={{ y: -8, scale: 1.05 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Poster Image or Fallback */}
      {posterPath ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 animate-shimmer bg-card-dark" />
          )}
          <img
            src={posterPath}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-card-dark to-surface-dark text-center">
          <span className="text-sm font-semibold text-gray-400 line-clamp-3">{title}</span>
          <span className="text-xs text-gray-500 mt-2 capitalize">{mediaType}</span>
        </div>
      )}

      {/* Card Border Highlight */}
      <div className="absolute inset-0 border border-white/0 group-hover:border-brand/40 rounded-xl transition-colors duration-300 pointer-events-none" />

      {/* Hover Info Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-4 pointer-events-none"
          >
            <h3 className="font-bold text-white text-sm sm:text-base line-clamp-2 mb-1 drop-shadow-md">
              {title}
            </h3>
            
            <div className="flex items-center gap-3 text-xs text-gray-300">
              {year && <span>{year}</span>}
              <div className="flex items-center gap-1 font-semibold text-brand">
                <Star size={12} fill="currentColor" />
                <span>{rating}</span>
              </div>
              <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 rounded bg-white/10 font-bold">
                {mediaType}
              </span>
            </div>
            
            <p className="text-[10px] text-gray-400 line-clamp-2 mt-2 font-light">
              {media.overview || 'No overview available.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
