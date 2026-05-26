import React, { useState } from "react";
import StarryBackground from "../components/landing/StarryBackground";
import FloatingClouds from "../components/landing/FloatingClouds";
import MascotLogo from "../components/landing/MascotLogo";
import PromptInput from "../components/landing/PromptInput";
import PreviewArea from "../components/landing/PreviewArea";
import { generateImage } from "../lib/imageGeneration";

export default function Home() {
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setError(null);
    try {
      const imageUrl = await generateImage(prompt);
      setGeneratedImage(imageUrl);
    } catch (err) {
      setError(err.message || "まほうがつかえませんでした");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen overflow-hidden flex flex-col">
      <StarryBackground />
      <FloatingClouds />

      <div className="relative z-10 flex-shrink-0 w-full">
        <MascotLogo />
      </div>

      <div className="relative z-10 flex flex-col flex-1 min-h-0 gap-3 w-full max-w-4xl mx-auto px-4 pb-4 pt-3">
        <div className="flex-1 min-h-0">
          <PreviewArea
            generatedImage={generatedImage}
            isLoading={isLoading}
            error={error}
          />
        </div>
        <div className="flex-shrink-0">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
