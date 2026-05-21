import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "@/assets/logo-2.png";

const PIXEL_FONT = "'DotGothic16', monospace";
const BURST_COLORS = ["#FBBF24", "#a78bfa", "#f9a8d4", "#7dd3fc", "#ffffff"];

function PixelBurst() {
  const [particles, setParticles] = useState([]);
  const pid = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const id = pid.current++;
      const angle = Math.random() * Math.PI * 2;
      const dist = 30 + Math.random() * 40;
      setParticles((prev) => [...prev, {
        id,
        vx: Math.cos(angle) * dist,
        vy: Math.sin(angle) * dist,
        size: Math.random() < 0.3 ? 4 : 2,
        color: BURST_COLORS[Math.floor(Math.random() * BURST_COLORS.length)],
      }]);
      setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 900);
    };
    const interval = setInterval(spawn, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: p.size, height: p.size,
              background: p.color,
              marginLeft: -p.size / 2, marginTop: -p.size / 2,
            }}
            initial={{ x: 0, y: 0, opacity: 1 }}
            animate={{ x: p.vx, y: p.vy, opacity: 0, scale: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function MascotLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-4"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Full-width banner image */}
      <motion.img
        src={logoSrc}
        alt="logo"
        style={{ width: "100%", height: "auto", display: "block" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Title banner */}
      <div className="text-center flex flex-col items-center gap-2">
        <motion.div
          style={{ background: "#1a0050", border: "4px solid #C4B5FD", padding: "10px 24px", position: "relative" }}
          animate={{ boxShadow: ["4px 4px 0px #000", "6px 6px 0px #000", "4px 4px 0px #000"] }}
          transition={{ duration: 1.2, repeat: Infinity }}
        >
          {[{top:-4,left:-4},{top:-4,right:-4},{bottom:-4,left:-4},{bottom:-4,right:-4}].map((pos,i) => (
            <motion.div key={i} style={{ position: "absolute", ...pos, width: 8, height: 8 }}
              animate={{ background: ["#FBBF24","#f9a8d4","#7dd3fc","#FBBF24"] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
          <h1 style={{ display: "flex", gap: 0, justifyContent: "center" }}>
            {"ドリームキャンバス".split("").map((ch, i) => (
              <motion.span key={i} style={{
                fontFamily: PIXEL_FONT,
                fontSize: "clamp(1.4rem, 4vw, 2rem)",
                color: "#fff",
                textShadow: "2px 2px 0px #000",
                display: "inline-block",
                lineHeight: 1.6,
              }}
                animate={{ y: [0, -4, 0], color: ["#ffffff", "#FBBF24", "#C4B5FD", "#ffffff"] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.08, ease: "easeInOut" }}
              >
                {ch === " " ? "\u00A0" : ch}
              </motion.span>
            ))}
          </h1>
        </motion.div>

        <motion.p style={{
          fontFamily: PIXEL_FONT, fontSize: "1rem",
          color: "#ffffff", letterSpacing: "0.05em",
          textShadow: "0 0 8px #c4b5fd, 0 0 18px #7C3AED, 2px 2px 0 #000",
        }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.45, 0.5, 0.95] }}
        >
          ★ そうぞうが アートになる ★
        </motion.p>
      </div>
    </motion.div>
  );
}
