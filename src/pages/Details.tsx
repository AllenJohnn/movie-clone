import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Star, Calendar, Clock, Film, ChevronRight, User, Plus, Check } from 'lucide-react';
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
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../lib/watchlist';
import { getAverageColor, getCachedColor } from '../lib/colors';

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

  // Watchlist & Accent Color states
  const [isInList, setIsInList] = useState(false);
  const [accentColor, setAccentColor] = useState<string>('#e50914');

  const mediaId = Number(id);
  const mediaType = type as 'movie' | 'tv';

  // Watchlist Sync
  useEffect(() => {
    if (isNaN(mediaId)) return;
    setIsInList(isInWatchlist(mediaId));
  }, [mediaId]);

  // Color Extraction
  useEffect(() => {
    if (media) {
      const cacheKey = `${media.id}_${mediaType}`;
      const cached = getCachedColor(cacheKey);
      setAccentColor(cached);

      const poster = getPosterUrl(media.poster_path);
      if (poster) {
        getAverageColor(poster, cacheKey).then((color) => {
          setAccentColor(color);
        });
      }
    }
  }, [media, mediaType]);

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

      } catch (err: any) {
        console.error('Error fetching details page data:', err);
        setError('Failed to load page details. Please make sure TMDB is reachable and your API key is correct.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [mediaId, mediaType]);

  // Load episodes when selectedSeason changes (TV only)
  useEffect(() => {
    const loadEpisodes = async () => {
      if (mediaType !== 'tv' || isNaN(mediaId)) return;
      
      try {
        setEpisodesLoading(true);
        const data = await getTVSeason(mediaId, selectedSeason);
        setEpisodes(data.episodes || []);
      } catch (err) {
        console.error('Error loading episodes:', err);
        setEpisodes([]);
      } finally {
        setEpisodesLoading(false);
      }
    };

    loadEpisodes();
  }, [selectedSeason, mediaId, mediaType]);

  const handlePlayClick = () => {
    if (!media) return;
    if (mediaType === 'tv') {
      const episodeNum = lastWatched?.episode || 1;
      const seasonNum = lastWatched?.season || 1;
      const startAtSecs = lastWatched?.currentTime || 0;
      navigate(`/player/tv/${media.id}?season=${seasonNum}&episode=${episodeNum}&startAt=${startAtSecs}`);
    } else {
      const startAtSecs = lastWatched?.currentTime || 0;
      navigate(`/player/movie/${media.id}?startAt=${startAtSecs}`);
    }
  };

  const handleEpisodePlay = (episodeNum: number) => {
    if (!media) return;
    // Check if there is watch progress for this specific episode
    const hist = getContinueWatchingItem(String(mediaId), 'tv');
    const startAtSecs = (hist?.season === selectedSeason && hist?.episode === episodeNum) 
      ? hist.currentTime 
      : 0;
      
    navigate(`/player/tv/${media.id}?season=${selectedSeason}&episode=${episodeNum}&startAt=${startAtSecs}`);
  };

  const handleWatchlistToggle = () => {
    if (!media) return;
    if (isInList) {
      removeFromWatchlist(media.id);
      setIsInList(false);
    } else {
      addToWatchlist({ ...media, media_type: mediaType });
      setIsInList(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-t-brand border-white/10 animate-spin" />
          <span className="text-gray-400 text-sm font-medium">Loading details...</span>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center p-6">
        <div className="max-w-md text-center p-8 rounded-2xl bg-surface-dark border border-white/5 shadow-2xl">
          <h2 className="text-xl font-bold text-brand mb-3">Failed to load Details</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">{error || 'Title not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const title = media.title || media.name || media.original_title || media.original_name || 'Details';
  const posterUrl = getPosterUrl(media.poster_path);
  const backdropUrl = getBackdropUrl(media.backdrop_path);
  
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? releaseDate.split('-')[0] : '';
  const rating = media.vote_average ? media.vote_average.toFixed(1) : 'N/A';

  // Duration formatting (e.g. 2h 15m)
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
          style={{ backgroundColor: accentColor, boxShadow: `0 10px 25px -5px ${accentColor}80` }}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl active:scale-95 transition-all cursor-pointer"
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
            <img src={posterUrl} alt={title} className="w-full h-full object-cover animate-fade-in" />
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
              <p
                style={{ color: accentColor }}
                className="font-medium italic text-sm sm:text-base"
              >
                "{media.tagline}"
              </p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-300 font-medium mt-1">
              <div
                style={{ color: accentColor, borderColor: `${accentColor}33`, backgroundColor: `${accentColor}11` }}
                className="flex items-center gap-1 font-semibold px-2 py-0.5 rounded border"
              >
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
                    className="text-xs bg-surface-dark/80 hover:bg-white/10 transition-colors border border-white/5 px-3 py-1 rounded-xl text-gray-300 cursor-pointer"
                    onClick={() => navigate(`/?genre=${genre.id}`)}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons (Desktop) */}
            <div className="hidden md:flex items-center gap-4 mt-6">
              <button
                onClick={handlePlayClick}
                style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px 0 ${accentColor}4d` }}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-lg"
              >
                <Play size={18} fill="currentColor" className="text-white ml-0.5" />
                <span>
                  {lastWatched 
                    ? `Resume (S${lastWatched.season || 1}:E${lastWatched.episode || 1})` 
                    : 'Play Now'}
                </span>
              </button>

              <button
                onClick={handleWatchlistToggle}
                style={{ 
                  borderColor: accentColor, 
                  color: isInList ? '#ffffff' : accentColor,
                  backgroundColor: isInList ? `${accentColor}26` : 'transparent'
                }}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border font-bold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm shadow-md"
              >
                {isInList ? <Check size={18} /> : <Plus size={18} />}
                <span>{isInList ? 'In My List' : 'Add to Watchlist'}</span>
              </button>

              {lastWatched && (
                <span className="text-xs text-gray-400 font-light">
                  Last watched at {Math.floor(lastWatched.progress * 100)}%
                </span>
              )}
            </div>

            {/* Action Buttons (Mobile Layout) */}
            <div className="flex md:hidden flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handlePlayClick}
                style={{ backgroundColor: accentColor, boxShadow: `0 4px 14px 0 ${accentColor}4d` }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold transition-all duration-200 active:scale-95 cursor-pointer text-sm w-full"
              >
                <Play size={16} fill="currentColor" className="text-white ml-0.5" />
                <span>
                  {lastWatched 
                    ? `Resume (S${lastWatched.season || 1}:E${lastWatched.episode || 1})` 
                    : 'Play Now'}
                </span>
              </button>

              <button
                onClick={handleWatchlistToggle}
                style={{ 
                  borderColor: accentColor, 
                  color: isInList ? '#ffffff' : accentColor,
                  backgroundColor: isInList ? `${accentColor}26` : 'transparent'
                }}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border font-bold transition-all duration-200 active:scale-95 cursor-pointer text-sm w-full backdrop-blur-sm"
              >
                {isInList ? <Check size={16} /> : <Plus size={16} />}
                <span>{isInList ? 'In My List' : 'Add to Watchlist'}</span>
              </button>
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
            <h2
              style={{ borderLeftColor: accentColor }}
              className="text-xl font-bold text-white border-l-4 pl-3"
            >
              Overview
            </h2>
            <p className="text-gray-300 leading-relaxed font-light text-base">
              {media.overview || 'No overview description available.'}
            </p>
          </motion.div>

          {/* Cast Cards */}
          {cast.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2
                style={{ borderLeftColor: accentColor }}
                className="text-xl font-bold text-white border-l-4 pl-3"
              >
                Cast Members
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
                {cast.map((member) => (
                  <CastCard key={member.id} person={member} />
                ))}
              </div>
            </div>
          )}

          {/* Episodes Section (TV Only) */}
          {mediaType === 'tv' && media.seasons && media.seasons.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2
                style={{ borderLeftColor: accentColor }}
                className="text-xl font-bold text-white border-l-4 pl-3 mb-4"
              >
                Episodes Catalog
              </h2>
              
              {/* Season Selection */}
              <SeasonEpisodeSelector
                seasons={media.seasons}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
              />

              {/* Episodes List */}
              <EpisodeGrid
                episodes={episodes}
                isLoading={episodesLoading}
                onPlayEpisode={handleEpisodePlay}
                accentColor={accentColor}
                currentEpisodeNumber={lastWatched?.season === selectedSeason ? lastWatched.episode : undefined}
              />
            </div>
          )}

        </div>

        {/* Right 1 Column: Meta Details (Directors, Status, etc.) */}
        <div className="flex flex-col gap-6 bg-surface-dark/30 border border-white/5 rounded-2xl p-6 h-fit text-left">
          
          {/* Creator (TV Only) */}
          {creators.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                Creators
              </span>
              <div className="flex flex-wrap gap-2">
                {creators.map((c) => (
                  <span
                    key={c.id}
                    className="text-sm font-semibold text-gray-200"
                  >
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
                    style={{ '--hover-color': accentColor } as React.CSSProperties}
                    className="text-sm font-semibold text-gray-200 hover:text-[var(--hover-color)] cursor-pointer flex items-center gap-1.5 transition-colors"
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
