import type { CSSProperties } from "react";

/**
 * Loader : un immeuble qui se construit étage par étage, puis recommence.
 * Idéal pour un écran de chargement ou un état "en cours".
 */
export default function FloorsLoader({ floors = 6 }: { floors?: number }) {
  return (
    <div
      className="flex flex-col-reverse items-center gap-[3px]"
      role="status"
      aria-label="Chargement"
    >
      <div className="h-[3px] w-40 bg-current" />
      {Array.from({ length: floors }, (_, k) => (
        <div
          key={k}
          className="floor flex h-6 w-28 items-center justify-around border border-current bg-current/10"
          style={{ "--i": k } as CSSProperties}
        >
          {Array.from({ length: 4 }, (_, w) => (
            <span key={w} className="h-3 w-3 bg-[var(--site-yellow)]/80" />
          ))}
        </div>
      ))}
    </div>
  );
}
