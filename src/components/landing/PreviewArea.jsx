import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mirrorImg from "@/assets/mirror.jpg";

const PIXEL_FONT = "'DotGothic16', monospace";
const DUST_COLORS  = ["#FBBF24", "#a78bfa", "#f9a8d4", "#7dd3fc", "#ffffff", "#34D399"];

const PANEL_BG     = "#080418";
const PANEL_SHADOW = [
  "inset 2px 2px 0 #9880d0",
  "inset 3px 3px 0 rgba(160,140,220,0.22)",
  "inset -2px -2px 0 #0c0620",
  "inset -3px -3px 0 rgba(8,4,20,0.55)",
  "0 0 0 2px #4b3b78",
  "0 0 0 4px #1a0e38",
  "4px 4px 0 #000",
].join(", ");

// Pixel dust inside canvas
function PixelDust() {
  const [particles, setParticles] = useState([]);
  const pid = useRef(0);
  useEffect(() => {
    const interval = setInterval(() => {
      const id = pid.current++;
      const p = {
        id,
        x: `${8 + Math.random() * 84}%`,
        y: `${8 + Math.random() * 84}%`,
        size: Math.random() < 0.25 ? 4 : 2,
        color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
        duration: 0.9 + Math.random() * 0.9,
      };
      setParticles((prev) => [...prev, p]);
      setTimeout(() => setParticles((prev) => prev.filter((x) => x.id !== id)), 2000);
    }, 180);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 3 }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div key={p.id}
            style={{ position: "absolute", left: p.x, top: p.y, width: p.size, height: p.size, background: p.color }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0], y: [0, -(8 + Math.random() * 12)] }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Pixel corner accent square
function PixelCorner({ style }) {
  return (
    <div style={{ position: "absolute", ...style, width: 6, height: 6, background: "#6c52b0", zIndex: 12, pointerEvents: "none" }} />
  );
}

export default function PreviewArea() {
  const [sparkles, setSparkles] = useState([]);
  const sparkleId = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      if      (side === 0) { x = `${5 + Math.random() * 90}%`; y = "-14px"; }
      else if (side === 1) { x = `${5 + Math.random() * 90}%`; y = "calc(100% + 10px)"; }
      else if (side === 2) { x = "-14px"; y = `${5 + Math.random() * 90}%`; }
      else                 { x = "calc(100% + 10px)"; y = `${5 + Math.random() * 90}%`; }
      const id = sparkleId.current++;
      setSparkles((prev) => [...prev, { id, x, y, duration: 0.9 + Math.random() * 0.5 }]);
      setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 1600);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative" style={{ margin: "32px 0", overflow: "visible", backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px), linear-gradient(180deg, #4e3488 0%, #3c2274 46%, #502e8c 100%)" }}>

        {/* Multi-layer pixel panel border */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 6,
          boxShadow: PANEL_SHADOW,
        }} />

        {/* Pixel corner accents */}
        <PixelCorner style={{ top: -3, left: -3 }} />
        <PixelCorner style={{ top: -3, right: -3 }} />
        <PixelCorner style={{ bottom: -3, left: -3 }} />
        <PixelCorner style={{ bottom: -3, right: -3 }} />

        {/* Title bar */}
        <div style={{
          backgroundImage: "linear-gradient(180deg, #3a2468 0%, #2c185a 100%)",
          borderBottom: "2px solid #0c0620",
          boxShadow: "inset 0 2px 0 rgba(180,160,240,0.3), inset 0 -1px 0 rgba(0,0,0,0.7)",
          padding: "8px 16px",
          display: "flex", alignItems: "center", gap: 8,
          position: "relative", zIndex: 7,
        }}>
          {["#EF4444", "#FBBF24", "#34D399"].map((c, i) => (
            <motion.div key={i} style={{ width: 8, height: 8, background: c }}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
          <div style={{ margin: "0 auto", display: "flex" }}>
            {"★まほうのキャンバス★".split("").map((ch, i) => (
              <motion.span key={i} style={{
                fontFamily: PIXEL_FONT, fontSize: "1rem", color: "#e2d4ff",
                textShadow: "1px 1px 0 #000", display: "inline-block",
              }}
                animate={{
                  y: [0, -3, 0],
                  color: ["#e2d4ff", "#FBBF24", "#f9a8d4", "#e2d4ff"],
                  textShadow: ["0 0 6px #a78bfa, 0 0 12px #7C3AED", "0 0 6px #FBBF24, 0 0 12px #f59e0b", "0 0 6px #f9a8d4, 0 0 12px #ec4899", "0 0 6px #a78bfa, 0 0 12px #7C3AED"],
                }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
              >{ch === " " ? "\u00A0" : ch}</motion.span>
            ))}
          </div>
          <motion.div style={{ width: 8, height: 8, background: "#a78bfa" }}
            animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
        </div>

        {/* Perimeter ✦ sparkles */}
        <AnimatePresence>
          {sparkles.map((s) => (
            <motion.span key={s.id}
              style={{ position: "absolute", left: s.x, top: s.y, zIndex: 20, color: "#FBBF24", fontSize: 12, pointerEvents: "none" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0], y: [0, -14] }}
              transition={{ duration: s.duration }}
            >✦</motion.span>
          ))}
        </AnimatePresence>

        {/* Content area */}
        <div style={{
          minHeight: 420,
          background: PANEL_BG,
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "36px 24px", position: "relative", zIndex: 7, overflow: "hidden",
        }}>
          <PixelDust />

          {/* Magic mirror with twinkling stars */}
          <div className="relative flex items-center justify-center mb-5" style={{ zIndex: 4 }}>
            <motion.img
              src={mirrorImg} alt="magic mirror"
              style={{ width: 180, height: 180, imageRendering: "pixelated", objectFit: "cover", display: "block" }}
              animate={{ scale: [1, 1.05, 1], y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            {[
              { top: -14, left: "20%",  size: 10, delay: 0,   dur: 1.2 },
              { top: -10, right: "18%", size: 8,  delay: 0.4, dur: 1.5 },
              { top: "30%", left: -16,  size: 10, delay: 0.8, dur: 1.3 },
              { top: "30%", right: -14, size: 8,  delay: 0.2, dur: 1.6 },
              { bottom: -12, left: "25%",  size: 8,  delay: 0.6, dur: 1.1 },
              { bottom: -10, right: "22%", size: 10, delay: 1.0, dur: 1.4 },
              { top: "10%", left: -12,  size: 6, delay: 1.2, dur: 1.0 },
              { top: "10%", right: -10, size: 6, delay: 0.9, dur: 1.7 },
              { bottom: "15%", left: -14,  size: 8, delay: 0.3, dur: 1.3 },
              { bottom: "15%", right: -12, size: 6, delay: 0.7, dur: 1.5 },
            ].map((s, i) => (
              <motion.div key={i} style={{
                position: "absolute", top: s.top, bottom: s.bottom, left: s.left, right: s.right,
                width: s.size, height: s.size, background: DUST_COLORS[i % DUST_COLORS.length], pointerEvents: "none",
              }}
                animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
                transition={{ duration: s.dur, repeat: Infinity, delay: s.delay }}
              />
            ))}
          </div>

          {/* RPG text box — same panel style */}
          <div style={{
            boxShadow: PANEL_SHADOW,
            padding: "12px 24px",
            background: "rgba(35, 8, 80, 0.55)",
            textAlign: "center",
            position: "relative", zIndex: 4,
          }}>
            <p style={{ fontFamily: PIXEL_FONT, fontSize: "1.2rem", color: "#e2d4ff", lineHeight: 2, textShadow: "0 0 8px #a78bfa, 0 0 16px #7C3AED, 1px 1px 0 #000" }}>
              まほうのえが<br />ここにあらわれます
            </p>
            <motion.p style={{
              fontFamily: PIXEL_FONT, fontSize: "0.9rem", color: "#FBBF24",
              lineHeight: 2, marginTop: 4, textShadow: "0 0 8px #FBBF24, 0 0 16px #f59e0b, 1px 1px 0 #000",
            }}
              animate={{ opacity: [1, 1, 0, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, times: [0, 0.45, 0.5, 0.95] }}
            >▶ じゅもんをまってます ▶</motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
