import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Film, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MovieOrShow } from '../types';
import { searchMulti, getTrending } from '../lib/tmdb';
import { PosterCard } from '../components/PosterCard';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState<MovieOrShow[]>([]);
  const [trendingList, setTrendingList] = useState<MovieOrShow[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce query input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Load trending as initial state
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await getTrending('all', 'day');
        // Show only movies and TV shows
        const filtered = (res.results || []).filter(
          item => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setTrendingList(filtered);
      } catch (err) {
        console.error('Error fetching trending search fallbacks:', err);
      }
    };
    fetchTrending();
  }, []);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const res = await searchMulti(debouncedQuery);
        // Filter out people credits from search, we only want movies and tv shows
        const filtered = (res.results || []).filter(
          item => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setResults(filtered);
      } catch (err) {
        console.error('Error searching:', err);
        setError('Failed to search titles. Please check your network connection.');
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-bg-dark pt-24 px-4 md:px-8 lg:px-12 pb-16"
    >
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6">
        
        {/* Search bar */}
        <div className="relative w-full max-w-2xl mx-auto z-10">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon size={20} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-card-dark border border-white/5 focus:border-brand/40 focus:outline-none focus:ring-1 focus:ring-brand/40 text-white placeholder-gray-400 transition-all duration-300 shadow-xl text-base"
          />

          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Search status states */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full mt-8">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] w-full rounded-xl bg-card-dark animate-shimmer"
                />
              ))}
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertCircle size={40} className="text-brand mb-4 animate-bounce" />
            <h3 className="text-lg font-bold text-white mb-1">Search Error</h3>
            <p className="text-sm text-gray-400">{error}</p>
          </div>
        )}

        {/* Empty Search State */}
        {!query && !isLoading && !error && (
          <div className="mt-8">
            <h2 className="text-lg md:text-xl font-bold mb-6 text-white/95">
              Popular Searches
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {trendingList.map((item) => (
                <PosterCard key={item.id} media={item} />
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {query && debouncedQuery && results.length === 0 && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film size={44} className="text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Results Found</h3>
            <p className="text-sm text-gray-400 max-w-sm">
              We couldn't find any movie or TV show matching "{debouncedQuery}". Try another search term.
            </p>
          </div>
        )}

        {/* Search Results Grid */}
        {results.length > 0 && !isLoading && !error && (
          <div className="mt-6">
            <h2 className="text-lg md:text-xl font-bold mb-6 text-white/95">
              Search Results for "{debouncedQuery}"
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {results.map((item) => (
                <PosterCard key={item.id} media={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
