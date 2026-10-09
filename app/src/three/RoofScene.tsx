import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls as ThreeOrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { sunPosition } from "../engine/solar";
import { loadTexture, repeated, type TextureName } from "./assets";
import { Effects, pickQuality, type Quality } from "./Effects";
import { FLOOR_H, layoutArray, MODULE, mulberry32, type RoofDims } from "./layout";
import { Instanced, Lantern, sagLine, StringLights, type Placement } from "./Props";
import { skyFragment, skyLook, skyVertex, sunVector } from "./sky";
import { panelTexture, windowTextures } from "./textures";

export interface SceneState {
  lat: number;
  lon: number;
  doy: number;
  hour: number;
  panels: number;
  /** 0 = panels in the air, 1 = installed */
  drop: number;
  /** Hero camera path, 0..1 */
  camT: number;
  /** Shift the picture sideways, as a fraction of the canvas width (hero layout) */
  viewX: number;
}

export function makeSceneState(partial: Partial<SceneState> = {}): SceneState {
  return { lat: 28.61, lon: 77.21, doy: 105, hour: 12.5, panels: 6, drop: 1, camT: 0, viewX: 0, ...partial };
}

interface Props {
  state: MutableRefObject<SceneState>;
  roof: RoofDims;
  interactive?: boolean;
  /** Re-layout panels when this changes (report slider) */
  panelsKey?: number;
  lowPower?: boolean;
  quality?: Quality;
  className?: string;
  onReady?: () => void;
  cameraPosition?: [number, number, number];
  /** Stop rendering, e.g. while the canvas is scrolled out of view */
  paused?: boolean;
}

// Limewash, Jodhpur blue, sandstone, pista green and haldi facades.
const PALETTE = ["#86a6d4", "#b3c8e6", "#ecc3b6", "#e9c886", "#c4dccb", "#f1efe8", "#d9a586", "#a9bfdc", "#f2e0c4", "#efe9dc"];

/* ------------------------------------------------------------------ */
/* Shared textures                                                     */
/* ------------------------------------------------------------------ */

type TexSet = Partial<Record<TextureName, THREE.Texture>>;

function useSceneTextures(): TexSet {
  const [set, setSet] = useState<TexSet>({});
  useEffect(() => {
    let live = true;
    const names: TextureName[] = ["plaster_normal", "plaster_rough", "slab_diff", "slab_normal", "lane_diff"];
    names.forEach((n) =>
      loadTexture(n)
        .then((t) => live && setSet((s) => ({ ...s, [n]: t })))
        .catch(() => {
          /* untextured fallback is fine */
        }),
    );
    return () => {
      live = false;
    };
  }, []);
  return set;
}

/** Plaster relief on facades: normal + roughness at the given tiling. */
function plasterize(m: THREE.MeshStandardMaterial, tex: TexSet, rx: number, ry: number) {
  if (!tex.plaster_normal || !tex.plaster_rough) return;
  m.normalMap = repeated(tex.plaster_normal, rx, ry);
  m.normalScale.set(0.55, 0.55);
  m.roughnessMap = repeated(tex.plaster_rough, rx, ry);
  m.needsUpdate = true;
}

function slabify(m: THREE.MeshStandardMaterial, tex: TexSet, r: number) {
  if (!tex.slab_diff || !tex.slab_normal) return;
  m.map = repeated(tex.slab_diff, r, r);
  m.normalMap = repeated(tex.slab_normal, r, r);
  m.normalScale.set(0.6, 0.6);
  m.needsUpdate = true;
}

/* ------------------------------------------------------------------ */
/* Sky, lights and a reflection map rendered from the same sky        */
/* ------------------------------------------------------------------ */

