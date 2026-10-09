// Tests for the design layer: the landing's day timeline, the hero camera
// path, the count-up figures and the CC0 asset budget.
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatCount, parseCount } from "../src/lib/count";
import { chapterAt, CHAPTERS, colorsAt, dialPoint, HOUR_KEYS, interp, smoothstep, STEPS } from "../src/lib/story";
import { CAM_KEYS, camAt, layoutArray, MODULE, roofFromArea } from "../src/three/layout";
import { MODEL_NAMES, TEXTURE_NAMES } from "../src/three/manifest";

const PUBLIC = join(__dirname, "..", "public");

/** WCAG relative luminance of an sRGB colour given as "rgb(r,g,b)" or "#rrggbb". */
function luminance(c: string): number {
  const [r, g, b] = c.startsWith("#") ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.slice(4, -1).split(",").map(Number);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

describe("landing day timeline", () => {
  it("runs from dawn (06:42) to night (21:00) without going backwards", () => {
    expect(interp(HOUR_KEYS, 0)).toBeCloseTo(6.7, 5);
    expect(interp(HOUR_KEYS, 1)).toBe(21);
    let prev = -Infinity;
    for (let i = 0; i <= 200; i++) {
      const h = interp(HOUR_KEYS, i / 200);
      expect(h).toBeGreaterThanOrEqual(prev);
      prev = h;
    }
  });

  it("clamps progress outside 0..1", () => {
    expect(interp(HOUR_KEYS, -0.5)).toBe(interp(HOUR_KEYS, 0));
    expect(interp(HOUR_KEYS, 1.5)).toBe(21);
  });

  it("keeps hero text at WCAG AA contrast (4.5:1) at every moment of the day", () => {
    let worst = Infinity;
    for (let i = 0; i <= 200; i++) {
      const c = colorsAt(i / 200);
      worst = Math.min(worst, contrast(c.bg, c.fg));
    }
    expect(worst).toBeGreaterThanOrEqual(4.5);
  });

  it("switches to light text after sunset", () => {
    expect(colorsAt(0.2).dark).toBe(false);
    expect(colorsAt(0.95).dark).toBe(true);
  });

  it("visits all seven chapters in order", () => {
    expect(CHAPTERS).toHaveLength(STEPS.length);
    const seen: number[] = [];
    for (let i = 0; i <= 400; i++) {
      const c = chapterAt(i / 400);
      if (seen[seen.length - 1] !== c) seen.push(c);
    }
    expect(seen).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it("smoothstep is 0 before, 1 after, monotonic between", () => {
    expect(smoothstep(0.44, 0.58, 0.3)).toBe(0);
    expect(smoothstep(0.44, 0.58, 0.7)).toBe(1);
    expect(smoothstep(0.44, 0.58, 0.51)).toBeGreaterThan(smoothstep(0.44, 0.58, 0.47));
  });

  it("puts the sun on the dial: left at sunrise, top at noon, below the line at night", () => {
    const rise = dialPoint(6, 6, 18);
    expect(rise.x).toBeCloseTo(14, 0);
    expect(rise.y).toBeCloseTo(106, 0);
    const noon = dialPoint(12, 6, 18);
    expect(noon.x).toBeCloseTo(110, 0);
    expect(noon.y).toBeCloseTo(10, 0);
    const night = dialPoint(20.5, 6, 18);
    expect(night.below).toBe(true);
    expect(night.y).toBeGreaterThan(106);
  });
});

describe("hero camera path", () => {
  it("starts and ends on its keyframes", () => {
    expect(camAt(0).slice(1)).toEqual(CAM_KEYS[0].slice(1));
    expect(camAt(1).slice(1)).toEqual(CAM_KEYS[CAM_KEYS.length - 1].slice(1));
  });

  it("never jumps: no more than 2° or 1 m between 1/500 steps of scroll", () => {
    for (let i = 1; i <= 500; i++) {
      const a = camAt((i - 1) / 500);
      const b = camAt(i / 500);
      expect(Math.abs(b[1] - a[1])).toBeLessThan(2);
      expect(Math.abs(b[2] - a[2])).toBeLessThan(2);
      expect(Math.abs(b[3] - a[3])).toBeLessThan(1);
    }
  });

  it("stays above the roofs and outside the house", () => {
    for (let i = 0; i <= 100; i++) {
      const [, , polar, radius] = camAt(i / 100);
      expect(polar).toBeLessThan(80);
      expect(radius).toBeGreaterThan(20);
    }
  });
});

describe("panel layout", () => {
  it("fits every requested panel inside the parapet", () => {
    const roof = roofFromArea(1100, 3);
    for (const n of [1, 4, 6, 10, 16]) {
      const l = layoutArray(n, roof, 25);
      expect(l.slots).toHaveLength(n);
      for (const s of l.slots) {
        expect(Math.abs(s.x) + MODULE.w / 2).toBeLessThanOrEqual(roof.w / 2);
        expect(Math.abs(s.z)).toBeLessThanOrEqual(roof.d / 2);
      }
    }
  });
});

describe("count-up figures", () => {
  // The landing's proof grid: the last frame of each count must be the
  // exact string that was authored, or the number visibly jumps at the end.
  const FIGURES = ["51 lakh", "5%", "₹78,000", "8.9%", "$53M", "0.727", "₹1,08,000"];

  it.each(FIGURES)("%s counts up to exactly itself", (f) => {
    const spec = parseCount(f)!;
    expect(spec).not.toBeNull();
    expect(formatCount(spec, spec.target)).toBe(f);
  });

  it("keeps Indian digit grouping and decimals mid-count", () => {
    const rupee = parseCount("₹1,08,000")!;
    expect(formatCount(rupee, 54321.4)).toBe("₹54,321");
    const pct = parseCount("8.9%")!;
    expect(formatCount(pct, 4.44)).toBe("4.4%");
  });

  it("refuses text without a number", () => {
    expect(parseCount("Night")).toBeNull();
  });
});

describe("CC0 3D assets", () => {
  const credits = JSON.parse(readFileSync(join(PUBLIC, "models", "credits.json"), "utf8")) as {
    models: { file: string; license: string; bytes: number; tris: number; source: string }[];
    textures: { license: string; source: string; files: { file: string; bytes: number }[] }[];
  };

  it("ships every model and texture the scene asks for", () => {
    for (const m of MODEL_NAMES) expect(existsSync(join(PUBLIC, "models", `${m}.glb`)), m).toBe(true);
    for (const t of TEXTURE_NAMES) expect(existsSync(join(PUBLIC, "textures", `${t}.webp`)), t).toBe(true);
  });

  it("credits every file as CC0 with a source link, and the sizes are honest", () => {
    for (const m of credits.models) {
      expect(m.license).toBe("CC0");
      expect(m.source).toMatch(/^https:\/\/polyhaven\.com\/a\//);
      expect(statSync(join(PUBLIC, m.file)).size).toBe(m.bytes);
    }
    for (const t of credits.textures) {
      expect(t.license).toBe("CC0");
      for (const f of t.files) expect(statSync(join(PUBLIC, f.file)).size).toBe(f.bytes);
    }
  });

  it("stays inside the web budget: < 1 MB total, < 200 KB and < 12k triangles per model", () => {
    const total = credits.models.reduce((n, m) => n + m.bytes, 0) + credits.textures.flatMap((t) => t.files).reduce((n, f) => n + f.bytes, 0);
    expect(total).toBeLessThan(1024 * 1024);
    for (const m of credits.models) {
      expect(m.bytes, m.file).toBeLessThan(200 * 1024);
      expect(m.tris, m.file).toBeLessThan(12000);
    }
  });
});
