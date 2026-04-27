import { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("amarflix_token"));

  /**
   * Fetch current user from backend using stored token.
   */
  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else {
        // Token invalid — clean up
        localStorage.removeItem("amarflix_token");
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, check for token in URL (from OAuth callback) or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");

    if (urlToken) {
      // Came from OAuth callback
      localStorage.setItem("amarflix_token", urlToken);
      setToken(urlToken);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // When token changes, fetch user
  useEffect(() => {
    fetchUser(token);
  }, [token, fetchUser]);

  /**
   * Save token after login (called from callback page).
   */
  const login = useCallback((newToken) => {
    localStorage.setItem("amarflix_token", newToken);
    setToken(newToken);
  }, []);

  /**
   * Logout — clear token and user state.
   */
  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
    } catch {
      // Silent fail — still clean up locally
    }

    localStorage.removeItem("amarflix_token");
    setToken(null);
    setUser(null);
  }, [token]);

  /**
   * Initiate Google OAuth login.
   */
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${API_BASE}/api/auth/google`;
  }, []);

  const isAdmin = user?.role === "admin";
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        loginWithGoogle,
        refreshUser: () => fetchUser(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
