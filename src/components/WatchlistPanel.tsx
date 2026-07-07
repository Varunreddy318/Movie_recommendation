import React from 'react';
import { Star, Eye, Film, Trash2 } from 'lucide-react';
import { Movie } from '../types';

interface WatchlistPanelProps {
  watchlist: Movie[];
  recentlyViewed: Movie[];
  onSelectMovie: (movie: Movie) => void;
  onRemoveFromWatchlist: (movie: Movie) => void;
  onClearRecent: () => void;
}

export default function WatchlistPanel({ watchlist, recentlyViewed, onSelectMovie, onRemoveFromWatchlist, onClearRecent }: WatchlistPanelProps) {
  return (
    <div id="watchlist-panel" className="px-4 md:px-12 py-8 bg-[#0a0a0a]/50 border-t border-white/5 select-none relative z-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Watchlist Section */}
        <div id="watchlist-section" className="text-left bg-[#111111]/80 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <h3 className="text-lg md:text-xl font-bold font-display text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500 fill-current animate-pulse" />
              <span>YOUR WATCHLIST</span>
            </h3>
            <span className="text-xs font-mono text-neutral-500">{watchlist.length} titles saved</span>
          </div>

          {watchlist.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 font-mono gap-2 text-center border border-dashed border-white/5 rounded-xl">
              <Film className="w-8 h-8 text-neutral-700" />
              <span className="text-xs">No titles saved in watchlist yet.</span>
              <span className="text-[10px] text-neutral-600">Click '+ Watchlist' on any movie banner or modal!</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {watchlist.map((movie) => (
                <div
                  key={movie.id}
                  id={`watchlist-item-${movie.id}`}
                  className="group relative bg-[#161616]/40 border border-white/5 hover:border-[#E50914]/30 p-2 rounded-xl flex flex-col gap-2 transition-all"
                >
                  <div
                    onClick={() => onSelectMovie(movie)}
                    className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#0a0a0a] cursor-pointer relative animate-fade-in"
                  >
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-[#E50914] text-white text-[10px] font-bold py-1 px-3 rounded-full">VIEW</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-xs text-neutral-200 truncate group-hover:text-[#E50914] transition-colors">
                      {movie.title}
                    </h4>
                    <button
                      id={`remove-watchlist-${movie.id}`}
                      onClick={() => onRemoveFromWatchlist(movie)}
                      className="text-[10px] text-neutral-500 hover:text-[#E50914] font-mono mt-1 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Viewed Section */}
        <div id="recently-viewed-section" className="text-left bg-[#111111]/80 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
            <h3 className="text-lg md:text-xl font-bold font-display text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#E50914]" />
              <span>RECENTLY VIEWED</span>
            </h3>
            {recentlyViewed.length > 0 && (
              <button
                id="clear-recent-btn"
                onClick={onClearRecent}
                className="text-[10px] text-neutral-500 hover:text-[#E50914] font-mono border border-white/5 px-2 py-1 rounded hover:bg-[#1a1a1a] transition-all cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {recentlyViewed.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-500 font-mono gap-2 text-center border border-dashed border-white/5 rounded-xl">
              <Eye className="w-8 h-8 text-neutral-700" />
              <span className="text-xs">No recently viewed history.</span>
              <span className="text-[10px] text-neutral-600">Your recent cinematic explorations will persist here!</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {recentlyViewed.map((movie) => (
                <div
                  key={movie.id}
                  id={`recent-item-${movie.id}`}
                  onClick={() => onSelectMovie(movie)}
                  className="group cursor-pointer bg-[#161616]/40 border border-white/5 hover:border-[#E50914]/30 p-2 rounded-xl flex flex-col gap-2 transition-all"
                >
                  <div className="aspect-[2/3] w-full overflow-hidden rounded-lg bg-[#0a0a0a] relative">
                    <img
                      src={movie.posterPath}
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-[#E50914] text-white text-[10px] font-bold py-1 px-3 rounded-full">OPEN</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-xs text-neutral-200 truncate group-hover:text-[#E50914] transition-colors">
                      {movie.title}
                    </h4>
                    <span className="text-[9px] text-neutral-500 font-mono">
                      {movie.genres[0]} • {movie.runtime}m
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
