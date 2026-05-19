import React, { useRef, useEffect, useState } from "react";

/**
 * Loads an image onto a canvas and removes near-white pixels,
 * producing a transparent-background version at runtime.
 */
export default function PixelImage({ src, alt, width, style, className }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Remove pixels that are near-white (all channels > 210)
        const brightness = Math.min(r, g, b);
        if (brightness > 210) {
          // Fade out based on how white the pixel is
          const alpha = Math.round(((255 - brightness) / 45) * 255);
          data[i + 3] = Math.min(data[i + 3], alpha);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setReady(true);
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      className={className}
      style={{
        width: width || "100%",
        height: "auto",
        display: ready ? "block" : "none",
        imageRendering: "pixelated",
        ...style,
      }}
    />
  );
}