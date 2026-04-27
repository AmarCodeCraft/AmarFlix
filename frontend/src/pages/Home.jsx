import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX, Play, Info, Loader2, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";
import { movies as localMovies } from "../data/movies";
import { fetchVideos } from "../lib/api";

const categories = ["All", "Trending", "Latest", "Recommended"];

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const [dataSource, setDataSource] = useState("local"); // "api" | "local"
  const [activeCategory, setActiveCategory] = useState("All");

  // Fetch movies from backend, fall back to local data
  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      try {
        const apiMovies = await fetchVideos();
        if (!cancelled && apiMovies.length > 0) {
          // Normalize backend data to match local shape
          const normalized = apiMovies.map((m, i) => ({
            ...m,
            id: m._id || m.id || i + 1,
            _id: m._id,
          }));
          setMovies(normalized);
          setDataSource("api");
        } else if (!cancelled) {
          setMovies(localMovies);
          setDataSource("local");
        }
      } catch {
        // Backend unavailable — use local fallback
        if (!cancelled) {
          setMovies(localMovies);
          setDataSource("local");
        }
      } finally {
        if (!cancelled) {
          // Small delay for the skeleton loader effect
          setTimeout(() => setLoading(false), 600);
        }
      }
    };

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const normalizedTerm = searchTerm.trim().toLowerCase();
    return movies.filter((movie) =>
      movie.title.toLowerCase().includes(normalizedTerm),
    );
  }, [searchTerm, movies]);

  const filteredMovies = useMemo(() => {
    if (activeCategory === "All") return movies;
    return movies.filter((m) => m.category === activeCategory);
  }, [activeCategory, movies]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-24 sm:pt-28">
        <Navbar onSearch={handleSearch} />
        <div className="mx-auto flex max-w-screen-2xl flex-wrap gap-4 p-4 sm:gap-6 sm:p-8">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex flex-col items-start w-[160px] sm:w-[200px] md:w-[240px]"
            >
              <div className="aspect-video w-full rounded-md bg-white/5" />
              <div className="h-4 bg-white/5 rounded-md mt-4 w-3/4" />
              <div className="h-3 bg-white/5 rounded-md mt-2 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isSearching = searchTerm.trim().length > 0;
  const heroMovie = movies[0];

  // Group movies by category for rows
  const moviesByCategory = categories
    .filter((c) => c !== "All")
    .map((cat) => ({
      category: cat,
      movies: movies.filter((m) => m.category === cat),
    }))
    .filter((g) => g.movies.length > 0);

  return (
    <div className="min-h-screen bg-[#050505] selection:bg-brand-primary/40 pb-0">
      <Navbar onSearch={handleSearch} />

      <main className="w-full">
        {!isSearching ? (
          <>
            {/* Immersive Edge-to-Edge Hero Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-full min-h-[75vh] md:min-h-[85vh] max-h-[1000px] mb-8 sm:mb-16 flex flex-col justify-end"
            >
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={
                    heroMovie?.thumbnail ||
                    "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&q=80"
                  }
                  alt={heroMovie?.title || "Featured"}
                  className="w-full h-full object-cover opacity-60"
                />
                {/* Netflix-style vignette masks */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-100" />
              </div>

              <div className="relative z-10 w-full pb-12 pt-32 sm:pb-20 md:pb-28 px-4 sm:px-8 md:px-12 lg:px-16 mx-auto max-w-screen-2xl">
                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                  className="max-w-2xl lg:max-w-3xl"
                >
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="flex h-5 sm:h-6 items-center justify-center rounded-sm bg-brand-primary px-2 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">
                      {dataSource === "api" ? "Stream" : "Series"}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold tracking-widest text-brand-on-surface/70 uppercase">
                      AmarFlix Original
                    </span>
                  </div>

                  <h1 className="mb-3 sm:mb-5 text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter drop-shadow-2xl">
                    <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
                      {heroMovie?.title || "AmarFlix"}
                    </span>
                  </h1>

                  <p className="mb-6 sm:mb-8 text-sm sm:text-base md:text-lg font-medium text-white/80 leading-relaxed max-w-xl drop-shadow-lg">
                    {heroMovie?.description ||
                      "Discover millions of movies, documentaries, and TV shows. Your ultimate entertainment destination natively crafted for cinematic speed."}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Link
                      to={`/watch/${heroMovie?._id || heroMovie?.id || 1}`}
                      className="flex h-10 sm:h-12 md:h-14 items-center justify-center gap-2 sm:gap-3 rounded-md bg-white px-6 sm:px-8 text-sm sm:text-base font-bold text-black transition-transform duration-300 hover:scale-105 hover:bg-white/90"
                    >
                      <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                      Play
                    </Link>
                    <button className="flex h-10 sm:h-12 md:h-14 items-center justify-center gap-2 sm:gap-3 rounded-md bg-white/20 px-6 sm:px-8 text-sm sm:text-base font-bold text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:scale-105 border border-white/10">
                      <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                      More Info
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Category Filter Bar */}
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-8 md:px-12 lg:px-16 mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <Filter className="h-4 w-4 text-white/40 shrink-0" />
                {categories.map((cat) => (
                  <motion.button
                    key={cat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                      activeCategory === cat
                        ? "bg-white text-black"
                        : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            {activeCategory === "All" ? (
              /* Horizontal Movie Rows */
              <div className="flex flex-col gap-8 sm:gap-12 md:gap-16 pb-16">
                {moviesByCategory.map(({ category, movies: categoryMovies }) => (
                  <div
                    key={category}
                    className="mx-auto w-full max-w-screen-2xl px-4 sm:px-8 md:px-12 lg:px-16"
                  >
                    <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-white drop-shadow-md">
                      {category}
                    </h2>

                    {/* Horizontal Scroll Container */}
                    <div className="relative group/row">
                      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-8 pt-4 -mt-4 px-1 -mx-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] snap-x snap-mandatory">
                        {categoryMovies.map((movie) => (
                          <div key={movie._id || movie.id} className="snap-start shrink-0">
                            <MovieCard movie={movie} dataSource={dataSource} />
                          </div>
                        ))}
                      </div>

                      {/* Gradient fade on the right side */}
                      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-16 sm:w-24 bg-gradient-to-l from-[#050505] to-transparent opacity-0 transition-opacity duration-300 group-hover/row:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Filtered Grid View */
              <div className="mx-auto max-w-screen-2xl px-4 sm:px-8 md:px-12 lg:px-16 pb-16">
                {filteredMovies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-white/50 text-lg">
                      No movies in "{activeCategory}" category
                    </p>
                  </div>
                ) : (
                  <motion.div
                    className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                    initial="hidden"
                    animate="visible"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: { staggerChildren: 0.05 },
                      },
                    }}
                  >
                    {filteredMovies.map((movie) => (
                      <MovieCard
                        key={movie._id || movie.id}
                        movie={movie}
                        dataSource={dataSource}
                      />
                    ))}
                  </motion.div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Search Results Grid */
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-8 md:px-12 lg:px-16 pt-32 sm:pt-40 pb-20">
            <h2 className="mb-6 sm:mb-8 text-xl sm:text-3xl font-bold text-white/90">
              Search Results for{" "}
              <span className="text-white">"{searchTerm}"</span>
            </h2>

            {searchResults.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 flex flex-col items-center justify-center px-4 text-center sm:mt-24"
              >
                <div className="mb-6 rounded-full bg-white/5 p-6 border border-white/10">
                  <SearchX
                    className="h-12 w-12 text-white/40"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="mb-3 text-2xl font-bold text-white sm:text-3xl">
                  No matches found
                </h2>
                <p className="text-base text-white/50 sm:text-lg">
                  We couldn't find any match for "{searchTerm}". Try adjusting
                  the term.
                </p>
              </motion.div>
            ) : (
              <motion.div
                className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 },
                  },
                }}
              >
                <AnimatePresence>
                  {searchResults.map((movie) => (
                    <MovieCard
                      key={movie._id || movie.id}
                      movie={movie}
                      dataSource={dataSource}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
