import React from 'react';
import { Star, Eye, Calendar, Sparkles } from 'lucide-react';
import { Movie } from '../types';

interface MovieSliderProps {
  id: string;
  title: string;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
  showSimilarityScore?: boolean;
}

export default function MovieSlider({ id, title, movies, onSelectMovie, showSimilarityScore = false }: MovieSliderProps) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <div id={`slider-section-${id}`} className="py-6 select-none relative z-20">
      <div className="flex items-center gap-3 px-4 md:px-12 mb-4">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display border-l-4 border-[#E50914] pl-3">
          {title}
        </h2>
        {showSimilarityScore && (
          <span className="flex items-center gap-1 text-[10px] bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20 font-mono font-semibold uppercase px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" /> Content-Based Match Engine
          </span>
        )}
      </div>

      {/* Horizontal Scrolling Track */}
      <div
        id={`scroll-track-${id}`}
        className="flex gap-4 md:gap-6 overflow-x-auto overflow-y-hidden px-4 md:px-12 pb-6 scroll-smooth snap-x snap-mandatory scrollbar-none"
      >
        {movies.map((movie) => {
          // Check if movie has similarityScore injected (from recommend endpoint)
          const similarityPercent = (movie as any).similarityScore
            ? Math.round((movie as any).similarityScore * 100)
            : null;

          return (
            <div
              key={movie.id}
              id={`movie-card-${id}-${movie.id}`}
              onClick={() => onSelectMovie(movie)}
              className="flex-shrink-0 w-44 md:w-56 snap-start cursor-pointer group relative bg-[#111111]/90 rounded-xl overflow-hidden border border-white/5 hover:border-[#E50914] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#E50914]/20"
            >
              {/* Poster Frame */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-neutral-950">
                <img
                  src={movie.posterPath}
                  alt={movie.title}
                  className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                
                {/* Similarity Match Badge Overlay */}
                {similarityPercent !== null && (
                  <div className="absolute top-2 right-2 bg-black/80 border border-[#E50914]/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#E50914] z-10 shadow-lg">
                    {similarityPercent}% MATCH
                  </div>
                )}

                {/* Rating Badge Overlay */}
                {similarityPercent === null && (
                  <div className="absolute top-2 right-2 bg-black/70 border border-neutral-800 px-2 py-0.5 rounded text-[10px] font-mono font-semibold text-yellow-500 z-10 flex items-center gap-1 shadow-md">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{movie.voteAverage.toFixed(1)}</span>
                  </div>
                )}

                {/* Quick Info Hover Glass-overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-10 card-blur">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 font-mono mb-1.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {movie.releaseDate.split('-')[0]}
                    </span>
                    <span>{movie.runtime}m</span>
                  </div>
                  <div className="text-xs font-semibold text-white line-clamp-1 mb-1">{movie.director}</div>
                  <p className="text-[10px] text-neutral-400 line-clamp-2 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>
              </div>

              {/* Title Card Info Bar */}
              <div className="p-3">
                <h3 className="font-semibold text-sm md:text-base text-neutral-200 group-hover:text-[#E50914] transition-colors truncate">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-400 truncate">
                  {movie.genres.slice(0, 2).map((g, idx) => (
                    <React.Fragment key={g}>
                      <span>{g}</span>
                      {idx < movie.genres.slice(0, 2).length - 1 && (
                        <span className="text-neutral-600">•</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
