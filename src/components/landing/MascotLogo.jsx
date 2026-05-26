import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "@/assets/logo-6.png";

const PIXEL_FONT = "'DotGothic16', monospace";

export default function MascotLogo() {
  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <motion.img
        src={logoSrc}
        alt="logo"
        style={{ width: "100%", maxHeight: "120px", display: "block", objectFit: "cover" }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.p style={{
        fontFamily: PIXEL_FONT, fontSize: "1rem",
        color: "#ffffff", letterSpacing: "0.05em",
        textShadow: "0 0 8px #c4b5fd, 0 0 18px #7C3AED, 2px 2px 0 #000",
      }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, times: [0, 0.45, 0.5, 0.95] }}
      >
        ★ そうぞうがアートになる ★
      </motion.p>
    </motion.div>
  );
}
