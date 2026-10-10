// Scene state shared with the pages. Kept out of RoofScene so importing it
// doesn't pull three.js into the page chunk; the scene itself is lazy-loaded.

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
