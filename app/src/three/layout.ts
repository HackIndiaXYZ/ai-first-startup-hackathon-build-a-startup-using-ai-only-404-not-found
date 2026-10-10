// Pure layout math for the rooftop scene, kept separate so it can be tested.

export const MODULE = { w: 2.278, d: 1.134, t: 0.035 };
export const FLOOR_H = 3.1;
export const STRUCTURE_H = 1.7; // elevated GI structure: low edge clearance above the slab
/** Most panels the scene will draw; instance buffers are sized from it. */
export const MAX_PANELS = 40;
/** Every row has at most 3 post pairs and 2 rails, and there are at most MAX_PANELS rows. */
export const MAX_POSTS = MAX_PANELS * 6;
export const MAX_RAILS = MAX_PANELS * 2;

export interface RoofDims {
  w: number;
  d: number;
  floors: number;
}

/** Roof footprint (m) from a usable-area estimate in sq ft. */
export function roofFromArea(sqft: number, floors = 2): RoofDims {
  const m2 = Math.max(40, Math.min(400, sqft / 10.764 / 0.82));
  const w = Math.sqrt(m2 * 1.25);
  return { w: Math.max(7, Math.min(22, w)), d: Math.max(6.5, Math.min(18, m2 / w)), floors };
}

export interface PanelSlot {
  x: number;
  y: number;
  z: number;
  row: number;
}

export interface ArrayLayout {
  slots: PanelSlot[];
  tilt: number;
  rows: number;
  cols: number;
  rowZ: number[];
  rowSpanX: [number, number][];
  topY: number;
  lowY: number;
  rowDepth: number;
}

export function layoutArray(n: number, roof: RoofDims, tiltDeg: number): ArrayLayout {
  const H = roof.floors * FLOOR_H;
  const tilt = (tiltDeg * Math.PI) / 180;
  const x0 = -roof.w / 2 + 1.6;
  const x1 = roof.w / 2 - 0.5;
  const z0 = -roof.d / 2 + 3.4;
  const z1 = roof.d / 2 - 0.5;
  const pitchX = MODULE.w + 0.04;
  const cols = Math.max(1, Math.floor((x1 - x0 + 0.04) / pitchX));
  const rows = Math.max(1, Math.ceil(n / cols));
  const rowDepth = MODULE.d * Math.cos(tilt);
  const avail = Math.max(0.1, z1 - z0 - rowDepth);
  const pitchZ = rows > 1 ? Math.min(rowDepth + 1.1, Math.max(rowDepth * 0.55, avail / (rows - 1))) : 0;
  const totalZ = (rows - 1) * pitchZ;
  const zStart = (z0 + z1) / 2 - totalZ / 2;
  const cx = (x0 + x1) / 2;
  const lowY = H + STRUCTURE_H;
  const centerY = lowY + (MODULE.d / 2) * Math.sin(tilt);
  const slots: PanelSlot[] = [];
  const rowZ: number[] = [];
  const rowSpanX: [number, number][] = [];
  let left = n;
  for (let r = 0; r < rows; r++) {
    const inRow = Math.min(cols, left);
    left -= inRow;
    const z = zStart + r * pitchZ;
    rowZ.push(z);
    rowSpanX.push([cx - (inRow * pitchX) / 2, cx + (inRow * pitchX) / 2]);
    for (let k = 0; k < inRow; k++) {
      slots.push({ x: cx + (k - (inRow - 1) / 2) * pitchX, y: centerY, z, row: r });
    }
  }
  return { slots, tilt, rows, cols, rowZ, rowSpanX, topY: lowY + MODULE.d * Math.sin(tilt), lowY, rowDepth };
}

/** Deterministic PRNG so the neighbourhood looks the same on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Camera keyframes along the story: [t, azimuth°, polar°, radius, target lift]
// Azimuth 0 = south of the house, 90 = east. Dawn looks east into the sunrise,
// noon looks down on the panels, dusk looks west into the sunset.
export const CAM_KEYS: [number, number, number, number, number][] = [
  [0, -62, 74, 44, 4.2],
  [0.16, -40, 66, 37, 2.6],
  [0.32, -14, 58, 32, 1.4],
  [0.5, 26, 47, 25, 0.5],
  [0.66, 50, 52, 25, 0.6],
  [0.84, 96, 66, 33, 2.4],
  [1, 116, 72, 44, 3.6],
];

export function camAt(t: number) {
  let i = 1;
  while (i < CAM_KEYS.length - 1 && t > CAM_KEYS[i][0]) i++;
  const a = CAM_KEYS[i - 1];
  const b = CAM_KEYS[i];
  const k = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
  const e = k * k * (3 - 2 * k);
  return a.map((v, j) => (j === 0 ? 0 : v + (b[j] - v) * e)) as typeof a;
}
