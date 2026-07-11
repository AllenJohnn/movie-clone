import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Calendar, Star, Info, ListVideo } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovieOrShow, CastMember, Episode, Season } from '../types';
import {
  getMovieDetails,
  getTVDetails,
  getTVSeason,
  getBackdropUrl,
} from '../lib/tmdb';
import { getVidLinkUrl, setupVidLinkMessageListener } from '../lib/vidlink';
import { CastCard } from '../components/CastCard';
import { SeasonEpisodeSelector } from '../components/SeasonEpisodeSelector';
import { EpisodeGrid } from '../components/EpisodeGrid';
import { PosterCarousel } from '../components/PosterCarousel';
import { PosterCard } from '../components/PosterCard';

export const Player: React.FC = () => {
  const { type, tmdbId } = useParams<{ type: string; tmdbId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Route parameters parsing
  const mediaId = Number(tmdbId);
  const mediaType = type as 'movie' | 'tv';

  const season = searchParams.get('season') ? Number(searchParams.get('season')) : 1;
  const episode = searchParams.get('episode') ? Number(searchParams.get('episode')) : 1;
  const startAt = searchParams.get('startAt') ? Number(searchParams.get('startAt')) : 0;

  // Metadata states
  const [media, setMedia] = useState<(MovieOrShow & { seasons?: Season[] }) | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [similar, setSimilar] = useState<MovieOrShow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TV states
  const [tvEpisodes, setTvEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'episodes' | 'more'>('overview');

  // Ref to hold current details for postMessage callback
  const activeStateRef = useRef({
    tmdbId: String(tmdbId),
    type: mediaType,
    title: '',
    posterPath: null as string | null,
    backdropPath: null as string | null,
    season: mediaType === 'tv' ? season : undefined,
    episode: mediaType === 'tv' ? episode : undefined,
  });

  // Keep ref in sync
  useEffect(() => {
    activeStateRef.current = {
      tmdbId: String(tmdbId),
      type: mediaType,
      title: media?.title || media?.name || '',
      posterPath: media?.poster_path || null,
      backdropPath: media?.backdrop_path || null,
      season: mediaType === 'tv' ? season : undefined,
      episode: mediaType === 'tv' ? episode : undefined,
    };
  }, [media, type, tmdbId, season, episode]);

  // Load details
  useEffect(() => {
    const loadMediaDetails = async () => {
      if (isNaN(mediaId)) return;

      try {
        setIsLoading(true);
        setError(null);
        let data: any;

        if (mediaType === 'movie') {
          data = await getMovieDetails(mediaId);
          setActiveTab('overview');
        } else {
          data = await getTVDetails(mediaId);
          setActiveTab('episodes'); // Default to episode selection for TV shows
        }

        setMedia(data);
        setCast(data.credits?.cast?.slice(0, 10) || []);

        const recommendations = data.recommendations?.results || [];
        const similarTitles = data.similar?.results || [];
        const combined = [...recommendations, ...similarTitles];
        const seen = new Set<number>();
        const deduped = combined.filter((item) => {
          if (seen.has(item.id)) return false;
          seen.add(item.id);
          return true;
        });
        setSimilar(deduped);

      } catch (err) {
        console.error('Error fetching details in player:', err);
        setError('Failed to fetch details. The video will still play if the ID is valid.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMediaDetails();
  }, [type, tmdbId]);

  // Fetch episodes (TV only)
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (mediaType !== 'tv' || isNaN(mediaId) || !season) return;

      try {
        setEpisodesLoading(true);
        const data = await getTVSeason(mediaId, season);
        setTvEpisodes(data.episodes || []);
      } catch (err) {
        console.error(`Error fetching episodes for season ${season}:`, err);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [season, tmdbId, mediaType]);

  // Setup VidLink postMessage Listeners
  useEffect(() => {
    const getter = () => {
      if (!media) return null;
      return activeStateRef.current;
    };

    const cleanup = setupVidLinkMessageListener(getter);
    return () => cleanup();
  }, [media]);

  const handleEpisodeSelect = (episodeNumber: number, _episodeName: string) => {
    setSearchParams({
      season: String(season),
      episode: String(episodeNumber),
    });
  };

  const handleSeasonChange = (seasonNumber: number) => {
    setSearchParams({
      season: String(seasonNumber),
      episode: '1',
    });
  };

  const playUrl = getVidLinkUrl(
    String(tmdbId),
    mediaType,
    mediaType === 'tv' ? season : undefined,
    mediaType === 'tv' ? episode : undefined,
    startAt
  );

  const title = media?.title || media?.name || media?.original_title || 'Media Player';
  const releaseDate = media?.release_date || media?.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = media?.vote_average ? media.vote_average.toFixed(1) : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg-dark text-white pt-20 px-4 md:px-8 lg:px-12 pb-16 text-left"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(`/details/${mediaType}/${tmdbId}`)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-brand transition-colors cursor-pointer w-fit select-none font-semibold mb-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Details</span>
        </button>

        {/* Video Player Embed 16:9 Wrapper */}
        <div className="relative w-full aspect-video rounded-2xl bg-black border border-white/5 shadow-2xl overflow-hidden">
          <iframe
            src={playUrl}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            title={`${title} Player`}
          />
        </div>

        {/* Info & Browsing Section Below Player */}
        <div className="mt-4 flex flex-col gap-6">
          
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {title}
              </h1>
              
              {mediaType === 'tv' && (
                <p className="text-sm font-bold text-brand uppercase tracking-wider">
                  Season {season}, Episode {episode}
                </p>
              )}
            </div>

            {/* Quick Metadata */}
            <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-300 font-medium">
              <div className="flex items-center gap-1 font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                <Star size={14} fill="currentColor" />
                <span>{rating}</span>
              </div>
              {year && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-gray-500" />
                  <span>{year}</span>
                </span>
              )}
              <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-white/10 font-bold border border-white/5">
                {mediaType}
              </span>
            </div>
          </div>

          {/* Netflix Style Immersive Tabs Selector */}
          <div className="flex border-b border-white/5 text-sm font-bold select-none gap-6">
            {mediaType === 'tv' && (
              <button
                onClick={() => setActiveTab('episodes')}
                className={`py-3 relative flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'episodes' ? 'text-brand' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListVideo size={16} />
                <span>Episodes</span>
                {activeTab === 'episodes' && (
                  <motion.div layoutId="playerTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
                )}
              </button>
            )}

            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'overview' ? 'text-brand' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Info size={16} />
              <span>Details & Cast</span>
              {activeTab === 'overview' && (
                <motion.div layoutId="playerTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('more')}
              className={`py-3 relative flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'more' ? 'text-brand' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play size={14} fill="currentColor" />
              <span>More Like This</span>
              {activeTab === 'more' && (
                <motion.div layoutId="playerTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
              )}
            </button>
          </div>

          {/* Tab Contents */}
          <div className="py-2">
            {activeTab === 'episodes' && mediaType === 'tv' && media?.seasons && (
              <div className="flex flex-col gap-6">
                <SeasonEpisodeSelector
                  seasons={media.seasons}
                  selectedSeason={season}
                  onSeasonChange={handleSeasonChange}
                />
                
                <EpisodeGrid
                  episodes={tvEpisodes}
                  selectedEpisode={episode}
                  onEpisodeSelect={handleEpisodeSelect}
                  isLoading={episodesLoading}
                />
              </div>
            )}

            {activeTab === 'overview' && media && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-bold text-white uppercase tracking-wider">Overview</h3>
                    <p className="text-gray-300 leading-relaxed font-light text-sm sm:text-base">
                      {media.overview || 'No overview description available.'}
                    </p>
                  </div>
                  
                  {cast.length > 0 && (
                    <div className="flex flex-col gap-3">
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">Cast</h3>
                      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        {cast.map((member) => (
                          <CastCard key={member.credit_id || member.id} person={member} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Sidebar Info */}
                <div className="bg-surface-dark/30 p-5 rounded-2xl border border-white/5 h-fit flex flex-col gap-4 text-sm font-light">
                  <h4 className="font-bold text-white mb-1">Production Details</h4>
                  
                  {media.genres && media.genres.length > 0 && (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Genres</span>
                      <span className="text-gray-300 font-medium">{media.genres.map(g => g.name).join(', ')}</span>
                    </div>
                  )}
                  
                  {media.tagline && (
                    <div className="flex flex-col gap-1 mt-2">
                      <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Tagline</span>
                      <span className="text-gray-300 italic">"{media.tagline}"</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'more' && (
              <div>
                {similar.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {similar.map((item) => (
                      <PosterCard key={item.id} media={item} fallbackMediaType={mediaType} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No similar titles found.</p>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </motion.div>
  );
};
