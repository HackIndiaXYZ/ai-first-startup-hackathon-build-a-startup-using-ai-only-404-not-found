"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { Environment, AdaptiveDpr, Bvh } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"

import { CameraRig } from "./CameraRig"
import { SceneEnvironment } from "./SceneEnvironment"
import { FloatingPlatform } from "./FloatingPlatform"
import { TechWall } from "./TechWall"

export default function Showroom() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [introDone, setIntroDone] = useState(false)
  const [bootStep, setBootStep] = useState(0)

  // Memoize performance flags so they don't trigger re-renders
  const perfConfig = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    return {
      dpr: isMobile ? 1 : [1, 1.5],
      bloomIntensity: isMobile ? 0.8 : 1.2,
      bloomRadius: isMobile ? 0.4 : 0.7,
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    const handleVisualViewportResize = () => {
      const vv = window.visualViewport
      const height = vv ? vv.height : window.innerHeight
      document.documentElement.style.setProperty("--vh", `${height * 0.01}px`)
    }
    handleVisualViewportResize()
    window.addEventListener("resize", handleVisualViewportResize)
    
    document.body.style.overflow = "hidden"
    document.body.style.overscrollBehavior = "none"

    return () => window.removeEventListener("resize", handleVisualViewportResize)
  }, [])

  useEffect(() => {
    const steps = [300, 700, 1100, 1500, 1900]
    steps.forEach((time, i) => setTimeout(() => setBootStep(i + 1), time))
    const finish = setTimeout(() => setIntroDone(true), 2200)
    return () => clearTimeout(finish)
  }, [])

  if (!mounted) return <div style={{ background: "#000", width: "100vw", height: "100vh" }} />

  return (
    <div 
      style={{ 
        width: "100vw", 
        height: "calc(var(--vh, 1vh) * 100)", 
        position: "fixed", 
        inset: 0,
        background: "#000",
        overflow: "hidden",
        touchAction: "none"
      }}
    >
      {/* ===== INTRO OVERLAY (Unchanged logic, optimized styles) ===== */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: "8%",
          color: "#00ffff",
          fontFamily: "monospace",
          zIndex: 20,
          opacity: introDone ? 0 : 1,
          transition: "opacity 0.8s ease-in-out",
          pointerEvents: "none"
        }}
      >
        <div style={{ fontSize: "0.8rem", opacity: 0.5, marginBottom: 15 }}>SYSTEM_BOOT_INIT</div>
        {bootStep >= 1 && <div>&gt; CORE_READY</div>}
        {bootStep >= 2 && <div>&gt; ENV_LOADED</div>}
        {bootStep >= 3 && <div>&gt; MESH_MOUNTED</div>}
        {bootStep >= 4 && <div style={{ color: "#fff" }}>&gt; UI_ACTIVE</div>}
      </div>

      {/* ===== 3D SCENE ===== */}
      <Canvas
        shadows
        camera={{ fov: 45, near: 0.5, far: 1500, position: [0, 15, 120] }}
        dpr={perfConfig.dpr}
        gl={{ 
          powerPreference: "high-performance",
          antialias: false, 
          stencil: false,
          depth: true,
          alpha: false // Faster rendering for opaque backgrounds
        }}
      >
        <color attach="background" args={["#000000"]} />

        {/* Bvh helps with raycasting/interaction performance */}
        <Bvh firstHitOnly>
          <Suspense fallback={null}>
            <CameraRig onIndexChange={setCurrentIndex} />
            <SceneEnvironment />
            <FloatingPlatform activeIndex={currentIndex} />
            <TechWall />
            {/* Single global environment call */}
            <Environment preset="night" />
          </Suspense>
        </Bvh>

        {/* Dynamic DPR adjustment based on frame stress */}
        <AdaptiveDpr pixelated />

        <EffectComposer disableNormalPass multisampling={0}>
          <Bloom 
            intensity={perfConfig.bloomIntensity} 
            luminanceThreshold={0.2} 
            mipmapBlur 
            radius={perfConfig.bloomRadius}
          />
        </EffectComposer>
      </Canvas>
    </div>
  )
}