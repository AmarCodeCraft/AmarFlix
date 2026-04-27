import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Loader2, Film, ChevronLeft } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMyList } from "../lib/api";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";

const MyList = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const loadList = async () => {
      try {
        const data = await getMyList();
        setMovies(data);
      } catch (error) {
        console.error("Failed to load My List:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) loadList();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="max-w-screen-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <button
              onClick={() => navigate("/")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <Heart className="h-7 w-7 text-brand-primary fill-brand-primary" />
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                My List
              </h1>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            </div>
          ) : movies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="mb-6 rounded-full bg-white/5 p-6 border border-white/10">
                <Film className="h-14 w-14 text-white/20" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Your list is empty
              </h2>
              <p className="text-white/50 max-w-md">
                Start adding movies to your list by clicking the + button on any
                movie card. They'll appear here for easy access.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors"
              >
                Browse Movies
              </button>
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
                {movies.map((movie) => (
                  <MovieCard
                    key={movie._id}
                    movie={movie}
                    dataSource="api"
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyList;
