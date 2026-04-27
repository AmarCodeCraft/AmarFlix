import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

/**
 * OAuth callback landing page.
 * Extracts the token from URL params, stores it, and redirects home.
 */
const AuthCallback = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      navigate(`/login?error=${error}`, { replace: true });
      return;
    }

    if (token) {
      login(token);
      // Small delay to let auth context update
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    } else {
      navigate("/login?error=no_token", { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
        <p className="text-lg font-medium text-white/50">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
