"use client";

import { forwardRef, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import { TEXTURE_UNIT, colorMaterial, getMaterials } from "./houseMaterials";
import {
  WALL_HEIGHT,
  WALL_THICKNESS,
  furniture,
  rooms,
  segments,
  type Furniture,
  type Segment,
} from "./housePlan";

/* ------------------------------------------------------------------ */
/* Briques de base                                                     */
/* ------------------------------------------------------------------ */

type V3 = [number, number, number];

function Box({
  p,
  s,
  m,
  shadow = true,
}: {
  p: V3;
  s: V3;
  m: THREE.Material;
  shadow?: boolean;
}) {
  return (
    <mesh position={p} material={m} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

function Cylinder({ p, r, h, m }: { p: V3; r: number; h: number; m: THREE.Material }) {
  return (
    <mesh position={p} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[r, r * 0.85, h, 20]} />
    </mesh>
  );
}

function Blob({ p, r, m }: { p: V3; r: number; m: THREE.Material }) {
  return (
    <mesh position={p} material={m} castShadow receiveShadow>
      <icosahedronGeometry args={[r, 1]} />
    </mesh>
  );
}

/** Plan horizontal dont les UV suivent les dimensions réelles (texture à l'échelle) */
function ScaledPlane({
  w,
  d,
  unit,
  p,
  m,
}: {
  w: number;
  d: number;
  unit: number;
  p: V3;
  m: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(w, d);
    const uv = g.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / unit, (uv.getY(i) * d) / unit);
    return g;
  }, [w, d, unit]);
  return (
    <mesh position={p} rotation-x={-Math.PI / 2} geometry={geometry} material={m} receiveShadow />
  );
}

/* ------------------------------------------------------------------ */
/* Murs, fenêtres, portes                                              */
/* ------------------------------------------------------------------ */

function SegmentMesh({ s }: { s: Segment }) {
  const M = getMaterials();
  const L = s.to - s.from;
  const mid = (s.from + s.to) / 2;
  const H = WALL_HEIGHT;
  const T = WALL_THICKNESS;
  const position: V3 = s.axis === "x" ? [mid, 0, s.at] : [s.at, 0, mid];
  const rotation = s.axis === "x" ? 0 : Math.PI / 2;

  let content: ReactNode;
  if (s.kind === "wall") {
    content = <Box p={[0, H / 2, 0]} s={[L, H, T]} m={M.plaster} />;
  } else {
    const lintel = s.lintel ?? 2.1;
    const sill = s.kind === "window" ? (s.sill ?? 0.9) : 0;
    const fw = 0.06; // largeur des profilés
    const above = <Box p={[0, (lintel + H) / 2, 0]} s={[L, H - lintel, T]} m={M.plaster} />;

    if (s.kind === "opening") {
      content = above;
    } else if (s.kind === "door") {
      content = (
        <>
          {above}
          <Box p={[-L / 2 + fw / 2, lintel / 2, 0]} s={[fw, lintel, 0.12]} m={M.frame} />
          <Box p={[L / 2 - fw / 2, lintel / 2, 0]} s={[fw, lintel, 0.12]} m={M.frame} />
          <Box p={[0, lintel - fw / 2, 0]} s={[L, fw, 0.12]} m={M.frame} />
          <Box p={[0, (lintel - fw) / 2, 0]} s={[L - 2 * fw, lintel - fw, 0.06]} m={M.doorWood} />
          <Box p={[0, (lintel - fw) / 2, 0]} s={[0.12, lintel - 0.5, 0.065]} m={M.glass} shadow={false} />
          <Box p={[L / 2 - 0.2, 1.0, 0]} s={[0.03, 0.4, 0.12]} m={M.steel} />
          <Box p={[0, 0.01, 0.15]} s={[L + 0.2, 0.02, 0.3]} m={M.stone} />
        </>
      );
    } else {
      const panes = Math.max(1, Math.round(L / 1.1));
      content = (
        <>
          {above}
          {sill > 0.05 ? (
            <>
              <Box p={[0, sill / 2, 0]} s={[L, sill, T]} m={M.plaster} />
              <Box p={[0, sill + 0.02, 0]} s={[L + 0.1, 0.04, T + 0.1]} m={M.stone} />
            </>
          ) : (
            <Box p={[0, 0.01, 0]} s={[L, 0.02, T + 0.1]} m={M.stone} />
          )}
          {/* dormants */}
          <Box p={[0, lintel - fw / 2, 0]} s={[L, fw, 0.1]} m={M.frame} />
          <Box p={[0, sill + fw / 2, 0]} s={[L, fw, 0.1]} m={M.frame} />
          {Array.from({ length: panes + 1 }, (_, k) => (
            <Box
              key={k}
              p={[-L / 2 + fw / 2 + (k * (L - fw)) / panes, (sill + lintel) / 2, 0]}
              s={[fw, lintel - sill, 0.1]}
              m={M.frame}
            />
          ))}
          {/* vitrage */}
          <Box
            p={[0, (sill + lintel) / 2, 0]}
            s={[L - fw, lintel - sill - fw, 0.02]}
            m={M.glass}
            shadow={false}
          />
        </>
      );
    }
  }

  return (
    <group position={position} rotation-y={rotation}>
      {content}
    </group>
  );
}

