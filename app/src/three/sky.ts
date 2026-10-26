import * as THREE from "three";

export interface SkyLook {
  top: THREE.Color;
  horizon: THREE.Color;
  sun: THREE.Color;
  sunIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  fog: THREE.Color;
  /** 0 at day, 1 at full night */
  night: number;
}

const C = (hex: string) => new THREE.Color(hex);

// Keyframes by sun elevation (degrees). Dawn and dusk differ slightly: dawn
// leans pink, dusk leans saffron.
const KEYS = [
  { el: -14, top: "#070d22", horizonAm: "#152042", horizonPm: "#1a2246", sun: "#30406f", si: 0, hemi: 0.22 },
  { el: -5, top: "#16224a", horizonAm: "#9f6f8c", horizonPm: "#b8644a", sun: "#ff8a5c", si: 0.1, hemi: 0.35 },
  { el: 2, top: "#4b6aa8", horizonAm: "#f4b7a2", horizonPm: "#f6a15a", sun: "#ff9c55", si: 1.2, hemi: 0.6 },
  { el: 12, top: "#5d8bd0", horizonAm: "#f6d9bf", horizonPm: "#f8cd94", sun: "#ffd3a0", si: 2.3, hemi: 0.85 },
  { el: 35, top: "#4a82d6", horizonAm: "#d3e4f4", horizonPm: "#dbe5ef", sun: "#fff4e3", si: 3.0, hemi: 1.0 },
  { el: 75, top: "#3d78d4", horizonAm: "#dce9f6", horizonPm: "#dce9f6", sun: "#ffffff", si: 3.3, hemi: 1.05 },
];

const smooth = (t: number) => t * t * (3 - 2 * t);

export function skyLook(elevation: number, afternoon: boolean): SkyLook {
  let i = 0;
  while (i < KEYS.length - 2 && elevation > KEYS[i + 1].el) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const t = smooth(Math.max(0, Math.min(1, (elevation - a.el) / (b.el - a.el))));
  const top = C(a.top).lerp(C(b.top), t);
  const horizon = C(afternoon ? a.horizonPm : a.horizonAm).lerp(C(afternoon ? b.horizonPm : b.horizonAm), t);
  const sun = C(a.sun).lerp(C(b.sun), t);
  const night = Math.max(0, Math.min(1, (2 - elevation) / 12));
  return {
    top,
    horizon,
    sun,
    sunIntensity: a.si + (b.si - a.si) * t,
    hemiSky: top.clone().lerp(C("#ffffff"), 0.35),
    hemiGround: C("#8a7a64").lerp(C("#1a1d2a"), night),
    hemiIntensity: a.hemi + (b.hemi - a.hemi) * t,
    fog: horizon.clone(),
    night,
  };
}

export function sunVector(elevationDeg: number, azimuthDeg: number, distance = 60): THREE.Vector3 {
  const el = (elevationDeg * Math.PI) / 180;
  const az = (azimuthDeg * Math.PI) / 180;
  // x = east, y = up, z = south (north is −z)
  return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), -Math.cos(az) * Math.cos(el)).multiplyScalar(distance);
}

export const skyVertex = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize((modelMatrix * vec4(position, 1.0)).xyz);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;
}
`;

export const skyFragment = /* glsl */ `
uniform vec3 uTop;
uniform vec3 uHorizon;
uniform vec3 uSun;
uniform vec3 uSunDir;
uniform float uNight;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  vec3 col = mix(uHorizon, uTop, pow(clamp(h, 0.0, 1.0), 0.55));
  col = mix(col, uHorizon * 0.55, smoothstep(0.0, -0.25, h));
  float s = max(dot(d, normalize(uSunDir)), 0.0);
  float vis = smoothstep(-0.12, 0.05, normalize(uSunDir).y);
  col += uSun * (pow(s, 12.0) * 0.35 + pow(s, 120.0) * 0.6) * vis;
  col = mix(col, vec3(1.0, 0.97, 0.9), smoothstep(0.9993, 0.9996, s) * vis);
  // Stars, only above the horizon at night.
  float st = step(0.9975, hash(floor(d * 380.0))) * uNight * smoothstep(0.05, 0.3, h);
  col += vec3(st) * 0.9;
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
