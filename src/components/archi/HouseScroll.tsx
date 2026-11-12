"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FurnitureSet, Floors, Garden, Ground, Roof, Walls } from "./HouseModel";
import { getMaterials } from "./houseMaterials";
import { WALL_HEIGHT, rooms, type Room } from "./housePlan";

/**
 * Maison pilotée par le scroll :
 *   1. vue de dessus = plan 2D sur fond bleu
 *   2. les murs montent, la caméra bascule en vue isométrique
 *   3. meubles et jardin apparaissent, la caméra tourne autour
 *   4. la toiture se pose : la maison est terminée, fiche projet
 */

const BLUEPRINT = new THREE.Color("#0b3d91");
const PAPER = new THREE.Color("#efeae0");
const SLAB_PLAN = new THREE.Color("#0a3784");
const SLAB_BUILT = new THREE.Color("#bdb6aa");

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Étapes du scroll (0 → 1) */
const PHASE = {
  build: [0.1, 0.38], // les murs montent, la caméra bascule
  furnish: [0.34, 0.56], // meubles + jardin
  orbit: [0.45, 0.95], // la caméra tourne autour de la maison
  roof: [0.74, 0.9], // la toiture se pose
} as const;

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

/** Éclairage d'ambiance réaliste (reflets doux sur le verre, le métal…) */
function useEnvironment() {
  const gl = useThree((state) => state.gl);
  const texture = useMemo(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();
    return env;
  }, [gl]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function Scene({
  progress,
  onBackground,
}: {
  progress: RefObject<number>;
  onBackground: (color: string) => void;
}) {
  const { camera, size } = useThree();
  const environment = useEnvironment();
  const smooth = useRef(0);
  const walls = useRef<THREE.Group>(null);
  const furnitureGroup = useRef<THREE.Group>(null);
  const garden = useRef<THREE.Group>(null);
  const roof = useRef<THREE.Group>(null);
  const labels = useRef<THREE.Group>(null);
  const bg = useMemo(() => new THREE.Color(), []);

  useFrame((_, delta) => {
    const M = getMaterials();
    // Lissage du scroll pour un mouvement fluide
    smooth.current += (progress.current - smooth.current) * Math.min(1, delta * 6);
    const p = smooth.current;

    const build = smoothstep(...PHASE.build, p);
    const furnish = smoothstep(...PHASE.furnish, p);
    const orbit = smoothstep(...PHASE.orbit, p);
    const roofDrop = smoothstep(...PHASE.roof, p);

    if (walls.current) walls.current.scale.y = Math.max(0.004, build);
    if (furnitureGroup.current) {
      furnitureGroup.current.scale.y = Math.max(0.001, furnish);
      furnitureGroup.current.visible = furnish > 0.001;
    }
    if (garden.current) {
      garden.current.scale.setScalar(Math.max(0.001, furnish));
      garden.current.visible = furnish > 0.001;
    }
    if (roof.current) {
      roof.current.visible = roofDrop > 0.001;
      roof.current.position.y = WALL_HEIGHT + (1 - roofDrop) * 9;
    }

    // Sols et terrain apparaissent en fondu
    M.floorWood.opacity = build;
    M.floorTile.opacity = build;
    M.lawn.opacity = build;
    M.soil.opacity = build;
    M.slab.color.lerpColors(SLAB_PLAN, SLAB_BUILT, build);
    const labelOpacity = 1 - smoothstep(0.25, 0.4, p);
    labels.current?.children.forEach((child) => {
      ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = labelOpacity;
    });

    bg.lerpColors(BLUEPRINT, PAPER, build);
    onBackground(`#${bg.getHexString()}`);

    // Caméra : vue de dessus → vue isométrique → tour de la maison
    // jusqu'à la façade sud (entrée, terrasse), un peu plus basse et plus proche
    const polar = THREE.MathUtils.lerp(0.02, 0.8, build) + roofDrop * 0.3;
    const azimuth =
      THREE.MathUtils.lerp(0, Math.PI / 4, build) - orbit * (Math.PI / 4 + Math.PI / 5);
    const cam = camera as THREE.PerspectiveCamera;
    const halfFov = THREE.MathUtils.degToRad(cam.fov / 2);
    const aspect = size.width / size.height;
    // Sur grand écran, on décale la maquette vers la droite pour laisser
    // la place à la carte de texte
    const wide = size.width >= 640;
    if (wide) cam.setViewOffset(size.width, size.height, -size.width * 0.13, 0, size.width, size.height);
    else cam.clearViewOffset();
    const framing = THREE.MathUtils.lerp(1, 1.3, build);
    const distance =
      framing *
      Math.max(17 / (2 * Math.tan(halfFov)), (wide ? 24 : 15) / (2 * Math.tan(halfFov) * aspect));
    cam.position.setFromSphericalCoords(distance, polar, azimuth);
    cam.lookAt(0, 0.8 * build, 0.5 * build);
  });

  return (
    <>
      <primitive attach="environment" object={environment} />
      <hemisphereLight args={["#fff6e8", "#7c8a6a", 0.9]} />
      <directionalLight
        position={[9, 14, 10]}
        intensity={2.6}
        color="#fff1dc"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />

      <Ground />
      <Floors />
      <group ref={labels}>
        {rooms.map((room) => (
          <RoomLabel key={room.name} room={room} />
        ))}
      </group>
      <Walls ref={walls} />
      <FurnitureSet ref={furnitureGroup} />
      <Garden ref={garden} />
      <Roof ref={roof} />
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
    tag: "03 — L'aménagement",
    title: "Des pièces à vivre",
    text: "Séjour traversant ouvert sur la terrasse, cuisine en L, deux chambres de 22 m² au calme.",
  },
  {
    tag: "04 — L'ouvrage fini",
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
      setStep(p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.74 ? 2 : 3);
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
    <section ref={section} className="relative h-[500vh]">
      <div
        ref={background}
        className="sticky top-0 h-screen overflow-hidden"
        style={{ backgroundColor: "#0b3d91" }}
      >
        <Canvas
          shadows="percentage"
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
