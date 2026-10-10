// CC0 rooftop props (Poly Haven) placed on the house and the neighbourhood.
// Every model is drawn as instanced meshes, one per material, so twenty AC
// units cost the same draw calls as one.

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { loadModelParts, type ModelName, type ModelPart } from "./assets";

export interface Placement {
  x: number;
  y: number;
  z: number;
  /** Rotation about Y, radians */
  ry?: number;
  s?: number;
}

function useParts(name: ModelName) {
  const [parts, setParts] = useState<ModelPart[] | null>(null);
  useEffect(() => {
    let live = true;
    loadModelParts(name)
      .then((r) => live && setParts(r.parts))
      .catch(() => {
        /* a missing prop must never take the scene down */
      });
    return () => {
      live = false;
    };
  }, [name]);
  return parts;
}

/** One model at many placements. */
export function Instanced({ name, at, castShadow = true, receiveShadow = true, tweak }: { name: ModelName; at: Placement[]; castShadow?: boolean; receiveShadow?: boolean; tweak?: (m: THREE.Material) => THREE.Material }) {
  const parts = useParts(name);
  const mats = useMemo(() => parts?.map((p) => (tweak ? tweak(p.material) : p.material)) ?? [], [parts, tweak]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  useEffect(() => {
    if (!parts) return;
    const d = new THREE.Object3D();
    refs.current.forEach((m) => {
      if (!m) return;
      at.forEach((p, i) => {
        d.position.set(p.x, p.y, p.z);
        d.rotation.set(0, p.ry ?? 0, 0);
        d.scale.setScalar(p.s ?? 1);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
      });
      m.count = at.length;
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    });
  }, [parts, at]);
  if (!parts || !at.length) return null;
  return (
    <group>
      {parts.map((p, i) => (
        <instancedMesh
          key={i}
          ref={(m) => {
            refs.current[i] = m;
          }}
          args={[p.geometry, mats[i], at.length]}
          castShadow={castShadow}
          receiveShadow={receiveShadow}
        />
      ))}
    </group>
  );
}

/**
 * The brass lantern by the stair-room door. Its glass panes glow after
 * sunset and a small warm point light spills onto the roof slab.
 */
export function Lantern({ position }: { position: [number, number, number] }) {
  const parts = useParts("lantern");
  const { scene } = useThree();
  const light = useRef<THREE.PointLight>(null);
  const glow = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2b1d0c", emissive: "#ffb347", emissiveIntensity: 0, roughness: 0.4 }),
    [],
  );
  const mats = useMemo(
    () =>
      parts?.map((p) => {
        const m = p.material as THREE.MeshStandardMaterial;
        // The glass panes are the darkest, least metallic material in the model.
        const lum = m.color ? m.color.r + m.color.g + m.color.b : 3;
        return lum < 0.6 && (m.metalness ?? 0) < 0.5 ? glow : m;
      }) ?? [],
    [parts, glow],
  );
  useFrame(({ clock }) => {
    const n = (scene.userData as { night?: number }).night ?? 0;
    const flicker = 1 + Math.sin(clock.elapsedTime * 9.1) * 0.04 + Math.sin(clock.elapsedTime * 23.7) * 0.03;
    glow.emissiveIntensity = n * 7 * flicker;
    if (light.current) light.current.intensity = n * 9 * flicker;
  });
  if (!parts) return null;
  return (
    <group position={position} scale={1.5}>
      {parts.map((p, i) => (
        <mesh key={i} geometry={p.geometry} material={mats[i]} castShadow />
      ))}
      <pointLight ref={light} position={[0, 0.12, 0.05]} color="#ffb04a" distance={7} decay={1.6} intensity={0} />
    </group>
  );
}

/**
 * Diwali string lights along the parapet: two interleaved sets that twinkle
 * out of phase after dark.
 */
export function StringLights({ points }: { points: THREE.Vector3[] }) {
  const { scene } = useThree();
  const a = useRef<THREE.InstancedMesh>(null);
  const b = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.SphereGeometry(0.045, 8, 6), []);
  const ma = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2a12", emissive: "#ffc76b", emissiveIntensity: 0 }), []);
  const mb = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2a12", emissive: "#ff8a5c", emissiveIntensity: 0 }), []);
  const halves = useMemo(() => [points.filter((_, i) => i % 2 === 0), points.filter((_, i) => i % 2 === 1)], [points]);
  const wire = useMemo(
    () => new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: "#2a2a2a", transparent: true, opacity: 0.6 })),
    [points],
  );
  useEffect(() => {
    const d = new THREE.Object3D();
    [a.current, b.current].forEach((m, k) => {
      if (!m) return;
      halves[k].forEach((p, i) => {
        d.position.copy(p);
        d.updateMatrix();
        m.setMatrixAt(i, d.matrix);
      });
      m.count = halves[k].length;
      m.instanceMatrix.needsUpdate = true;
    });
  }, [halves]);
  useFrame(({ clock }) => {
    const n = (scene.userData as { night?: number }).night ?? 0;
    const t = clock.elapsedTime;
    ma.emissiveIntensity = n * (5 + Math.sin(t * 2.2) * 2.2);
    mb.emissiveIntensity = n * (5 + Math.sin(t * 2.2 + Math.PI) * 2.2);
  });
  return (
    <group>
      <primitive object={wire} />
      <instancedMesh ref={a} args={[geo, ma, Math.max(1, halves[0].length)]} frustumCulled={false} />
      <instancedMesh ref={b} args={[geo, mb, Math.max(1, halves[1].length)]} frustumCulled={false} />
    </group>
  );
}

/** A sagging catenary-ish string between two points. */
export function sagLine(from: THREE.Vector3, to: THREE.Vector3, sag: number, n: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = from.clone().lerp(to, t);
    p.y -= Math.sin(Math.PI * t) * sag;
    out.push(p);
  }
  return out;
}
