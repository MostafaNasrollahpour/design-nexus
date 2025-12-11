// src/components/slider.tsx
import { useEffect, useState } from "react";
import "./slider.css";

type SliderProps = {
  images?: string[];
  interval?: number;
  autoPlay?: boolean;
  showDots?: boolean;
};

export default function Slider({
  images = [],
  interval = 3000,
  autoPlay = true,
  showDots = true,
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setTimeout(goToNext, interval);

    return () => clearTimeout(timer);
  }, [currentIndex, autoPlay, interval, images.length]);

  return (
    <div className="custom-slider">
      <div
        className="custom-slider-inner"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <div className="custom-slide" key={index}>
            <img src={src} alt={`slide-${index}`} />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            className="slider-arrow slider-arrow-right"
            onClick={goToNext}
          >
            ❯
          </button>
          <button
            className="slider-arrow slider-arrow-left"
            onClick={goToPrev}
          >
            ❮
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="slider-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={
                "slider-dot" +
                (index === currentIndex ? " active" : "")
              }
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
