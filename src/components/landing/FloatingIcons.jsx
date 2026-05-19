import React from "react";
import { motion } from "framer-motion";
import PixelImage from "./PixelImage";

const PIXEL_IMAGES = [
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/d7e52c642_image.png", label: "ufo" },
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/eac30576e_image.png", label: "crystal-ball" },
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/2c0f3adfa_image.png", label: "moon" },
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/5f353a724_image.png", label: "shooting-stars" },
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/f6f73375d_image.png", label: "planet" },
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/1a23f6436_image.png", label: "coin" },
  { src: "https://media.base44.com/images/public/6a0a5cf029ac69425c28488f/a54474594_image.png", label: "cloud-star" },
];

// Icons pinned to the left and right gutters — well away from the centered content column
const ICONS = [
  // Left side
  { imgIdx: 0, width: 64, side: "left",  offset: 16, top: "6vh",  floatY: -10, floatDuration: 3.8, delay: 0,   rotate: -8  },
  { imgIdx: 4, width: 56, side: "left",  offset: 24, top: "30vh", floatY:  10, floatDuration: 4.5, delay: 0.4, rotate: -6  },
  { imgIdx: 6, width: 52, side: "left",  offset: 10, top: "58vh", floatY:  -8, floatDuration: 4.1, delay: 0.9, rotate:  8  },
  { imgIdx: 3, width: 58, side: "left",  offset: 20, top: "80vh", floatY:   8, floatDuration: 3.6, delay: 1.3, rotate: -5  },
  // Right side
  { imgIdx: 2, width: 60, side: "right", offset: 16, top: "10vh", floatY: -10, floatDuration: 4.2, delay: 0.5, rotate:  10 },
  { imgIdx: 1, width: 54, side: "right", offset: 20, top: "38vh", floatY:   9, floatDuration: 3.9, delay: 0.2, rotate:  -7 },
  { imgIdx: 5, width: 50, side: "right", offset: 12, top: "65vh", floatY:  -7, floatDuration: 4.3, delay: 1.0, rotate:   6 },
];

export default function FloatingIcons() {
  return (
    <div className="pointer-events-none" style={{ position: "fixed", inset: 0, zIndex: 6, overflow: "hidden" }}>
      {ICONS.map((icon, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            [icon.side]: icon.offset,
            top: icon.top,
            width: icon.width,
          }}
          animate={{ y: [0, icon.floatY, 0], rotate: [0, icon.rotate, 0] }}
          transition={{
            duration: icon.floatDuration,
            repeat: Infinity,
            delay: icon.delay,
            ease: "easeInOut",
          }}
        >
          <PixelImage src={PIXEL_IMAGES[icon.imgIdx].src} alt={PIXEL_IMAGES[icon.imgIdx].label} />
        </motion.div>
      ))}
    </div>
  );
}
