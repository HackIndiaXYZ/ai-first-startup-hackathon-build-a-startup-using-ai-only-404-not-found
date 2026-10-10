// The landing story's timeline: one scroll progress value (0..1) mapped to a
// clock time, a background colour and a chapter. Pure, so it is unit tested.

export const HOUR_KEYS: [number, number][] = [
  [0, 6.7],
  [0.14, 8.6],
  [0.3, 11.1],
  [0.46, 12.7],
  [0.62, 15.3],
  [0.78, 17.85],
  [0.9, 19.5],
  [1, 21],
];

// Background through the day. Text colour flips by luminance so it never
// passes through a low-contrast midpoint.
export const COLOR_KEYS: [number, string][] = [
  [0, "#f6e3da"],
  [0.14, "#f4ece6"],
  [0.32, "#eef3f7"],
  [0.5, "#f4f4ee"],
  [0.66, "#f8e7cc"],
  [0.8, "#f4c79a"],
  [0.86, "#f0b585"],
  [0.89, "#2a2747"],
  [1, "#111833"],
];

/** Scroll progress at which each chapter starts. */
export const STEPS = [0, 0.14, 0.3, 0.46, 0.62, 0.78, 0.9];
export const CHAPTERS = ["Dawn", "Morning", "Late morning", "Noon", "Afternoon", "Dusk", "Night"];

export function interp(keys: [number, number][], p: number): number {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (p <= keys[i][0]) {
      const [p0, v0] = keys[i - 1];
      const [p1, v1] = keys[i];
      return v0 + ((v1 - v0) * (p - p0)) / (p1 - p0);
    }
  }
  return keys[keys.length - 1][1];
}

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

function mix(a: string, b: string, t: number): [number, number, number] {
  const A = hex(a);
  const B = hex(b);
  return A.map((v, i) => Math.round(v + (B[i] - v) * t)) as [number, number, number];
}

const INK = "#161c36";
const LIMEWASH = "#f1eee7";

/** WCAG relative luminance of an sRGB triple. */
export function luminance([r, g, b]: [number, number, number]): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const isDark = (h: string) => contrastRatio(hex(h) as [number, number, number], hex(LIMEWASH) as [number, number, number]) > contrastRatio(hex(h) as [number, number, number], hex(INK) as [number, number, number]);

/**
 * Background and text colour at progress p. Within the day or within the
 * night the background blends; across sunset it switches at the midpoint
 * instead, because every colour halfway between turmeric and indigo fails
 * 4.5:1 with both ink and limewash text. CSS eases the switch.
 */
export function colorsAt(p: number): { bg: string; fg: string; dark: boolean } {
  const q = Math.max(0, Math.min(1, p));
  let rgb = hex(COLOR_KEYS[COLOR_KEYS.length - 1][1]) as [number, number, number];
  for (let i = 1; i < COLOR_KEYS.length; i++) {
    if (q <= COLOR_KEYS[i][0]) {
      const [p0, b0] = COLOR_KEYS[i - 1];
      const [p1, b1] = COLOR_KEYS[i];
      const t = (q - p0) / (p1 - p0);
      rgb = isDark(b0) === isDark(b1) ? mix(b0, b1, t) : (hex(t < 0.5 ? b0 : b1) as [number, number, number]);
      break;
    }
  }
  const ink = hex(INK) as [number, number, number];
  const lime = hex(LIMEWASH) as [number, number, number];
  const dark = contrastRatio(rgb, lime) > contrastRatio(rgb, ink);
  return { bg: `rgb(${rgb.join(",")})`, fg: dark ? LIMEWASH : INK, dark };
}

export function smoothstep(a: number, b: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** Index of the chapter on screen at progress p (switches a hair early). */
export function chapterAt(p: number): number {
  let i = 0;
  while (i < STEPS.length - 1 && p >= STEPS[i + 1] - 0.015) i++;
  return i;
}

/** Where the sun sits on the landing's day arc, in the dial's 220×120 box. */
export function dialPoint(hour: number, sunrise: number, sunset: number): { x: number; y: number; below: boolean } {
  const f = (hour - sunrise) / (sunset - sunrise);
  const a = Math.PI - Math.max(-0.12, Math.min(1.12, f)) * Math.PI;
  const below = f < 0 || f > 1;
  const x = 110 + Math.cos(a) * 96;
  const y = below ? 106 + Math.abs(Math.sin(a)) * 30 : 106 - Math.sin(a) * 96;
  return { x, y, below };
}
