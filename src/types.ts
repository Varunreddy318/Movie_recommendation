export interface Movie {
  id: string; // TMDB or internal ID
  title: string;
  tagline?: string;
  overview: string;
  genres: string[];
  keywords: string[];
  runtime: number; // in minutes
  language: string;
  releaseDate: string;
  budget?: number;
  revenue?: number;
  voteAverage: number;
  voteCount: number;
  productionCompanies?: string[];
  director: string;
  cast: {
    name: string;
    character: string;
    profilePath?: string;
  }[];
  posterPath: string; // TMDB path or full URL
  backdropPath: string; // TMDB path or full URL
  trailerKey?: string; // YouTube key
}

export interface Review {
  author: string;
  content: string;
  rating?: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}
