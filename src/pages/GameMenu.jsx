import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PIXEL_FONT = "'DotGothic16', monospace";
const S = 5; // canvas scale: 5px per art pixel

// ─── Floating Pixel Particles ────────────────────────────────────────────────

function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  const pid = useRef(0);

  useEffect(() => {
    const spawn = () => {
      const id = pid.current++;
      const r = Math.random();
      const color = r < 0.28 ? "#FBBF24" : r < 0.55 ? "#f9a8d4" : r < 0.75 ? "#e8d5ff" : "#ffffff";
      const size = Math.random() < 0.22 ? 4 : 2;
      setParticles((prev) => [
        ...prev,
        { id, left: `${3 + Math.random() * 94}%`, top: `${10 + Math.random() * 75}%`, size, color, duration: 4 + Math.random() * 5 },
      ]);
      setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 9000);
    };
    for (let i = 0; i < 16; i++) setTimeout(spawn, i * 180);
    const iv = setInterval(spawn, 320);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute", left: p.left, top: p.top,
              width: p.size, height: p.size,
              background: p.color,
              imageRendering: "pixelated",
            }}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 0.9, 0.9, 0], y: -60 }}
            exit={{ opacity: 0 }}
            transition={{ duration: p.duration, ease: "linear" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Pixel Moon ──────────────────────────────────────────────────────────────

function PixelMoon() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -63%)",
        width: 400, height: 400,
        zIndex: 2, pointerEvents: "none",
      }}
    >
      <motion.div
        style={{
          position: "absolute", inset: 0,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 38% 30%, #dbb8f0 0%, #c498dc 10%, #aa78c4 26%, #8e5aac 42%, #6e3e94 57%, #4e2478 71%, #2e1058 85%, #10062a 100%)",
        }}
        animate={{
          boxShadow: [
            "0 0 40px rgba(160,110,210,0.32), 0 0 80px rgba(110,60,160,0.16)",
            "0 0 70px rgba(160,110,210,0.58), 0 0 130px rgba(110,60,160,0.30)",
            "0 0 40px rgba(160,110,210,0.32), 0 0 80px rgba(110,60,160,0.16)",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Square crater details for pixel-art feel */}
      <div style={{ position: "absolute", top: "18%", right: "21%", width: 40, height: 36, background: "rgba(62,24,100,0.38)" }} />
      <div style={{ position: "absolute", top: "47%", left: "15%", width: 26, height: 24, background: "rgba(52,18,88,0.30)" }} />
      <div style={{ position: "absolute", bottom: "22%", right: "29%", width: 32, height: 28, background: "rgba(58,22,94,0.32)" }} />
      <div style={{ position: "absolute", top: "31%", left: "42%", width: 18, height: 16, background: "rgba(46,14,78,0.26)" }} />
      <div style={{ position: "absolute", top: "62%", right: "18%", width: 14, height: 12, background: "rgba(50,18,82,0.22)" }} />
    </div>
  );
}

// ─── Sakura Trees (Canvas pixel art) ─────────────────────────────────────────

