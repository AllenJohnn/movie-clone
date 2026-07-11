import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Film, ChevronRight, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { MovieOrShow, CastMember, CrewMember, Episode, Season } from '../types';
import {
  getMovieDetails,
  getTVDetails,
  getTVSeason,
  getPosterUrl,
  getBackdropUrl,
} from '../lib/tmdb';
import { getContinueWatchingItem } from '../lib/vidlink';
import { CastCard } from '../components/CastCard';
import { SeasonEpisodeSelector } from '../components/SeasonEpisodeSelector';
import { EpisodeGrid } from '../components/EpisodeGrid';
import { PosterCarousel } from '../components/PosterCarousel';

export const Details: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  
  const [media, setMedia] = useState<(MovieOrShow & { seasons?: Season[] }) | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [directors, setDirectors] = useState<CrewMember[]>([]);
  const [creators, setCreators] = useState<any[]>([]);
  const [similarRecommendations, setSimilarRecommendations] = useState<MovieOrShow[]>([]);
  
  // TV specific states
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastWatched, setLastWatched] = useState<any>(null);

  const mediaId = Number(id);
  const mediaType = type as 'movie' | 'tv';

  useEffect(() => {
    const fetchDetails = async () => {
      if (isNaN(mediaId)) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch watch history item if exists
        const watchHistory = getContinueWatchingItem(String(mediaId), mediaType);
        setLastWatched(watchHistory || null);

        let data: any;
        if (mediaType === 'movie') {
          data = await getMovieDetails(mediaId);
        } else {
          data = await getTVDetails(mediaId);
          // Set season from watch history, otherwise default to season 1 (or the first season in list)
          const availableSeasons = data.seasons || [];
          const initialSeason = watchHistory?.season || 
            (availableSeasons.length > 0 ? availableSeasons[0].season_number : 1);
          setSelectedSeason(initialSeason);
        }

        setMedia(data);
        setCast(data.credits?.cast?.slice(0, 15) || []);
        
        // Extract Directors / Creators
        if (mediaType === 'movie') {
          const dirs = (data.credits?.crew || []).filter((c: any) => c.job === 'Director');
          setDirectors(dirs);
        } else {
          setCreators(data.created_by || []);
          const executiveDirs = (data.credits?.crew || []).filter(
            (c: any) => c.job === 'Director' || c.job === 'Executive Producer'
          ).slice(0, 2);
          setDirectors(executiveDirs);
        }

        // Merge and dedupe similar & recommended
        const recommendations = data.recommendations?.results || [];
        const similar = data.similar?.results || [];
        const combined = [...recommendations, ...similar];
        const seen = new Set<number>();
        const deduped = combined.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        setSimilarRecommendations(deduped);

      } catch (err) {
        console.error('Error loading details:', err);
        setError('Could not retrieve media details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [type, id]);

  // Fetch TV episodes when season changes
  useEffect(() => {
    const fetchEpisodes = async () => {
      if (mediaType !== 'tv' || isNaN(mediaId) || !selectedSeason) return;

      try {
        setEpisodesLoading(true);
        const data = await getTVSeason(mediaId, selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error(`Error loading season ${selectedSeason} episodes:`, err);
      } finally {
        setEpisodesLoading(false);
      }
    };

    fetchEpisodes();
  }, [selectedSeason, mediaId, mediaType]);

  const handlePlayClick = () => {
    if (mediaType === 'movie') {
      const url = lastWatched 
        ? `/player/movie/${id}?startAt=${lastWatched.currentTime}`
        : `/player/movie/${id}`;
      navigate(url);
    } else {
      const s = lastWatched?.season || 1;
      const e = lastWatched?.episode || 1;
      const start = lastWatched?.currentTime || 0;
      const url = `/player/tv/${id}?season=${s}&episode=${e}&startAt=${start}`;
      navigate(url);
    }
  };

  const handleEpisodeSelect = (episodeNumber: number, _episodeName: string) => {
    // If the episode clicked is the one we already have progress on, carry over startAt
    const startAtParam = (lastWatched && lastWatched.season === selectedSeason && lastWatched.episode === episodeNumber)
      ? `&startAt=${lastWatched.currentTime}`
      : '';
    navigate(`/player/tv/${id}?season=${selectedSeason}&episode=${episodeNumber}${startAtParam}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-dark pt-24 text-white">
        <div className="h-[40vh] w-full bg-card-dark animate-shimmer" />
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 flex flex-col md:flex-row gap-8">
          <div className="w-[200px] sm:w-[260px] aspect-[2/3] rounded-2xl bg-card-dark animate-shimmer flex-none" />
          <div className="flex-grow flex flex-col gap-4">
            <div className="h-10 w-2/3 rounded bg-card-dark animate-shimmer" />
            <div className="h-6 w-1/3 rounded bg-card-dark animate-shimmer" />
            <div className="h-24 w-full rounded bg-card-dark animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white p-6">
        <div className="max-w-md text-center p-8 rounded-2xl bg-surface-dark border border-white/5 shadow-2xl">
          <Film size={40} className="text-brand mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Details Unreachable</h2>
          <p className="text-sm text-gray-400 mb-6">{error || 'Media not found.'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition-colors cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const title = media.title || media.name || media.original_title || media.original_name || 'Untitled';
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';
  const backdropUrl = getBackdropUrl(media.backdrop_path);
  const posterUrl = getPosterUrl(media.poster_path);

  // Runtime / season count string
  let durationInfo = '';
  if (mediaType === 'movie' && media.runtime) {
    const hrs = Math.floor(media.runtime / 60);
    const mins = media.runtime % 60;
    durationInfo = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  } else if (mediaType === 'tv' && media.number_of_seasons) {
    durationInfo = `${media.number_of_seasons} ${media.number_of_seasons === 1 ? 'Season' : 'Seasons'}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg-dark pb-16"
    >
      {/* Backdrop Section */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] md:h-[60vh] lg:h-[65vh] select-none overflow-hidden">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover object-top opacity-35"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-card-dark to-bg-dark opacity-35" />
        )}
        
        {/* Bottom Fade Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark via-bg-dark/40 to-transparent" />
      </div>

      {/* Floating Action Play Button for Scrolling / Mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={handlePlayClick}
          className="w-14 h-14 rounded-full bg-brand flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all shadow-brand/40"
          title="Play Now"
        >
          <Play size={24} fill="currentColor" className="ml-1" />
        </button>
      </div>

      {/* Content Section */}
      <div className="relative max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 -mt-32 sm:-mt-44 md:-mt-52 z-10 flex flex-col md:flex-row gap-6 md:gap-10">
        
        {/* Poster (Left Column) */}
        <div className="w-[180px] sm:w-[240px] md:w-[280px] lg:w-[320px] aspect-[2/3] rounded-2xl overflow-hidden bg-card-dark/40 border border-white/10 shadow-2xl flex-none mx-auto md:mx-0">
          {posterUrl ? (
            <img src={posterUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-card-dark to-surface-dark">
              <Film size={40} className="text-gray-500 mb-2" />
              <span className="text-sm text-gray-400 font-semibold">{title}</span>
            </div>
          )}
        </div>

        {/* Text Info (Right Column) */}
        <div className="flex-grow flex flex-col justify-end text-left pt-4 md:pt-0">
          <div className="flex flex-col gap-3">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h1>

            {/* Tagline */}
            {media.tagline && (
              <p className="text-brand font-medium italic text-sm sm:text-base">
                "{media.tagline}"
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300 font-medium mt-1">
              <div className="flex items-center gap-1 font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                <Star size={14} fill="currentColor" />
                <span>{rating}</span>
              </div>
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{year}</span>
                </div>
              )}
              {durationInfo && (
                <div className="flex items-center gap-1">
                  <Clock size={14} className="text-gray-400" />
                  <span>{durationInfo}</span>
                </div>
              )}
              <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-white/10 font-bold border border-white/5">
                {mediaType}
              </span>
            </div>

            {/* Genre Tags */}
            {media.genres && media.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {media.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs bg-surface-dark/80 hover:bg-white/10 transition-colors border border-white/5 px-3 py-1 rounded-xl text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Play/Resume Button (Desktop) */}
            <div className="hidden md:flex items-center gap-4 mt-6">
              <button
                onClick={handlePlayClick}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-brand/20 cursor-pointer"
              >
                <Play size={18} fill="currentColor" className="text-white ml-0.5" />
                <span>
                  {lastWatched 
                    ? `Resume (S${lastWatched.season || 1}:E${lastWatched.episode || 1})` 
                    : 'Play Now'}
                </span>
              </button>

              {lastWatched && (
                <span className="text-xs text-gray-400 font-light">
                  Last watched at {Math.floor(lastWatched.progress * 100)}%
                </span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Details breakdown */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left 2 Columns: Description, Cast, Episodes */}
        <div className="lg:col-span-2 flex flex-col gap-10 text-left">
          
          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-3"
          >
            <h2 className="text-xl font-bold text-white border-l-4 border-brand pl-3">
              Overview
            </h2>
            <p className="text-gray-300 leading-relaxed font-light text-base">
              {media.overview || 'No overview description available.'}
            </p>
          </motion.div>

          {/* Cast Cards */}
          {cast.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-white border-l-4 border-brand pl-3">
                Cast Members
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                {cast.map((member) => (
                  <CastCard key={member.credit_id || member.id} person={member} />
                ))}
              </div>
            </div>
          )}

          {/* Seasons & Episodes (TV Only) */}
          {mediaType === 'tv' && media.seasons && media.seasons.length > 0 && (
            <div className="flex flex-col border-t border-white/5 pt-8">
              <h2 className="text-xl font-bold text-white border-l-4 border-brand pl-3 mb-4">
                Episodes
              </h2>
              
              <SeasonEpisodeSelector
                seasons={media.seasons}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
              />
              
              <EpisodeGrid
                episodes={episodes}
                selectedEpisode={lastWatched?.season === selectedSeason ? lastWatched.episode : 0}
                onEpisodeSelect={handleEpisodeSelect}
                isLoading={episodesLoading}
              />
            </div>
          )}

        </div>

        {/* Right 1 Column: Key Crew Details */}
        <div className="flex flex-col gap-6 text-left bg-surface-dark/30 p-6 rounded-2xl border border-white/5 h-fit">
          <h3 className="text-lg font-bold text-white mb-2">Production</h3>
          
          {/* Creators (TV) */}
          {mediaType === 'tv' && creators.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Creators</span>
              <div className="flex flex-col gap-1">
                {creators.map((c) => (
                  <span
                    key={c.id}
                    onClick={() => navigate(`/person/${c.id}`)}
                    className="text-sm font-semibold text-gray-200 hover:text-brand cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <User size={12} className="text-gray-400" />
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Directors (Movies/TV) */}
          {directors.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                {mediaType === 'movie' ? 'Directors' : 'Key Directors / Producers'}
              </span>
              <div className="flex flex-col gap-1">
                {directors.map((d) => (
                  <span
                    key={d.id}
                    onClick={() => navigate(`/person/${d.id}`)}
                    className="text-sm font-semibold text-gray-200 hover:text-brand cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <User size={12} className="text-gray-400" />
                    {d.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Status info */}
          <div className="flex flex-col border-t border-white/5 pt-4 mt-2 gap-4">
            {media.release_date && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Release Date</span>
                <span className="text-gray-300 font-semibold">{media.release_date}</span>
              </div>
            )}
            {media.first_air_date && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">First Air Date</span>
                <span className="text-gray-300 font-semibold">{media.first_air_date}</span>
              </div>
            )}
            {media.vote_count > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium">Vote Count</span>
                <span className="text-gray-300 font-semibold">{media.vote_count.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Recommended Carousel */}
      {similarRecommendations.length > 0 && (
        <div className="border-t border-white/5 mt-12 pt-6">
          <PosterCarousel
            title="More Like This"
            items={similarRecommendations}
            fallbackMediaType={mediaType}
          />
        </div>
      )}
    </motion.div>
  );
};
