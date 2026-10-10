// Loading for the scene's CC0 models and textures (see scripts/fetch-assets.mjs),
// with one shared progress counter the landing preloader can read.

import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

import type { ModelName, TextureName } from "./manifest";

export type { ModelName, TextureName };

const BASE = import.meta.env.BASE_URL ?? "./";

/* ---------------- progress ---------------- */

type Listener = (p: number) => void;
const listeners = new Set<Listener>();
let started = 0;
let finished = 0;

function emit() {
  const p = started === 0 ? 0 : finished / started;
  listeners.forEach((l) => l(p));
}

/** Fraction of scene assets loaded so far (0..1). Calls back immediately. */
export function onAssetProgress(l: Listener): () => void {
  listeners.add(l);
  l(started === 0 ? 0 : finished / started);
  return () => listeners.delete(l);
}

function track<T>(p: Promise<T>): Promise<T> {
  started++;
  emit();
  return p.finally(() => {
    finished++;
    emit();
  });
}

/* ---------------- models ---------------- */

const gltfLoader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const modelCache = new Map<ModelName, Promise<GLTF>>();

export function loadModel(name: ModelName): Promise<GLTF> {
  let p = modelCache.get(name);
  if (!p) {
    p = track(gltfLoader.loadAsync(`${BASE}models/${name}.glb`));
    modelCache.set(name, p);
  }
  return p;
}

/** Meshes of a model with their transforms baked, ready for instancing. */
export interface ModelPart {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
}

const partsCache = new Map<ModelName, Promise<{ parts: ModelPart[]; size: THREE.Vector3 }>>();

export function loadModelParts(name: ModelName): Promise<{ parts: ModelPart[]; size: THREE.Vector3 }> {
  let p = partsCache.get(name);
  if (!p) {
    p = loadModel(name).then((gltf) => {
      gltf.scene.updateMatrixWorld(true);
      const parts: ModelPart[] = [];
      gltf.scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const geometry = m.geometry.clone();
        geometry.applyMatrix4(m.matrixWorld);
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        mats.forEach((material) => parts.push({ geometry, material }));
      });
      const box = new THREE.Box3().setFromObject(gltf.scene);
      // Sit every model on y = 0, centred on x/z, so placement is just a position.
      const c = box.getCenter(new THREE.Vector3());
      const shift = new THREE.Matrix4().makeTranslation(-c.x, -box.min.y, -c.z);
      const seen = new Set<THREE.BufferGeometry>();
      parts.forEach((pt) => {
        if (seen.has(pt.geometry)) return;
        seen.add(pt.geometry);
        pt.geometry.applyMatrix4(shift);
      });
      return { parts, size: box.getSize(new THREE.Vector3()) };
    });
    partsCache.set(name, p);
  }
  return p;
}

/* ---------------- textures ---------------- */

const texLoader = new THREE.TextureLoader();
const texCache = new Map<TextureName, Promise<THREE.Texture>>();

export function loadTexture(name: TextureName): Promise<THREE.Texture> {
  let p = texCache.get(name);
  if (!p) {
    p = track(texLoader.loadAsync(`${BASE}textures/${name}.webp`)).then((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.anisotropy = 8;
      if (name.endsWith("_diff")) t.colorSpace = THREE.SRGBColorSpace;
      return t;
    });
    texCache.set(name, p);
  }
  return p;
}

/** Same texture with its own repeat, sharing the GPU upload. */
export function repeated(t: THREE.Texture, x: number, y: number): THREE.Texture {
  const c = t.clone();
  c.repeat.set(x, y);
  c.needsUpdate = true;
  return c;
}

/** Start every download now, e.g. while the preloader is on screen. */
export function preloadSceneAssets(models: ModelName[], textures: TextureName[]) {
  return Promise.allSettled([...models.map(loadModel), ...textures.map(loadTexture)]);
}
