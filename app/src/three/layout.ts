// Pure layout math for the rooftop scene, kept separate so it can be tested.

export const MODULE = { w: 2.278, d: 1.134, t: 0.035 };
export const FLOOR_H = 3.1;
export const STRUCTURE_H = 1.7; // elevated GI structure: low edge clearance above the slab

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
