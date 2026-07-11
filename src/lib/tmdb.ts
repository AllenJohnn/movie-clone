import { MovieOrShow, Person, Season, ContinueWatchingItem } from '../types';

const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

async function fetchFromTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  if (!apiKey) {
    console.warn("VITE_TMDB_API_KEY is not defined. Please configure it in your .env file.");
  }

  const queryParams = new URLSearchParams({
    api_key: apiKey || '',
    language: 'en-US',
    ...params
  });
  
  const url = `https://api.themoviedb.org/3${endpoint}?${queryParams.toString()}`;
  
  // Check Cache
  const cached = cache.get(url);
  if (cached && cached.expiry > Date.now()) {
    return cached.data as T;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText} at ${endpoint}`);
  }
  
  const data = await response.json();
  cache.set(url, { data, expiry: Date.now() + CACHE_DURATION });
  return data as T;
}

export const getPosterUrl = (path: string | null) => 
  path ? `https://image.tmdb.org/t/p/w500${path}` : null;

export const getBackdropUrl = (path: string | null) => 
  path ? `https://image.tmdb.org/t/p/original${path}` : null;

export const getProfileUrl = (path: string | null) => 
  path ? `https://image.tmdb.org/t/p/w185${path}` : null;

export const getStillUrl = (path: string | null) =>
  path ? `https://image.tmdb.org/t/p/w300${path}` : null;

export async function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week') {
  return fetchFromTMDB<{ results: MovieOrShow[] }>(`/trending/${mediaType}/${timeWindow}`);
}

export async function getPopularMovies() {
  return fetchFromTMDB<{ results: MovieOrShow[] }>('/movie/popular');
}

export async function getPopularTVShows() {
  return fetchFromTMDB<{ results: MovieOrShow[] }>('/tv/popular');
}

export async function getTopRated() {
  // We fetch top rated movies as the main Top Rated carousel
  return fetchFromTMDB<{ results: MovieOrShow[] }>('/movie/top_rated');
}

export async function getMovieDetails(id: number) {
  return fetchFromTMDB<MovieOrShow & {
    credits: { cast: any[]; crew: any[] };
    recommendations: { results: MovieOrShow[] };
    similar: { results: MovieOrShow[] };
  }>(`/movie/${id}`, { append_to_response: 'credits,recommendations,similar' });
}

export async function getTVDetails(id: number) {
  return fetchFromTMDB<MovieOrShow & {
    credits: { cast: any[]; crew: any[] };
    recommendations: { results: MovieOrShow[] };
    similar: { results: MovieOrShow[] };
  }>(`/tv/${id}`, { append_to_response: 'credits,recommendations,similar' });
}

export async function getTVSeason(tvId: number, seasonNumber: number) {
  return fetchFromTMDB<{ episodes: any[] }>(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function searchMulti(query: string, page = 1) {
  return fetchFromTMDB<{ results: (MovieOrShow & { media_type: 'movie' | 'tv' | 'person' })[]; total_pages: number }>(
    '/search/multi', 
    { query, page: String(page), include_adult: 'false' }
  );
}

export async function getPersonDetails(id: number) {
  return fetchFromTMDB<Person>(`/person/${id}`, { append_to_response: 'combined_credits' });
}

export async function getRecommendedForYou(progressItems: ContinueWatchingItem[]): Promise<MovieOrShow[]> {
  if (!progressItems || progressItems.length === 0) {
    const trending = await getTrending('all', 'week');
    return trending.results || [];
  }
  
  // Sort by lastUpdated descending, get the 3 most recently updated items
  const recentWatch = [...progressItems]
    .sort((a, b) => b.lastUpdated - a.lastUpdated)
    .slice(0, 3);
    
  const recommendationPromises = recentWatch.map(item => {
    return fetchFromTMDB<{ results: MovieOrShow[] }>(`/${item.type}/${item.tmdbId}/recommendations`)
      .then(res => res.results.map(r => ({ ...r, media_type: item.type })))
      .catch(() => [] as MovieOrShow[]);
  });
  
  const resultsArray = await Promise.all(recommendationPromises);
  const combined = resultsArray.flat();
  
  // Deduplicate
  const seen = new Set<number>();
  const deduped = combined.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
  
  if (deduped.length === 0) {
    const trending = await getTrending('all', 'week');
    return trending.results || [];
  }
  
  return deduped;
}
