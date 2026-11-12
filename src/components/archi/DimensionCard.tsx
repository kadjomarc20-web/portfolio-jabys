import type { ReactNode } from "react";

/**
 * Carte (ex. : un projet) entourée de lignes de cote qui se déploient
 * au survol, comme sur un plan.
 */
export default function DimensionCard({
  width = "12.50 m",
  height = "8.00 m",
  children,
  className = "",
}: {
  width?: string;
  height?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`dim-card relative ${className}`} tabIndex={0}>
      <span className="dim-h" aria-hidden>
        <span className="dim-label">{width}</span>
      </span>
      <span className="dim-v" aria-hidden>
        <span className="dim-label">{height}</span>
      </span>
      {children}
    </div>
  );
}
