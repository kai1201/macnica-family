import { useEffect, useRef } from "react";

const COLORS = ["#ffffff", "#FBBF24", "#a78bfa", "#f9a8d4", "#7dd3fc", "#C4B5FD"];

export default function CursorSparkle() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e) => {
      for (let i = 0; i < 4; i++) {
        particles.current.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5 - 0.8,
          size: Math.random() < 0.25 ? 4 : 2,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          life: 1,
          decay: 0.035 + Math.random() * 0.04,
        });
      }
    };

    window.addEventListener("mousemove", onMouseMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.current = particles.current.filter((p) => p.life > 0);

      for (const p of particles.current) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        // snap to pixel grid for crisp squares
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravity
        p.life -= p.decay;
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 9999,
        imageRendering: "pixelated",
      }}
    />
  );
}
