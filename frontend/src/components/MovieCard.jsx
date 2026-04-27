import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Info, Plus } from "lucide-react";
import { cn } from "../lib/utils";

const MovieCard = ({ movie, dataSource = "local" }) => {
  // Use MongoDB _id for backend data, numeric id for local fallback
  const movieId = movie._id || movie.id;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{
        scale: 1.05,
        y: -5,
        zIndex: 40,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      className="relative flex-none w-[160px] sm:w-[200px] md:w-[240px] lg:w-[280px] xl:w-[320px]"
    >
      <Link
        to={`/watch/${movieId}`}
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-md bg-brand-surface-container-lowest shadow-lg",
          "transition-all duration-500 ease-out",
          "hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:ring-1 hover:ring-brand-outline-variant/30",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary",
        )}
      >
        <div className="relative aspect-video w-full overflow-hidden will-change-transform bg-black">
          <img
            src={
              movie.thumbnail ||
              "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop"
            }
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-80 group-hover:opacity-100"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />

          {/* Hover Actions (Netflix style pop-up controls) */}
          <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4 opacity-0 transition-all duration-300 translate-y-4 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white text-black shadow-lg hover:bg-brand-primary hover:text-white transition-colors">
                <Play className="h-3 w-3 sm:h-4 sm:w-4 ml-0.5 fill-current" />
              </div>
              <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md hover:border-white transition-colors">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <div className="ml-auto flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-white/40 bg-black/50 text-white backdrop-blur-md hover:border-white transition-colors">
                <Info className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-white drop-shadow-md sm:text-base truncate">
              {movie.title}
            </h3>
            <div className="mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-medium">
              <span className="text-green-500 font-bold tracking-wide">
                98% Match
              </span>
              <span className="border border-white/30 px-1 text-white/80 rounded-[2px]">
                HD
              </span>
              <span className="text-white/70 truncate">{movie.category}</span>
            </div>
          </div>

          {/* Default Title (when not hovered) */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pt-10 bg-gradient-to-t from-black/90 to-transparent transition-opacity duration-300 group-hover:opacity-0">
            <h3 className="truncate text-xs font-bold tracking-wide text-brand-on-surface/90 sm:text-sm">
              {movie.title}
            </h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MovieCard;