function Atmosphere({ state, lowPower }: { state: MutableRefObject<SceneState>; lowPower?: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const { scene, gl } = useThree();
  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uSun: { value: new THREE.Color() },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uNight: { value: 0 },
    }),
    [],
  );
  const fog = useMemo(() => new THREE.Fog("#dce9f6", 110, 340), []);

  // The sky also lives in a tiny scene of its own. Whenever the sun moves
  // enough, it is baked into a prefiltered environment map so panel glass,
  // metal and plaster pick up dawn pinks and dusk oranges.
  const env = useMemo(() => {
    const s = new THREE.Scene();
    const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, uniforms, vertexShader: skyVertex, fragmentShader: skyFragment });
    s.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), mat));
    return { scene: s, pmrem: new THREE.PMREMGenerator(gl), rt: null as THREE.WebGLRenderTarget | null, el: 999, night: -1 };
  }, [gl, uniforms]);

  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
      scene.environment = null;
      env.rt?.dispose();
      env.pmrem.dispose();
    };
  }, [scene, fog, env]);

  useFrame(() => {
    const s = state.current;
    const p = sunPosition(s.lat, s.lon, s.doy, s.hour);
    const look = skyLook(p.elevation, s.hour > 12.5);
    const dir = sunVector(p.elevation, p.azimuth, 60);
    uniforms.uTop.value.copy(look.top);
    uniforms.uHorizon.value.copy(look.horizon);
    uniforms.uSun.value.copy(look.sun);
    uniforms.uSunDir.value.copy(dir).normalize();
    uniforms.uNight.value = look.night;
    fog.color.copy(look.fog);
    if (sun.current) {
      sun.current.position.copy(dir);
      sun.current.color.copy(look.sun);
      sun.current.intensity = p.elevation > -1 ? look.sunIntensity : 0;
    }
    if (hemi.current) {
      hemi.current.color.copy(look.hemiSky);
      hemi.current.groundColor.copy(look.hemiGround);
      hemi.current.intensity = look.hemiIntensity * 0.55;
    }
    if (moon.current) moon.current.intensity = look.night * 0.55;
    (scene.userData as { night?: number }).night = look.night;

    if (Math.abs(p.elevation - env.el) > (lowPower ? 4 : 1.5) || Math.abs(look.night - env.night) > 0.06) {
      env.el = p.elevation;
      env.night = look.night;
      const rt = env.pmrem.fromScene(env.scene, 0, 0.1, 400);
      env.rt?.dispose();
      env.rt = rt;
      scene.environment = rt.texture;
    }
    scene.environmentIntensity = 0.55 - look.night * 0.35;
  });

  return (
    <>
      <mesh frustumCulled={false} renderOrder={-1}>
        <sphereGeometry args={[450, 32, 16]} />
        <shaderMaterial side={THREE.BackSide} depthWrite={false} uniforms={uniforms} vertexShader={skyVertex} fragmentShader={skyFragment} />
      </mesh>
      <hemisphereLight ref={hemi} />
      <directionalLight
        ref={sun}
        castShadow={!lowPower}
        shadow-mapSize={lowPower ? [1024, 1024] : [2048, 2048]}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={26}
        shadow-camera-bottom={-26}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={3}
      />
      <directionalLight ref={moon} position={[-30, 40, 20]} color="#8fa6e6" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The house                                                           */
/* ------------------------------------------------------------------ */

function useWindowMaterial(floors: number, tint: string, tex: TexSet) {
  const mat = useMemo(() => {
    const { map, emissive } = windowTextures();
    const m = map.clone();
    const e = emissive.clone();
    // The texture holds 4 bays x 4 floors; show one row per storey.
    m.repeat.set(1, floors / 4);
    e.repeat.set(1, floors / 4);
    m.needsUpdate = e.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: tint, map: m, emissive: "#ffd28a", emissiveMap: e, emissiveIntensity: 0, roughness: 0.92 });
  }, [floors, tint]);
  useEffect(() => plasterize(mat, tex, 3, floors), [mat, tex, floors]);
  return mat;
}

function NightGlow({ materials }: { materials: THREE.MeshStandardMaterial[] }) {
  const { scene } = useThree();
  useFrame(() => {
    const n = (scene.userData as { night?: number }).night ?? 0;
    for (const m of materials) m.emissiveIntensity = n * 1.6;
  });
  return null;
}

/** A Sintex-style ribbed black water tank, the most Indian object on any roof. */
function useTankGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const H = 1.2;
    for (let i = 0; i <= 24; i++) {
      const y = (i / 24) * H;
      const rib = Math.abs(Math.sin((y / H) * Math.PI * 4)) * 0.025;
      pts.push(new THREE.Vector2(0.6 + rib - (y / H) * 0.03, y));
    }
    pts.push(new THREE.Vector2(0.45, H + 0.08), new THREE.Vector2(0.24, H + 0.12), new THREE.Vector2(0.24, H + 0.2), new THREE.Vector2(0.001, H + 0.2));
    pts.unshift(new THREE.Vector2(0.001, 0));
    const g = new THREE.LatheGeometry(pts, 32);
    g.computeVertexNormals();
    return g;
  }, []);
}

