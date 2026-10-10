// Downloads the CC0 models and textures the rooftop scene uses and packs them
// for the web: one meshopt-compressed .glb per model with small WebP
// textures, and 512 px WebP texture sets for walls, roof slabs and lanes.
//
// Every asset is CC0 from Poly Haven (https://polyhaven.com/license), so
// nothing here needs attribution, but public/models/credits.json lists the
// source page of each one anyway.
//
// Usage: node scripts/fetch-assets.mjs   (writes public/models, public/textures)

import { mkdirSync, rmSync, writeFileSync, existsSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, simplify, textureCompress, meshopt, resample, flatten, join as joinMeshes } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CACHE = join(ROOT, "node_modules", ".cache", "polyhaven");
const OUT_MODELS = join(ROOT, "public", "models");
const OUT_TEX = join(ROOT, "public", "textures");
const API = "https://api.polyhaven.com";

/** Models: id, simplify ratio (1 = keep), texture edge in px. */
const MODELS = [
  { id: "exterior_aircon_unit", as: "aircon", ratio: 0.5, tex: 256, role: "Split AC outdoor units on neighbouring roofs" },
  { id: "Barrel_02", as: "drum", ratio: 1, tex: 256, role: "Blue plastic water drum by the stair room" },
  { id: "planter_pot_clay", as: "planter", ratio: 1, tex: 256, role: "Terracotta planter (tulsi pot)" },
  { id: "potted_plant_02", as: "plant", ratio: 0.04, tex: 256, role: "Potted plant on the parapet" },
  { id: "SchoolChair_01", as: "chair", ratio: 1, tex: 256, role: "Folding chair on the roof" },
  { id: "brass_diya_lantern", as: "lantern", ratio: 0.6, tex: 256, role: "Brass lantern that lights up at dusk" },
];

/** Texture sets: id, maps to keep (Poly Haven names), output edge in px. */
const TEXTURES = [
  { id: "white_plaster_rough_01", as: "plaster", maps: ["nor_gl", "rough"], size: 512, role: "Plaster relief on every facade" },
  { id: "concrete_floor_02", as: "slab", maps: ["diff", "nor_gl"], size: 512, role: "Roof slabs", tone: { brightness: 1.9, saturation: 0.35, contrast: 0.55 } },
  { id: "aerial_asphalt_01", as: "lane", maps: ["diff"], size: 512, role: "Lanes between houses", tone: { brightness: 1.25, saturation: 0.6, contrast: 0.8 } },
];

async function getJSON(url) {
  const r = await fetch(url, { headers: { "user-agent": "chhat-asset-fetch" } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
}

async function download(url, file) {
  if (existsSync(file) && statSync(file).size > 0) return;
  mkdirSync(dirname(file), { recursive: true });
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      writeFileSync(file, Buffer.from(await r.arrayBuffer()));
      return;
    } catch (e) {
      if (attempt === 4) throw e;
      await new Promise((res) => setTimeout(res, 2 ** attempt * 1000));
    }
  }
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

async function packModel(m, io) {
  const files = await getJSON(`${API}/files/${m.id}`);
  const g = files.gltf["1k"].gltf;
  const dir = join(CACHE, m.id);
  const gltfPath = join(dir, `${m.id}.gltf`);
  await download(g.url, gltfPath);
  for (const [rel, info] of Object.entries(g.include)) await download(info.url, join(dir, rel));

  const doc = await io.read(gltfPath);
  // Poly Haven ships some models with variant materials (e.g. a rusted AC).
  // Keep only what the default scene uses.
  doc.getRoot().listExtensionsUsed().forEach((ext) => {
    if (ext.extensionName === "KHR_materials_variants") ext.dispose();
  });
  await doc.transform(
    flatten(),
    joinMeshes(),
    dedup(),
    weld(),
    ...(m.ratio < 1 ? [simplify({ simplifier: MeshoptSimplifier, ratio: m.ratio, error: m.ratio < 0.1 ? 0.02 : 0.002 })] : []),
    resample(),
    prune(),
    textureCompress({ encoder: sharp, targetFormat: "webp", resize: [m.tex, m.tex], quality: 78 }),
    meshopt({ encoder: MeshoptEncoder, level: "medium" }),
  );
  const out = join(OUT_MODELS, `${m.as}.glb`);
  await io.write(out, doc);
  const size = statSync(out).size;
  const tris = doc
    .getRoot()
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives())
    .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3, 0);
  console.log(`model  ${m.as.padEnd(8)} ${kb(size).padStart(7)}  ${Math.round(tris)} tris  <- ${m.id}`);
  return { file: `models/${m.as}.glb`, source: `https://polyhaven.com/a/${m.id}`, id: m.id, license: "CC0", role: m.role, bytes: size, tris: Math.round(tris) };
}

async function packTexture(t) {
  const files = await getJSON(`${API}/files/${t.id}`);
  const keyFor = { diff: "Diffuse", nor_gl: "nor_gl", rough: "Rough" };
  const out = [];
  for (const map of t.maps) {
    const entry = files[keyFor[map]]["1k"].jpg;
    const src = join(CACHE, t.id, `${map}.jpg`);
    await download(entry.url, src);
    const dest = join(OUT_TEX, `${t.as}_${map === "nor_gl" ? "normal" : map}.webp`);
    let img = sharp(src).resize(t.size, t.size);
    // Indian roof slabs are pale, sun-bleached concrete: lift and flatten the
    // diffuse so the scene's own lighting carries the contrast.
    if (t.tone && map === "diff") img = img.modulate({ brightness: t.tone.brightness, saturation: t.tone.saturation }).linear(t.tone.contrast, 128 * (1 - t.tone.contrast));
    await img.webp({ quality: map === "nor_gl" ? 86 : 74 }).toFile(dest);
    const size = statSync(dest).size;
    console.log(`texture ${`${t.as}/${map}`.padEnd(15)} ${kb(size).padStart(7)}  <- ${t.id}`);
    out.push({ file: dest.slice(join(ROOT, "public").length + 1), bytes: size });
  }
  return { id: t.id, source: `https://polyhaven.com/a/${t.id}`, license: "CC0", role: t.role, files: out };
}

async function main() {
  await MeshoptEncoder.ready;
  await MeshoptSimplifier.ready;
  rmSync(OUT_MODELS, { recursive: true, force: true });
  rmSync(OUT_TEX, { recursive: true, force: true });
  mkdirSync(OUT_MODELS, { recursive: true });
  mkdirSync(OUT_TEX, { recursive: true });
  const io = new NodeIO(fetch).registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });

  const models = [];
  for (const m of MODELS) models.push(await packModel(m, io));
  const textures = [];
  for (const t of TEXTURES) textures.push(await packTexture(t));

  const credits = {
    note: "All third-party 3D assets are CC0 (public domain) from Poly Haven. Processed by scripts/fetch-assets.mjs.",
    generated: new Date().toISOString().slice(0, 10),
    models,
    textures,
  };
  writeFileSync(join(OUT_MODELS, "credits.json"), JSON.stringify(credits, null, 2) + "\n");
  const total = models.reduce((n, m) => n + m.bytes, 0) + textures.flatMap((t) => t.files).reduce((n, f) => n + f.bytes, 0);
  console.log(`\n${models.length} models, ${textures.length} texture sets, ${kb(total)} in total`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
