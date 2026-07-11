import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MovieOrShow } from '../types';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRated,
  getRecommendationsWithSource,
  getMovieGenres,
  discoverMedia,
} from '../lib/tmdb';
import { getContinueWatchingList } from '../lib/vidlink';
import { getWatchlist } from '../lib/watchlist';
import { Hero } from '../components/Hero';
import { ContinueWatchingRow } from '../components/ContinueWatchingRow';
import { PosterCarousel } from '../components/PosterCarousel';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') as 'movie' | 'tv' | null;
  const genreId = searchParams.get('genre');

  const [heroMedia, setHeroMedia] = useState<MovieOrShow | null>(null);
  const [recommended, setRecommended] = useState<MovieOrShow[]>([]);
  const [recommendationSource, setRecommendationSource] = useState<string>('');
  const [watchlistItems, setWatchlistItems] = useState<MovieOrShow[]>([]);
  const [popularMovies, setPopularMovies] = useState<MovieOrShow[]>([]);
  const [popularTV, setPopularTV] = useState<MovieOrShow[]>([]);
  const [topRated, setTopRated] = useState<MovieOrShow[]>([]);
  const [genreName, setGenreName] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load watchlist items
      const watchlist = getWatchlist();
      setWatchlistItems(watchlist);

      const history = getContinueWatchingList();

      if (genreId) {
        // Fetch genre catalogs to find the name of the genre
        const genresRes = await getMovieGenres();
        const activeGenre = genresRes.genres?.find(g => String(g.id) === genreId);
        setGenreName(activeGenre ? activeGenre.name : 'Genre');

        // Fetch discover movies/TV for this genre
        const [discoverMoviesRes, discoverTVRes] = await Promise.all([
          discoverMedia('movie', genreId),
          discoverMedia('tv', genreId),
        ]);

        const moviesList = discoverMoviesRes.results || [];
        const tvList = discoverTVRes.results || [];

        setPopularMovies(moviesList);
        setPopularTV(tvList);
        setTopRated([]); // Reset top rated during genre browsing
        setRecommended([]); // Disable recommendations in genre mode

        // Select hero from genre movies
        const validHeroItems = moviesList.filter(item => item.backdrop_path && item.overview);
        if (validHeroItems.length > 0) {
          setHeroMedia(validHeroItems[Math.floor(Math.random() * Math.min(5, validHeroItems.length))]);
        } else if (moviesList.length > 0) {
          setHeroMedia(moviesList[0]);
        }

      } else {
        // Standard Browse All / Movies / TV shows
        setGenreName('');
        
        const [trendingRes, popularMoviesRes, popularTVRes, topRatedRes, recsRes] = await Promise.all([
          getTrending('all', 'week'),
          getPopularMovies(),
          getPopularTVShows(),
          getTopRated(),
          getRecommendationsWithSource(history),
        ]);

        const trendingList = trendingRes.results || [];
        
        // Select Hero
        if (filter === 'movie') {
          const validMovies = (popularMoviesRes.results || []).filter(item => item.backdrop_path && item.overview);
          if (validMovies.length > 0) {
            setHeroMedia(validMovies[Math.floor(Math.random() * Math.min(5, validMovies.length))]);
          }
        } else if (filter === 'tv') {
          const validTVs = (popularTVRes.results || []).filter(item => item.backdrop_path && item.overview);
          if (validTVs.length > 0) {
            setHeroMedia(validTVs[Math.floor(Math.random() * Math.min(5, validTVs.length))]);
          }
        } else {
          const validHeroItems = trendingList.filter(item => item.backdrop_path && item.overview);
          if (validHeroItems.length > 0) {
            const randomIndex = Math.floor(Math.random() * Math.min(5, validHeroItems.length));
            setHeroMedia(validHeroItems[randomIndex]);
          } else if (trendingList.length > 0) {
            setHeroMedia(trendingList[0]);
          }
        }

        setPopularMovies(popularMoviesRes.results || []);
        setPopularTV(popularTVRes.results || []);
        setTopRated(topRatedRes.results || []);
        setRecommended(recsRes.results || []);
        setRecommendationSource(recsRes.sourceTitle || '');
      }

    } catch (err: any) {
      console.error('Error fetching home page data:', err);
      setError('Failed to load content. Please make sure your TMDB API key is configured correctly.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, genreId]);

  useEffect(() => {
    loadData();
  }, [refreshKey, loadData]);

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
    // Force refresh rows when items are modified
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
        <ContinueWatchingRow filter={filter} onRefreshNeeded={handleRefresh} />

        {/* My List Row */}
        {!genreId && watchlistItems.length > 0 && (
          <PosterCarousel
            title="My List"
            items={watchlistItems}
            isLoading={isLoading}
          />
        )}

        {/* Recommended For You */}
        {!genreId && recommended.length > 0 && (
          <PosterCarousel
            title={recommendationSource ? `Recommended: Because you watched ${recommendationSource}` : 'Recommended For You'}
            items={recommended}
            isLoading={isLoading}
          />
        )}

        {/* Popular Movies (or Genre Movies) */}
        {(!filter || filter === 'movie') && popularMovies.length > 0 && (
          <PosterCarousel
            title={genreName ? `${genreName} Movies` : 'Popular Movies'}
            items={popularMovies}
            fallbackMediaType="movie"
            isLoading={isLoading}
          />
        )}

        {/* Popular TV Shows (or Genre TV Shows) */}
        {(!filter || filter === 'tv') && popularTV.length > 0 && (
          <PosterCarousel
            title={genreName ? `${genreName} TV Shows` : 'Popular TV Shows'}
            items={popularTV}
            fallbackMediaType="tv"
            isLoading={isLoading}
          />
        )}

        {/* Top Rated */}
        {!genreId && (!filter || filter === 'movie') && topRated.length > 0 && (
          <PosterCarousel
            title="Top Rated Movies"
            items={topRated}
            fallbackMediaType="movie"
            isLoading={isLoading}
          />
        )}
      </div>
    </motion.div>
  );
};
