import React, { useState } from 'react';
import { Play, Star, Calendar } from 'lucide-react';
import { Episode } from '../types';
import { getStillUrl } from '../lib/tmdb';

interface EpisodeGridProps {
  episodes: Episode[];
  isLoading?: boolean;
  onPlayEpisode: (episodeNumber: number) => void;
  accentColor?: string;
  currentEpisodeNumber?: number;
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  episodes,
  isLoading = false,
  onPlayEpisode,
  accentColor = '#e50914',
  currentEpisodeNumber,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-surface-dark/40 border border-white/5 animate-pulse h-[120px]" />
        ))}
      </div>
    );
  }

  if (!episodes || episodes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 font-light">
        No episodes found for this season.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 select-none">
      {episodes.map((episode) => {
        const isSelected = episode.episode_number === currentEpisodeNumber;
        const stillUrl = getStillUrl(episode.still_path);
        const hasError = imageErrors[episode.episode_number];
        const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;

        // Dynamic inline styles
        const activeStyles: React.CSSProperties = isSelected
          ? {
              backgroundColor: `${accentColor}11`,
              borderColor: accentColor,
              boxShadow: `0 4px 14px -4px ${accentColor}33`,
            }
          : {};

        return (
          <div
            key={episode.id}
            onClick={() => onPlayEpisode(episode.episode_number)}
            style={activeStyles}
            className={`group flex flex-col md:flex-row gap-5 p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
              isSelected
                ? ''
                : 'bg-surface-dark/30 hover:bg-surface-dark/70 border-white/5 hover:border-white/10'
            }`}
          >
            {/* 16:9 Episode Thumbnail (Left) */}
            <div className="relative aspect-video w-full md:w-[220px] rounded-lg overflow-hidden bg-card-dark flex-none">
              {stillUrl && !hasError ? (
                <img
                  src={stillUrl}
                  alt={episode.name}
                  loading="lazy"
                  onError={() => setImageErrors(prev => ({ ...prev, [episode.episode_number]: true }))}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card-dark to-surface-dark text-gray-600 font-bold text-xs">
                  EPISODE {episode.episode_number}
                </div>
              )}

              {/* Play Overlay */}
              <div className={`absolute inset-0 bg-black/45 group-hover:bg-black/60 transition-colors flex items-center justify-center ${
                isSelected ? 'bg-black/60' : 'opacity-0 group-hover:opacity-100'
              }`}>
                <div
                  style={{ backgroundColor: accentColor }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition-transform"
                >
                  <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                </div>
              </div>

              {/* Episode Number Tag */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white tracking-wide border border-white/5">
                EP {episode.episode_number}
              </div>
            </div>

            {/* Info details (Right) */}
            <div className="flex-grow flex flex-col justify-start text-left">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-1.5">
                <h4
                  style={{ color: isSelected ? accentColor : undefined }}
                  className="font-bold text-base transition-colors text-white group-hover:text-brand"
                >
                  {episode.name}
                </h4>
                
                {rating && (
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-500">
                    <Star size={12} fill="currentColor" />
                    <span>{rating}</span>
                  </div>
                )}
              </div>

              {episode.air_date && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  <Calendar size={10} />
                  <span>
                    {new Date(episode.air_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      timeZone: 'UTC'
                    })}
                  </span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-400 font-light leading-relaxed line-clamp-2 md:line-clamp-3">
                {episode.overview || 'No description available for this episode.'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
