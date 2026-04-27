import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";
import { Player } from "@remotion/player";
import { useState, useEffect } from "react";

// Particle component for subtle floating light dots
const Particles = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate deterministic particles
  const particles = Array.from({ length: 40 }).map((_, i) => {
    const startX = (i * 137) % width; // Pseudo-random distribution
    const speed = ((i * 17) % 3) + 1;
    const size = ((i * 7) % 4) + 2;
    const delay = (i * 11) % 60;
    return { id: i, startX, speed, size, delay };
  });

  return (
    <div style={{ position: "absolute", width: "100%", height: "100%", overflow: "hidden" }}>
      {particles.map((p) => {
        const pFrame = Math.max(0, frame - p.delay);
        const y = interpolate(pFrame, [0, 150], [height, -50], { extrapolateRight: "clamp" });
        const opacity = interpolate(pFrame, [0, 30, 120, 150], [0, 0.6, 0.6, 0], { extrapolateRight: "clamp" });
        
        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.startX,
              top: y,
              width: p.size,
              height: p.size,
              backgroundColor: "#ff2a2a",
              borderRadius: "50%",
              opacity,
              boxShadow: "0 0 10px #ff2a2a",
              filter: "blur(1px)",
            }}
          />
        );
      })}
    </div>
  );
};

// Pulse wave that expands outwards
const BackgroundPulse = () => {
  const frame = useCurrentFrame();
  
  const scale = interpolate(frame, [20, 90], [0.5, 3.5], { extrapolateRight: "clamp" });
  const opacity = interpolate(frame, [20, 50, 90], [0, 0.3, 0], { extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 500,
          height: 500,
          borderRadius: "50%",
          border: "2px solid #e50914",
          boxShadow: "0 0 100px #e50914, inset 0 0 50px #e50914",
          transform: `scale(${scale})`,
          opacity,
          filter: "blur(4px)",
        }}
      />
    </div>
  );
};

// Single letter animation (pop and glow)
const Letter = ({ char, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: { damping: 14, mass: 0.8 },
  });

  const scale = interpolate(progress, [0, 1], [2, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const blur = interpolate(progress, [0, 1], [10, 0]);

  // Red glow that flashes brightly when popping in, then settles
  const textShadowOpacity = interpolate(frame - delay, [0, 10, 30], [0, 1, 0.4], { extrapolateRight: "clamp" });

  return (
    <span
      style={{
        display: "inline-block",
        transform: `scale(${scale})`,
        opacity,
        filter: `blur(${blur}px)`,
        textShadow: `0 0 30px rgba(229, 9, 20, ${textShadowOpacity * 0.9}), 0 0 60px rgba(229, 9, 20, ${textShadowOpacity * 0.6})`,
      }}
    >
      {char}
    </span>
  );
};

// The core text with the sweep effect
const AnimatedText = () => {
  const text = "AMARFLIX";
  const frame = useCurrentFrame();

  // Dramatic continuous zoom (Netflix style)
  const globalScale = interpolate(frame, [0, 135], [0.95, 1.15]);

  // Light sweep calculation
  const sweepStartFrame = 50;
  const sweepProgress = interpolate(frame - sweepStartFrame, [0, 45], [-50, 150], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${globalScale})` }}>
      <div style={{ position: "relative" }}>
        <h1
          style={{
            fontFamily: "Outfit, Inter, sans-serif",
            fontSize: "150px",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "0.15em",
            color: "#ffffff",
            display: "flex",
            position: "relative",
            zIndex: 10,
          }}
        >
          {text.split("").map((char, i) => (
            <Letter key={i} char={char} delay={15 + i * 4} />
          ))}
        </h1>

        {/* Sweep Mask Overlay */}
        <h1
          style={{
            fontFamily: "Outfit, Inter, sans-serif",
            fontSize: "150px",
            fontWeight: 900,
            margin: 0,
            letterSpacing: "0.15em",
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            zIndex: 20,
            color: "transparent",
            backgroundImage: `linear-gradient(110deg, transparent ${sweepProgress - 10}%, rgba(255,255,255,1) ${sweepProgress}%, transparent ${sweepProgress + 10}%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            textShadow: sweepProgress > 0 && sweepProgress < 100 ? "0 0 40px rgba(255,255,255,0.6)" : "none",
            opacity: interpolate(frame, [sweepStartFrame, sweepStartFrame + 50], [1, 0.8]),
          }}
        >
          {text}
        </h1>
      </div>
    </div>
  );
};

const CinematicIntro = () => {
  const frame = useCurrentFrame();
  
  // Fade in from black
  const fadeOpacity = interpolate(frame, [0, 10], [1, 0], { extrapolateRight: "clamp" });
  
  // Deep dark red cinematic vignette background
  const bgOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ flex: 1, backgroundColor: "#000000", position: "relative", overflow: "hidden" }}>
      {/* Background Gradient */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(circle at center, #1a0203 0%, #000000 70%)",
          opacity: bgOpacity,
        }}
      />
      
      <BackgroundPulse />
      <Particles />
      <AnimatedText />

      {/* Fade overlay at start */}
      <div style={{ position: "absolute", inset: 0, backgroundColor: "#000000", opacity: fadeOpacity, pointerEvents: "none", zIndex: 100 }} />
    </div>
  );
};

const AnimatedIntro = ({ onFinish }) => {
  const [isFinished, setIsFinished] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // 4.5 seconds total runtime
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    const unmountTimer = setTimeout(() => {
      setIsFinished(true);
      if (onFinish) onFinish();
    }, 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onFinish]);

  if (isFinished) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black pointer-events-none transition-opacity duration-500 ease-in-out ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <Player
        component={CinematicIntro}
        durationInFrames={135} // 4.5 seconds at 30fps
        compositionWidth={1920}
        compositionHeight={1080}
        fps={30}
        autoPlay
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default AnimatedIntro;
