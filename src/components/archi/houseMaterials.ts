import * as THREE from "three";

/**
 * Matériaux et textures de la maquette, générés en code (aucune image à
 * télécharger) : parquet, carrelage, gazon, terrasse bois, dallage.
 * Créés une seule fois, côté navigateur uniquement.
 */

// Générateur pseudo-aléatoire déterministe : la texture est identique à chaque visite
function random(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvasTexture(draw: (ctx: CanvasRenderingContext2D, size: number) => void, size = 512) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  draw(canvas.getContext("2d")!, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

function planks(base: [number, number, number], rows: number, gap: string, seed: number) {
  return canvasTexture((ctx, size) => {
    const rnd = random(seed);
    const h = size / rows;
    for (let r = 0; r < rows; r++) {
      let x = -rnd() * size * 0.5;
      while (x < size) {
        const len = size * (0.35 + rnd() * 0.5);
        const v = (rnd() - 0.5) * 22;
        ctx.fillStyle = `rgb(${base[0] + v},${base[1] + v * 0.8},${base[2] + v * 0.6})`;
        ctx.fillRect(x, r * h, len, h);
        // veinage
        ctx.strokeStyle = "rgba(60,35,15,0.10)";
        ctx.lineWidth = 1;
        for (let g = 0; g < 5; g++) {
          const y = r * h + rnd() * h;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.bezierCurveTo(x + len * 0.3, y + rnd() * 4 - 2, x + len * 0.6, y + rnd() * 4 - 2, x + len, y);
          ctx.stroke();
        }
        ctx.fillStyle = gap;
        ctx.fillRect(x, r * h, 2, h);
        x += len;
      }
      ctx.fillStyle = gap;
      ctx.fillRect(0, r * h, size, 2);
    }
  });
}

function tiles(count: number, color: string, grout: string, seed: number) {
  return canvasTexture((ctx, size) => {
    const rnd = random(seed);
    const s = size / count;
    ctx.fillStyle = grout;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.92 + rnd() * 0.08;
        ctx.fillRect(i * s + 2, j * s + 2, s - 4, s - 4);
      }
    }
    ctx.globalAlpha = 1;
  });
}

function grass() {
  return canvasTexture((ctx, size) => {
    const rnd = random(7);
    ctx.fillStyle = "#6e8b4a";
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 9000; i++) {
      const g = 110 + rnd() * 60;
      ctx.strokeStyle = `rgba(${g * 0.55},${g},${g * 0.38},0.55)`;
      const x = rnd() * size;
      const y = rnd() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + rnd() * 3 - 1.5, y - 3 - rnd() * 4);
      ctx.stroke();
    }
  });
}

function withRepeat(texture: THREE.Texture, x: number, y: number) {
  const t = texture.clone();
  t.repeat.set(x, y);
  t.needsUpdate = true;
  return t;
}

/**
 * Taille réelle (en mètres) représentée par une répétition de chaque texture.
 * Les UV des sols sont mis à l'échelle en conséquence (voir scaledPlane).
 */
export const TEXTURE_UNIT = { wood: 2, tile: 1.2, lawn: 3 };

export type HouseMaterials = ReturnType<typeof createMaterials>;

function createMaterials() {
  const wood = planks([196, 160, 118], 8, "rgba(80,55,30,0.35)", 3);
  const deck = planks([150, 112, 80], 10, "rgba(40,25,15,0.7)", 11);
  const tile = tiles(4, "#ecebe7", "#c9c6bf", 5);
  const paver = tiles(2, "#cdc7bb", "#a39d92", 9);
  const lawn = grass();

  const std = (params: THREE.MeshStandardMaterialParameters) =>
    new THREE.MeshStandardMaterial({ roughness: 0.85, ...params });

  return {
    // Repères de la dalle : bleu sur le plan, béton une fois construite
    slab: std({ color: "#0f4aa8", roughness: 1 }),
    floorWood: std({ map: wood, transparent: true, opacity: 0, roughness: 0.6 }),
    floorTile: std({ map: tile, transparent: true, opacity: 0, roughness: 0.35 }),
    lawn: std({ map: lawn, transparent: true, opacity: 0, roughness: 1 }),
    deck: std({ map: withRepeat(deck, 2, 1), roughness: 0.75 }),
    paver: std({ map: withRepeat(paver, 1, 1), roughness: 0.9 }),
    soil: std({ color: "#6b5644", roughness: 1, transparent: true, opacity: 0 }),

    plaster: std({ color: "#f5f2ec", roughness: 0.95 }),
    frame: std({ color: "#3a3d41", roughness: 0.4, metalness: 0.6 }),
    glass: new THREE.MeshStandardMaterial({
      color: "#a9c6d4",
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.35,
      envMapIntensity: 1.5,
    }),
    stone: std({ color: "#d8d2c6", roughness: 0.8 }),
    doorWood: std({ color: "#5b3f2b", roughness: 0.6 }),

    roof: std({ color: "#ebe7df", roughness: 0.9 }),
    gravel: std({ color: "#8f8b84", roughness: 1 }),
    fascia: std({ color: "#3f4246", roughness: 0.5, metalness: 0.4 }),

    woodLight: std({ color: "#c49a6c", roughness: 0.6 }),
    woodDark: std({ color: "#6b4a33", roughness: 0.6 }),
    white: std({ color: "#f7f7f5", roughness: 0.4 }),
    ceramic: std({ color: "#ffffff", roughness: 0.15 }),
    black: std({ color: "#1d1e20", roughness: 0.3 }),
    steel: std({ color: "#b8bcc0", roughness: 0.3, metalness: 0.8 }),
    worktop: std({ color: "#2f3033", roughness: 0.3 }),
    linen: std({ color: "#f3f0ea", roughness: 0.95 }),
    pot: std({ color: "#b5694a", roughness: 0.9 }),
    leaf: std({ color: "#4f7a3a", roughness: 0.8, flatShading: true }),
    leafDark: std({ color: "#3e6331", roughness: 0.8, flatShading: true }),
    trunk: std({ color: "#5d4636", roughness: 1 }),
    water: std({ color: "#cfe3ea", roughness: 0.05 }),
  };
}

let cache: HouseMaterials | null = null;
export function getMaterials() {
  if (!cache) cache = createMaterials();
  return cache;
}

// Matériaux de couleur unie (tissus, tapis…), mis en cache par couleur
const colorCache = new Map<string, THREE.MeshStandardMaterial>();
export function colorMaterial(color: string, roughness = 0.9) {
  const key = `${color}-${roughness}`;
  let m = colorCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness });
    colorCache.set(key, m);
  }
  return m;
}
