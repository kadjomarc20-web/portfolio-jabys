"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/**
 * Zone où le curseur devient un réticule de logiciel de DAO (type AutoCAD),
 * avec les coordonnées X / Y affichées en temps réel.
 */
export default function CadCursor({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const coordsRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const area = areaRef.current;
    if (!area || e.pointerType !== "mouse") return;
    const rect = area.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    area.style.setProperty("--x", `${x}px`);
    area.style.setProperty("--y", `${y}px`);
    if (overlayRef.current) overlayRef.current.style.opacity = "1";
    if (coordsRef.current) {
      // 1 px = 2 cm, origine en bas à gauche comme sur un plan
      const X = (x * 0.02).toFixed(2);
      const Y = ((rect.height - y) * 0.02).toFixed(2);
      coordsRef.current.textContent = `X ${X}  Y ${Y}`;
    }
  };

  const onLeave = () => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
  };

  return (
    <div
      ref={areaRef}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`relative overflow-hidden cad-area ${className}`}
    >
      {children}
      <div
        ref={overlayRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity"
      >
        <div className="cad-line-h" />
        <div className="cad-line-v" />
        <div className="cad-box" />
        <span
          ref={coordsRef}
          className="cad-coords whitespace-pre font-mono text-xs"
        />
      </div>
    </div>
  );
}
