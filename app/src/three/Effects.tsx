// Post-processing for the rooftop: ambient occlusion so the boxes sit on the
// ground, bloom so the sun and lit windows glow, SMAA, a soft vignette and
// Khronos PBR Neutral tone mapping (keeps the palette's base colours intact).

import { useFrame, useThree } from "@react-three/fiber";
import { N8AOPostPass } from "n8ao";
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, ToneMappingEffect, ToneMappingMode, VignetteEffect } from "postprocessing";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

export type Quality = "high" | "medium" | "low";

/** Pick a render tier from the device; `?quality=` in the URL overrides it. */
export function pickQuality(lowPower: boolean): Quality {
  if (typeof window !== "undefined") {
    const q = new URLSearchParams(window.location.hash.split("?")[1] ?? window.location.search).get("quality");
    if (q === "high" || q === "medium" || q === "low") return q;
  }
  return lowPower ? "medium" : "high";
}

export function Effects({ quality }: { quality: Exclude<Quality, "low"> }) {
  const { gl, scene, camera, size } = useThree();

  const { composer, ao, bloom } = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType });
    composer.addPass(new RenderPass(scene, camera));
    let ao: N8AOPostPass | null = null;
    if (quality === "high") {
      ao = new N8AOPostPass(scene, camera, size.width, size.height);
      Object.assign(ao.configuration, {
        aoRadius: 2.4,
        distanceFalloff: 1.2,
        intensity: 2.6,
        halfRes: true,
        aoSamples: 12,
        denoiseSamples: 6,
        denoiseRadius: 10,
        gammaCorrection: false,
      });
      composer.addPass(ao);
    }
    const bloom = new BloomEffect({ luminanceThreshold: 0.92, luminanceSmoothing: 0.18, intensity: 0.85, mipmapBlur: true, radius: 0.72 });
    composer.addPass(
      new EffectPass(
        camera,
        bloom,
        new SMAAEffect(),
        new VignetteEffect({ offset: 0.32, darkness: 0.42 }),
        new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      ),
    );
    return { composer, ao, bloom };
    // The composer is rebuilt only when the tier or the scene graph changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera, quality]);

  useEffect(() => {
    const prev = gl.toneMapping;
    gl.toneMapping = THREE.NoToneMapping;
    return () => {
      gl.toneMapping = prev;
      composer.dispose();
    };
  }, [gl, composer]);

  useEffect(() => {
    composer.setSize(size.width, size.height, false);
    ao?.setSize(size.width, size.height);
  }, [composer, ao, size.width, size.height]);

  // Night makes lit windows and the lantern the brightest things on screen;
  // let bloom catch more of them.
  useFrame(() => {
    const n = (scene.userData as { night?: number }).night ?? 0;
    bloom.intensity = 0.45 + n * 1.1;
    bloom.luminanceMaterial.threshold = 1.05 - n * 0.45;
  });

  useFrame((_, dt) => composer.render(dt), 1);
  return null;
}
