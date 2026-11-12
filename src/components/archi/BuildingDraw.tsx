"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * Façade d'immeuble qui se dessine au trait, comme un plan tracé à la main,
 * dès qu'elle entre dans l'écran.
 */
export default function BuildingDraw({ className = "" }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const i = (n: number) => ({ "--i": n }) as CSSProperties;

  const windows: { x: number; y: number }[] = [];
  for (let floor = 0; floor < 3; floor++) {
    for (let col = 0; col < 5; col++) {
      windows.push({ x: 82 + col * 52, y: 95 + floor * 50 });
    }
  }

  return (
    <svg
      ref={ref}
      viewBox="0 0 400 320"
      className={`${visible ? "is-visible" : ""} ${className}`}
      role="img"
      aria-label="Façade d'immeuble dessinée au trait"
      strokeWidth={1.5}
      strokeLinecap="round"
    >
      {/* Sol + hachures */}
      <path className="draw" pathLength={1} style={i(0)} d="M10 280 H390" />
      {Array.from({ length: 19 }, (_, k) => (
        <path
          key={k}
          className="draw"
          pathLength={1}
          style={i(1)}
          d={`M${20 + k * 20} 280 l-10 10`}
          strokeWidth={0.75}
        />
      ))}

      {/* Structure */}
      <path className="draw" pathLength={1} style={i(2)} d="M60 280 V80 H340 V280" />
      <path className="draw" pathLength={1} style={i(3)} d="M50 80 H350 M50 80 V70 H350 V80" />
      <path className="draw" pathLength={1} style={i(4)} d="M60 130 H340" strokeWidth={0.75} />
      <path className="draw" pathLength={1} style={i(5)} d="M60 180 H340" strokeWidth={0.75} />
      <path className="draw" pathLength={1} style={i(6)} d="M60 230 H340" strokeWidth={0.75} />

      {/* Fenêtres */}
      {windows.map((w, k) => (
        <g key={k}>
          <rect
            className="draw"
            pathLength={1}
            style={i(7 + k * 0.4)}
            x={w.x}
            y={w.y}
            width={30}
            height={22}
          />
          <rect
            className="draw-fill"
            style={i(12 + k * 0.4)}
            x={w.x + 1}
            y={w.y + 1}
            width={28}
            height={20}
            fill="currentColor"
            fillOpacity={0.15}
            stroke="none"
          />
        </g>
      ))}

      {/* Porte */}
      <path className="draw" pathLength={1} style={i(14)} d="M185 280 V240 H215 V280" />

      {/* Cote de hauteur */}
      <g strokeWidth={0.75}>
        <path className="draw" pathLength={1} style={i(16)} d="M30 70 V280" />
        <path className="draw" pathLength={1} style={i(17)} d="M24 70 H36 M24 280 H36" />
        <path className="draw" pathLength={1} style={i(17)} d="M26 76 L30 70 L34 76 M26 274 L30 280 L34 274" />
      </g>
      <text
        className="draw-fill"
        style={i(18)}
        x={22}
        y={175}
        fontSize={11}
        fill="currentColor"
        stroke="none"
        transform="rotate(-90 22 175)"
        textAnchor="middle"
        fontFamily="var(--font-geist-mono), monospace"
      >
        H = 21.00 m
      </text>

      {/* Cartouche */}
      <g className="draw-fill" style={i(19)} fontFamily="var(--font-geist-mono), monospace" fontSize={9} fill="currentColor">
        <rect x={290} y={292} width={100} height={22} fill="none" stroke="currentColor" strokeWidth={0.75} />
        <text x={296} y={306} stroke="none">
          FAÇADE NORD · 1/200
        </text>
      </g>
    </svg>
  );
}
