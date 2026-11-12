"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import {
  WALL_HEIGHT,
  WALL_THICKNESS,
  furniture,
  rooms,
  segments,
  type Room,
  type Segment,
} from "./housePlan";

/**
 * Maison pilotée par le scroll :
 *   1. vue de dessus = plan 2D sur fond bleu
 *   2. les murs montent, la caméra bascule en vue isométrique
 *   3. la maquette tourne et la fiche projet apparaît
 */

const BLUEPRINT = new THREE.Color("#0b3d91");
const PAPER = new THREE.Color("#efeae0");
const SLAB_PLAN = new THREE.Color("#0f4aa8");
const SLAB_BUILT = new THREE.Color("#cfc8bb");

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

const SILL = 0.9;
const LINTEL = 2.1;

function Wall({ s }: { s: Segment }) {
  const length = s.to - s.from;
  const mid = (s.from + s.to) / 2;
  const position: [number, number] = s.axis === "x" ? [mid, s.at] : [s.at, mid];
  const size: [number, number] =
    s.axis === "x" ? [length, WALL_THICKNESS] : [WALL_THICKNESS, length];

  if (s.kind === "wall") {
    return (
      <mesh position={[position[0], WALL_HEIGHT / 2, position[1]]} castShadow receiveShadow>
        <boxGeometry args={[size[0], WALL_HEIGHT, size[1]]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    );
  }

  const glass: [number, number] =
    s.axis === "x" ? [length, 0.04] : [0.04, length];
  return (
    <group position={[position[0], 0, position[1]]}>
      <mesh position={[0, SILL / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[size[0], SILL, size[1]]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
      <mesh position={[0, (SILL + LINTEL) / 2, 0]}>
        <boxGeometry args={[glass[0], LINTEL - SILL, glass[1]]} />
        <meshStandardMaterial color="#8fd0ff" transparent opacity={0.45} roughness={0.1} />
      </mesh>
      <mesh position={[0, (LINTEL + WALL_HEIGHT) / 2, 0]} castShadow>
        <boxGeometry args={[size[0], WALL_HEIGHT - LINTEL, size[1]]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>
    </group>
  );
}

function makeLabel(room: Room) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.font = "600 64px ui-monospace, Menlo, monospace";
  ctx.fillText(room.name.toUpperCase(), 256, 115);
  ctx.font = "44px ui-monospace, Menlo, monospace";
  ctx.fillText(room.area, 256, 185);
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

function RoomLabel({ room }: { room: Room }) {
  const texture = useMemo(() => makeLabel(room), [room]);
  useEffect(() => () => texture.dispose(), [texture]);
  const w = Math.min(room.w * 0.8, 2.6);
  return (
    <mesh position={[room.x, 0.03, room.z]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, w / 2]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function Scene({
  progress,
  onBackground,
}: {
  progress: RefObject<number>;
  onBackground: (color: string) => void;
}) {
  const { camera, size } = useThree();
  const smooth = useRef(0);
  const walls = useRef<THREE.Group>(null);
  const furnitureGroup = useRef<THREE.Group>(null);
  const roomFloors = useRef<THREE.Group>(null);
  const labels = useRef<THREE.Group>(null);

  const slabMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: SLAB_PLAN, roughness: 1 }),
    [],
  );
  const bg = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    // Lissage du scroll pour un mouvement fluide
    smooth.current += (progress.current - smooth.current) * Math.min(1, delta * 6);
    const p = smooth.current;

    const build = smoothstep(0.12, 0.55, p); // plan -> volume
    const orbit = smoothstep(0.5, 1, p); // rotation finale
    const furnish = smoothstep(0.45, 0.7, p);

    if (walls.current) walls.current.scale.y = Math.max(0.004, build);
    if (furnitureGroup.current) {
      furnitureGroup.current.scale.y = Math.max(0.001, furnish);
      furnitureGroup.current.visible = furnish > 0.001;
    }
    if (roomFloors.current) {
      roomFloors.current.children.forEach((child) => {
        const material = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        material.opacity = build;
      });
    }

    slabMaterial.color.lerpColors(SLAB_PLAN, SLAB_BUILT, build);
    // Étiquettes : blanches sur le plan bleu, sombres sur la maquette
    labels.current?.children.forEach((child) => {
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setScalar(1 - 0.8 * build);
    });
    bg.lerpColors(BLUEPRINT, PAPER, build);
    onBackground(`#${bg.getHexString()}`);

    // Caméra : de la vue de dessus à la vue isométrique, puis orbite
    const polar = THREE.MathUtils.lerp(0.02, 0.72, build);
    const azimuth = THREE.MathUtils.lerp(0, Math.PI / 4, build) + orbit * (Math.PI / 2.5);
    const cam = camera as THREE.PerspectiveCamera;
    const halfFov = THREE.MathUtils.degToRad(cam.fov / 2);
    const aspect = size.width / size.height;
    // Sur grand écran, on décale la maquette vers la droite pour laisser
    // la place à la carte de texte
    const wide = size.width >= 640;
    if (wide) cam.setViewOffset(size.width, size.height, -size.width * 0.13, 0, size.width, size.height);
    else cam.clearViewOffset();
    const distance = Math.max(17 / (2 * Math.tan(halfFov)), (wide ? 24 : 15) / (2 * Math.tan(halfFov) * aspect));
    cam.position.setFromSphericalCoords(distance, polar, azimuth);
    cam.lookAt(0, 0.6 * build, 0);
  });

  const corners: [number, number][] = [
    [-6, -4],
    [6, -4],
    [-6, 4],
    [6, 4],
  ];

  return (
    <>
      <ambientLight intensity={1.3} />
      <directionalLight
        position={[8, 14, 6]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0005}
      />

      {/* Dalle */}
      <mesh position={[0, -0.1, 0]} receiveShadow material={slabMaterial}>
        <boxGeometry args={[12.6, 0.2, 8.6]} />
      </mesh>

      {/* Sols des pièces */}
      <group ref={roomFloors}>
        {rooms.map((room) => (
          <mesh
            key={room.name}
            position={[room.x, 0.01, room.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[room.w, room.d]} />
            <meshStandardMaterial color={room.color} transparent opacity={0} roughness={1} />
          </mesh>
        ))}
      </group>

      <group ref={labels}>
        {rooms.map((room) => (
          <RoomLabel key={room.name} room={room} />
        ))}
      </group>

      {/* Murs */}
      <group ref={walls}>
        {segments.map((s, k) => (
          <Wall key={k} s={s} />
        ))}
        {corners.map(([x, z]) => (
          <mesh key={`${x}${z}`} position={[x, WALL_HEIGHT / 2, z]} castShadow>
            <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, WALL_THICKNESS]} />
            <meshStandardMaterial color="#ffffff" roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Mobilier */}
      <group ref={furnitureGroup}>
        {furniture.map((f, k) => (
          <mesh key={k} position={[f.x, f.h / 2, f.z]} castShadow receiveShadow>
            <boxGeometry args={[f.w, f.h, f.d]} />
            <meshStandardMaterial color={f.color} roughness={0.8} />
          </mesh>
        ))}
      </group>
    </>
  );
}

const steps = [
  {
    tag: "01 — Le plan",
    title: "Tout commence par un plan",
    text: "Murs porteurs, cloisons, ouvertures : la maison telle qu'elle est dessinée, à l'échelle.",
  },
  {
    tag: "02 — L'élévation",
    title: "Les murs montent",
    text: "2,60 m sous plafond, refend central porteur, baies vitrées au sud pour la lumière.",
  },
  {
    tag: "03 — La fiche projet",
    title: "Villa de plain-pied",
    text: "",
  },
];

const facts = [
  ["Surface", "96 m²"],
  ["Pièces", "5"],
  ["Emprise", "12 × 8 m"],
  ["Structure", "Béton armé"],
];

export default function HouseScroll() {
  const section = useRef<HTMLElement>(null);
  const background = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [step, setStep] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = section.current;
    if (!el) return;

    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.current = p;
      setStep(p < 0.3 ? 0 : p < 0.62 ? 1 : 2);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // On ne calcule la 3D que lorsque la section est à l'écran
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={section} className="relative h-[400vh]">
      <div
        ref={background}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ backgroundColor: "#0b3d91" }}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          frameloop={inView ? "always" : "never"}
          camera={{ fov: 30, near: 0.1, far: 200, position: [0, 30, 0.5] }}
        >
          <Scene
            progress={progress}
            onBackground={(color) => {
              if (background.current) background.current.style.backgroundColor = color;
            }}
          />
        </Canvas>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:inset-x-auto sm:bottom-auto sm:left-10 sm:top-1/2 sm:w-80 sm:-translate-y-1/2 sm:p-0">
          <div className="relative h-44 sm:h-56">
            {steps.map((s, k) => (
              <div
                key={s.tag}
                className={`absolute inset-x-0 bottom-0 rounded-sm border border-zinc-900/10 bg-white/95 p-5 text-zinc-900 shadow-xl transition-all duration-500 sm:bottom-auto sm:top-0 ${
                  step === k ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0b3d91]">
                  {s.tag}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">{s.title}</h3>
                {s.text ? (
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600">{s.text}</p>
                ) : (
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
                    {facts.map(([label, value]) => (
                      <div key={label}>
                        <dt className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                          {label}
                        </dt>
                        <dd className="text-sm font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
