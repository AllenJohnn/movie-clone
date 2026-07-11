import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MovieOrShow } from '../types';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRated,
  getRecommendedForYou,
} from '../lib/tmdb';
import { getContinueWatchingList } from '../lib/vidlink';
import { Hero } from '../components/Hero';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { PosterCarousel } from '../components/PosterCarousel';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [heroMedia, setHeroMedia] = useState<MovieOrShow | null>(null);
  const [recommended, setRecommended] = useState<MovieOrShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieOrShow[]>([]);
  const [popularTV, setPopularTV] = useState<MovieOrShow[]>([]);
  const [topRated, setTopRated] = useState<MovieOrShow[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch trending, popular movies, popular tv, and top rated in parallel
      const [trendingRes, popularMoviesRes, popularTVRes, topRatedRes] = await Promise.all([
        getTrending('all', 'week'),
        getPopularMovies(),
        getPopularTVShows(),
        getTopRated(),
      ]);

      const trendingList = trendingRes.results || [];
      
      // Select a random popular item from trending that has a backdrop
      const validHeroItems = trendingList.filter(item => item.backdrop_path && item.overview);
      if (validHeroItems.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(5, validHeroItems.length));
        setHeroMedia(validHeroItems[randomIndex]);
      } else if (trendingList.length > 0) {
        setHeroMedia(trendingList[0]);
      }

      setPopularMovies(popularMoviesRes.results || []);
      setPopularTV(popularTVRes.results || []);
      setTopRated(topRatedRes.results || []);

      // Fetch recommended for you (depends on local storage history)
      const history = getContinueWatchingList();
      const recommendedList = await getRecommendedForYou(history);
      setRecommended(recommendedList);

    } catch (err: any) {
      console.error('Error fetching home page data:', err);
      setError('Failed to load content. Please make sure your TMDB API key is configured correctly.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handlePlayHero = () => {
    if (!heroMedia) return;
    const mediaType = heroMedia.media_type || (heroMedia.title ? 'movie' : 'tv');
    navigate(`/player/${mediaType}/${heroMedia.id}`);
  };

  const handleInfoHero = () => {
    if (!heroMedia) return;
    const mediaType = heroMedia.media_type || (heroMedia.title ? 'movie' : 'tv');
    navigate(`/details/${mediaType}/${heroMedia.id}`);
  };

  const handleRefresh = () => {
    // Force refresh recommended row when history is cleared
    setRefreshKey(prev => prev + 1);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white p-6">
        <div className="max-w-md text-center p-8 rounded-2xl bg-surface-dark border border-white/5 shadow-2xl">
          <h2 className="text-xl font-bold text-brand mb-3">API Connection Error</h2>
          <p className="text-sm text-gray-400 leading-relaxed mb-6">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="px-6 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-semibold transition-colors duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg-dark pb-16"
    >
      {/* Hero Header */}
      {heroMedia && (
        <Hero
          media={heroMedia}
          onPlay={handlePlayHero}
          onMoreInfo={handleInfoHero}
        />
      )}

      {/* Rows Container */}
      <div className="relative z-20 -mt-8 sm:-mt-12 md:-mt-20">
        {/* Continue Watching Row */}
        <ContinueWatchingRow onRefreshNeeded={handleRefresh} />

        {/* Recommended For You */}
        <PosterCarousel
          title="Recommended For You"
          items={recommended}
          isLoading={isLoading}
        />

        {/* Popular Movies */}
        <PosterCarousel
          title="Popular Movies"
          items={popularMovies}
          fallbackMediaType="movie"
          isLoading={isLoading}
        />

        {/* Popular TV Shows */}
        <PosterCarousel
          title="Popular TV Shows"
          items={popularTV}
          fallbackMediaType="tv"
          isLoading={isLoading}
        />

        {/* Top Rated */}
        <PosterCarousel
          title="Top Rated Movies"
          items={topRated}
          fallbackMediaType="movie"
          isLoading={isLoading}
        />
      </div>
    </motion.div>
  );
};