function SakuraTree({ variant }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const px = (x, y, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x * S), Math.round(y * S), w * S, h * S);
    };

    const blob = (cx, cy, r, color) => {
      ctx.fillStyle = color;
      for (let dy = Math.floor(-r); dy <= Math.ceil(r); dy++) {
        for (let dx = Math.floor(-r); dx <= Math.ceil(r); dx++) {
          if (dx * dx + dy * dy <= r * r + 0.6) {
            ctx.fillRect(Math.round((cx + dx) * S), Math.round((cy + dy) * S), S, S);
          }
        }
      }
    };

    if (variant === "tall") {
      // Trunk (2 px wide, 14 tall, starts at row 16)
      px(8, 16, 2, 14, "#160602");
      px(9, 16, 1, 14, "#4a1e0c");
      // Branches
      px(4, 20, 4, 1, "#2a0e06");
      px(10, 18, 4, 1, "#2a0e06");
      // Branch-tip blossoms
      blob(4,  19, 2.0, "#f472b6");
      blob(13, 17, 1.8, "#fce7f3");

      // Main blossom clusters — upper canopy
      blob(8,   3, 4.0, "#f472b6");
      blob(13,  5, 3.2, "#f9a8d4");
      blob(4,   7, 3.0, "#ec4899");
      blob(10,  9, 3.6, "#f472b6");
      blob(5,  10, 3.0, "#fce7f3");
      blob(15,  8, 2.6, "#f472b6");
      blob(8,  13, 2.8, "#f9a8d4");
      blob(3,  12, 2.4, "#ec4899");
      blob(12, 11, 2.6, "#f472b6");
      blob(7,   7, 2.2, "#fce7f3");
      // Dark accent flecks
      blob(8,   4, 1.2, "#9d174d");
      blob(10, 10, 1.0, "#9d174d");
      blob(5,  11, 0.9, "#be185d");
      blob(14,  6, 0.9, "#be185d");

    } else if (variant === "medium") {
      // Trunk
      px(6, 13, 2, 9, "#160602");
      px(7, 13, 1, 9, "#4a1e0c");
      // Branches
      px(3, 16, 3, 1, "#2a0e06");
      px(8, 14, 3, 1, "#2a0e06");
      blob(3,  15, 1.6, "#f9a8d4");
      blob(10, 13, 1.5, "#f472b6");

      blob(6,  3, 3.2, "#f472b6");
      blob(10, 5, 2.8, "#f9a8d4");
      blob(3,  5, 2.6, "#ec4899");
      blob(8,  8, 3.0, "#f472b6");
      blob(4,  9, 2.4, "#fce7f3");
      blob(11, 7, 2.2, "#f472b6");
      blob(7, 11, 2.2, "#f9a8d4");
      blob(2,  8, 1.8, "#ec4899");
      blob(6,  4, 1.0, "#9d174d");
      blob(9,  9, 0.9, "#be185d");

    } else {
      // Small tree
      px(4,  9, 2, 7, "#160602");
      px(5,  9, 1, 7, "#4a1e0c");
      px(2, 12, 2, 1, "#2a0e06");

      blob(5,  2, 2.8, "#f472b6");
      blob(8,  4, 2.2, "#f9a8d4");
      blob(2,  4, 2.0, "#ec4899");
      blob(5,  6, 2.5, "#f472b6");
      blob(3,  8, 1.8, "#fce7f3");
      blob(8,  6, 1.6, "#f472b6");
      blob(5,  3, 0.9, "#9d174d");
    }
  }, [variant]);

  const dims = { tall: [18, 30], medium: [13, 22], small: [11, 16] }[variant];
  return (
    <canvas
      ref={canvasRef}
      width={dims[0] * S}
      height={dims[1] * S}
      style={{ imageRendering: "pixelated", display: "block" }}
    />
  );
}

// ─── Game Button ─────────────────────────────────────────────────────────────

