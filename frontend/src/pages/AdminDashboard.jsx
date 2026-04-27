import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Trash2,
  Film,
  Users,
  BarChart3,
  Plus,
  Loader2,
  AlertTriangle,
  ExternalLink,
  Search,
  ChevronLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { fetchVideos, deleteVideo } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAdmin, navigate]);

  // Load videos
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const data = await fetchVideos();
        setVideos(data);
      } catch (error) {
        console.error("Failed to load videos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadVideos();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteVideo(id);
      setVideos((prev) => prev.filter((v) => v._id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      alert("Failed to delete video: " + error.message);
    } finally {
      setDeleting(null);
    }
  };

  const filteredVideos = videos.filter((v) =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    {
      label: "Total Movies",
      value: videos.length,
      icon: Film,
      color: "from-brand-primary to-brand-primary-container",
    },
    {
      label: "Categories",
      value: [...new Set(videos.map((v) => v.category))].length,
      icon: BarChart3,
      color: "from-brand-secondary to-brand-secondary-container",
    },
    {
      label: "Role",
      value: user?.role?.toUpperCase() || "—",
      icon: Users,
      color: "from-emerald-400 to-emerald-600",
      isText: true,
    },
  ];

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="pt-24 pb-20 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="text-white/50 text-sm mt-1">
                  Manage your AmarFlix content library
                </p>
              </div>
            </div>
            <Link
              to="/admin/upload"
              className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Upload Movie
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="glass-card ghost-border p-6 flex items-center gap-4"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-white/50 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-black text-white">
                    {stat.isText ? stat.value : stat.value}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Content Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card ghost-border p-6 sm:p-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold">Content Library</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary transition-colors"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Film className="h-16 w-16 text-white/10 mb-4" />
                <p className="text-white/50 text-lg font-medium">
                  {videos.length === 0
                    ? "No movies uploaded yet"
                    : "No results found"}
                </p>
                {videos.length === 0 && (
                  <Link
                    to="/admin/upload"
                    className="mt-4 text-brand-primary hover:text-brand-primary-container transition-colors font-semibold"
                  >
                    Upload your first movie →
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredVideos.map((video, i) => (
                    <motion.div
                      key={video._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50, height: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition-all group"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-24 sm:w-32 aspect-video rounded-lg overflow-hidden bg-white/5 shrink-0">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate text-sm sm:text-base">
                          {video.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded">
                            {video.category}
                          </span>
                          <span className="text-xs text-white/30">
                            {new Date(video.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {video.description && (
                          <p className="text-xs text-white/30 mt-1 truncate hidden sm:block">
                            {video.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/watch/${video._id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                          title="Watch"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(video._id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card ghost-border p-8 max-w-md w-full"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
                  <AlertTriangle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Movie</h3>
                  <p className="text-white/50 text-sm">
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <p className="text-white/60 text-sm mb-6">
                Are you sure you want to permanently delete "
                {videos.find((v) => v._id === showDeleteConfirm)?.title}"?
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 h-11 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={deleting === showDeleteConfirm}
                  className="flex-1 h-11 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting === showDeleteConfirm ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
