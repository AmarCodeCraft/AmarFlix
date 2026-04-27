import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Loader2,
  UploadCloud,
  CheckCircle,
  ChevronLeft,
  Film,
  Image,
  Type,
  AlignLeft,
  Tag,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { uploadVideo, addVideo } from "../lib/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const AdminUpload = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [category, setCategory] = useState("Latest");

  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [authLoading, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file first.");
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError("");
    setSuccess(false);

    try {
      // Step 1: Upload Video to Cloudinary via backend
      setProgressText("Uploading video...");
      const uploadData = await uploadVideo(file, (percent) => {
        setUploadProgress(percent);
        setProgressText(`Uploading: ${percent}%`);
      });

      const videoUrl = uploadData.videoUrl;
      const duration = uploadData.duration;
      const cloudinaryPublicId = uploadData.publicId;

      // Step 2: Save to MongoDB
      setProgressText("Saving movie details...");
      await addVideo({
        title,
        description,
        thumbnail,
        videoUrl,
        duration,
        cloudinaryPublicId,
        category,
      });

      setSuccess(true);
      // Reset form
      setFile(null);
      setTitle("");
      setDescription("");
      setThumbnail("");
      setCategory("Latest");
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      setProgressText("");
      setUploadProgress(0);
    }
  };

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
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <button
              onClick={() => navigate("/admin")}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <UploadCloud className="w-8 h-8 text-brand-primary" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Upload Movie</h1>
                <p className="text-white/50 text-sm">
                  Add new content to AmarFlix
                </p>
              </div>
            </div>
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card ghost-border p-8"
          >
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 rounded-lg bg-green-500/15 border border-green-500/30 flex items-center gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
                <p className="text-green-200 text-sm">
                  Movie uploaded successfully! You can view it on the{" "}
                  <button
                    onClick={() => navigate("/")}
                    className="text-green-300 underline hover:no-underline"
                  >
                    home page
                  </button>
                  .
                </p>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-4 rounded-lg bg-red-500/15 border border-red-500/30"
              >
                <p className="text-red-200 text-sm">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                  <Type className="h-4 w-4" />
                  Movie Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="e.g. Inception"
                />
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                  <AlignLeft className="h-4 w-4" />
                  Description
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                  placeholder="A brief summary of the movie..."
                />
              </div>

              {/* Thumbnail */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                  <Image className="h-4 w-4" />
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  required
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-primary transition-colors"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {thumbnail && (
                  <div className="mt-3 aspect-video w-40 rounded-lg overflow-hidden border border-white/10">
                    <img
                      src={thumbnail}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                  <Tag className="h-4 w-4" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors appearance-none cursor-pointer"
                >
                  <option value="Trending">Trending</option>
                  <option value="Latest">Latest</option>
                  <option value="Recommended">Recommended</option>
                </select>
              </div>

              {/* Video File */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-white/70 mb-2">
                  <Film className="h-4 w-4" />
                  Video File (.mp4, .webm)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="video/mp4,video/webm"
                    required
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full bg-black/50 border border-white/10 border-dashed rounded-xl px-4 py-6 text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/20 file:text-brand-primary hover:file:bg-brand-primary/30 cursor-pointer transition-colors hover:border-brand-primary/50"
                  />
                </div>
                {file && (
                  <p className="mt-2 text-xs text-white/40">
                    Selected: {file.name} (
                    {(file.size / 1024 / 1024).toFixed(1)} MB)
                  </p>
                )}
              </div>

              {/* Upload Progress */}
              <div className="mt-2">
                {uploading && uploadProgress > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-white/50">
                        {progressText}
                      </span>
                      <span className="text-xs font-bold text-brand-primary">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                      <motion.div
                        className="bg-gradient-to-r from-brand-primary to-brand-secondary h-full rounded-full shadow-[0_0_10px_rgba(192,193,255,0.8)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full h-14 bg-gradient-to-r from-brand-primary to-brand-primary-container hover:opacity-90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {progressText || "Processing..."}
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5" />
                      Upload Movie
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminUpload;
