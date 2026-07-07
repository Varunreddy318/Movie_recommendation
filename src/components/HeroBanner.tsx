import React, { useState } from 'react';
import { Play, Info, Star, Clock, Volume2, VolumeX, Eye } from 'lucide-react';
import { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie;
  onOpenDetails: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  isInWatchlist: boolean;
}

export default function HeroBanner({ movie, onOpenDetails, onToggleWatchlist, isInWatchlist }: HeroBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div id="hero-banner" className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden bg-black select-none">
      {/* Background Image / Video Player */}
      <div className="absolute inset-0 w-full h-full">
        {isPlaying && movie.trailerKey ? (
          <div className="absolute inset-0 w-full h-full bg-black z-10">
            <iframe
              id="hero-youtube-iframe"
              src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=1&controls=1&modestbranding=1&rel=0`}
              title={`${movie.title} Trailer`}
              className="w-full h-full border-0 pointer-events-auto"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            ></iframe>
            <button
              id="close-trailer-btn"
              onClick={() => setIsPlaying(false)}
              className="absolute top-6 right-6 bg-black/60 border border-neutral-800 hover:bg-red-600 hover:border-red-600 text-white rounded-full p-2.5 z-20 transition-all shadow-lg"
            >
              Close Trailer
            </button>
          </div>
        ) : (
          <>
            <img
              src={movie.backdropPath}
              alt={movie.title}
              className="w-full h-full object-cover scale-105 filter brightness-[0.4] transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Ambient Dark Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/30 z-0"></div>
          </>
        )}
      </div>

      {/* Hero Movie Metadata & Action Panel */}
      {!isPlaying && (
        <div className="absolute bottom-12 md:bottom-20 left-4 md:left-12 max-w-2xl z-20 flex flex-col items-start gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-red-600 text-white font-mono text-[10px] md:text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded">
              SPOTLIGHT PREMIER
            </span>
            <div className="flex items-center gap-1 bg-black/50 border border-neutral-800 px-2 py-0.5 rounded text-xs font-medium text-yellow-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-mono">{movie.voteAverage.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1 bg-black/50 border border-neutral-800 px-2 py-0.5 rounded text-xs text-neutral-300 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{movie.runtime} min</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-display uppercase leading-none drop-shadow-md">
            {movie.title}
          </h1>

          {movie.tagline && (
            <p className="text-amber-400 font-display italic text-base md:text-xl font-medium drop-shadow">
              "{movie.tagline}"
            </p>
          )}

          <p className="text-neutral-300 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-4 font-normal drop-shadow-sm max-w-xl">
            {movie.overview}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {movie.trailerKey && (
              <button
                id="play-trailer-btn"
                onClick={() => setIsPlaying(true)}
                className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 font-bold py-2.5 md:py-3 px-8 rounded-full shadow-xl cursor-pointer transition-all duration-300"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Play Trailer</span>
              </button>
            )}

            <button
              id="hero-details-btn"
              onClick={() => onOpenDetails(movie)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/20 font-bold py-2.5 md:py-3 px-8 rounded-full shadow-lg cursor-pointer transition-all duration-300"
            >
              <Info className="w-5 h-5" />
              <span>View Details</span>
            </button>

            <button
              id="hero-watchlist-btn"
              onClick={() => onToggleWatchlist(movie)}
              className={`font-bold py-2.5 md:py-3 px-8 rounded-full transition-all duration-300 border shadow-md backdrop-blur-md ${
                isInWatchlist
                  ? 'bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              {isInWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
