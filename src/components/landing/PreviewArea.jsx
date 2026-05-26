import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import mirrorImg from "@/assets/mirror.png";

const PIXEL_FONT = "'DotGothic16', monospace";
const DUST_COLORS = ["#FBBF24", "#a78bfa", "#f9a8d4", "#7dd3fc", "#ffffff", "#34D399"];

const PANEL_BG     = "rgba(55, 45, 160, 0.45)";
const INNER_SHADOW = "inset 2px 2px 0 #d4daff, inset -2px -2px 0 #05051a, 0 0 0 2px #5060c8, 1px 1px 0 rgba(0,0,0,0.4)";
const SHADOW_DIM   = "inset 3px 3px 0 #d4daff, inset -3px -3px 0 #05051a, 0 0 0 2px #5a6ad8, 0 0 8px rgba(80,90,210,0.3), 2px 2px 0 rgba(0,0,0,0.4)";
const SHADOW_GLOW  = "inset 3px 3px 0 #e0e6ff, inset -3px -3px 0 #05051a, 0 0 0 2px #8090ff, 0 0 22px rgba(128,144,255,0.65), 2px 2px 0 rgba(0,0,0,0.4)";

const SPELL_COLORS = [
  "#ffffff", "#FBBF24", "#fde68a", "#f9a8d4",
  "#7dd3fc", "#d4aff8", "#c4b5fd", "#a78bfa", "#34D399",
];

