export interface MovieOrShow {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  media_type?: 'movie' | 'tv' | 'person';
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: Genre[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: Season[];
  tagline?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  episode_count: number;
  air_date?: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date?: string;
  vote_average?: number;
}

export interface CastMember {
  id: number;
  credit_id?: string;
  name: string;
  original_name: string;
  character: string;
  profile_path: string | null;
  known_for_department: string;
  order: number;
}

export interface CrewMember {
  id: number;
  credit_id?: string;
  name: string;
  original_name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  known_for_department: string;
  place_of_birth: string | null;
  birthday: string | null;
  deathday: string | null;
  combined_credits?: {
    cast: MovieOrShow[];
    crew: MovieOrShow[];
  };
}

export interface ContinueWatchingItem {
  tmdbId: string;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number;
  episode?: number;
  episodeName?: string;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  duration: number; // in seconds
  lastUpdated: number;
}