export const Walls = forwardRef<THREE.Group>(function Walls(_, ref) {
  const M = getMaterials();
  const corners: [number, number][] = [
    [-6, -4],
    [6, -4],
    [-6, 4],
    [6, 4],
  ];
  return (
    <group ref={ref}>
      {segments.map((s, k) => (
        <SegmentMesh key={k} s={s} />
      ))}
      {corners.map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, WALL_HEIGHT / 2, z]} s={[T_, WALL_HEIGHT, T_]} m={M.plaster} />
      ))}
    </group>
  );
});
const T_ = WALL_THICKNESS;

/* ------------------------------------------------------------------ */
/* Sols                                                                */
/* ------------------------------------------------------------------ */

export function Floors() {
  const M = getMaterials();
  return (
    <>
      <mesh position={[0, -0.1, 0]} material={M.slab} receiveShadow>
        <boxGeometry args={[12.4, 0.2, 8.4]} />
      </mesh>
      <ScaledPlane w={11.9} d={7.9} unit={TEXTURE_UNIT.wood} p={[0, 0.004, 0]} m={M.floorWood} />
      {rooms
        .filter((r) => r.floor === "tile")
        .map((r) => (
          <ScaledPlane
            key={r.name}
            w={r.w}
            d={r.d}
            unit={TEXTURE_UNIT.tile}
            p={[r.x, 0.008, r.z]}
            m={M.floorTile}
          />
        ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Mobilier                                                            */
/* ------------------------------------------------------------------ */

function Piece({ f }: { f: Furniture }) {
  const M = getMaterials();
  const w = f.w ?? 1;
  const d = f.d ?? 1;
  let content: ReactNode = null;

  switch (f.kind) {
    case "sofa": {
      const fabric = colorMaterial(f.color ?? "#7b8794");
      const D = 0.95;
      content = (
        <>
          <Box p={[0, 0.21, 0.05]} s={[w - 0.3, 0.42, D - 0.1]} m={fabric} />
          <Box p={[0, 0.48, -D / 2 + 0.1]} s={[w, 0.96, 0.2]} m={fabric} />
          <Box p={[-w / 2 + 0.1, 0.3, 0]} s={[0.2, 0.6, D]} m={fabric} />
          <Box p={[w / 2 - 0.1, 0.3, 0]} s={[0.2, 0.6, D]} m={fabric} />
          <Box p={[-(w - 0.3) / 4, 0.47, 0.08]} s={[(w - 0.36) / 2, 0.12, D - 0.3]} m={fabric} />
          <Box p={[(w - 0.3) / 4, 0.47, 0.08]} s={[(w - 0.36) / 2, 0.12, D - 0.3]} m={fabric} />
          <Box p={[-w / 2 + 0.45, 0.7, -D / 2 + 0.3]} s={[0.42, 0.36, 0.12]} m={colorMaterial("#d8c6a5")} />
          <Box p={[w / 2 - 0.45, 0.7, -D / 2 + 0.3]} s={[0.42, 0.36, 0.12]} m={colorMaterial("#c9a27c")} />
        </>
      );
      break;
    }
    case "coffeeTable":
      content = (
        <>
          <Box p={[0, 0.38, 0]} s={[1.0, 0.04, 0.6]} m={M.woodLight} />
          {[-1, 1].flatMap((i) =>
            [-1, 1].map((j) => (
              <Box key={`${i}${j}`} p={[i * 0.45, 0.18, j * 0.25]} s={[0.04, 0.36, 0.04]} m={M.black} />
            )),
          )}
          <Cylinder p={[0.2, 0.48, 0]} r={0.06} h={0.16} m={M.ceramic} />
        </>
      );
      break;
    case "dining":
      content = (
        <>
          <Box p={[0, 0.74, 0]} s={[1.6, 0.05, 0.9]} m={M.woodLight} />
          {[-1, 1].flatMap((i) =>
            [-1, 1].map((j) => (
              <Box key={`l${i}${j}`} p={[i * 0.72, 0.36, j * 0.36]} s={[0.06, 0.72, 0.06]} m={M.woodDark} />
            )),
          )}
          {[-0.4, 0.4].flatMap((x) =>
            [-1, 1].map((side) => (
              <group key={`c${x}${side}`} position={[x, 0, side * 0.68]}>
                <Box p={[0, 0.45, 0]} s={[0.42, 0.05, 0.42]} m={M.woodDark} />
                <Box p={[0, 0.72, side * 0.19]} s={[0.42, 0.5, 0.04]} m={M.woodDark} />
                {[-1, 1].flatMap((i) =>
                  [-1, 1].map((j) => (
                    <Box key={`${i}${j}`} p={[i * 0.18, 0.22, j * 0.18]} s={[0.03, 0.44, 0.03]} m={M.woodDark} />
                  )),
                )}
              </group>
            )),
          )}
          <Cylinder p={[0, 0.85, 0]} r={0.08} h={0.18} m={M.white} />
          <Blob p={[0, 0.98, 0]} r={0.12} m={M.leaf} />
        </>
      );
      break;
    case "tvUnit":
      content = (
        <>
          <Box p={[0, 0.22, 0]} s={[w, 0.44, 0.4]} m={M.woodDark} />
          <Box p={[0, 0.95, -0.08]} s={[1.3, 0.75, 0.04]} m={M.black} />
        </>
      );
      break;
    case "rug":
      content = <Box p={[0, 0.012, 0]} s={[w, 0.012, d]} m={colorMaterial(f.color ?? "#bbb")} shadow={false} />;
      break;
    case "kitchenRun":
      content = (
        <>
          <Box p={[0, 0.43, 0.02]} s={[w, 0.86, 0.58]} m={M.white} />
          <Box p={[0, 0.88, 0.02]} s={[w, 0.04, 0.62]} m={M.worktop} />
          {f.sink !== undefined && (
            <>
              <Box p={[f.sink, 0.901, 0.04]} s={[0.6, 0.004, 0.4]} m={M.steel} shadow={false} />
              <Box p={[f.sink, 1.0, -0.2]} s={[0.03, 0.22, 0.03]} m={M.steel} />
            </>
          )}
          {f.cooktop !== undefined && (
            <Box p={[f.cooktop, 0.901, 0.04]} s={[0.6, 0.004, 0.5]} m={M.black} shadow={false} />
          )}
        </>
      );
      break;
    case "fridge":
      content = <Box p={[0, 0.95, 0]} s={[0.65, 1.9, 0.65]} m={M.steel} />;
      break;
    case "bathtub":
      content = (
        <>
          <Box p={[0, 0.28, 0]} s={[1.7, 0.56, 0.75]} m={M.ceramic} />
          <Box p={[0, 0.562, 0]} s={[1.5, 0.006, 0.55]} m={M.water} shadow={false} />
        </>
      );
      break;
    case "toilet":
      content = (
        <>
          <Box p={[0, 0.2, 0.05]} s={[0.38, 0.4, 0.5]} m={M.ceramic} />
          <Box p={[0, 0.5, -0.2]} s={[0.4, 0.4, 0.16]} m={M.ceramic} />
        </>
      );
      break;
    case "vanity":
      content = (
        <>
          <Box p={[0, 0.4, 0]} s={[0.9, 0.8, 0.48]} m={M.woodLight} />
          <Box p={[0, 0.82, 0]} s={[0.92, 0.04, 0.5]} m={M.ceramic} />
          <Box p={[0, 1.5, -0.22]} s={[0.8, 0.7, 0.02]} m={M.steel} />
        </>
      );
      break;
    case "bed": {
      const bw = 1.6;
      content = (
        <>
          <Box p={[0, 0.17, 0]} s={[bw + 0.1, 0.28, 2.1]} m={M.woodLight} />
          <Box p={[0, 0.4, 0.02]} s={[bw, 0.2, 2.0]} m={M.linen} />
          <Box p={[0, 0.52, 0.3]} s={[bw + 0.04, 0.06, 1.35]} m={colorMaterial(f.color ?? "#7e93a3")} />
          <Box p={[0, 0.6, -1.03]} s={[bw + 0.2, 1.1, 0.08]} m={M.woodDark} />
          <Box p={[-bw / 4, 0.56, -0.75]} s={[bw / 2 - 0.1, 0.12, 0.4]} m={M.linen} />
          <Box p={[bw / 4, 0.56, -0.75]} s={[bw / 2 - 0.1, 0.12, 0.4]} m={M.linen} />
        </>
      );
      break;
    }
    case "nightstand":
      content = (
        <>
          <Box p={[0, 0.25, 0]} s={[0.45, 0.5, 0.4]} m={M.woodDark} />
          <Cylinder p={[0, 0.58, 0]} r={0.03} h={0.16} m={M.black} />
          <Cylinder p={[0, 0.72, 0]} r={0.12} h={0.16} m={M.linen} />
        </>
      );
      break;
    case "wardrobe":
      content = (
        <>
          <Box p={[0, 1.1, 0]} s={[w, 2.2, 0.6]} m={M.white} />
          <Box p={[0, 1.1, 0.301]} s={[0.01, 2.1, 0.005]} m={M.black} shadow={false} />
          <Box p={[-0.06, 1.1, 0.31]} s={[0.02, 0.3, 0.02]} m={M.steel} />
          <Box p={[0.06, 1.1, 0.31]} s={[0.02, 0.3, 0.02]} m={M.steel} />
        </>
      );
      break;
    case "plant":
      content = (
        <>
          <Cylinder p={[0, 0.2, 0]} r={0.18} h={0.4} m={M.pot} />
          <Blob p={[0, 0.72, 0]} r={0.34} m={M.leaf} />
          <Blob p={[0.08, 1.0, 0.05]} r={0.22} m={M.leafDark} />
        </>
      );
      break;
  }

  return (
    <group position={[f.x, 0, f.z]} rotation-y={((f.rot ?? 0) * Math.PI) / 2}>
      {content}
    </group>
  );
}

export const FurnitureSet = forwardRef<THREE.Group>(function FurnitureSet(_, ref) {
  return (
    <group ref={ref}>
      {furniture.map((f, k) => (
        <Piece key={k} f={f} />
      ))}
    </group>
  );
});

/* ------------------------------------------------------------------ */
/* Jardin (terrain, terrasse, allée, arbres, haie)                     */
/* ------------------------------------------------------------------ */

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  const M = getMaterials();
  return (
    <group position={[x, 0, z]} scale={scale}>
      <Cylinder p={[0, 1, 0]} r={0.14} h={2} m={M.trunk} />
      <Blob p={[0, 2.6, 0]} r={1.25} m={M.leaf} />
      <Blob p={[0.5, 3.3, 0.2]} r={0.85} m={M.leafDark} />
      <Blob p={[-0.4, 3.1, -0.3]} r={0.75} m={M.leaf} />
    </group>
  );
}

/** Terrain : apparaît en fondu (le sol) */
export function Ground() {
  const M = getMaterials();
  return (
    <>
      <mesh position={[0, -0.32, 1]} material={M.soil}>
        <boxGeometry args={[22, 0.6, 16]} />
      </mesh>
      <ScaledPlane w={22} d={16} unit={TEXTURE_UNIT.lawn} p={[0, -0.015, 1]} m={M.lawn} />
    </>
  );
}

/** Aménagements extérieurs : poussent avec l'animation */
export const Garden = forwardRef<THREE.Group>(function Garden(_, ref) {
  const M = getMaterials();
  return (
    <group ref={ref}>
      {/* Terrasse bois devant la baie */}
      <Box p={[-3.7, 0.02, 5.2]} s={[4.4, 0.08, 2.2]} m={M.deck} />
      {/* Allée en dalles vers l'entrée */}
      {[4.75, 5.55, 6.35, 7.15, 7.95, 8.75].map((z) => (
        <Box key={z} p={[-0.7, 0.005, z]} s={[1.0, 0.04, 0.6]} m={M.paver} />
      ))}
      {/* Haie au nord */}
      <Box p={[0, 0.5, -6.55]} s={[21, 1, 0.7]} m={M.leafDark} />
      {/* Arbustes */}
      {[1.1, 2.1, 5.2].map((x) => (
        <Blob key={x} p={[x, 0.32, 4.65]} r={0.38} m={M.leaf} />
      ))}
      <Tree x={-8.6} z={-4.2} scale={1.1} />
      <Tree x={8.4} z={-4.6} />
      <Tree x={8.6} z={6.4} scale={1.2} />
      <Tree x={-8.8} z={7.0} scale={0.9} />
    </group>
  );
});

/* ------------------------------------------------------------------ */
/* Toiture-terrasse                                                    */
/* ------------------------------------------------------------------ */

export const Roof = forwardRef<THREE.Group>(function Roof(_, ref) {
  const M = getMaterials();
  return (
    <group ref={ref} visible={false}>
      <Box p={[0, 0.15, 0]} s={[12.8, 0.3, 8.8]} m={M.roof} />
      <Box p={[0, 0.305, 0]} s={[12.4, 0.01, 8.4]} m={M.gravel} shadow={false} />
      {/* acrotères */}
      <Box p={[0, 0.42, -4.3]} s={[12.8, 0.25, 0.2]} m={M.roof} />
      <Box p={[0, 0.42, 4.3]} s={[12.8, 0.25, 0.2]} m={M.roof} />
      <Box p={[-6.3, 0.42, 0]} s={[0.2, 0.25, 8.4]} m={M.roof} />
      <Box p={[6.3, 0.42, 0]} s={[0.2, 0.25, 8.4]} m={M.roof} />
      {/* puits de lumière */}
      <Box p={[-0.6, 0.38, -2.6]} s={[1.0, 0.14, 0.8]} m={M.glass} />
      <Box p={[3.4, 0.38, -2]} s={[1.2, 0.14, 0.9]} m={M.glass} />
    </group>
  );
});
