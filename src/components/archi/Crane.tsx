/**
 * Grue à tour animée : le chariot avance sur la flèche, descend sa charge
 * (une poutre IPN) puis remonte. 100 % CSS, aucun JavaScript.
 */
export default function Crane({ className = "" }: { className?: string }) {
  // Treillis de la flèche
  const jibLattice = Array.from({ length: 12 }, (_, k) => {
    const x = 80 + k * 18;
    return `M${x} 40 L${x + 9} 55 L${x + 18} 40`;
  }).join(" ");

  // Treillis du mât
  const mastLattice = Array.from({ length: 11 }, (_, k) => {
    const y = 60 + k * 18;
    return `M70 ${y} L86 ${y + 9} L70 ${y + 18}`;
  }).join(" ");

  return (
    <svg
      viewBox="0 0 320 280"
      className={className}
      role="img"
      aria-label="Grue de chantier en mouvement"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    >
      {/* Sol */}
      <path d="M0 260 H320" />
      {/* Bâtiment en construction */}
      <path d="M220 260 V200 H300 V260 M220 230 H300 M247 200 V260 M273 200 V260" strokeWidth={1} strokeDasharray="4 3" />

      {/* Mât */}
      <path d="M70 60 V260 M86 60 V260" />
      <path d={mastLattice} strokeWidth={0.75} />
      <path d="M58 260 H98" strokeWidth={3} />

      {/* Cabine + pointe */}
      <rect x={66} y={55} width={24} height={14} fill="var(--site-yellow)" />
      <path d="M78 55 L78 15" />
      <path d="M78 15 L300 40 M78 15 L20 40" strokeWidth={0.75} />

      {/* Flèche + contre-flèche */}
      <path d="M20 40 H300 M80 55 H300" />
      <path d={jibLattice} strokeWidth={0.75} />
      <rect x={22} y={42} width={22} height={16} fill="currentColor" fillOpacity={0.35} />

      {/* Chariot + câble + charge */}
      <g className="crane-trolley">
        <rect x={112} y={52} width={14} height={7} fill="var(--site-yellow)" />
        <rect className="crane-cable" x={118.5} y={59} width={1} height={1} fill="currentColor" stroke="none" />
        <g className="crane-load">
          <g className="crane-swing">
            <path d="M119 59 V64 M112 70 L119 64 L126 70" strokeWidth={1} />
            <rect x={96} y={70} width={46} height={8} fill="var(--site-yellow)" strokeWidth={1} />
            <path d="M96 74 H142" strokeWidth={0.5} />
          </g>
        </g>
      </g>
    </svg>
  );
}
