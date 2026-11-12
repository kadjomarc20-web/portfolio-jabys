/**
 * Plan de la maison affichée dans <HouseScroll />.
 *
 * ⚠️ Ce plan est un EXEMPLE (maison de plain-pied 12 m × 8 m).
 * Pour afficher un vrai projet, il suffit de remplacer les données
 * ci-dessous par les cotes du plan réel. Unités : mètres.
 * Repère : x vers l'est, z vers le sud (façade d'entrée), origine au centre.
 */

export const WALL_HEIGHT = 2.6;
export const WALL_THICKNESS = 0.2;

export type SegmentKind =
  | "wall" // mur plein
  | "window" // allège + fenêtre + linteau
  | "door" // porte d'entrée (vantail) + linteau
  | "opening"; // passage intérieur (linteau seulement)

export type Segment = {
  kind: SegmentKind;
  /** axe du mur : "x" = mur est-ouest, "z" = mur nord-sud */
  axis: "x" | "z";
  /** position du mur sur l'autre axe */
  at: number;
  from: number;
  to: number;
  /** hauteur d'allège (fenêtres), 0.9 m par défaut */
  sill?: number;
  /** hauteur sous linteau, 2.1 m par défaut */
  lintel?: number;
};

type Part = [kind: SegmentKind, from: number, to: number, sill?: number, lintel?: number];

const run = (axis: "x" | "z", at: number, parts: Part[]): Segment[] =>
  parts.map(([kind, from, to, sill, lintel]) => ({ kind, axis, at, from, to, sill, lintel }));

export const segments: Segment[] = [
  // Façade nord
  ...run("x", -4, [
    ["wall", -6, -4.8],
    ["window", -4.8, -3.2, 1.0],
    ["wall", -3.2, -1.2],
    ["window", -1.2, -0.4, 1.4],
    ["wall", -0.4, 2.2],
    ["window", 2.2, 4.2],
    ["wall", 4.2, 6],
  ]),
  // Façade sud : baie vitrée du séjour, porte d'entrée, fenêtre chambre 2
  ...run("x", 4, [
    ["wall", -6, -5.4],
    ["window", -5.4, -2, 0.02, 2.2],
    ["wall", -2, -1.2],
    ["door", -1.2, -0.2],
    ["wall", -0.2, 2.5],
    ["window", 2.5, 4.5],
    ["wall", 4.5, 6],
  ]),
  // Façade ouest
  ...run("z", -6, [
    ["wall", -4, 0.8],
    ["window", 0.8, 2.8],
    ["wall", 2.8, 4],
  ]),
  // Façade est
  ...run("z", 6, [
    ["wall", -4, 1.2],
    ["window", 1.2, 2.8],
    ["wall", 2.8, 4],
  ]),
  // Refend central porteur (portes des chambres)
  ...run("z", 0.5, [
    ["wall", -4, -1.3],
    ["opening", -1.3, -0.4],
    ["wall", -0.4, 1.2],
    ["opening", 1.2, 2.1],
    ["wall", 2.1, 4],
  ]),
  // Cloison entre les deux chambres
  ...run("x", 0, [["wall", 0.5, 6]]),
  // Salle de bain
  ...run("z", -1.8, [["wall", -4, -1.5]]),
  ...run("x", -1.5, [
    ["wall", -1.8, -0.9],
    ["opening", -0.9, 0],
    ["wall", 0, 0.5],
  ]),
  // Retour de cloison cuisine / séjour
  ...run("x", -0.5, [["wall", -6, -3.8]]),
];

export type Room = {
  name: string;
  area: string;
  /** centre de la pièce */
  x: number;
  z: number;
  /** dimensions au sol */
  w: number;
  d: number;
  floor: "wood" | "tile";
};

export const rooms: Room[] = [
  { name: "Séjour", area: "29 m²", x: -2.75, z: 1.75, w: 6.3, d: 4.3, floor: "wood" },
  { name: "Cuisine", area: "15 m²", x: -3.9, z: -2.25, w: 4, d: 3.3, floor: "tile" },
  { name: "SdB", area: "6 m²", x: -0.65, z: -2.75, w: 2.1, d: 2.3, floor: "tile" },
  { name: "Chambre 1", area: "22 m²", x: 3.25, z: -2, w: 5.3, d: 3.8, floor: "wood" },
  { name: "Chambre 2", area: "22 m²", x: 3.25, z: 2, w: 5.3, d: 3.8, floor: "wood" },
];

export type FurnitureKind =
  | "sofa"
  | "coffeeTable"
  | "dining"
  | "tvUnit"
  | "rug"
  | "kitchenRun"
  | "fridge"
  | "bathtub"
  | "toilet"
  | "vanity"
  | "bed"
  | "nightstand"
  | "wardrobe"
  | "plant";

export type Furniture = {
  kind: FurnitureKind;
  x: number;
  z: number;
  /** rotation en quarts de tour ; 0 = le "devant" du meuble regarde le sud */
  rot?: 0 | 1 | 2 | 3;
  /** largeur / profondeur (selon le meuble) */
  w?: number;
  d?: number;
  color?: string;
  /** cuisine : position de l'évier / des plaques le long du plan de travail */
  sink?: number;
  cooktop?: number;
};

export const furniture: Furniture[] = [
  // Séjour
  { kind: "rug", x: -4.9, z: 1.2, w: 2.5, d: 1.8, color: "#b9ad9a" },
  { kind: "tvUnit", x: -4.9, z: -0.22, w: 1.8 },
  { kind: "coffeeTable", x: -4.9, z: 1.1 },
  { kind: "sofa", x: -4.9, z: 2.25, rot: 2, w: 2.3, color: "#7b8794" },
  { kind: "dining", x: -1.7, z: 1.7 },
  { kind: "plant", x: -5.55, z: 3.55 },
  { kind: "plant", x: 0.05, z: 3.5 },
  // Cuisine
  { kind: "kitchenRun", x: -4.25, z: -3.55, w: 3.3, sink: 0.25 },
  { kind: "kitchenRun", x: -5.55, z: -2.35, rot: 1, w: 1.9, cooktop: 0 },
  { kind: "fridge", x: -2.25, z: -3.5 },
  // Salle de bain
  { kind: "bathtub", x: -0.6, z: -3.45 },
  { kind: "toilet", x: -1.4, z: -2.3, rot: 1 },
  { kind: "vanity", x: 0.15, z: -2.4, rot: 3 },
  // Chambre 1
  { kind: "rug", x: 4.4, z: -2, w: 2.4, d: 2.6, color: "#d7cfc2" },
  { kind: "bed", x: 4.85, z: -2, rot: 3, color: "#7e93a3" },
  { kind: "nightstand", x: 5.6, z: -3.15, rot: 3 },
  { kind: "nightstand", x: 5.6, z: -0.85, rot: 3 },
  { kind: "wardrobe", x: 2.4, z: -0.42, rot: 2, w: 1.8 },
  { kind: "plant", x: 1.0, z: -3.5 },
  // Chambre 2
  { kind: "rug", x: 3.4, z: 1.6, w: 2.6, d: 2.2, color: "#cfc4b2" },
  { kind: "bed", x: 3.4, z: 1.15, color: "#b88f6a" },
  { kind: "nightstand", x: 2.35, z: 0.35 },
  { kind: "nightstand", x: 4.45, z: 0.35 },
  { kind: "wardrobe", x: 1.5, z: 3.58, rot: 2, w: 1.6 },
  { kind: "plant", x: 5.6, z: 3.55 },
];
