import * as THREE from "three";

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return { c, g: c.getContext("2d")! };
}

let cellTex: THREE.CanvasTexture | null = null;

/** A 545 Wp half-cut module: 6 × 24 half cells, silver grid, white frame line. */
export function panelTexture(): THREE.CanvasTexture {
  if (cellTex) return cellTex;
  const W = 512;
  const H = 256;
  const { c, g } = canvas(W, H);
  g.fillStyle = "#cfd6df";
  g.fillRect(0, 0, W, H);
  const cols = 24;
  const rows = 6;
  const pad = 6;
  const gap = 2;
  const cw = (W - pad * 2 - gap * (cols - 1)) / cols;
  const ch = (H - pad * 2 - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const x = pad + k * (cw + gap);
      const y = pad + r * (ch + gap);
      const grad = g.createLinearGradient(x, y, x + cw, y + ch);
      grad.addColorStop(0, "#1b2c56");
      grad.addColorStop(1, "#132042");
      g.fillStyle = grad;
      g.fillRect(x, y, cw, ch);
      g.strokeStyle = "rgba(190,205,230,0.35)";
      g.lineWidth = 0.8;
      for (let bb = 1; bb <= 4; bb++) {
        g.beginPath();
        g.moveTo(x + (cw * bb) / 5, y);
        g.lineTo(x + (cw * bb) / 5, y + ch);
        g.stroke();
      }
    }
  }
  // split line of half-cut modules
  g.fillStyle = "#cfd6df";
  g.fillRect(W / 2 - 2, 0, 4, H);
  cellTex = new THREE.CanvasTexture(c);
  cellTex.colorSpace = THREE.SRGBColorSpace;
  cellTex.anisotropy = 8;
  return cellTex;
}

let winTex: { map: THREE.CanvasTexture; emissive: THREE.CanvasTexture } | null = null;

/** Facade with windows; emissive map lights a random subset at night. */
export function windowTextures() {
  if (winTex) return winTex;
  const S = 256;
  const a = canvas(S, S);
  const e = canvas(S, S);
  a.g.fillStyle = "#ffffff";
  a.g.fillRect(0, 0, S, S);
  e.g.fillStyle = "#000000";
  e.g.fillRect(0, 0, S, S);
  const rows = 4;
  const cols = 4;
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const x = 22 + k * 58;
      const y = 26 + r * 60;
      a.g.fillStyle = "rgba(58,68,96,0.38)";
      a.g.fillRect(x + 3, y + 4, 24, 28);
      a.g.fillStyle = "rgba(255,255,255,0.55)";
      a.g.fillRect(x, y + 32, 30, 3);
      if ((r * 7 + k * 13) % 5 < 2) {
        e.g.fillStyle = (r + k) % 3 ? "#ffcf7a" : "#fff1c9";
        e.g.fillRect(x + 3, y + 4, 24, 28);
      }
    }
  }
  const map = new THREE.CanvasTexture(a.c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const emissive = new THREE.CanvasTexture(e.c);
  emissive.colorSpace = THREE.SRGBColorSpace;
  emissive.wrapS = emissive.wrapT = THREE.RepeatWrapping;
  winTex = { map, emissive };
  return winTex;
}
