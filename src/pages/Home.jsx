import React from "react";
import StarryBackground from "../components/landing/StarryBackground";
import FloatingClouds from "../components/landing/FloatingClouds";
import MascotLogo from "../components/landing/MascotLogo";
import PromptInput from "../components/landing/PromptInput";
import PreviewArea from "../components/landing/PreviewArea";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background layers */}
      <StarryBackground />
      <FloatingClouds />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        <div className="flex-1 flex flex-col items-center justify-center gap-8 md:gap-10 w-full max-w-4xl">

          {/* Logo */}
          <MascotLogo />

          {/* Preview Area */}
          <PreviewArea />

          {/* Prompt Input */}
          <div className="w-full mt-auto pb-6 md:pb-10">
            <PromptInput />
          </div>
        </div>
      </div>
    </div>
  );
}
