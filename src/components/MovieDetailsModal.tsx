import React, { useEffect, useState } from 'react';
import { X, Play, Star, Clock, Calendar, DollarSign, Globe, Building, ArrowRight, Loader } from 'lucide-react';
import { Movie, Review } from '../types';
import MovieSlider from './MovieSlider';
import { popularMovies } from '../data/movies';
import { MovieRecommender } from '../lib/ml';

const recommender = new MovieRecommender(popularMovies);

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
  onSelectMovie: (movie: Movie) => void;
  onToggleWatchlist: (movie: Movie) => void;
  isInWatchlist: boolean;
}

export default function MovieDetailsModal({ movie, onClose, onSelectMovie, onToggleWatchlist, isInWatchlist }: MovieDetailsModalProps) {
  const [details, setDetails] = useState<Movie & { reviews?: Review[] } | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  useEffect(() => {
    // Reset states on movie change
    setDetails(null);
    setSimilarMovies([]);
    setIsLoading(true);
    setIsPlayingTrailer(false);

    // Load Details and Compute Recommendations Client-Side (100% Client-Side for Netlify Compatibility)
    try {
      const movieDetails = popularMovies.find(m => m.id === movie.id);
      if (movieDetails) {
        // High fidelity simulated review fallback
        const reviews: Review[] = [
          { author: "CinematicWhiz", content: `Absolutely phenomenal! ${movieDetails.title} is an absolute masterpiece of direction, editing, and storytelling. It stays with you long after the credits roll.`, rating: 9, createdAt: "2026-02-14" },
          { author: "Reviewer_42", content: `Solid film. Great acting, but the pacing felt slightly slow in the second act. Overall worth watching!`, rating: 8, createdAt: "2026-03-01" }
        ];

        setDetails({ ...movieDetails, reviews });

        const recommendations = recommender.getRecommendations(movie.id, 6).map(r => ({
          ...r.movie,
          similarityScore: r.score
        }));
        setSimilarMovies(recommendations);
      }
    } catch (err) {
      console.error('Failed to load modal data details/recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [movie]);

  // Format monetary figures safely
  const formatCurrency = (value?: number) => {
    if (!value || value === 0) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div
      id="movie-details-backdrop"
      className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 overflow-y-auto flex justify-center py-6 px-3 md:py-12 animate-in fade-in duration-300"
    >
      <div
        id="movie-details-modal"
        className="relative w-full max-w-5xl bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl h-fit self-start animate-in zoom-in-95 duration-300"
      >
        {/* Close Button */}
        <button
          id="close-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-black/70 border border-white/5 text-neutral-400 hover:text-white rounded-full p-2 hover:bg-[#1a1a1a] transition-all shadow-md cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isLoading ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-neutral-400 font-mono gap-3">
            <Loader className="w-10 h-10 animate-spin text-[#E50914]" />
            <span className="text-xs">LOADING CINEMATIC METADATA...</span>
          </div>
        ) : (
          details && (
            <>
              {/* Top Section with Backdrop Hero */}
              <div className="relative w-full aspect-[16/7] md:aspect-[21/9] bg-[#161616]">
                {isPlayingTrailer && details.trailerKey ? (
                  <div className="absolute inset-0 bg-black z-10 w-full h-full">
                    <iframe
                      id="modal-youtube-iframe"
                      src={`https://www.youtube.com/embed/${details.trailerKey}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                      title={`${details.title} Trailer`}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    ></iframe>
                    <button
                      id="modal-close-trailer-btn"
                      onClick={() => setIsPlayingTrailer(false)}
                      className="absolute top-4 right-16 bg-black/80 hover:bg-[#E50914] text-white rounded-full p-2 z-20 transition-all border border-white/5 text-xs px-3 font-semibold font-mono"
                    >
                      STOP TRAILER
                    </button>
                  </div>
                ) : (
                  <>
                    <img
                      src={details.backdropPath}
                      alt={details.title}
                      className="w-full h-full object-cover filter brightness-[0.5]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent"></div>
                  </>
                )}

                {/* Left Poster overlay */}
                {!isPlayingTrailer && (
                  <div className="absolute bottom-4 left-4 md:left-10 flex gap-4 md:gap-6 items-end z-20">
                    <div className="w-20 md:w-36 aspect-[2/3] bg-[#161616] rounded-lg overflow-hidden shadow-2xl border-2 border-[#E50914]/50 hidden sm:block flex-shrink-0">
                      <img
                        src={details.posterPath}
                        alt={details.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="bg-[#E50914] text-white text-[10px] md:text-xs px-2 py-0.5 rounded font-mono font-bold uppercase">
                          {details.genres[0]}
                        </span>
                        <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded text-xs text-yellow-500 font-mono">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{details.voteAverage.toFixed(1)}</span>
                        </div>
                      </div>
                      <h2 className="text-xl md:text-4xl font-extrabold text-white uppercase tracking-tight drop-shadow">
                        {details.title}
                      </h2>
                      {details.tagline && (
                        <p className="text-amber-400 italic text-xs md:text-sm mt-1 font-display max-w-lg">
                          "{details.tagline}"
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Content & Specs Area */}
              <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 text-left bg-[#111111]">
                {/* Left major details block */}
                <div className="flex-1 flex flex-col gap-6">
                  <div>
                    <h3 className="text-sm font-mono font-semibold text-neutral-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-1">
                      Synopsis Overview
                    </h3>
                    <p className="text-neutral-300 text-sm md:text-base leading-relaxed">
                      {details.overview}
                    </p>
                  </div>

                  {/* Cast section */}
                  <div>
                    <h3 className="text-sm font-mono font-semibold text-neutral-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">
                      Top Cast & Characters
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {details.cast.map((actor, idx) => (
                        <div
                          key={idx}
                          className="bg-white/5 p-2 rounded-lg border border-white/5 hover:border-[#E50914]/30 transition-colors"
                        >
                          {actor.profilePath && (
                            <img
                              src={actor.profilePath}
                              alt={actor.name}
                              className="w-full aspect-[3/4] object-cover rounded mb-1.5"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div className="text-xs font-semibold text-white truncate">{actor.name}</div>
                          <div className="text-[10px] text-neutral-400 truncate">{actor.character}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reviews Section */}
                  {details.reviews && details.reviews.length > 0 && (
                    <div>
                      <h3 className="text-sm font-mono font-semibold text-neutral-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-1">
                        Audience Reviews
                      </h3>
                      <div className="flex flex-col gap-3">
                        {details.reviews.map((rev, idx) => (
                          <div key={idx} className="bg-[#161616]/40 p-4 rounded-xl border border-white/5 text-xs">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-neutral-200">{rev.author}</span>
                              <span className="text-neutral-500 font-mono">{rev.createdAt}</span>
                            </div>
                            <p className="text-neutral-300 leading-relaxed italic">"{rev.content}"</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Specs panel */}
                <div className="w-full md:w-64 flex flex-col gap-4">
                  {/* Action row */}
                  <div className="flex flex-col gap-2">
                    {details.trailerKey && !isPlayingTrailer && (
                      <button
                        id="modal-play-trailer-btn"
                        onClick={() => setIsPlayingTrailer(true)}
                        className="w-full py-2.5 bg-[#E50914] hover:bg-[#E50914]/90 text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Play Trailer</span>
                      </button>
                    )}

                    <button
                      id="modal-watchlist-btn"
                      onClick={() => onToggleWatchlist(details)}
                      className={`w-full py-2.5 font-bold text-sm rounded-lg border flex items-center justify-center gap-2 transition-all ${
                        isInWatchlist
                          ? 'bg-emerald-600/30 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#161616] text-neutral-300 border-white/5 hover:bg-[#1a1a1a]'
                      }`}
                    >
                      <span>{isInWatchlist ? '✓ In Watchlist' : '+ Add Watchlist'}</span>
                    </button>
                  </div>

                  {/* Metadata Specs */}
                  <div className="bg-[#161616]/40 rounded-xl border border-white/5 p-4 flex flex-col gap-3 text-xs">
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Director:</span>
                      <span className="font-semibold text-white">{details.director}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Release Date:</span>
                      <span className="font-semibold text-white">{details.releaseDate}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Runtime:</span>
                      <span className="font-semibold text-white">{details.runtime} mins</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Language:</span>
                      <span className="font-semibold text-white uppercase">{details.language}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Budget:</span>
                      <span className="font-semibold text-white">{formatCurrency(details.budget)}</span>
                    </div>
                    <div className="flex justify-between border-b border-white/5 pb-1.5">
                      <span className="text-neutral-400">Revenue:</span>
                      <span className="font-semibold text-white text-emerald-400">{formatCurrency(details.revenue)}</span>
                    </div>
                    {details.productionCompanies && details.productionCompanies.length > 0 && (
                      <div className="pt-1.5">
                        <span className="text-neutral-400 block mb-1">Production:</span>
                        <div className="flex flex-wrap gap-1">
                          {details.productionCompanies.map((c, i) => (
                            <span key={i} className="bg-black px-2 py-0.5 rounded text-[10px] text-neutral-300 border border-white/5">
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Similar Movies Slider Section */}
              {similarMovies.length > 0 && (
                <div className="border-t border-white/5 bg-[#111111] pb-8">
                  <MovieSlider
                    id="modal-similarity"
                    title="Recommended Cinematic Matches"
                    movies={similarMovies}
                    onSelectMovie={onSelectMovie}
                    showSimilarityScore={true}
                  />
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}