function GameButton({ label, disabled = false }) {
  const [hov, setHov] = useState(false);
  const [press, setPress] = useState(false);

  const noise = "repeating-linear-gradient(90deg, rgba(255,255,255,0.028) 0px, rgba(255,255,255,0.028) 1px, transparent 1px, transparent 4px)";

  const grad = press
    ? "linear-gradient(180deg, #190b3a 0%, #241250 100%)"
    : hov
    ? "linear-gradient(180deg, #624299 0%, #502e8a 46%, #643c9e 100%)"
    : "linear-gradient(180deg, #4e3488 0%, #3c2274 46%, #502e8c 100%)";

  const shadow = press
    ? [
        "inset 3px 3px 0 #0c0620",
        "inset -2px -2px 0 #5040a0",
        "0 0 0 2px #3a2c64",
        "0 0 0 4px #0c0618",
        "2px 2px 0 #000",
      ].join(", ")
    : hov
    ? [
        "inset 2px 2px 0 #c0b0f0",
        "inset 3px 3px 0 rgba(210,190,255,0.28)",
        "inset -2px -2px 0 #0c0620",
        "0 0 0 2px #9880d8",
        "0 0 0 4px #3c2c78",
        "0 0 16px rgba(148,108,238,0.55)",
        "0 0 32px rgba(120,80,200,0.22)",
        "4px 4px 0 #000",
      ].join(", ")
    : [
        "inset 2px 2px 0 #9880d0",
        "inset 3px 3px 0 rgba(160,140,220,0.22)",
        "inset -2px -2px 0 #0c0620",
        "inset -3px -3px 0 rgba(8,4,20,0.55)",
        "0 0 0 2px #4b3b78",
        "0 0 0 4px #1a0e38",
        "4px 4px 0 #000",
      ].join(", ");

  return (
    <div style={{ position: "relative" }}>
      {/* Pixel corner accents */}
      {[
        { top: -2, left: -2 },
        { top: -2, right: -2 },
        { bottom: -2, left: -2 },
        { bottom: -2, right: -2 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute", ...pos,
            width: 5, height: 5,
            background: disabled ? "#2a1e50" : hov ? "#c4b5fd" : "#6c52b0",
            pointerEvents: "none", zIndex: 2,
          }}
        />
      ))}
      <button
        disabled={disabled}
        onMouseEnter={() => !disabled && setHov(true)}
        onMouseLeave={() => { setHov(false); setPress(false); }}
        onMouseDown={() => !disabled && setPress(true)}
        onMouseUp={() => setPress(false)}
        style={{
          width: "100%",
          padding: "12px 20px",
          backgroundImage: `${noise}, ${grad}`,
          boxShadow: shadow,
          fontFamily: PIXEL_FONT,
          fontSize: "1rem",
          letterSpacing: "0.04em",
          lineHeight: 1,
          color: disabled ? "#3e2e62" : press ? "#b0a0de" : "#ddd0ff",
          textShadow: disabled ? "none" : press ? "1px 1px 0 #080418" : "2px 2px 0 #08041a",
          cursor: disabled ? "not-allowed" : "pointer",
          transform: press ? "translate(2px, 2px)" : "translate(0, 0)",
          transition: "box-shadow 0.04s steps(2), transform 0.04s steps(1), color 0.04s steps(1)",
          imageRendering: "pixelated",
          border: "none",
          outline: "none",
          display: "block",
          opacity: disabled ? 0.5 : 1,
          WebkitFontSmoothing: "none",
        }}
      >
        {label}
      </button>
    </div>
  );
}

// ─── Main Menu Page ───────────────────────────────────────────────────────────

export default function GameMenu() {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#000000",
        overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: PIXEL_FONT,
      }}
    >
      {/* Moon behind everything */}
      <PixelMoon />

      {/* Sakura trees — in front of moon and buttons */}
      {/* Tall tree — right side overlapping menu edge */}
      <div style={{ position: "absolute", left: "calc(50% + 130px)", top: "calc(50% - 220px)", zIndex: 15, pointerEvents: "none" }}>
        <SakuraTree variant="tall" />
      </div>
      {/* Medium tree — left side */}
      <div style={{ position: "absolute", left: "calc(50% - 260px)", top: "calc(50% - 110px)", zIndex: 15, pointerEvents: "none" }}>
        <SakuraTree variant="medium" />
      </div>
      {/* Small tree — bottom left */}
      <div style={{ position: "absolute", left: "calc(50% - 200px)", top: "calc(50% + 120px)", zIndex: 15, pointerEvents: "none" }}>
        <SakuraTree variant="small" />
      </div>

      {/* Floating pixel particles */}
      <FloatingParticles />

      {/* Menu buttons panel */}
      <motion.div
        style={{ position: "relative", zIndex: 10, width: 340 }}
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {/* Top full-width */}
          <GameButton label="ゲームにもどる" />

          {/* 2-column rows */}
          {[
            ["じつせき", "とうけい"],
            ["フィードバック", "バグをほうこく"],
            ["せってい...", "LANかいせつ"],
          ].map(([a, b], i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              <GameButton label={a} />
              <GameButton label={b} disabled={b === "LANかいせつ"} />
            </div>
          ))}

          {/* Bottom full-width */}
          <GameButton label="せつだん" />
        </div>
      </motion.div>
    </div>
  );
}