// ─── Background pixel dust ────────────────────────────────────────────────────
function PixelDust() {
  const [particles, setParticles] = useState([]);
  const pid = useRef(0);
  useEffect(() => {
    const iv = setInterval(() => {
      const id = pid.current++;
      const p = {
        id,
        x: `${8 + Math.random() * 84}%`,
        y: `${8 + Math.random() * 84}%`,
        size: Math.random() < 0.25 ? 4 : 2,
        color: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
        dur: 0.9 + Math.random() * 0.9,
      };
      setParticles((prev) => [...prev, p]);
      setTimeout(() => setParticles((prev) => prev.filter((x) => x.id !== id)), 2000);
    }, 180);
    return () => clearInterval(iv);
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
            transition={{ duration: p.dur, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Pixel corner accent ──────────────────────────────────────────────────────
function PixelCorner({ style, delay = 0 }) {
  return (
    <motion.div
      style={{ position: "absolute", ...style, width: 6, height: 6, zIndex: 12, pointerEvents: "none" }}
      animate={{ background: ["#d4aff8", "#FBBF24", "#f9a8d4", "#7dd3fc", "#d4aff8"] }}
      transition={{ duration: 3.5, repeat: Infinity, delay, ease: "linear" }}
    />
  );
}

// ─── 4-point star stroke ──────────────────────────────────────────────────────
function drawStar(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.9;
  ctx.shadowColor = color;
  ctx.shadowBlur = 5;
  for (let i = 0; i < 2; i++) {
    const a = (i / 2) * Math.PI;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * size, y + Math.sin(a) * size);
    ctx.lineTo(x - Math.cos(a) * size, y - Math.sin(a) * size);
    ctx.stroke();
  }
  ctx.restore();
}

// ─── Spell canvas ─────────────────────────────────────────────────────────────
// active: bool  — run the RAF loop
// rushing: bool — rush all particles toward the center (flash phase)
function SpellCanvas({ active, rushing }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const rushRef   = useRef(rushing);
  const dataRef   = useRef({ particles: [], elapsed: 0, lastTs: null, spawnAcc: 0 });

  // Keep rushRef in sync without restarting the RAF loop
  useEffect(() => { rushRef.current = rushing; }, [rushing]);

  // Sync canvas resolution to DOM size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const sync = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      canvas.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx  = canvas.getContext("2d");
    const data = dataRef.current;

    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      data.particles = [];
      data.elapsed   = 0;
      data.lastTs    = null;
      data.spawnAcc  = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Reset for a fresh cast
    data.particles = [];
    data.elapsed   = 0;
    data.lastTs    = null;
    data.spawnAcc  = 0;

    const spawn = (w, h) => {
      const cx   = w / 2;
      const cy   = h / 2;
      const maxR = Math.min(w, h) * 0.44;

      // Three orbital rings: outer, mid, inner
      const ring = Math.random();
      const radius = maxR * (
        ring < 0.35  ? 0.78 + Math.random() * 0.22   // outer
        : ring < 0.7 ? 0.44 + Math.random() * 0.34   // mid
                     : 0.12 + Math.random() * 0.30    // inner
      );

      const angle = Math.random() * Math.PI * 2;
      const cw    = Math.random() < 0.62 ? 1 : -1;

      return {
        angle,
        radius,
        baseRadius: radius,
        speed:      cw * (0.007 + Math.random() * 0.017),
        size:       1.3 + Math.random() * 2.9,
        color:      SPELL_COLORS[Math.floor(Math.random() * SPELL_COLORS.length)],
        alpha:      0.55 + Math.random() * 0.45,
        twPhase:    Math.random() * Math.PI * 2,
        twSpeed:    0.035 + Math.random() * 0.075,
        trail:      [],
        isStar:     Math.random() < 0.22,
        currentX:   cx + radius * Math.cos(angle),
        currentY:   cy + radius * Math.sin(angle),
      };
    };

    const loop = (ts) => {
      if (!data.lastTs) data.lastTs = ts;
      const delta  = Math.min(ts - data.lastTs, 50);
      data.lastTs  = ts;
      data.elapsed += delta;
      data.spawnAcc += delta;

      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (!w || !h) { rafRef.current = requestAnimationFrame(loop); return; }

      const cx = w / 2;
      const cy = h / 2;
      const t  = Math.min(data.elapsed / 9000, 1); // 0→1 over 9 s

      // Dynamic spawn: 6 → 60 particles, interval 220ms → 45ms
      const targetCount    = Math.floor(6 + t * 54);
      const spawnInterval  = Math.max(45, 220 - t * 175);

      while (data.spawnAcc >= spawnInterval && data.particles.length < targetCount) {
        data.particles.push(spawn(w, h));
        data.spawnAcc -= spawnInterval;
      }

      const isRushing = rushRef.current;

      // Update particles
      data.particles = data.particles.filter((p) => {
        if (isRushing) {
          p.radius *= 0.86;
          p.alpha  *= 0.89;
          return p.radius > 1.2 && p.alpha > 0.03;
        }
        return p.alpha > 0.03;
      });

      data.particles.forEach((p) => {
        const speedMul = isRushing ? 3.5 : 1;
        p.angle    += p.speed * speedMul;
        p.twPhase  += p.twSpeed;

        // Slow gentle inward spiral while swirling
        if (!isRushing) {
          p.radius = p.baseRadius * (1 - Math.min(data.elapsed / 14000, 0.22));
        }

        const x = cx + p.radius * Math.cos(p.angle);
        const y = cy + p.radius * Math.sin(p.angle);

        p.trail.push({ x, y });
        if (p.trail.length > 10) p.trail.shift();
        p.currentX = x;
        p.currentY = y;
      });

      // Draw
      ctx.clearRect(0, 0, w, h);

      // Subtle ambient glow at center while swirling
      if (!isRushing && data.elapsed > 800) {
        const glowAlpha = Math.min((data.elapsed - 800) / 3000, 0.18) * (0.7 + 0.3 * Math.sin(data.elapsed * 0.002));
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.35);
        grad.addColorStop(0,   `rgba(180, 160, 255, ${glowAlpha})`);
        grad.addColorStop(0.5, `rgba(100, 80, 200, ${glowAlpha * 0.4})`);
        grad.addColorStop(1,   "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      data.particles.forEach((p) => {
        if (!p.currentX) return;
        const { currentX: x, currentY: y } = p;
        const tw = 0.5 + 0.5 * Math.sin(p.twPhase);

        // Trail
        p.trail.forEach((tp, i) => {
          const ta = (i / p.trail.length) * p.alpha * 0.2 * tw;
          const ts = p.size * (i / p.trail.length) * 0.5;
          ctx.save();
          ctx.globalAlpha = ta;
          ctx.shadowColor = p.color;
          ctx.shadowBlur  = 3;
          ctx.fillStyle   = p.color;
          ctx.beginPath();
          ctx.arc(tp.x, tp.y, ts, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });

        // Outer glow halo
        ctx.save();
        ctx.globalAlpha = p.alpha * tw * 0.3;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 16;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Core particle
        ctx.save();
        ctx.globalAlpha = p.alpha * tw;
        ctx.shadowColor = p.color;
        ctx.shadowBlur  = 8;
        ctx.fillStyle   = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // White-hot center
        ctx.save();
        ctx.globalAlpha = p.alpha * tw;
        ctx.fillStyle   = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y, p.size * 0.36, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 4-point sparkle star on larger particles
        if (p.isStar && p.size > 2) {
          drawStar(ctx, x, y, p.size * 2.8, p.color, p.alpha * tw * 0.65);
        }
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        pointerEvents: "none", zIndex: 8,
      }}
    />
  );
}

// ─── PreviewArea ──────────────────────────────────────────────────────────────
export default function PreviewArea({ generatedImage = null, isLoading = false, error = null }) {
  const [sparkles,    setSparkles]    = useState([]);
  const [isFlashing,  setIsFlashing]  = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const sparkleId   = useRef(0);
  const prevImgRef  = useRef(null);

  // Hide image & reset flash when a new generation starts
  useEffect(() => {
    if (isLoading) {
      setImageVisible(false);
      setIsFlashing(false);
    }
  }, [isLoading]);

  // Flash → reveal sequence when new image arrives
  useEffect(() => {
    if (!isLoading && generatedImage && generatedImage !== prevImgRef.current) {
      prevImgRef.current = generatedImage;
      setImageVisible(false);
      setIsFlashing(true);
      const t = setTimeout(() => {
        setIsFlashing(false);
        setImageVisible(true);
      }, 750);
      return () => clearTimeout(t);
    }
    if (!generatedImage) {
      prevImgRef.current = null;
      setImageVisible(false);
      setIsFlashing(false);
    }
  }, [isLoading, generatedImage]);

  // Perimeter ✦ sparkles on panel border
  useEffect(() => {
    const iv = setInterval(() => {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      if      (side === 0) { x = `${5 + Math.random() * 90}%`; y = "-14px"; }
      else if (side === 1) { x = `${5 + Math.random() * 90}%`; y = "calc(100% + 10px)"; }
      else if (side === 2) { x = "-14px";                       y = `${5 + Math.random() * 90}%`; }
      else                 { x = "calc(100% + 10px)";           y = `${5 + Math.random() * 90}%`; }
      const id = sparkleId.current++;
      setSparkles((prev) => [...prev, { id, x, y, dur: 0.9 + Math.random() * 0.5 }]);
      setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== id)), 1600);
    }, 500);
    return () => clearInterval(iv);
  }, []);

  const showParticles = isLoading || isFlashing;
  const showIdle      = !isLoading && !imageVisible && !isFlashing && !error;
  const showError     = !!error && !isLoading && !imageVisible;

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto px-4 h-full"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
    >
      <motion.div
        className="relative h-full flex flex-col"
        style={{ overflow: "visible", background: PANEL_BG }}
        animate={{ boxShadow: isLoading
          ? [SHADOW_GLOW, SHADOW_DIM, SHADOW_GLOW]
          : [SHADOW_DIM,  SHADOW_GLOW, SHADOW_DIM]
        }}
        transition={{ duration: isLoading ? 1.1 : 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <PixelCorner style={{ top: -3, left: -3 }}   delay={0} />
        <PixelCorner style={{ top: -3, right: -3 }}  delay={0.875} />
        <PixelCorner style={{ bottom: -3, left: -3 }} delay={1.75} />
        <PixelCorner style={{ bottom: -3, right: -3 }} delay={2.625} />

        {/* Title bar */}
        <div style={{
          background: "rgba(25, 25, 100, 0.88)",
          borderBottom: "2px solid #10103a",
          boxShadow: "inset 0 2px 0 rgba(212,218,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.7)",
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
                  textShadow: [
                    "0 0 6px #a78bfa, 0 0 12px #7C3AED",
                    "0 0 6px #FBBF24, 0 0 12px #f59e0b",
                    "0 0 6px #f9a8d4, 0 0 12px #ec4899",
                    "0 0 6px #a78bfa, 0 0 12px #7C3AED",
                  ],
                }}
                transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.07, ease: "easeInOut" }}
              >{ch === " " ? " " : ch}</motion.span>
            ))}
          </div>
          <motion.div style={{ width: 8, height: 8, background: "#a78bfa" }}
            animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.7, repeat: Infinity }} />
        </div>

        {/* Perimeter sparkles */}
        <AnimatePresence>
          {sparkles.map((s) => (
            <motion.span key={s.id}
              style={{ position: "absolute", left: s.x, top: s.y, zIndex: 20, color: "#FBBF24", fontSize: 12, pointerEvents: "none" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 0], y: [0, -14] }}
              transition={{ duration: s.dur }}
            >✦</motion.span>
          ))}
        </AnimatePresence>

        {/* ── Content area ── */}
        <div style={{
          flex: 1,
          background: "rgba(35, 28, 110, 0.5)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "12px 24px", position: "relative", zIndex: 7, overflow: "hidden",
        }}>
          <PixelDust />

          {/* Swirling spell particles (canvas-based) */}
          <SpellCanvas active={showParticles} rushing={isFlashing} />

          {/* Magical flash overlay — radial burst expanding from center */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div
                style={{
                  position: "absolute", inset: 0, zIndex: 25, pointerEvents: "none",
                  background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.98) 0%, rgba(220,200,255,0.85) 25%, rgba(128,100,255,0.45) 55%, transparent 75%)",
                }}
                initial={{ opacity: 0, scale: 0.15 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.15, 1.0, 1.4, 2.8] }}
                transition={{ duration: 0.72, times: [0, 0.18, 0.48, 1], ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Generated image — fades in with blur dissolve */}
          <AnimatePresence>
            {imageVisible && generatedImage && (
              <motion.img
                key={generatedImage}
                src={generatedImage}
                alt="generated"
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "contain", zIndex: 6,
                  display: "block",
                }}
                initial={{ opacity: 0, scale: 1.06, filter: "blur(12px) brightness(2.5)" }}
                animate={{ opacity: 1,  scale: 1,    filter: "blur(0px)  brightness(1)"   }}
                transition={{ duration: 0.65, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* Loading status pill */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                style={{
                  position: "absolute", bottom: 14, left: 0, right: 0,
                  display: "flex", justifyContent: "center", zIndex: 15,
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.3 }}
              >
                <div style={{
                  background: "rgba(8, 6, 35, 0.78)",
                  border: "1px solid rgba(140,120,255,0.45)",
                  padding: "4px 18px",
                  backdropFilter: "blur(6px)",
                }}>
                  <motion.p
                    style={{ fontFamily: PIXEL_FONT, fontSize: "0.8rem", color: "#c4b5fd", textShadow: "0 0 8px #8090ff", margin: 0 }}
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  >まほうをかけています...</motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Idle state (mirror + placeholder) ── */}
          {showIdle && (
            <>
              <div className="relative flex items-center justify-center mb-3" style={{ zIndex: 4 }}>
                <motion.img
                  src={mirrorImg} alt="magic mirror"
                  style={{ width: "min(120px, 18vh)", height: "min(120px, 18vh)", imageRendering: "pixelated", objectFit: "contain", display: "block" }}
                  animate={{ scale: [1, 1.05, 1], y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                {[
                  { top: -14, left: "20%",   size: 10, delay: 0,   dur: 1.2 },
                  { top: -10, right: "18%",  size: 8,  delay: 0.4, dur: 1.5 },
                  { top: "30%", left: -16,   size: 10, delay: 0.8, dur: 1.3 },
                  { top: "30%", right: -14,  size: 8,  delay: 0.2, dur: 1.6 },
                  { bottom: -12, left: "25%",  size: 8,  delay: 0.6, dur: 1.1 },
                  { bottom: -10, right: "22%", size: 10, delay: 1.0, dur: 1.4 },
                  { top: "10%", left: -12,   size: 6,  delay: 1.2, dur: 1.0 },
                  { top: "10%", right: -10,  size: 6,  delay: 0.9, dur: 1.7 },
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

              <div style={{ boxShadow: INNER_SHADOW, padding: "8px 20px", background: "rgba(30, 25, 100, 0.6)", textAlign: "center", position: "relative", zIndex: 4 }}>
                <p style={{ fontFamily: PIXEL_FONT, fontSize: "0.95rem", color: "#e2e8ff", lineHeight: 1.7, textShadow: "0 0 8px #8090ff, 0 0 16px #5060c8, 1px 1px 0 #000" }}>
                  まほうのえが<br />ここにあらわれます
                </p>
                <motion.p
                  style={{ fontFamily: PIXEL_FONT, fontSize: "0.8rem", color: "#FBBF24", lineHeight: 1.6, marginTop: 2, textShadow: "0 0 8px #FBBF24, 0 0 16px #f59e0b, 1px 1px 0 #000" }}
                  animate={{ opacity: [1, 1, 0, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, times: [0, 0.45, 0.5, 0.95] }}
                >じゅもんをまってます</motion.p>
              </div>
            </>
          )}

          {/* ── Error state ── */}
          {showError && (
            <motion.div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, zIndex: 4 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
            >
              <motion.img
                src={mirrorImg} alt="magic mirror"
                style={{ width: "min(100px, 15vh)", height: "min(100px, 15vh)", imageRendering: "pixelated", objectFit: "contain", filter: "grayscale(0.5) brightness(0.65)" }}
                animate={{ x: [-5, 5, -5, 5, 0] }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
              <div style={{ boxShadow: INNER_SHADOW, padding: "8px 20px", background: "rgba(30, 25, 100, 0.6)", textAlign: "center", zIndex: 4, maxWidth: "80%" }}>
                <p style={{ fontFamily: PIXEL_FONT, fontSize: "0.85rem", color: "#f9a8d4", lineHeight: 1.7, textShadow: "0 0 8px #ec4899, 1px 1px 0 #000" }}>
                  まほうがしっぱいしました
                </p>
                <p style={{ fontFamily: PIXEL_FONT, fontSize: "0.72rem", color: "rgba(216,226,255,0.65)", lineHeight: 1.5, marginTop: 3 }}>
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
