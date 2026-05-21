import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import magicWandSrc from "@/assets/magic-wand.png";
import catSrc from "@/assets/cat.png";

function useTransparentBg(src, threshold = 230) {
  const [url, setUrl] = useState(src);
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] >= threshold && d[i + 1] >= threshold && d[i + 2] >= threshold) {
          d[i + 3] = 0;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      setUrl(canvas.toDataURL("image/png"));
    };
    img.src = src;
  }, [src, threshold]);
  return url;
}

const PIXEL_FONT = "'DotGothic16', monospace";

function BurstSparkle({ style }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ left: style.x, top: style.y, zIndex: 50, fontSize: 12 }}
      initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
      animate={{ opacity: [1, 1, 0], scale: [0, 1.2, 0.8], x: style.vx, y: style.vy }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {style.emoji}
    </motion.div>
  );
}

const BURST_EMOJIS = ["✨", "⭐", "💫", "🌟", "✦", "⚡"];
const HINTS = [
  "にじのおしろをとぶユニコーン",
  "つきでピザをたべるドラゴン",
  "まほうをつかうねこのまほうつかい",
  "はなばたけにいるロボット",
];

export default function PromptInput() {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [burst, setBurst] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const burstId = useRef(0);
  const inputRef = useRef(null);
  const hint = HINTS[Math.floor(Date.now() / 8000) % HINTS.length];
  const magicWand = useTransparentBg(magicWandSrc);

  const handleGenerate = () => {
    if (!value.trim()) return;
    setIsAnimating(true);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 120);

    const newSparkles = Array.from({ length: 10 }, (_, i) => {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 40 + Math.random() * 30;
      return {
        id: burstId.current++,
        x: "50%",
        y: "50%",
        emoji: BURST_EMOJIS[Math.floor(Math.random() * BURST_EMOJIS.length)],
        vx: Math.cos(angle) * dist,
        vy: Math.sin(angle) * dist,
      };
    });
    setBurst((prev) => [...prev, ...newSparkles]);
    setTimeout(() => {
      setBurst((prev) => prev.filter((s) => !newSparkles.find((n) => n.id === s.id)));
      setIsAnimating(false);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleGenerate();
  };

  return (
    <motion.div
      className="w-full max-w-xl mx-auto px-4"
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
    >
      {/* Animated glow wrapper */}
      <motion.div
        animate={{ boxShadow: [
          "0 0 8px rgba(136,72,200,0.3), 2px 2px 0 rgba(0,0,0,0.4)",
          "0 0 22px rgba(192,128,255,0.65), 2px 2px 0 rgba(0,0,0,0.4)",
          "0 0 8px rgba(136,72,200,0.3), 2px 2px 0 rgba(0,0,0,0.4)",
        ]}}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
      {/* RPG dialogue window — Arcane panel style */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          background: "rgba(90, 50, 160, 0.45)",
          boxShadow: isFocused
            ? "inset 3px 3px 0 #f0dcff, inset -3px -3px 0 #180530, 0 0 0 2px #c080ff, 0 0 18px rgba(192,128,255,0.55)"
            : "inset 3px 3px 0 #ead4ff, inset -3px -3px 0 #180530, 0 0 0 2px #8848c8",
          position: "relative",
          transition: "box-shadow 0.08s steps(2)",
          cursor: "url('/cursor.png') 4 2, auto",
        }}
      >
        {/* Pixel corner accents */}
        {[{ top: -3, left: -3 }, { top: -3, right: -3 }, { bottom: -3, left: -3 }, { bottom: -3, right: -3 }].map((pos, i) => (
          <motion.div key={i} style={{ position: "absolute", ...pos, width: 6, height: 6, zIndex: 10, pointerEvents: "none" }}
            animate={{ background: ["#d4aff8", "#FBBF24", "#f9a8d4", "#7dd3fc", "#d4aff8"] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.875, ease: "linear" }}
          />
        ))}

        {/* Title bar */}
        <div style={{
          background: "rgba(65, 30, 120, 0.88)",
          borderBottom: "2px solid rgba(120,80,200,0.4)",
          boxShadow: "inset 0 2px 0 rgba(234,212,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.7)",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <motion.img
            src={catSrc}
            alt="cat"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 28, height: 28, imageRendering: "pixelated", objectFit: "contain" }}
          />
          <span style={{
            fontFamily: PIXEL_FONT,
            fontSize: "1rem",
            color: "#e2d4ff",
            textShadow: "1px 1px 0px #000",
            letterSpacing: "0.08em",
          }}>
            じゅもんにゅうりょく
          </span>
          <motion.div
            style={{ marginLeft: "auto", width: 8, height: 8, background: isFocused ? "#FBBF24" : "#4c1d95" }}
            animate={isFocused ? { opacity: [1, 0, 1] } : { opacity: 1 }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
        </div>

        {/* Input row */}
        <div style={{ display: "flex", alignItems: "stretch", padding: "10px 12px", gap: 10 }}>
          {/* Recessed text field */}
          <div style={{
            flex: 1,
            background: "rgba(35, 15, 70, 0.7)",
            boxShadow: "inset 1px 1px 0 rgba(0,0,0,0.25), inset -1px -1px 0 #7a50b0, 0 0 0 2px #5a3a90",
            padding: "8px 12px",
            display: "flex", alignItems: "flex-start", gap: 8,
            cursor: "text",
          }} onClick={() => inputRef.current?.focus()}>
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
                placeholder="ここにかいてね..."
                rows={1}
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#ffffff",
                  caretColor: "#FBBF24",
                  fontFamily: PIXEL_FONT,
                  fontSize: "1.2rem",
                  lineHeight: 1.8,
                  WebkitFontSmoothing: "none",
                  resize: "none",
                  overflow: "hidden",
                  display: "block",
                  width: "100%",
                  textShadow: "0 0 8px #a78bfa, 0 0 16px #7C3AED",
                }}
              />
          </div>

          {/* Arcade button */}
          <div style={{
            display: "flex",
            alignItems: "center",
            position: "relative",
          }}>
            <AnimatePresence>
              {burst.map((s) => <BurstSparkle key={s.id} style={s} />)}
            </AnimatePresence>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
              onMouseDown={(e) => { e.stopPropagation(); setIsPressed(true); }}
              onMouseUp={() => setIsPressed(false)}
              onMouseLeave={() => setIsPressed(false)}
              style={{
                padding: "6px",
                background: "transparent",
                border: "none",
                boxShadow: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: isPressed ? "translate(2px, 2px)" : "translate(0, 0)",
                transition: "transform 0.05s, box-shadow 0.05s",
              }}
            >
              <motion.img
                src={magicWand}
                alt="magic wand"
                animate={{ rotate: isAnimating ? [0, 360] : [0, -15, 15, 0] }}
                transition={isAnimating
                  ? { duration: 0.5, ease: "linear" }
                  : { duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                style={{
                  width: 56,
                  height: 56,
                  imageRendering: "pixelated",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          </div>
        </div>

        {/* Hint bar */}
        <div style={{
          borderTop: "2px solid rgba(120,80,200,0.4)",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <span style={{ fontFamily: PIXEL_FONT, fontSize: "1rem", color: "#e9d8ff", textShadow: "0 0 8px #c4b5fd" }}>ヒント：</span>
          <p style={{
            fontFamily: PIXEL_FONT,
            fontSize: "0.9rem",
            color: "rgba(233,216,255,0.85)",
            textShadow: "0 0 6px rgba(196,181,253,0.6)",
            lineHeight: 1.6,
          }}>
            "{hint}"
          </p>
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}