function House({ roof, tex }: { roof: RoofDims; tex: TexSet }) {
  const H = roof.floors * FLOOR_H;
  const wall = useWindowMaterial(roof.floors, "#f3f1ea", tex);
  const plain = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f1efe8", roughness: 0.95 }), []);
  const slab = useMemo(() => new THREE.MeshStandardMaterial({ color: "#d8d2c6", roughness: 1 }), []);
  const tankGeo = useTankGeometry();
  useEffect(() => plasterize(plain, tex, 2, 1), [plain, tex]);
  useEffect(() => slabify(slab, tex, Math.round(roof.w / 3)), [slab, tex, roof.w]);
  const bodyMats = useMemo(() => [wall, wall, plain, plain, wall, wall], [wall, plain]);
  const cloth = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!cloth.current) return;
    cloth.current.children.forEach((c, i) => {
      c.rotation.z = Math.sin(clock.elapsedTime * 1.6 + i * 1.3) * 0.22;
    });
  });
  const par = 0.95;
  const pt = 0.2;
  const mx = roof.w / 2 - 1.7;
  const mz = -roof.d / 2 + 1.6;

  // Props on this roof, in metres from the roof centre.
  const plants = useMemo<Placement[]>(
    () => [
      { x: -roof.w / 2 + 0.6, y: H, z: roof.d / 2 - 0.6, s: 1.1 },
      { x: roof.w / 2 - 0.6, y: H, z: roof.d / 2 - 0.6, ry: 1.2, s: 0.95 },
      { x: mx - 2.3, y: H, z: mz + 0.3, ry: 2.4, s: 1.25 },
    ],
    [roof.w, roof.d, H, mx, mz],
  );
  const pots = useMemo<Placement[]>(
    () => [
      { x: -roof.w / 2 + 1.25, y: H, z: roof.d / 2 - 0.5, s: 1.7 },
      { x: roof.w / 2 - 1.2, y: H, z: roof.d / 2 - 0.45, s: 1.5, ry: 0.7 },
    ],
    [roof.w, roof.d, H],
  );
  const drum = useMemo<Placement[]>(() => [{ x: mx + 1.75, y: H, z: mz + 0.8, ry: 0.4 }], [mx, mz, H]);
  const chairs = useMemo<Placement[]>(() => [{ x: -roof.w / 2 + 2.2, y: H, z: roof.d / 2 - 2.1, ry: 2.5 }], [roof.w, roof.d, H]);
  const ac = useMemo<Placement[]>(() => [{ x: roof.w / 2 - 0.55, y: H + 0.02, z: mz + 2.8, ry: -Math.PI / 2, s: 0.85 }], [roof.w, mz, H]);
  const lights = useMemo(() => {
    const y = H + par + 0.32;
    const z = roof.d / 2 - 0.08;
    const x0 = -roof.w / 2 + 0.1;
    const x1 = roof.w / 2 - 0.1;
    const mid = (x0 + x1) / 2;
    return [
      ...sagLine(new THREE.Vector3(x0, y, z), new THREE.Vector3(mid, y, z), 0.22, 18),
      ...sagLine(new THREE.Vector3(mid, y, z), new THREE.Vector3(x1, y, z), 0.22, 18).slice(1),
    ];
  }, [roof.w, roof.d, H]);

  return (
    <group>
      <NightGlow materials={[wall]} />
      <mesh position={[0, H / 2, 0]} castShadow receiveShadow material={bodyMats}>
        <boxGeometry args={[roof.w, H, roof.d]} />
      </mesh>
      {/* roof slab */}
      <mesh position={[0, H + 0.02, 0]} receiveShadow material={slab}>
        <boxGeometry args={[roof.w - 0.1, 0.06, roof.d - 0.1]} />
      </mesh>
      {/* parapet with a coping band */}
      {[
        [0, roof.d / 2 - pt / 2, roof.w, pt],
        [0, -roof.d / 2 + pt / 2, roof.w, pt],
      ].map(([x, z, w, d], i) => (
        <mesh key={`pz${i}`} position={[x, H + par / 2, z]} castShadow receiveShadow material={plain}>
          <boxGeometry args={[w, par, d]} />
        </mesh>
      ))}
      {[
        [roof.w / 2 - pt / 2, 0],
        [-roof.w / 2 + pt / 2, 0],
      ].map(([x, z], i) => (
        <mesh key={`px${i}`} position={[x, H + par / 2, z]} castShadow receiveShadow material={plain}>
          <boxGeometry args={[pt, par, roof.d]} />
        </mesh>
      ))}
      <mesh position={[0, H + par + 0.03, roof.d / 2 - pt / 2]} castShadow>
        <boxGeometry args={[roof.w + 0.06, 0.06, pt + 0.08]} />
        <meshStandardMaterial color="#e2b54a" roughness={0.8} />
      </mesh>
      {/* mumty (stair room) */}
      <mesh position={[mx, H + 1.3, mz]} castShadow receiveShadow material={plain}>
        <boxGeometry args={[2.8, 2.6, 2.6]} />
      </mesh>
      <mesh position={[mx - 0.3, H + 1.05, mz + 1.31]}>
        <planeGeometry args={[0.95, 2.05]} />
        <meshStandardMaterial color="#3d5a8c" roughness={0.7} />
      </mesh>
      <Lantern position={[mx + 0.45, H + 2.05, mz + 1.42]} />
      {/* ribbed black water tank on the mumty */}
      <mesh position={[mx + 0.2, H + 2.6, mz - 0.1]} geometry={tankGeo} castShadow receiveShadow>
        <meshStandardMaterial color="#141619" roughness={0.42} metalness={0.05} />
      </mesh>
      {/* clothesline along the west parapet */}
      <group position={[-roof.w / 2 + 0.75, H, 0]}>
        {[-roof.d / 2 + 2.2, roof.d / 2 - 1.2].map((z) => (
          <mesh key={z} position={[0, 0.9, z]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.8, 6]} />
            <meshStandardMaterial color="#8a8f98" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 1.75, (roof.d / 2 - 1.2 + (-roof.d / 2 + 2.2)) / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, roof.d - 3.4, 4]} />
          <meshStandardMaterial color="#555" />
        </mesh>
        <group ref={cloth} position={[0, 1.75, 0]}>
          {[
            ["#f2b632", -0.9],
            ["#3d63b0", 0.1],
            ["#f6f3ea", 1.0],
            ["#c9483a", 1.9],
          ].map(([c, z]) => (
            <group key={z as number} position={[0, 0, (z as number) - roof.d / 8]}>
              <mesh position={[0, -0.42, 0]} castShadow rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[0.72, 0.8]} />
                <meshStandardMaterial color={c as string} side={THREE.DoubleSide} roughness={0.95} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
      <Instanced name="plant" at={plants} />
      <Instanced name="planter" at={pots} />
      <Instanced name="drum" at={drum} />
      <Instanced name="chair" at={chairs} />
      <Instanced name="aircon" at={ac} />
      <StringLights points={lights} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Solar array on an elevated structure                                */
/* ------------------------------------------------------------------ */

const MAX_PANELS = 40;

function SolarArray({ state, roof, panelsKey }: { state: MutableRefObject<SceneState>; roof: RoofDims; panelsKey?: number }) {
  const panels = useRef<THREE.InstancedMesh>(null);
  const posts = useRef<THREE.InstancedMesh>(null);
  const rails = useRef<THREE.InstancedMesh>(null);
  const tiltDeg = Math.max(10, Math.min(30, Math.abs(state.current.lat)));
  const count = Math.min(MAX_PANELS, Math.max(0, panelsKey ?? state.current.panels));
  const layout = useMemo(() => layoutArray(count, roof, tiltDeg), [count, roof, tiltDeg]);

  const mats = useMemo(() => {
    const frame = new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 0.85, roughness: 0.28 });
    const back = new THREE.MeshStandardMaterial({ color: "#e9ecef", roughness: 0.7 });
    const glass = new THREE.MeshPhysicalMaterial({
      map: panelTexture(),
      roughness: 0.3,
      metalness: 0.25,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      envMapIntensity: 1.1,
    });
    return [frame, frame, glass, back, frame, frame];
  }, []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#a7afb8", metalness: 0.75, roughness: 0.38 }), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const H = roof.floors * FLOOR_H;

  // Structure: posts at each row's ends (north tall, south short) and rails.
  useEffect(() => {
    const postMesh = posts.current;
    const railMesh = rails.current;
    if (!postMesh || !railMesh) return;
    let pi = 0;
    let ri = 0;
    layout.rowZ.forEach((z, r) => {
      const [xa, xb] = layout.rowSpanX[r];
      const zs = z + layout.rowDepth / 2;
      const zn = z - layout.rowDepth / 2;
      const xs = [xa + 0.15, xb - 0.15];
      if (xb - xa > 5) xs.push((xa + xb) / 2);
      for (const x of xs) {
        for (const [zz, top] of [
          [zs, layout.lowY],
          [zn, layout.topY],
        ] as const) {
          const h = top - H;
          dummy.position.set(x, H + h / 2, zz);
          dummy.rotation.set(0, 0, 0);
          dummy.scale.set(1, h, 1);
          dummy.updateMatrix();
          postMesh.setMatrixAt(pi++, dummy.matrix);
        }
      }
      for (const [zz, y] of [
        [zs, layout.lowY - 0.05],
        [zn, layout.topY - 0.05],
      ] as const) {
        dummy.position.set((xa + xb) / 2, y, zz);
        dummy.scale.set(xb - xa, 1, 1);
        dummy.updateMatrix();
        railMesh.setMatrixAt(ri++, dummy.matrix);
      }
    });
    postMesh.count = pi;
    railMesh.count = ri;
    postMesh.instanceMatrix.needsUpdate = true;
    railMesh.instanceMatrix.needsUpdate = true;
  }, [layout, dummy, H]);

  const lastDrop = useRef(-1);
  const lastLayout = useRef<typeof layout | null>(null);
  useFrame(() => {
    const m = panels.current;
    if (!m) return;
    const drop = state.current.drop;
    const built = drop > 0.001;
    if (posts.current) posts.current.visible = built;
    if (rails.current) rails.current.visible = built;
    if (Math.abs(drop - lastDrop.current) < 1e-4 && lastLayout.current === layout) return;
    lastDrop.current = drop;
    lastLayout.current = layout;
    const n = layout.slots.length;
    layout.slots.forEach((s, i) => {
      const delay = n > 1 ? (i / (n - 1)) * 0.45 : 0;
      const t = Math.max(0, Math.min(1, (drop - delay) / 0.55));
      const e = 1 - Math.pow(1 - t, 3);
      dummy.position.set(s.x, s.y + (1 - e) * 7, s.z);
      dummy.rotation.set(layout.tilt + (1 - e) * 0.8, (1 - e) * 0.3, 0);
      const sc = t <= 0 ? 0.0001 : 1;
      dummy.scale.set(sc, sc, sc);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.count = n;
    m.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={panels} args={[undefined, undefined, MAX_PANELS]} material={mats} castShadow receiveShadow frustumCulled={false}>
        <boxGeometry args={[MODULE.w, MODULE.t, MODULE.d]} />
      </instancedMesh>
      <instancedMesh ref={posts} args={[undefined, steel, 64]} castShadow>
        <boxGeometry args={[0.07, 1, 0.07]} />
      </instancedMesh>
      <instancedMesh ref={rails} args={[undefined, steel, 32]} castShadow>
        <boxGeometry args={[1, 0.06, 0.06]} />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Neighbourhood                                                       */
/* ------------------------------------------------------------------ */

interface Bldg {
  x: number;
  z: number;
  w: number;
  d: number;
  floors: number;
  color: string;
  tank: boolean;
  ac: boolean;
  drum: boolean;
}

function useNeighbourhood(lowPower?: boolean) {
  return useMemo(() => {
    const rnd = mulberry32(108);
    const list: Bldg[] = [];
    const R = lowPower ? 2 : 3;
    const S = 13.5;
    for (let gx = -R; gx <= R; gx++) {
      for (let gz = -R; gz <= R; gz++) {
        if (gx === 0 && gz === 0) continue;
        // Between the camera (south-east) and the house, keep buildings low.
        const near = Math.abs(gx) <= 1 && gz >= 0 && gz <= 1;
        const south = gz >= 0;
        const floors = near ? 1 + Math.floor(rnd() * 1.6) : south ? 1 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 4);
        list.push({
          x: gx * S + (rnd() - 0.5) * 1.2,
          z: gz * S + (rnd() - 0.5) * 1.2,
          w: 8.5 + rnd() * 3,
          d: 8 + rnd() * 3,
          floors,
          color: PALETTE[Math.floor(rnd() * PALETTE.length)],
          tank: rnd() < 0.75,
          ac: rnd() < 0.55,
          drum: rnd() < 0.3,
        });
      }
    }
    return list;
  }, [lowPower]);
}

/**
 * Roof slabs keep only a hint of the facade colour: painted walls, concrete
 * tops. Instance colours are mixed toward white in the shader.
 */
function roofMaterial() {
  const m = new THREE.MeshStandardMaterial({ color: "#d9d3c7", roughness: 1 });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <color_fragment>",
      `#if defined( USE_COLOR_ALPHA )
        diffuseColor *= vColor;
      #elif defined( USE_COLOR )
        diffuseColor.rgb *= mix( vec3( 1.0 ), vColor, 0.22 );
      #endif`,
    );
  };
  m.customProgramCacheKey = () => "chhat-roof";
  return m;
}

function FloorGroup({ items, floors, tex }: { items: Bldg[]; floors: number; tex: TexSet }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const wall = useWindowMaterial(floors, "#ffffff", tex);
  const top = useMemo(roofMaterial, []);
  useEffect(() => slabify(top, tex, 3), [top, tex]);
  const mats = useMemo(() => [wall, wall, top, top, wall, wall], [wall, top]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    items.forEach((b, i) => {
      const h = b.floors * FLOOR_H;
      d.position.set(b.x, h / 2, b.z);
      d.scale.set(b.w, h, b.d);
      d.updateMatrix();
      m.setMatrixAt(i, d.matrix);
      m.setColorAt(i, c.set(b.color));
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [items]);
  if (!items.length) return null;
  return (
    <>
      <NightGlow materials={[wall]} />
      <instancedMesh ref={ref} args={[undefined, undefined, items.length]} material={mats} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
      </instancedMesh>
    </>
  );
}

/** Parapet walls around every neighbouring roof, as one instanced mesh. */
function Parapets({ list, tex }: { list: Bldg[]; tex: TexSet }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.95 }), []);
  useEffect(() => plasterize(mat, tex, 4, 1), [mat, tex]);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const d = new THREE.Object3D();
    const c = new THREE.Color();
    let i = 0;
    const h = 0.85;
    const t = 0.18;
    list.forEach((b) => {
      const y = b.floors * FLOOR_H + h / 2;
      const sides: [number, number, number, number][] = [
        [b.x, b.z + b.d / 2 - t / 2, b.w, t],
        [b.x, b.z - b.d / 2 + t / 2, b.w, t],
        [b.x + b.w / 2 - t / 2, b.z, t, b.d],
        [b.x - b.w / 2 + t / 2, b.z, t, b.d],
      ];
      for (const [x, z, w, dd] of sides) {
        d.position.set(x, y, z);
        d.scale.set(w, h, dd);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
        m.setColorAt(i, c.set(b.color));
        i++;
      }
    });
    m.count = i;
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [list]);
  return (
    <instancedMesh ref={ref} args={[undefined, mat, list.length * 4]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  );
}

function City({ lowPower, tex }: { lowPower?: boolean; tex: TexSet }) {
  const list = useNeighbourhood(lowPower);
  const tanks = useRef<THREE.InstancedMesh>(null);
  const trees = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const tankGeo = useTankGeometry();
  const withTank = useMemo(() => list.filter((b) => b.tank), [list]);
  const ground = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9bda6", roughness: 1 }), []);
  useEffect(() => {
    if (!tex.lane_diff) return;
    ground.map = repeated(tex.lane_diff, 26, 26);
    ground.needsUpdate = true;
  }, [ground, tex]);
  const acs = useMemo<Placement[]>(
    () => list.filter((b) => b.ac).map((b, i) => ({ x: b.x - b.w * 0.18, y: b.floors * FLOOR_H, z: b.z + b.d * 0.3, ry: (i % 4) * (Math.PI / 2), s: 0.85 })),
    [list],
  );
  const drums = useMemo<Placement[]>(
    () => list.filter((b) => b.drum).map((b, i) => ({ x: b.x + b.w * 0.32, y: b.floors * FLOOR_H, z: b.z + b.d * 0.28, ry: i })),
    [list],
  );
  const treeSpots = useMemo(() => {
    const rnd = mulberry32(7);
    const s: [number, number, number][] = [];
    for (let i = 0; i < (lowPower ? 10 : 22); i++) {
      const gx = Math.floor(rnd() * 7) - 3;
      const gz = Math.floor(rnd() * 7) - 3;
      if (Math.abs(gx) < 1 && Math.abs(gz) < 1) continue;
      s.push([gx * 13.5 + 6.6, gz * 13.5 + 6.6, 1.6 + rnd() * 1.4]);
    }
    return s;
  }, [lowPower]);
  useEffect(() => {
    const d = new THREE.Object3D();
    if (tanks.current) {
      withTank.forEach((b, i) => {
        d.position.set(b.x + b.w * 0.25, b.floors * FLOOR_H, b.z - b.d * 0.22);
        d.scale.setScalar(0.92);
        d.updateMatrix();
        tanks.current!.setMatrixAt(i, d.matrix);
      });
      tanks.current.instanceMatrix.needsUpdate = true;
    }
    if (trees.current && trunks.current) {
      treeSpots.forEach(([x, z, r], i) => {
        d.position.set(x, 2.2 + r * 0.6, z);
        d.scale.set(r, r * 0.9, r);
        d.updateMatrix();
        trees.current!.setMatrixAt(i, d.matrix);
        d.position.set(x, 1.1, z);
        d.scale.set(1, 1, 1);
        d.updateMatrix();
        trunks.current!.setMatrixAt(i, d.matrix);
      });
      trees.current.instanceMatrix.needsUpdate = true;
      trunks.current.instanceMatrix.needsUpdate = true;
    }
  }, [withTank, treeSpots]);
  const byFloors = [1, 2, 3, 4].map((f) => list.filter((b) => b.floors === f));
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow material={ground}>
        <planeGeometry args={[400, 400]} />
      </mesh>
      {byFloors.map((items, i) => (
        <FloorGroup key={i} items={items} floors={i + 1} tex={tex} />
      ))}
      <Parapets list={list} tex={tex} />
      <instancedMesh ref={tanks} args={[tankGeo, undefined, Math.max(1, withTank.length)]} castShadow>
        <meshStandardMaterial color="#17191c" roughness={0.45} />
      </instancedMesh>
      <Instanced name="aircon" at={acs} />
      <Instanced name="drum" at={drums} castShadow={!lowPower} />
      <instancedMesh ref={trunks} args={[undefined, undefined, Math.max(1, treeSpots.length)]}>
        <cylinderGeometry args={[0.18, 0.25, 2.2, 6]} />
        <meshStandardMaterial color="#6b5440" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={trees} args={[undefined, undefined, Math.max(1, treeSpots.length)]} castShadow>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color="#5a8a4a" roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Kites over the rooftops                                             */
/* ------------------------------------------------------------------ */

function Kites() {
  const group = useRef<THREE.Group>(null);
  const kites = useMemo(
    () => [
      { color: "#f2b632", base: new THREE.Vector3(-16, 22, -24), anchor: new THREE.Vector3(-26, 9, -12), phase: 0 },
      { color: "#d8452f", base: new THREE.Vector3(14, 27, -30), anchor: new THREE.Vector3(26, 12, -16), phase: 1.7 },
      { color: "#2f62b5", base: new THREE.Vector3(-30, 18, 4), anchor: new THREE.Vector3(-38, 6, 14), phase: 3.1 },
      { color: "#3f9a6e", base: new THREE.Vector3(32, 20, 6), anchor: new THREE.Vector3(40, 9, 18), phase: 4.2 },
    ],
    [],
  );
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0.75, 0, 0.55, 0, 0, 0, -0.85, 0, 0, 0.75, 0, 0, -0.85, 0, -0.55, 0, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const lines = useMemo(
    () =>
      kites.map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(6), 3));
        return g;
      }),
    [kites],
  );
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    kites.forEach((k, i) => {
      const kite = g.children[i] as THREE.Mesh;
      kite.position.set(k.base.x + Math.sin(t * 0.6 + k.phase) * 1.6, k.base.y + Math.sin(t * 1.1 + k.phase) * 0.9, k.base.z + Math.cos(t * 0.5 + k.phase) * 1.2);
      kite.rotation.set(Math.sin(t * 1.3 + k.phase) * 0.25, Math.sin(t * 0.7 + k.phase) * 0.5, Math.sin(t * 0.9 + k.phase) * 0.35);
      const pos = lines[i].getAttribute("position") as THREE.BufferAttribute;
      pos.setXYZ(0, kite.position.x, kite.position.y - 0.6, kite.position.z);
      pos.setXYZ(1, k.anchor.x, k.anchor.y, k.anchor.z);
      pos.needsUpdate = true;
    });
  });
  return (
    <group>
      <group ref={group}>
        {kites.map((k) => (
          <mesh key={k.color} geometry={geom} scale={1.15}>
            <meshStandardMaterial color={k.color} side={THREE.DoubleSide} roughness={0.8} emissive={k.color} emissiveIntensity={0.15} />
          </mesh>
        ))}
      </group>
      {lines.map((g, i) => (
        <lineSegments key={i} geometry={g}>
          <lineBasicMaterial color="#f5f1e8" transparent opacity={0.45} />
        </lineSegments>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Cameras                                                             */
/* ------------------------------------------------------------------ */

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

function HeroCamera({ state, roof }: { state: MutableRefObject<SceneState>; roof: RoofDims }) {
  const { camera, pointer, size } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const view = useRef({ x: 0 });
  const roofY = roof.floors * FLOOR_H;
  useFrame(({ clock }, dt) => {
    const [, azD, polD, r, lift] = camAt(state.current.camT);
    // A slow breathing drift keeps the frame alive when nobody scrolls.
    const drift = Math.sin(clock.elapsedTime * 0.15) * 1.5;
    const az = THREE.MathUtils.degToRad(azD + drift + pointer.x * 3);
    const pol = THREE.MathUtils.degToRad(polD - pointer.y * 2);
    target.set(0, roofY + lift, 0);
    tmp.set(Math.sin(az) * Math.sin(pol) * r, Math.cos(pol) * r + target.y, Math.cos(az) * Math.sin(pol) * r);
    const k = 1 - Math.exp(-dt * 5);
    camera.position.lerp(tmp, k);
    camera.lookAt(target);
    const cam = camera as THREE.PerspectiveCamera;
    view.current.x += (state.current.viewX - view.current.x) * k;
    if (Math.abs(view.current.x) > 1e-4) cam.setViewOffset(size.width, size.height, -view.current.x * size.width, 0, size.width, size.height);
    else cam.clearViewOffset();
  });
  return null;
}

/** Orbit controls straight from three's examples, so the scene needs no helper library. */
function Orbit({ target }: { target: [number, number, number] }) {
  const { camera, gl } = useThree();
  const ref = useRef<ThreeOrbitControls | null>(null);
  useEffect(() => {
    const c = new ThreeOrbitControls(camera, gl.domElement);
    Object.assign(c, {
      enableDamping: true,
      dampingFactor: 0.08,
      minDistance: 12,
      maxDistance: 48,
      minPolarAngle: 0.35,
      maxPolarAngle: 1.32,
      enablePan: false,
    });
    c.target.set(...target);
    c.update();
    ref.current = c;
    return () => c.dispose();
  }, [camera, gl, target]);
  useFrame(() => ref.current?.update());
  return null;
}

/**
 * Watches frame times and steps the render tier down (high → medium → low)
 * when the device can't keep up. Never steps back up, so it can't flap.
 */
function PerfGuard({ tier, onDrop }: { tier: Quality; onDrop: () => void }) {
  const acc = useRef({ warm: 6, t: 0, n: 0, streak: 0 });
  useEffect(() => {
    acc.current = { warm: 6, t: 0, n: 0, streak: 0 };
  }, [tier]);
  useFrame((_, dt) => {
    if (tier === "low") return;
    const a = acc.current;
    // A gap over a second is a paused tab, not a slow GPU.
    if (dt > 1) {
      a.warm = 3;
      return;
    }
    // The first frames compile shaders and build the reflection map.
    if (a.warm > 0) {
      a.warm--;
      return;
    }
    a.streak = dt > 0.2 ? a.streak + 1 : 0;
    a.t += dt;
    a.n++;
    const slowAvg = a.n >= 45 && a.t / a.n > 1 / 24;
    if (a.streak >= 3 || slowAvg) {
      acc.current = { warm: 6, t: 0, n: 0, streak: 0 };
      onDrop();
    } else if (a.n >= 45) {
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

function Ready({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    // Wait two frames so shaders are compiled and the first picture is on screen.
    if (++frames.current === 2) onReady?.();
  });
  return null;
}

/* ------------------------------------------------------------------ */

export default function RoofScene({ state, roof, interactive, panelsKey, lowPower, quality, className, onReady, cameraPosition, paused }: Props) {
  const H = roof.floors * FLOOR_H;
  const orbitTarget = useMemo<[number, number, number]>(() => [0, H + 1, 0], [H]);
  const [tier, setTier] = useState<Quality>(() => quality ?? pickQuality(Boolean(lowPower)));
  const drop = useCallback(() => setTier((t) => (t === "high" ? "medium" : "low")), []);
  const tex = useSceneTextures();
  return (
    <Canvas
      className={className}
      frameloop={paused ? "never" : "always"}
      shadows={!lowPower ? "soft" : false}
      dpr={tier === "high" ? [1, 1.5] : [1, 1.25]}
      camera={{ position: cameraPosition ?? [24, 22, 26], fov: 36, near: 0.5, far: 1200 }}
      gl={{ antialias: tier === "low", powerPreference: "high-performance", preserveDrawingBuffer: true, toneMapping: THREE.NeutralToneMapping }}
    >
      <Atmosphere state={state} lowPower={lowPower} />
      <House roof={roof} tex={tex} />
      <SolarArray state={state} roof={roof} panelsKey={panelsKey} />
      <City lowPower={lowPower} tex={tex} />
      <Kites />
      {interactive ? <Orbit target={orbitTarget} /> : <HeroCamera state={state} roof={roof} />}
      {tier !== "low" && <Effects quality={tier} />}
      <PerfGuard tier={tier} onDrop={drop} />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
