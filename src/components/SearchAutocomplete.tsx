import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, Film, Loader } from 'lucide-react';
import { Movie } from '../types';
import { popularMovies } from '../data/movies';

interface SearchAutocompleteProps {
  onSelectMovie: (movie: Movie) => void;
}

interface Suggestion {
  id: string;
  title: string;
  genres: string[];
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
}

export default function SearchAutocomplete({ onSelectMovie }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter Suggestions locally while typing (100% Client-Side for Netlify Compatibility)
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(true);
      try {
        const lowerQuery = query.toLowerCase().trim();
        const results = popularMovies
          .filter(m => 
            m.title.toLowerCase().includes(lowerQuery) ||
            m.genres.some(g => g.toLowerCase().includes(lowerQuery)) ||
            m.director.toLowerCase().includes(lowerQuery) ||
            m.keywords.some(k => k.toLowerCase().includes(lowerQuery))
          )
          .slice(0, 8)
          .map(m => ({
            id: m.id,
            title: m.title,
            genres: m.genres,
            posterPath: m.posterPath,
            releaseDate: m.releaseDate,
            voteAverage: m.voteAverage
          }));
        setSuggestions(results);
        setIsOpen(true);
      } catch (err) {
        console.error('Autocomplete query failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150); // Fast client-side debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (suggestionId: string) => {
    const movie = popularMovies.find(m => m.id === suggestionId);
    if (movie) {
      onSelectMovie(movie);
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} id="search-container" className="relative w-full max-w-xl mx-auto">
      <div className="relative">
        <input
          type="text"
          id="search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search movie title, director, keyword, or genre..."
          className="w-full pl-12 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-600 focus:border-transparent transition-all duration-300 backdrop-blur-md shadow-lg text-sm md:text-base font-sans"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500">
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin text-red-600" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>
        {query && (
          <button
            id="clear-search-btn"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="search-suggestions"
          className="absolute left-0 right-0 mt-2 bg-neutral-950/95 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-50 card-blur animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="p-2 border-b border-neutral-800 flex justify-between items-center text-xs text-neutral-500 font-mono">
            <span>SUGGESTED TITLES</span>
            <span>{suggestions.length} results</span>
          </div>
          <div className="max-h-[360px] overflow-y-auto">
            {suggestions.map((movie) => (
              <button
                key={movie.id}
                id={`suggestion-${movie.id}`}
                onClick={() => handleSelect(movie.id)}
                className="w-full px-4 py-3 flex items-center gap-4 text-left hover:bg-neutral-900 transition-colors border-b border-neutral-900/50 last:border-0"
              >
                <div className="w-10 h-14 flex-shrink-0 bg-neutral-800 rounded-md overflow-hidden relative border border-neutral-700/50">
                  {movie.posterPath ? (
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <Film className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate text-sm hover:text-red-500 transition-colors">
                    {movie.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                    <span className="font-mono">{movie.releaseDate.split('-')[0]}</span>
                    <span>•</span>
                    <span className="truncate">{movie.genres.slice(0, 2).join(', ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800 text-xs text-yellow-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono font-medium">{movie.voteAverage.toFixed(1)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query.trim() && !isLoading && suggestions.length === 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-neutral-950/95 border border-neutral-800 rounded-2xl p-6 text-center text-neutral-400 z-50 card-blur">
          <Film className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
          <p className="text-sm">No exact matches found for "{query}".</p>
          <p className="text-xs text-neutral-500 mt-1">Try searching for keywords like "dream", "space", "batman", or "musical"!</p>
        </div>
      )}
    </div>
  );
}
