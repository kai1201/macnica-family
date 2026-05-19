import React, { useMemo, useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import bgImage from "@/assets/background.jpg";

const BG_OPACITY = 1;

function PixelStar({ style }) {
  return (
    <motion.div
      className="absolute"
      style={{
        width: style.size,
        height: style.size,
        left: style.left,
        top: style.top,
        background: style.color,
        imageRendering: "pixelated",
      }}
      animate={{ opacity: [style.minOpacity, 1, style.minOpacity] }}
      transition={{
        duration: style.duration,
        repeat: Infinity,
        delay: style.delay,
        ease: "linear",
      }}
    />
  );
}

function PixelShootingStar({ id, onComplete }) {
  const config = useMemo(() => {
    const startX = 5 + Math.random() * 85;
    const fallDuration = 1.2 + Math.random() * 1.0;
    const bounceDuration = 0.35 + Math.random() * 0.2;
    const bounceHeight = 40 + Math.random() * 60;
    const driftX = 30 + Math.random() * 50;
    const color = Math.random() < 0.4 ? "#FBBF24" : Math.random() < 0.5 ? "#a78bfa" : "#ffffff";
    return { startX, fallDuration, bounceDuration, bounceHeight, driftX, color };
  }, []);

  const totalDuration = config.fallDuration + config.bounceDuration;
  const impactT = config.fallDuration / totalDuration;

  return (
    <motion.div
      className="absolute"
      style={{ left: `${config.startX}%`, top: 0, zIndex: 5 }}
      initial={{ y: -8, x: 0, opacity: 0 }}
      animate={{
        y: ["0px", "100vh", `calc(100vh - ${config.bounceHeight}px)`, "110vh"],
        x: [0, config.driftX, config.driftX + 8, config.driftX + 12],
        opacity: [0, 1, 0.7, 0],
      }}
      transition={{
        duration: totalDuration,
        times: [0, impactT, impactT + (1 - impactT) * 0.5, 1],
        ease: ["easeIn", "easeOut", "easeIn"],
      }}
      onAnimationComplete={() => onComplete(id)}
    >
      {[0, 5, 10, 16].map((offset, i) => (
        <div key={i} style={{
          position: "absolute",
          top: -offset, left: -offset * 0.28,
          width: Math.max(1, 4 - i), height: Math.max(1, 4 - i),
          background: config.color,
          opacity: 1 - i * 0.22,
          imageRendering: "pixelated",
        }} />
      ))}
    </motion.div>
  );
}

export default function StarryBackground() {
  const [shootingStars, setShootingStars] = useState([]);
  const nextId = useRef(0);

  const stars = useMemo(() => {
    return Array.from({ length: 130 }, (_, i) => ({
      id: i,
      size: i % 12 === 0 ? 4 : i % 5 === 0 ? 3 : 2,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 88}%`,
      duration: 2 + Math.random() * 5,
      delay: Math.random() * 6,
      minOpacity: 0.05 + Math.random() * 0.15,
      color: i % 9 === 0 ? "#FBBF24" : i % 6 === 0 ? "#a78bfa" : i % 4 === 0 ? "#7dd3fc" : "#ffffff",
    }));
  }, []);

  useEffect(() => {
    const spawn = () => {
      const id = nextId.current++;
      setShootingStars((prev) => [...prev, id]);
    };

    // Initial burst
    for (let i = 0; i < 8; i++) {
      setTimeout(spawn, i * 120);
    }

    // Continuous rain: spawn 1-3 meteors every 150-300ms
    const interval = setInterval(() => {
      const count = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        setTimeout(spawn, i * 80);
      }
    }, 150 + Math.random() * 150);

    return () => clearInterval(interval);
  }, []);

  const removeShootingStar = (id) => {
    setShootingStars((prev) => prev.filter((s) => s !== id));
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Solid dark base */}
      <div className="absolute inset-0" style={{ background: "#0a0a2a" }} />

      {/* Background image */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: BG_OPACITY,
          filter: "blur(3px)",
          transform: "scale(1.05)",
        }}
      />



      {/* Pixel stars */}
      {stars.map((star) => (
        <PixelStar key={star.id} style={star} />
      ))}

      {/* Shooting stars */}
      <AnimatePresence>
        {shootingStars.map((id) => (
          <PixelShootingStar key={id} id={id} onComplete={removeShootingStar} />
        ))}
      </AnimatePresence>
    </div>
  );
}
