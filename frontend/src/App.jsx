import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import VideoPlayer from "./pages/VideoPlayer";
import AdminUpload from "./pages/AdminUpload";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import AuthCallback from "./pages/AuthCallback";
import MyList from "./pages/MyList";
import WatchHistory from "./pages/WatchHistory";
import AnimatedIntro from "./components/AnimatedIntro";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        {showIntro && <AnimatedIntro onFinish={() => setShowIntro(false)} />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/watch/:id" element={<VideoPlayer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/upload" element={<AdminUpload />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/history" element={<WatchHistory />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
