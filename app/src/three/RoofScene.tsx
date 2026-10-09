import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { sunPosition } from "../engine/solar";
import { FLOOR_H, layoutArray, MODULE, mulberry32, type RoofDims } from "./layout";
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
}

export function makeSceneState(partial: Partial<SceneState> = {}): SceneState {
  return { lat: 28.61, lon: 77.21, doy: 105, hour: 12.5, panels: 6, drop: 1, camT: 0, ...partial };
}

interface Props {
  state: MutableRefObject<SceneState>;
  roof: RoofDims;
  interactive?: boolean;
  /** Re-layout panels when this changes (report slider) */
  panelsKey?: number;
  lowPower?: boolean;
  className?: string;
  onReady?: () => void;
  cameraPosition?: [number, number, number];
}

const PALETTE = ["#7d9fd1", "#a9c1e2", "#e8bdb3", "#e5c07a", "#bcd9c7", "#efede6", "#d39a78", "#9fb7d6", "#f0dcc0"];

/* ------------------------------------------------------------------ */
/* Sky + lights, driven every frame from the shared state              */
/* ------------------------------------------------------------------ */

function Atmosphere({ state, lowPower }: { state: MutableRefObject<SceneState>; lowPower?: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const { scene } = useThree();
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
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);

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
      hemi.current.intensity = look.hemiIntensity;
    }
    if (moon.current) moon.current.intensity = look.night * 0.55;
    (scene.userData as { night?: number }).night = look.night;
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
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />
      <directionalLight ref={moon} position={[-30, 40, 20]} color="#8fa6e6" />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* The house                                                           */
/* ------------------------------------------------------------------ */

function useWindowMaterial(floors: number, tint: string) {
  return useMemo(() => {
    const { map, emissive } = windowTextures();
    const m = map.clone();
    const e = emissive.clone();
    // The texture holds 4 bays x 4 floors; show one row per storey.
    m.repeat.set(1, floors / 4);
    e.repeat.set(1, floors / 4);
    m.needsUpdate = e.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ color: tint, map: m, emissive: "#ffd28a", emissiveMap: e, emissiveIntensity: 0, roughness: 0.92 });
  }, [floors, tint]);
}

function NightGlow({ materials }: { materials: THREE.MeshStandardMaterial[] }) {
  const { scene } = useThree();
  useFrame(() => {
    const n = (scene.userData as { night?: number }).night ?? 0;
    for (const m of materials) m.emissiveIntensity = n * 1.1;
  });
  return null;
}

function House({ roof }: { roof: RoofDims }) {
  const H = roof.floors * FLOOR_H;
  const wall = useWindowMaterial(roof.floors, "#f3f1ea");
  const plain = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f1efe8", roughness: 0.95 }), []);
  const slab = useMemo(() => new THREE.MeshStandardMaterial({ color: "#b9b4aa", roughness: 1 }), []);
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
      {/* parapet */}
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
      {/* mumty (stair room) */}
      <mesh position={[mx, H + 1.3, mz]} castShadow receiveShadow material={plain}>
        <boxGeometry args={[2.8, 2.6, 2.6]} />
      </mesh>
      <mesh position={[mx - 0.3, H + 1.05, mz + 1.31]}>
        <planeGeometry args={[0.95, 2.05]} />
        <meshStandardMaterial color="#3d5a8c" roughness={0.7} />
      </mesh>
      {/* black ribbed water tank on the mumty */}
      <group position={[mx + 0.2, H + 2.6, mz - 0.1]}>
        <mesh position={[0, 0.62, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.66, 1.2, 28]} />
          <meshStandardMaterial color="#17191c" roughness={0.55} metalness={0.05} />
        </mesh>
        {[0.25, 0.62, 0.99].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.645, 0.025, 6, 28]} />
            <meshStandardMaterial color="#26292e" roughness={0.5} />
          </mesh>
        ))}
        <mesh position={[0, 1.27, 0]}>
          <cylinderGeometry args={[0.24, 0.26, 0.12, 20]} />
          <meshStandardMaterial color="#202226" roughness={0.6} />
        </mesh>
      </group>
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
      {/* tulsi planter */}
      <group position={[mx - 2.2, H, mz + 0.4]}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.6, 0.7, 0.6]} />
          <meshStandardMaterial color="#c4693f" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow>
          <icosahedronGeometry args={[0.38, 1]} />
          <meshStandardMaterial color="#4f8a4a" roughness={0.9} flatShading />
        </mesh>
      </group>
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
    const frame = new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 0.75, roughness: 0.35 });
    const glass = new THREE.MeshPhysicalMaterial({
      map: panelTexture(),
      roughness: 0.18,
      metalness: 0.2,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
    });
    return [frame, frame, glass, frame, frame, frame];
  }, []);
  const steel = useMemo(() => new THREE.MeshStandardMaterial({ color: "#9aa3ad", metalness: 0.6, roughness: 0.45 }), []);
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
          tank: rnd() < 0.7,
        });
      }
    }
    return list;
  }, [lowPower]);
}

