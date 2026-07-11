import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Star, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieOrShow } from '../types';
import { getBackdropUrl, getMediaVideos } from '../lib/tmdb';

interface HeroProps {
  media: MovieOrShow;
  onPlay: () => void;
  onMoreInfo: () => void;
}

export const Hero: React.FC<HeroProps> = ({ media, onPlay, onMoreInfo }) => {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  
  const hoverTimerRef = useRef<any>(null);

  const mediaType = (media.media_type || (media.title ? 'movie' : 'tv')) as 'movie' | 'tv';
  const title = media.title || media.name || media.original_title || media.original_name || 'Featured Title';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';

  // Backdrop URLs
  const lowResUrl = media.backdrop_path ? `https://image.tmdb.org/t/p/w300${media.backdrop_path}` : '';
  const originalUrl = getBackdropUrl(media.backdrop_path);

  // Reset trailer state when media changes
  useEffect(() => {
    setShowTrailer(false);
    setTrailerKey(null);
    setHighResLoaded(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
  }, [media]);

  const handleMouseEnter = () => {
    // Start 2s dwell timer
    hoverTimerRef.current = setTimeout(async () => {
      try {
        const videosRes = await getMediaVideos(media.id, mediaType);
        const videos = videosRes.results || [];
        const trailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
        
        if (trailer && trailer.key) {
          setTrailerKey(trailer.key);
          setShowTrailer(true);
        }
      } catch (err) {
        console.error('Failed to fetch hero trailer:', err);
      }
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setShowTrailer(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-[65vh] sm:h-[80vh] md:h-[85vh] lg:h-[90vh] bg-bg-dark flex items-end select-none overflow-hidden border-b border-white/5"
    >
      {/* Progressive Backdrop Loading (Crossfade) */}
      <AnimatePresence mode="wait">
        {!showTrailer ? (
          <motion.div
            key="static-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Low-Res Blurred Placeholder */}
            {lowResUrl && !highResLoaded && (
              <img
                src={lowResUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover object-top filter blur-xl scale-110 opacity-60"
              />
            )}

            {/* High-Res Backdrop */}
            {originalUrl ? (
              <img
                src={originalUrl}
                alt={title}
                loading="eager"
                onLoad={() => setHighResLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
                  highResLoaded ? 'opacity-55 md:opacity-75' : 'opacity-0'
                }`}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-card-dark to-bg-dark opacity-40" />
            )}
          </motion.div>
        ) : (
          /* Autoplay YouTube Trailer iframe */
          trailerKey && (
            <motion.div
              key="trailer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 w-full h-full"
            >
              <div className="absolute inset-0 w-full h-full scale-115 pointer-events-none">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&playsinline=1&enablejsapi=1&iv_load_policy=3&rel=0&showinfo=0`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
                  title="Hero Trailer"
                />
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Cinematic Gradient Overlays */}
      <div className="absolute inset-0 backdrop-fade z-10 pointer-events-none" />
      <div className="absolute inset-0 backdrop-fade-left z-10 hidden md:block pointer-events-none" />
      <div className="absolute inset-0 bg-black/10 z-0 pointer-events-none" />

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

        {/* Action Buttons & Sound controls */}
        <div className="flex items-center justify-between w-full mt-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3 w-full sm:w-auto"
          >
            {/* Play Button */}
            <button
              onClick={onPlay}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white hover:bg-white/90 text-black font-extrabold transition-all duration-200 hover:scale-102 cursor-pointer shadow-lg text-sm sm:text-base"
            >
              <Play size={18} fill="currentColor" className="text-black" />
              <span>Play Now</span>
            </button>
            
            {/* Info Button */}
            <button
              onClick={onMoreInfo}
              className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold transition-all duration-200 hover:scale-102 border border-white/5 shadow-lg cursor-pointer text-sm sm:text-base backdrop-blur-sm"
            >
              <Info size={18} />
              <span>Info</span>
            </button>
          </motion.div>

          {/* Floating Sound Toggle */}
          {showTrailer && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsMuted(!isMuted)}
              className="p-3 rounded-full bg-black/60 border border-white/10 hover:border-brand/40 text-gray-300 hover:text-white transition-all cursor-pointer mr-6 hover:scale-105"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
