import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Search, LogOut, Shield, User, Heart, History, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

const Navbar = ({ onSearch }) => {
  const { user, isAuthenticated, isAdmin, logout, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { scrollY } = useScroll();

  // Transform background and borders based on scroll
  const backgroundY = useTransform(
    scrollY,
    [0, 50],
    ["rgba(5, 5, 5, 0)", "rgba(5, 5, 5, 0.95)"]
  );

  const borderY = useTransform(
    scrollY,
    [0, 50],
    ["rgba(70, 69, 84, 0)", "rgba(70, 69, 84, 0.2)"]
  );

  const backdropBlur = useTransform(
    scrollY,
    [0, 50],
    ["blur(0px)", "blur(16px)"]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    navigate("/");
  };

  return (
    <motion.nav
      style={{
        backgroundColor: backgroundY,
        borderBottomColor: borderY,
        borderBottomWidth: 1,
        backdropFilter: backdropBlur,
      }}
      className="fixed top-0 z-50 w-full"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-8 sm:py-4">
        {/* Left: Logo + Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Link
            to="/"
            className="group flex items-center gap-1.5 text-2xl font-black tracking-tighter text-brand-on-surface sm:text-3xl"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5"
            >
              <span className="bg-gradient-to-r from-brand-primary to-brand-primary-container bg-clip-text text-transparent">
                Amar
              </span>
              <span>Flix</span>
            </motion.div>
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-5">
            <Link
              to="/"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/my-list"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                My List
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:text-brand-primary-container transition-colors"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Center: Search */}
        {onSearch && (
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md items-center"
          >
            <div className="group relative flex w-full items-center border-b border-brand-outline-variant/60 bg-transparent py-2 transition-all duration-300 focus-within:border-brand-secondary focus-within:shadow-[0_8px_15px_-5px_rgba(76,215,246,0.1)] px-2">
              <Search className="h-5 w-5 text-brand-outline-variant transition-colors group-focus-within:text-brand-secondary group-hover:text-brand-on-surface" />
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent px-3 text-sm text-brand-on-surface placeholder-brand-on-surface/50 outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="text-xs font-semibold tracking-wider text-brand-secondary transition-colors hover:text-brand-primary"
              >
                SEARCH
              </motion.button>
            </div>
          </form>
        )}

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 rounded-full p-0.5 transition-all hover:ring-2 hover:ring-brand-primary/50"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover border-2 border-white/20"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-white/50 transition-transform hidden sm:block",
                    showDropdown && "rotate-180"
                  )}
                />
              </motion.button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-brand-surface-container-high/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50"
                  >
                    {/* User Info */}
                    <div className="px-4 py-4 border-b border-white/10">
                      <p className="font-bold text-white text-sm truncate">
                        {user?.name}
                      </p>
                      <p className="text-white/50 text-xs truncate mt-0.5">
                        {user?.email}
                      </p>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded-full">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <Link
                        to="/my-list"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Heart className="h-4 w-4" />
                        My List
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <History className="h-4 w-4" />
                        Watch History
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="mx-4 my-1 h-px bg-white/10" />
                          <Link
                            to="/admin"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-primary hover:bg-brand-primary/5 transition-colors"
                          >
                            <Shield className="h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        </>
                      )}
                      <div className="mx-4 my-1 h-px bg-white/10" />
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loginWithGoogle}
              className="flex items-center gap-2 h-9 px-5 rounded-lg bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
