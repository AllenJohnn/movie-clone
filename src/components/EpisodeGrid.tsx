import React, { useState } from 'react';
import { Play, Star } from 'lucide-react';
import { Episode } from '../types';
import { getStillUrl } from '../lib/tmdb';

interface EpisodeGridProps {
  episodes: Episode[];
  selectedEpisode: number;
  onEpisodeSelect: (episodeNumber: number, episodeName: string) => void;
  isLoading?: boolean;
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  episodes,
  selectedEpisode,
  onEpisodeSelect,
  isLoading = false,
}) => {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-video w-full rounded-xl bg-card-dark animate-shimmer" />
            <div className="h-4 w-3/4 rounded bg-card-dark animate-shimmer" />
            <div className="h-3 w-full rounded bg-card-dark animate-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (!episodes || episodes.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        No episodes found for this season.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 select-none">
      {episodes.map((episode) => {
        const isSelected = episode.episode_number === selectedEpisode;
        const stillUrl = getStillUrl(episode.still_path);
        const hasError = imageErrors[episode.episode_number];
        const rating = episode.vote_average ? episode.vote_average.toFixed(1) : null;

        return (
          <div
            key={episode.id}
            onClick={() => onEpisodeSelect(episode.episode_number, episode.name)}
            className="group flex flex-col bg-surface-dark/40 border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-brand/40 transition-all duration-300 shadow-md"
          >
            {/* Thumbnail 16:9 */}
            <div className="relative aspect-video w-full bg-card-dark overflow-hidden">
              {stillUrl && !hasError ? (
                <img
                  src={stillUrl}
                  alt={episode.name}
                  loading="lazy"
                  onError={() => setImageErrors(prev => ({ ...prev, [episode.episode_number]: true }))}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4 bg-gradient-to-br from-card-dark to-surface-dark text-gray-600 font-bold text-lg select-none">
                  EPISODE {episode.episode_number}
                </div>
              )}

              {/* Shading Overlays */}
              <div className={`absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center ${
                isSelected ? 'bg-black/60 border-2 border-brand rounded-t-xl' : ''
              }`}>
                {/* Play Button Overlay */}
                <div className={`w-10 h-10 rounded-full bg-brand flex items-center justify-center shadow-lg transition-transform duration-300 ${
                  isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100'
                }`}>
                  <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                </div>
              </div>

              {/* Rating Badge */}
              {rating && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-brand border border-white/5">
                  <Star size={10} fill="currentColor" />
                  <span>{rating}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3.5 flex-grow flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h4 className={`font-semibold text-sm line-clamp-1 group-hover:text-brand transition-colors ${
                  isSelected ? 'text-brand' : 'text-white'
                }`}>
                  {episode.episode_number}. {episode.name}
                </h4>
              </div>

              {episode.air_date && (
                <span className="text-[10px] text-gray-500 font-medium tracking-wide block mb-2">
                  {new Date(episode.air_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              )}

              <p className="text-xs text-gray-400 font-light line-clamp-3 leading-relaxed mt-auto">
                {episode.overview || 'No description available for this episode.'}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
