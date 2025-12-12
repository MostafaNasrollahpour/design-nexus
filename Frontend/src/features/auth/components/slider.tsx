import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/slider.css";
import { resolveSlide, type ResolveSlideResponse } from "../API/authAPI";

export type Slide = {
  src: string;
  alt?: string;
  buttonText: string;
  actionKey: string;
};

type SliderProps = {
  slides: Slide[];
  interval?: number;
  autoPlay?: boolean;
  showDots?: boolean;

  onSlideAction?: (slide: Slide, index: number) => Promise<void>;
  resolveFn?: (key: string) => Promise<ResolveSlideResponse>;
};

export default function Slider({
  slides,
  interval = 3000,
  autoPlay = true,
  showDots = true,
  onSlideAction,
  resolveFn,
}: SliderProps) {
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const count = slides.length;
  const canNavigate = count > 1;

  useEffect(() => {
    if (count === 0) return;
    setCurrentIndex((i) => Math.min(i, count - 1));
  }, [count]);

  const goToNext = () => setCurrentIndex((i) => (i + 1) % count);
  const goToPrev = () => setCurrentIndex((i) => (i === 0 ? count - 1 : i - 1));

  useEffect(() => {
    if (!autoPlay || !canNavigate) return;
    const timer = window.setTimeout(goToNext, interval);
    return () => window.clearTimeout(timer);
  }, [currentIndex, autoPlay, interval, canNavigate]);

  const handleAction = async (slide: Slide, index: number) => {
    if (loadingIndex !== null) return;

    try {
      setLoadingIndex(index);

      // حالت سفارشی
      if (onSlideAction) {
        await onSlideAction(slide, index);
        return;
      }

      // حالت پیش‌فرض: API + navigate
      const resolver = resolveFn ?? resolveSlide;
      const { route, pageData } = await resolver(slide.actionKey);

      navigate(route, { state: { pageData } });
    } catch (err) {
      console.error(err);
      alert("خطا در دریافت اطلاعات. دوباره تلاش کنید.");
    } finally {
      setLoadingIndex(null);
    }
  };

  if (count === 0) return null;

  return (
    <div className="slider-shell">
      <div className="custom-slider">
        <div
          className="custom-slider-inner"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div className="custom-slide" key={slide.actionKey}>
              <img src={slide.src} alt={slide.alt ?? `slide-${index}`} />

              <button
                className="slide-cta"
                type="button"
                onClick={() => handleAction(slide, index)}
                disabled={loadingIndex !== null}
                aria-busy={loadingIndex === index}
              >
                {loadingIndex === index ? "در حال پردازش..." : slide.buttonText}
              </button>
            </div>
          ))}
        </div>

        {canNavigate && (
          <>
            <button
              className="slider-arrow slider-arrow-right"
              onClick={goToNext}
              type="button"
              aria-label="Next slide"
            >
              ❯
            </button>

            <button
              className="slider-arrow slider-arrow-left"
              onClick={goToPrev}
              type="button"
              aria-label="Previous slide"
            >
              ❮
            </button>
          </>
        )}

        {showDots && canNavigate && (
          <div className="slider-dots">
            {slides.map((_, index) => (
              <button
                key={index}
                className={"slider-dot" + (index === currentIndex ? " active" : "")}
                onClick={() => setCurrentIndex(index)}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
