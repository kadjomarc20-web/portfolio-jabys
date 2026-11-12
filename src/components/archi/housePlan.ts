/**
 * Plan de la maison affichée dans <HouseScroll />.
 *
 * ⚠️ Ce plan est un EXEMPLE (maison de plain-pied 12 m × 8 m).
 * Pour afficher un vrai projet, il suffit de remplacer les données
 * ci-dessous par les cotes du plan réel. Unités : mètres.
 * Repère : x vers l'est, z vers le sud, origine au centre de la maison.
 */

export const WALL_HEIGHT = 2.6;
export const WALL_THICKNESS = 0.2;

export type Segment = {
  /** "wall" = mur plein, "window" = allège + vitrage + linteau */
  kind: "wall" | "window";
  /** axe du mur : "x" = mur est-ouest, "z" = mur nord-sud */
  axis: "x" | "z";
  /** position du mur sur l'autre axe */
  at: number;
  from: number;
  to: number;
};

const run = (
  axis: "x" | "z",
  at: number,
  parts: [kind: "wall" | "window" | "gap", from: number, to: number][],
): Segment[] =>
  parts
    .filter(([kind]) => kind !== "gap")
    .map(([kind, from, to]) => ({ kind: kind as "wall" | "window", axis, at, from, to }));

export const segments: Segment[] = [
  // Façade nord
  ...run("x", -4, [
    ["wall", -6, -4.8],
    ["window", -4.8, -3.2],
    ["wall", -3.2, -1.2],
    ["window", -1.2, -0.4],
    ["wall", -0.4, 2.2],
    ["window", 2.2, 4.2],
    ["wall", 4.2, 6],
  ]),
  // Façade sud (porte d'entrée = "gap")
  ...run("x", 4, [
    ["wall", -6, -4.5],
    ["window", -4.5, -2],
    ["wall", -2, -1.2],
    ["gap", -1.2, -0.2],
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
  // Refend central (portes des chambres = "gap")
  ...run("z", 0.5, [
    ["wall", -4, -1.3],
    ["gap", -1.3, -0.4],
    ["wall", -0.4, 1.2],
    ["gap", 1.2, 2.1],
    ["wall", 2.1, 4],
  ]),
  // Cloison entre les deux chambres
  ...run("x", 0, [["wall", 0.5, 6]]),
  // Salle de bain
  ...run("z", -1.8, [["wall", -4, -1.5]]),
  ...run("x", -1.5, [
    ["wall", -1.8, -0.9],
    ["gap", -0.9, 0],
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
  color: string;
};

export const rooms: Room[] = [
  { name: "Séjour", area: "29 m²", x: -2.75, z: 1.75, w: 6.3, d: 4.3, color: "#e8dcc8" },
  { name: "Cuisine", area: "15 m²", x: -3.9, z: -2.25, w: 4, d: 3.3, color: "#d9d4cc" },
  { name: "SdB", area: "6 m²", x: -0.65, z: -2.75, w: 2.1, d: 2.3, color: "#c9d8de" },
  { name: "Chambre 1", area: "22 m²", x: 3.25, z: -2, w: 5.3, d: 3.8, color: "#decfb8" },
  { name: "Chambre 2", area: "22 m²", x: 3.25, z: 2, w: 5.3, d: 3.8, color: "#decfb8" },
];

export type Furniture = {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  color: string;
};

export const furniture: Furniture[] = [
  // Séjour : canapé, table basse, table à manger
  { x: -4.2, z: 3.2, w: 2.2, d: 0.9, h: 0.7, color: "#7d8a99" },
  { x: -4.2, z: 2, w: 1, d: 0.6, h: 0.35, color: "#a67c52" },
  { x: -1.4, z: 1.3, w: 1.6, d: 0.9, h: 0.75, color: "#a67c52" },
  // Cuisine : plans de travail en L
  { x: -5.55, z: -2.3, w: 0.6, d: 2.8, h: 0.9, color: "#f2f2f2" },
  { x: -3.9, z: -3.55, w: 2.7, d: 0.6, h: 0.9, color: "#f2f2f2" },
  // Salle de bain : baignoire
  { x: -1.3, z: -3, w: 0.7, d: 1.7, h: 0.55, color: "#ffffff" },
  // Chambres : lits
  { x: 4.6, z: -2.2, w: 2, d: 1.6, h: 0.5, color: "#c4a484" },
  { x: 4.6, z: 2.6, w: 2, d: 1.6, h: 0.5, color: "#c4a484" },
];
