"use client";

import { useEffect, useRef } from "react";

/**
 * Mire de niveau fixée sur le bord droit : indique la progression du scroll
 * comme une cote d'altitude (NGF) qui monte au fil de la page.
 */
export default function ScrollLevel({ maxHeight = 45 }: { maxHeight?: number }) {
  const markerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      if (markerRef.current) {
        markerRef.current.style.top = `${progress * 100}%`;
      }
      if (labelRef.current) {
        labelRef.current.textContent = `+${(progress * maxHeight).toFixed(2)} m`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [maxHeight]);

  return (
    <div
      aria-hidden
      className="level-ruler pointer-events-none fixed top-[15vh] right-3 z-50 hidden h-[70vh] w-6 text-zinc-500 mix-blend-difference sm:block"
    >
      <div ref={markerRef} className="absolute right-0 flex -translate-y-1/2 items-center gap-1">
        <span
          ref={labelRef}
          className="whitespace-nowrap font-mono text-[10px] text-white"
        />
        {/* Symbole de niveau : triangle pointant vers le trait */}
        <svg width="12" height="10" viewBox="0 0 12 10" className="text-white">
          <path d="M0 0 H12 L6 10 Z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
