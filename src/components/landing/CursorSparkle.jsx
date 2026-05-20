import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#FBBF24", "#a78bfa", "#f9a8d4", "#7dd3fc", "#C4B5FD", "#34D399"];

function makeParticle(x, y, fast = false) {
  const angle = Math.random() * Math.PI * 2;
  const speed = fast
    ? 1.2 + Math.random() * 2.8
    : 0.3 + Math.random() * 1.2;
  const type = Math.random() < 0.35 ? "cross" : Math.random() < 0.5 ? "star" : "sq";
  const size = type === "sq" ? (Math.random() < 0.3 ? 4 : 2) : 2;
  return {
    x: x + (Math.random() - 0.5) * (fast ? 12 : 6),
    y: y + (Math.random() - 0.5) * (fast ? 12 : 6),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - (fast ? 1.2 : 0.4),
    size,
    type,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    life: 1,
    decay: fast
      ? 0.028 + Math.random() * 0.032
      : 0.012 + Math.random() * 0.018,
    twinkle: Math.random() < 0.5,
    age: 0,
  };
}

function drawParticle(ctx, p) {
  const s = p.size;
  const x = Math.round(p.x);
  const y = Math.round(p.y);

  // Twinkle: pulse opacity for twinkling particles
  const alpha = p.twinkle
    ? p.life * (0.5 + 0.5 * Math.sin(p.age * 0.45))
    : p.life;
  ctx.globalAlpha = Math.max(0, alpha);
  ctx.fillStyle = p.color;

  // Pixel glow via shadow
  ctx.shadowColor = p.color;
  ctx.shadowBlur = 5;

  if (p.type === "cross") {
    // ╋ pixel cross
    ctx.fillRect(x,      y,      s, s); // center
    ctx.fillRect(x - s,  y,      s, s); // left
    ctx.fillRect(x + s,  y,      s, s); // right
    ctx.fillRect(x,      y - s,  s, s); // top
    ctx.fillRect(x,      y + s,  s, s); // bottom
  } else if (p.type === "star") {
    // ✦ 4-pointed pixel star
    ctx.fillRect(x,       y,       s, s); // center
    ctx.fillRect(x - s*2, y,       s, s); // left arm
    ctx.fillRect(x + s*2, y,       s, s); // right arm
    ctx.fillRect(x,       y - s*2, s, s); // top arm
    ctx.fillRect(x,       y + s*2, s, s); // bottom arm
    ctx.fillRect(x - s,   y - s,   s, s); // inner diagonals
    ctx.fillRect(x + s,   y - s,   s, s);
    ctx.fillRect(x - s,   y + s,   s, s);
    ctx.fillRect(x + s,   y + s,   s, s);
  } else {
    ctx.fillRect(x, y, s, s);
  }

  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export default function CursorSparkle() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);
  const mouse = useRef({ x: -999, y: -999, active: false });
  const lastIdle = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // On move: burst of fast particles
    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY, active: true };
      for (let i = 0; i < 5; i++) {
        particles.current.push(makeParticle(e.clientX, e.clientY, true));
      }
    };

    const onMouseLeave = () => { mouse.current.active = false; };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Idle sparkle: trickle even when stationary
      const now = Date.now();
      if (mouse.current.active && now - lastIdle.current > 90) {
        const count = Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          particles.current.push(makeParticle(mouse.current.x, mouse.current.y, false));
        }
        lastIdle.current = now;
      }

      particles.current = particles.current.filter((p) => p.life > 0);

      for (const p of particles.current) {
        drawParticle(ctx, p);
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gentle gravity
        p.vx *= 0.98; // slight drag
        p.life -= p.decay;
        p.age++;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0, left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        imageRendering: "pixelated",
      }}
    />
  );
}
