import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Check } from 'lucide-react';
import { MovieOrShow } from '../types';
import { getPosterUrl } from '../lib/tmdb';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/watchlist';
import { getCachedColor } from '../lib/colors';

interface PosterCardProps {
  media: MovieOrShow;
  fallbackMediaType?: 'movie' | 'tv';
  isHighlighted?: boolean;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  media,
  fallbackMediaType,
  isHighlighted = false,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const mediaType = media.media_type || fallbackMediaType || (media.title ? 'movie' : 'tv');
  const title = media.title || media.name || media.original_title || media.original_name || 'Untitled';
  
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const posterPath = getPosterUrl(media.poster_path);

  // Cache key and ambient color lookup
  const cacheKey = `${media.id}_${mediaType}`;
  const accentColor = getCachedColor(cacheKey);

  useEffect(() => {
    setInWatchlist(isInWatchlist(media.id));
  }, [media.id]);

  const handleClick = () => {
    navigate(`/details/${mediaType}/${media.id}`);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation
    if (inWatchlist) {
      removeFromWatchlist(media.id);
      setInWatchlist(false);
    } else {
      addToWatchlist({ ...media, media_type: mediaType as 'movie' | 'tv' });
      setInWatchlist(true);
    }
  };

  // Border & Glow inline styling
  const isActive = isHighlighted || isHovered;
  const cardStyle: React.CSSProperties = {
    borderColor: isActive ? accentColor : undefined,
    boxShadow: isActive ? `0 10px 30px -10px ${accentColor}66` : undefined,
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={cardStyle}
      className={`relative flex-none w-[155px] sm:w-[175px] md:w-[195px] aspect-[2/3] rounded-xl overflow-hidden cursor-pointer bg-[#111317] border border-white/5 transition-all duration-300 shadow-md select-none ${
        isHighlighted ? 'scale-104' : ''
      }`}
    >
      {/* Poster Image Container */}
      <div className="w-full h-full relative overflow-hidden">
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
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-106 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-106' : ''}`}
            />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-card-dark to-surface-dark text-center">
            <span className="text-sm font-semibold text-gray-400 line-clamp-3">{title}</span>
            <span className="text-xs text-gray-500 mt-2 capitalize">{mediaType}</span>
          </div>
        )}
      </div>

      {/* Watchlist Toggle Button (Top Right) */}
      <button
        onClick={handleWatchlistClick}
        style={{ backgroundColor: inWatchlist ? `${accentColor}cc` : 'rgba(0, 0, 0, 0.6)' }}
        className="absolute top-2.5 right-2.5 z-30 p-1.5 rounded-full border border-white/10 hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-sm shadow-md"
        title={inWatchlist ? 'Remove from List' : 'Add to List'}
      >
        {inWatchlist ? (
          <Check size={12} className="text-white" />
        ) : (
          <Plus size={12} className="text-white" />
        )}
      </button>

      {/* Minimal Footer Info (Fades in on hover or shows on focus) */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-3.5 pointer-events-none transition-opacity duration-300 ${
          isActive ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="font-bold text-white text-xs sm:text-sm line-clamp-2 mb-1">
          {title}
        </h3>
        
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-semibold mt-1">
          <div className="flex items-center gap-2">
            {year && <span>{year}</span>}
            <span className="uppercase text-[9px] tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
              {mediaType}
            </span>
          </div>
          <div className="flex items-center gap-0.5 text-yellow-500">
            <Star size={10} fill="currentColor" />
            <span>{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
