import React, { useEffect, useState } from 'react';
import { Film, Sparkles, Filter, RefreshCw, Star, Play, Award, RotateCcw } from 'lucide-react';
import { Movie } from './types';
import SearchAutocomplete from './components/SearchAutocomplete';
import HeroBanner from './components/HeroBanner';
import MovieSlider from './components/MovieSlider';
import MovieDetailsModal from './components/MovieDetailsModal';
import WatchlistPanel from './components/WatchlistPanel';
import { popularMovies } from './data/movies';

export default function App() {
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Persistence State
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Movie[]>([]);

  // Filtering States
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Load Initial Movie Data & Local Storage
  useEffect(() => {
    // Watchlist persistence
    const savedWatchlist = localStorage.getItem('cinematch_watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (err) {
        console.error(err);
      }
    }

    // Recently viewed persistence
    const savedRecent = localStorage.getItem('cinematch_recent');
    if (savedRecent) {
      try {
        setRecentlyViewed(JSON.parse(savedRecent));
      } catch (err) {
        console.error(err);
      }
    }

    fetchMovies();
  }, []);

  // Load movies locally (100% Client-Side for Netlify Compatibility)
  const fetchMovies = () => {
    setIsLoading(true);
    setAllMovies(popularMovies);
    setFilteredMovies(popularMovies);

    // Pick a premium movie as spotlight hero (e.g. Inception or Interstellar)
    const spotlight = popularMovies.find((m: Movie) => m.title === 'Inception') || popularMovies[0];
    setHeroMovie(spotlight);
    setIsLoading(false);
  };

  // Filter movies locally (100% Client-Side for Netlify Compatibility)
  useEffect(() => {
    const applyFilters = () => {
      setIsLoading(true);
      let results = [...popularMovies];

      if (selectedGenre) {
        const targetGenre = selectedGenre.toLowerCase();
        results = results.filter(m => m.genres.some(g => g.toLowerCase() === targetGenre));
      }

      if (selectedLanguage) {
        const targetLang = selectedLanguage.toLowerCase();
        results = results.filter(m => m.language.toLowerCase() === targetLang);
      }

      if (selectedYear) {
        const targetYear = selectedYear;
        results = results.filter(m => m.releaseDate.startsWith(targetYear));
      }

      if (minRating > 0) {
        results = results.filter(m => m.voteAverage >= minRating);
      }

      setFilteredMovies(results);
      setIsLoading(false);
    };

    if (allMovies.length > 0) {
      applyFilters();
    }
  }, [selectedGenre, selectedLanguage, selectedYear, minRating, allMovies]);

  // Watchlist toggle handler
  const handleToggleWatchlist = (movie: Movie) => {
    const isSaved = watchlist.some((m) => m.id === movie.id);
    let updated: Movie[] = [];
    if (isSaved) {
      updated = watchlist.filter((m) => m.id !== movie.id);
    } else {
      updated = [movie, ...watchlist];
    }
    setWatchlist(updated);
    localStorage.setItem('cinematch_watchlist', JSON.stringify(updated));
  };

  // Track Recently Viewed
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);

    // Prepends to list, removes duplicates, limits to size of 6
    const cleanedRecent = recentlyViewed.filter((m) => m.id !== movie.id);
    const updated = [movie, ...cleanedRecent].slice(0, 6);
    setRecentlyViewed(updated);
    localStorage.setItem('cinematch_recent', JSON.stringify(updated));
  };

  const handleClearRecent = () => {
    setRecentlyViewed([]);
    localStorage.removeItem('cinematch_recent');
  };

  // Unique lists for Filter dropdowns
  const genresList = ['Science Fiction', 'Action', 'Adventure', 'Drama', 'Thriller', 'Crime', 'Romance', 'Animation', 'Comedy', 'Music'];
  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: 'Korean' }
  ];
  const yearsList = ['2021', '2019', '2018', '2017', '2016', '2014', '2010', '2009', '2008', '2000', '1999', '1997', '1994'];

  const resetFilters = () => {
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedYear('');
    setMinRating(0);
    setFilteredMovies(allMovies);
  };

  return (
    <div id="movie-recommendation-app" className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#E50914] selection:text-white font-sans overflow-x-hidden relative">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#E50914] opacity-[0.08] blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-[#E50914] opacity-[0.04] blur-[100px] rounded-full pointer-events-none z-0"></div>

      {/* Premium Netflix-style Navigation Header */}
      <nav id="navbar" className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent px-4 md:px-12 py-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Film className="w-8 h-8 text-[#E50914] fill-current animate-pulse" />
          <div className="text-[#E50914] font-black text-3xl tracking-tighter">
            CINEMATCH<span className="text-white font-light">.AI</span>
          </div>
        </div>

        {/* Dynamic Search Autocomplete */}
        <div className="w-full max-w-md">
          <SearchAutocomplete onSelectMovie={handleSelectMovie} />
        </div>

        <div className="flex items-center gap-4 text-xs font-mono font-bold">
          <span className="text-neutral-500">ML ENGINE ONLINE</span>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
        </div>
      </nav>

      {/* Main Container padding top for fixed Navbar */}
      <div className="pt-24 md:pt-20 relative z-10">
        
        {/* Spotlight Hero Banner */}
        {heroMovie && (
          <HeroBanner
            movie={heroMovie}
            onOpenDetails={handleSelectMovie}
            onToggleWatchlist={handleToggleWatchlist}
            isInWatchlist={watchlist.some((m) => m.id === heroMovie.id)}
          />
        )}

        {/* Cinematic Filtering Control Row */}
        <section id="filters-section" className="relative z-30 max-w-7xl mx-auto px-4 md:px-12 py-6 -mt-8">
          <div className="bg-[#111111]/80 border border-white/5 p-4 rounded-2xl shadow-2xl flex flex-col gap-4 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wider font-display text-neutral-300 uppercase">
                <Filter className="w-4 h-4 text-[#E50914]" />
                <span>Filter Cinema Archive</span>
              </div>
              {(selectedGenre || selectedLanguage || selectedYear || minRating > 0) && (
                <button
                  id="reset-filters-btn"
                  onClick={resetFilters}
                  className="text-xs font-mono text-neutral-500 hover:text-[#E50914] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                </button>
              )}
            </div>

            {/* Quick Filters selection pills */}
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                id="genre-pill-all"
                onClick={() => setSelectedGenre('')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedGenre === ''
                    ? 'bg-[#E50914] text-white'
                    : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-250'
                }`}
              >
                All Genres
              </button>
              {genresList.map((g) => (
                <button
                  key={g}
                  id={`genre-pill-${g.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => setSelectedGenre(g)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selectedGenre === g
                      ? 'bg-[#E50914] text-white'
                      : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-neutral-250'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* Dropdown Select Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Language */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Language</label>
                <select
                  id="filter-lang-select"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/5 text-neutral-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E50914]"
                >
                  <option value="">Any Language</option>
                  {languagesList.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Release Year</label>
                <select
                  id="filter-year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="bg-[#1a1a1a] border border-white/5 text-neutral-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E50914]"
                >
                  <option value="">Any Year</option>
                  {yearsList.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Min Rating */}
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Minimum Rating</label>
                <select
                  id="filter-rating-select"
                  value={minRating === 0 ? '' : minRating.toString()}
                  onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : 0)}
                  className="bg-[#1a1a1a] border border-white/5 text-neutral-300 rounded-lg p-2.5 focus:outline-none focus:border-[#E50914]"
                >
                  <option value="">Any Rating</option>
                  <option value="8.5">8.5+ Critic Score</option>
                  <option value="8.0">8.0+ Highly Rated</option>
                  <option value="7.5">7.5+ Good Matches</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Movie Sliders Rows */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center font-mono text-neutral-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
            <span className="text-xs">PROBING MACHINE LEARNING RECOGNITION MATRIX...</span>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {/* Show search result slider if any filters are engaged */}
            {(selectedGenre || selectedLanguage || selectedYear || minRating > 0) ? (
              <MovieSlider
                id="filtered-results"
                title={`Filter Results (${filteredMovies.length} found)`}
                movies={filteredMovies}
                onSelectMovie={handleSelectMovie}
              />
            ) : (
              <>
                {/* Standard Netflix category rows */}
                <MovieSlider
                  id="trending"
                  title="Trending Now"
                  movies={allMovies.slice(0, 8)}
                  onSelectMovie={handleSelectMovie}
                />

                <MovieSlider
                  id="scifi"
                  title="Sci-Fi & High Concept Ventures"
                  movies={allMovies.filter((m) => m.genres.includes('Science Fiction'))}
                  onSelectMovie={handleSelectMovie}
                />

                <MovieSlider
                  id="top-rated"
                  title="Critics Choice (Top Rated)"
                  movies={allMovies.filter((m) => m.voteAverage >= 8.3)}
                  onSelectMovie={handleSelectMovie}
                />

                <MovieSlider
                  id="dramas"
                  title="Emotional Masterpieces & Dramas"
                  movies={allMovies.filter((m) => m.genres.includes('Drama'))}
                  onSelectMovie={handleSelectMovie}
                />
              </>
            )}
          </div>
        )}

        {/* Watchlist & Recently Viewed Panel */}
        <WatchlistPanel
          watchlist={watchlist}
          recentlyViewed={recentlyViewed}
          onSelectMovie={handleSelectMovie}
          onRemoveFromWatchlist={handleToggleWatchlist}
          onClearRecent={handleClearRecent}
        />

        {/* Detailed Modal Overlay */}
        {selectedMovie && (
          <MovieDetailsModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onSelectMovie={handleSelectMovie}
            onToggleWatchlist={handleToggleWatchlist}
            isInWatchlist={watchlist.some((m) => m.id === selectedMovie.id)}
          />
        )}

        {/* Footer */}
        <footer className="bg-neutral-950 border-t border-neutral-900 py-10 text-neutral-500 text-xs text-center select-none mt-12 font-sans">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Film className="w-5 h-5 text-red-600 fill-current" />
              <span className="font-extrabold text-white tracking-tighter">CINEMATCH RECOMMENDER</span>
            </div>
            <p className="text-neutral-600">
              Content-Based Recommender Engine fitting **TF-IDF Vectorizers** and computing **Cosine Similarity** matrices.
            </p>
            <p className="text-[11px] font-mono">&copy; 2026 CineMatch. Built for Premium Production deployment.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
