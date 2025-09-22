import { useState, useEffect } from "react";
import type { Recipe } from "../services/api";

interface CocktailSlideshowProps {
  cocktails: Recipe[];
}

export function CocktailSlideshow({ cocktails }: CocktailSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance slideshow every 4 seconds
  useEffect(() => {
    if (cocktails.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % cocktails.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [cocktails.length]);

  if (cocktails.length === 0) {
    return (
      <div className="flex h-[300px] sm:h-[400px] md:h-[500px] items-center justify-center rounded-2xl border border-gray-700 bg-gray-800">
        <div className="text-center">
          <div className="text-6xl mb-2">🍹</div>
          <p className="text-gray-400">No cocktails to display yet</p>
        </div>
      </div>
    );
  }

  const currentCocktail = cocktails[currentIndex];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gray-800">
      <div className="relative h-[300px] sm:h-[400px] md:h-[500px]">
        {currentCocktail.imageUrl ? (
          <img
            src={currentCocktail.imageUrl}
            alt={currentCocktail.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-700">
            <div className="text-center">
              <div className="text-6xl mb-2">🍹</div>
              <p className="text-gray-400">No image available</p>
            </div>
          </div>
        )}
      </div>

      {/* Dots Indicator */}
      {cocktails.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {cocktails.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-pink-600" : "bg-gray-600"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