function FloorGroup({ items, floors }: { items: Bldg[]; floors: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const wall = useWindowMaterial(floors, "#ffffff");
  const top = useMemo(() => new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 1 }), []);
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

function City({ lowPower }: { lowPower?: boolean }) {
  const list = useNeighbourhood(lowPower);
  const tanks = useRef<THREE.InstancedMesh>(null);
  const trees = useRef<THREE.InstancedMesh>(null);
  const trunks = useRef<THREE.InstancedMesh>(null);
  const withTank = list.filter((b) => b.tank);
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
        d.position.set(b.x + b.w * 0.25, b.floors * FLOOR_H + 0.55, b.z - b.d * 0.22);
        d.scale.set(1, 1, 1);
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
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#b6a98f" roughness={1} />
      </mesh>
      {byFloors.map((items, i) => (
        <FloorGroup key={i} items={items} floors={i + 1} />
      ))}
      <instancedMesh ref={tanks} args={[undefined, undefined, Math.max(1, withTank.length)]} castShadow>
        <cylinderGeometry args={[0.55, 0.58, 1.1, 14]} />
        <meshStandardMaterial color="#1a1c20" roughness={0.6} />
      </instancedMesh>
      <instancedMesh ref={trunks} args={[undefined, undefined, Math.max(1, treeSpots.length)]}>
        <cylinderGeometry args={[0.18, 0.25, 2.2, 6]} />
        <meshStandardMaterial color="#6b5440" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={trees} args={[undefined, undefined, Math.max(1, treeSpots.length)]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#5f8f4e" roughness={0.95} flatShading />
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
const CAM_KEYS: [number, number, number, number, number][] = [
  [0, -58, 71, 40, 3.2],
  [0.3, -22, 62, 34, 2],
  [0.5, 28, 50, 27, 0.6],
  [0.7, 52, 53, 26, 0.6],
  [0.86, 96, 67, 34, 2.4],
  [1, 112, 71, 42, 3.2],
];

function camAt(t: number) {
  let i = 1;
  while (i < CAM_KEYS.length - 1 && t > CAM_KEYS[i][0]) i++;
  const a = CAM_KEYS[i - 1];
  const b = CAM_KEYS[i];
  const k = Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0])));
  const e = k * k * (3 - 2 * k);
  return a.map((v, j) => (j === 0 ? 0 : v + (b[j] - v) * e)) as typeof a;
}

function HeroCamera({ state, roof }: { state: MutableRefObject<SceneState>; roof: RoofDims }) {
  const { camera, pointer } = useThree();
  const target = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const roofY = roof.floors * FLOOR_H;
  useFrame((_, dt) => {
    const [, azD, polD, r, lift] = camAt(state.current.camT);
    const az = THREE.MathUtils.degToRad(azD + pointer.x * 3);
    const pol = THREE.MathUtils.degToRad(polD - pointer.y * 2);
    target.set(0, roofY + lift, 0);
    tmp.set(Math.sin(az) * Math.sin(pol) * r, Math.cos(pol) * r + target.y, Math.cos(az) * Math.sin(pol) * r);
    const k = 1 - Math.exp(-dt * 5);
    camera.position.lerp(tmp, k);
    camera.lookAt(target);
  });
  return null;
}

function Ready({ onReady }: { onReady?: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    if (!done.current) {
      done.current = true;
      onReady?.();
    }
  });
  return null;
}

/* ------------------------------------------------------------------ */

export default function RoofScene({ state, roof, interactive, panelsKey, lowPower, className, onReady, cameraPosition }: Props) {
  const H = roof.floors * FLOOR_H;
  return (
    <Canvas
      className={className}
      shadows={!lowPower}
      dpr={lowPower ? [1, 1.25] : [1, 1.75]}
      camera={{ position: cameraPosition ?? [24, 22, 26], fov: 38, near: 0.5, far: 1200 }}
      gl={{ antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
    >
      <Atmosphere state={state} lowPower={lowPower} />
      <House roof={roof} />
      <SolarArray state={state} roof={roof} panelsKey={panelsKey} />
      <City lowPower={lowPower} />
      <Kites />
      {interactive ? (
        <OrbitControls
          target={[0, H + 1, 0]}
          enableDamping
          dampingFactor={0.08}
          minDistance={12}
          maxDistance={48}
          minPolarAngle={0.35}
          maxPolarAngle={1.32}
          enablePan={false}
        />
      ) : (
        <HeroCamera state={state} roof={roof} />
      )}
      <Ready onReady={onReady} />
    </Canvas>
  );
}
