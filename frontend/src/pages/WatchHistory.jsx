import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { History as HistoryIcon, Loader2, Play, ChevronLeft, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getWatchHistory } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const WatchHistory = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await getWatchHistory();
        setHistory(data);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) loadHistory();
  }, [isAuthenticated]);

  const fmt = (s) => {
    if (!s || !Number.isFinite(s)) return "0:00";
    return `${String(Math.floor(s / 60)).padStart(1, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  const getProgressPercent = (entry) => {
    if (!entry.duration || entry.duration === 0) return 0;
    return Math.min(100, (entry.progress / entry.duration) * 100);
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return d.toLocaleDateString();
  };

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
              <HistoryIcon className="h-7 w-7 text-brand-secondary" />
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                Watch History
              </h1>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
            </div>
          ) : history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <div className="mb-6 rounded-full bg-white/5 p-6 border border-white/10">
                <Clock className="h-14 w-14 text-white/20" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                No watch history yet
              </h2>
              <p className="text-white/50 max-w-md">
                Start watching movies and your progress will be tracked here so
                you can resume anytime.
              </p>
              <button
                onClick={() => navigate("/")}
                className="mt-6 px-6 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-primary/90 transition-colors"
              >
                Browse Movies
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, i) => {
                const movie = entry.video;
                if (!movie) return null;

                return (
                  <motion.div
                    key={entry._id || i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/watch/${movie._id}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 hover:bg-white/[0.06] transition-all group"
                    >
                      {/* Thumbnail with progress */}
                      <div className="relative w-36 sm:w-48 aspect-video rounded-lg overflow-hidden bg-white/5 shrink-0">
                        <img
                          src={movie.thumbnail}
                          alt={movie.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Play overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black">
                            <Play className="h-4 w-4 ml-0.5 fill-current" />
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className="h-full bg-brand-primary"
                            style={{
                              width: `${getProgressPercent(entry)}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate text-sm sm:text-base group-hover:text-brand-primary transition-colors">
                          {movie.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">
                            {movie.category}
                          </span>
                          <span className="text-xs text-white/30">
                            {fmt(entry.progress)} / {fmt(entry.duration)}
                          </span>
                        </div>
                        <p className="text-xs text-white/30 mt-1">
                          {timeAgo(entry.lastWatched)}
                        </p>
                      </div>

                      {/* Resume badge */}
                      {getProgressPercent(entry) > 0 &&
                        getProgressPercent(entry) < 95 && (
                          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-primary/10 text-brand-primary text-xs font-semibold shrink-0">
                            <Play className="h-3 w-3 fill-current" />
                            Resume
                          </div>
                        )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WatchHistory;
