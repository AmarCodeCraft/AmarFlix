import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, Maximize, ArrowLeft, Share2, Plus, Loader2, Settings, Check, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";
import { movies as localMovies } from "../data/movies";
import { fetchVideoById, updateWatchProgress as saveProgress, getVideoProgress, addToMyList, removeFromMyList } from "../lib/api";

const VideoPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hideTimerRef = useRef(null);
  const saveTimerRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [quality, setQuality] = useState("Auto");
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [inMyList, setInMyList] = useState(false);

  // Check if in user's my list
  useEffect(() => {
    if (user?.myList && id) {
      setInMyList(user.myList.some((vid) => vid === id || vid._id === id));
    }
  }, [user, id]);

  // Load movie
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const isObjectId = /^[a-f\d]{24}$/i.test(id);
        if (isObjectId) {
          const data = await fetchVideoById(id);
          if (!cancelled && data) { setMovie(data); setLoading(false); return; }
        }
        const local = localMovies.find((m) => String(m.id) === id || m._id === id);
        if (!cancelled) {
          if (local) setMovie(local); else setError("Movie not found");
          setLoading(false);
        }
      } catch {
        const local = localMovies.find((m) => String(m.id) === id || m._id === id);
        if (!cancelled) {
          if (local) setMovie(local); else setError("Movie not found");
          setLoading(false);
        }
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id]);

  // Load server-side progress
  useEffect(() => {
    if (!isAuthenticated || !movie?._id || !/^[a-f\d]{24}$/i.test(movie._id)) return;
    getVideoProgress(movie._id).then((data) => {
      if (data.progress > 0 && videoRef.current) {
        const v = videoRef.current;
        const restore = () => {
          if (data.progress < v.duration - 5) v.currentTime = data.progress;
          v.removeEventListener("loadedmetadata", restore);
        };
        if (v.readyState >= 1) { if (data.progress < v.duration - 5) v.currentTime = data.progress; }
        else v.addEventListener("loadedmetadata", restore);
      }
    }).catch(() => {});
  }, [isAuthenticated, movie]);

  const videoSource = useMemo(() => {
    if (!movie) return "";
    let url = movie.videoUrl || "";
    if (url.includes("res.cloudinary.com") && quality !== "Auto") {
      const parts = url.split("/upload/");
      if (parts.length === 2) return `${parts[0]}/upload/q_auto,h_${quality}/${parts[1]}`;
    }
    return url;
  }, [movie, quality]);

  const prevSourceRef = useRef(videoSource);
  useEffect(() => {
    if (videoSource !== prevSourceRef.current && videoRef.current) {
      const v = videoRef.current;
      const timeToRestore = currentTime;
      const handleLoaded = () => { v.currentTime = timeToRestore; if (isPlaying) v.play().catch(() => {}); v.removeEventListener("loadeddata", handleLoaded); };
      v.addEventListener("loadeddata", handleLoaded);
      prevSourceRef.current = videoSource;
    }
  }, [videoSource, currentTime, isPlaying]);

  // Video event listeners
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      const d = Number.isFinite(v.duration) ? v.duration : 0;
      const c = Number.isFinite(v.currentTime) ? v.currentTime : 0;
      setCurrentTime(c); setDuration(d); setProgress(d > 0 ? (c / d) * 100 : 0);
      // Local progress save
      if (movie && c > 0) localStorage.setItem(`amarflix_progress_${movie._id || movie.id}`, c.toString());
    };
    const onMeta = () => {
      setDuration(Number.isFinite(v.duration) ? v.duration : 0);
      if (movie && !isAuthenticated) {
        const saved = localStorage.getItem(`amarflix_progress_${movie._id || movie.id}`);
        if (saved && parseFloat(saved) < v.duration - 5) v.currentTime = parseFloat(saved);
      }
    };
    const onPlay = () => { setIsPlaying(true); setBuffering(false); };
    const onPause = () => { setIsPlaying(false); setShowControls(true); };
    const onEnd = () => { setIsPlaying(false); setShowControls(true); };
    const onWait = () => setBuffering(true);
    const onCanPlay = () => setBuffering(false);
    const onVolChange = () => { setVolume(v.volume); setIsMuted(v.muted || v.volume === 0); };

    v.addEventListener("timeupdate", onTime); v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause); v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("ended", onEnd); v.addEventListener("waiting", onWait);
    v.addEventListener("canplay", onCanPlay); v.addEventListener("volumechange", onVolChange);
    return () => {
      v.removeEventListener("timeupdate", onTime); v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause); v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("ended", onEnd); v.removeEventListener("waiting", onWait);
      v.removeEventListener("canplay", onCanPlay); v.removeEventListener("volumechange", onVolChange);
    };
  }, [videoSource, movie, isAuthenticated]);

  // Save progress to server periodically
  useEffect(() => {
    if (!isAuthenticated || !movie?._id || !/^[a-f\d]{24}$/i.test(movie._id)) return;
    if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    saveTimerRef.current = setInterval(() => {
      if (currentTime > 0 && duration > 0) saveProgress(movie._id, currentTime, duration).catch(() => {});
    }, 10000);
    return () => { if (saveTimerRef.current) clearInterval(saveTimerRef.current); };
  }, [isAuthenticated, movie, currentTime, duration]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (isAuthenticated && movie?._id && /^[a-f\d]{24}$/i.test(movie._id) && currentTime > 0) {
        saveProgress(movie._id, currentTime, duration).catch(() => {});
      }
    };
  }, [isAuthenticated, movie, currentTime, duration]);

  // Auto-hide controls
  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) hideTimerRef.current = setTimeout(() => setShowControls(false), 2500);
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [isPlaying, showControls]);

  const togglePlay = useCallback(() => { const v = videoRef.current; if (!v) return; v.paused ? v.play().catch(() => setIsPlaying(false)) : v.pause(); }, []);
  const handleSeek = useCallback((e) => { const rect = e.currentTarget.getBoundingClientRect(); const x = (e.touches?.[0]?.clientX ?? e.clientX) - rect.left; const pct = (x * 100) / rect.width; const v = videoRef.current; if (v && Number.isFinite(v.duration)) v.currentTime = (v.duration / 100) * pct; }, []);
  const skipTime = useCallback((s) => { const v = videoRef.current; if (!v) return; const d = Number.isFinite(v.duration) ? v.duration : 0; v.currentTime = Math.min(Math.max(0, v.currentTime + s), d); }, []);
  const toggleMute = useCallback(() => { const v = videoRef.current; if (!v) return; if (v.muted || v.volume === 0) { v.muted = false; const r = volume > 0 ? volume : 0.6; v.volume = r; setVolume(r); setIsMuted(false); } else { v.muted = true; setIsMuted(true); } }, [volume]);
  const handleVolume = useCallback((e) => { const val = Number(e.target.value); setVolume(val); if (videoRef.current) { videoRef.current.volume = val; videoRef.current.muted = val === 0; } setIsMuted(val === 0); }, []);
  const toggleFullscreen = useCallback(async () => { const c = playerRef.current; if (!c) return; !document.fullscreenElement ? await c.requestFullscreen?.() : await document.exitFullscreen?.(); }, []);
  const showCtrl = useCallback(() => { setShowControls(true); if (hideTimerRef.current) clearTimeout(hideTimerRef.current); if (videoRef.current && !videoRef.current.paused) hideTimerRef.current = setTimeout(() => setShowControls(false), 2500); }, []);
  const fmt = (s) => { if (!Number.isFinite(s) || s < 0) return "00:00"; return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

  const toggleMyList = async () => {
    if (!isAuthenticated || !movie?._id) return;
    try {
      if (inMyList) { await removeFromMyList(movie._id); setInMyList(false); }
      else { await addToMyList(movie._id); setInMyList(true); }
    } catch (err) { console.error("My List error:", err); }
  };

  if (loading) return (<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="flex flex-col items-center gap-4"><Loader2 className="h-12 w-12 animate-spin text-brand-primary" /><p className="text-lg font-medium text-white/50">Loading player...</p></div></div>);
  if (error || !movie) return (<div className="flex min-h-screen items-center justify-center bg-[#050505]"><div className="flex flex-col items-center gap-4 text-center px-4"><p className="text-2xl font-bold text-white">Movie not found</p><p className="text-white/50">{error || "The requested video could not be loaded."}</p><button onClick={() => navigate("/")} className="mt-4 rounded-md bg-white px-6 py-3 font-bold text-black hover:bg-white/90 transition-colors">Go Home</button></div></div>);

  const controlsVisible = showControls || !isPlaying;

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-primary/30">
      <div ref={playerRef} className="relative w-full bg-black aspect-video md:h-[85vh] md:aspect-auto" onMouseMove={showCtrl} onTouchStart={showCtrl}>
        <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => navigate("/")} className="absolute left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-brand-primary/90 sm:left-6 sm:top-6 sm:h-12 sm:w-12"><ArrowLeft className="h-6 w-6" /></motion.button>

        <div className="relative h-full w-full overflow-hidden">
          <video ref={videoRef} src={videoSource} className="h-full w-full object-contain md:object-cover" controls={false} poster={movie.thumbnail || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070"} onClick={togglePlay} />
          {buffering && (<div className="absolute inset-0 flex items-center justify-center z-30"><Loader2 className="h-16 w-16 animate-spin text-white/80" /></div>)}
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 transition-opacity duration-500 ${controlsVisible ? "opacity-100" : "opacity-0"}`} />

          <div className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-500 ${controlsVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={(e) => { e.stopPropagation(); togglePlay(); }} className={`pointer-events-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-primary/90 text-white shadow-[0_0_30px_rgba(192,193,255,0.5)] backdrop-blur-md transition-opacity sm:h-20 sm:w-20 ${isPlaying ? "opacity-0" : "opacity-100"}`}>
                {isPlaying ? <Pause className="h-8 w-8 fill-current sm:h-10 sm:w-10" /> : <Play className="h-8 w-8 ml-1 fill-current sm:h-10 sm:w-10" />}
              </motion.button>
            </div>

            <div className="relative z-20 px-3 pb-2 pt-8 sm:px-6 sm:pb-6 sm:pt-12">
              <div className="group/progress relative cursor-pointer py-3 sm:py-4" onClick={handleSeek} onTouchStart={handleSeek}>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/20 backdrop-blur-sm transition-all group-hover/progress:h-2.5">
                  <div className="h-full bg-brand-primary shadow-[0_0_10px_rgba(192,193,255,0.8)] transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="mt-1 flex flex-col gap-2 sm:mt-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex min-w-0 items-center gap-2 sm:flex-1 sm:gap-4">
                  <button onClick={() => skipTime(-10)} className="text-white/90 hover:text-brand-primary transition-colors"><svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4L7 9l5 5v-4c3.314 0 6 2.686 6 6 0 .552.448 1 1 1s1-.448 1-1c0-4.418-3.582-8-8-8z" /></svg></button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-brand-primary transition-colors">
                    {isPlaying ? <Pause className="h-7 w-7 fill-current sm:h-8 sm:w-8" /> : <Play className="h-7 w-7 fill-current sm:h-8 sm:w-8" />}
                  </motion.button>
                  <button onClick={() => skipTime(10)} className="text-white/90 hover:text-brand-primary transition-colors"><svg className="h-6 w-6 sm:h-7 sm:w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4l5 5-5 5v-4c-3.314 0-6 2.686-6 6 0 .552-.448 1-1 1s-1-.448-1-1c0-4.418 3.582-8 8-8z" /></svg></button>
                  <h3 className="hidden truncate text-xs font-bold tracking-wide text-white/90 drop-shadow-md sm:block sm:text-lg lg:text-xl">{movie.title}</h3>
                </div>

                <div className="flex items-center justify-between gap-2 sm:w-auto sm:justify-end sm:gap-3">
                  <span className="text-xs text-white/80 sm:hidden">{fmt(currentTime)} / {fmt(duration)}</span>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={toggleMute} className="text-white/80 hover:text-white">
                    {isMuted ? <VolumeX className="h-5 w-5 sm:h-6 sm:w-6" /> : <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />}
                  </motion.button>
                  <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolume} className="w-12 accent-brand-primary sm:w-20 md:w-24" />
                  <span className="hidden text-xs text-white/80 sm:inline sm:text-sm">{fmt(currentTime)} / {fmt(duration)}</span>
                  <div className="relative">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-white/70 hover:text-white relative" onClick={() => setShowQualityMenu(!showQualityMenu)}>
                      <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                      {quality !== "Auto" && <span className="absolute -top-2 -right-3 rounded-full bg-brand-primary px-1 text-[8px] font-bold">{quality}p</span>}
                    </motion.button>
                    {showQualityMenu && (
                      <div className="absolute bottom-full right-0 mb-4 w-32 rounded-lg bg-black/90 p-2 border border-white/10 backdrop-blur-md shadow-2xl z-50 flex flex-col">
                        <div className="text-xs font-bold text-white/50 px-2 py-1 mb-1 border-b border-white/10">Quality</div>
                        {["Auto", "1080", "720", "480"].map((q) => (
                          <button key={q} onClick={() => { setQuality(q); setShowQualityMenu(false); setBuffering(true); }} className={`text-left px-2 py-2 text-sm rounded hover:bg-white/10 transition-colors ${quality === q ? "text-brand-primary font-bold" : "text-white"}`}>
                            {q === "Auto" ? "Auto" : `${q}p`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-white/70 hover:text-white" onClick={toggleFullscreen}><Maximize className="h-5 w-5 sm:h-6 sm:w-6" /></motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Info */}
      <div className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 sm:py-10 md:px-8 md:py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl">
            <h1 className="mb-3 text-3xl font-black sm:mb-4 sm:text-4xl md:text-5xl lg:text-7xl">{movie.title}</h1>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wide text-white/80 sm:mb-6 sm:gap-3 sm:text-sm">
              <span className="rounded bg-white/10 px-3 py-1">2026</span>
              <span className="rounded border border-white/20 bg-white/5 px-2.5 py-1">4K UHD</span>
              <span className="flex items-center gap-1.5 text-green-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Current Top 10
              </span>
              <span className="text-white/60">{movie.category}</span>
            </div>
            <p className="text-sm leading-relaxed text-white/60 sm:text-base md:text-xl">
              {movie.description || `Get ready to experience the ultimate thrill in ${movie.title}. Dive into an immersive world filled with breathtaking visual effects and stunning cinematography.`}
            </p>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid w-full max-w-md shrink-0 grid-cols-2 gap-4 sm:flex sm:w-auto sm:gap-6">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMyList} className={`flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold sm:h-14 sm:px-6 sm:text-base border transition-all ${inMyList ? "bg-brand-primary/20 border-brand-primary/50 text-brand-primary" : "bg-white/10 border-white/10 text-white hover:bg-white/20"}`}>
              {inMyList ? <><Check className="h-5 w-5" /> In List</> : <><Plus className="h-5 w-5 sm:h-6 sm:w-6" /> My List</>}
            </motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/20 sm:h-14 sm:px-6 sm:text-base border border-white/10">
              <Share2 className="h-5 w-5 sm:h-6 sm:w-6" /> Share
            </motion.button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VideoPlayer;
