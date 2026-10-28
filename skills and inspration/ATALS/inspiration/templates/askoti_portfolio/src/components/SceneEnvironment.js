import { Grid, ContactShadows } from "@react-three/drei"
import { useMemo } from "react"
import * as THREE from "three"

// Pre-define shared resources to avoid recreation on every render
const wallGeom = new THREE.PlaneGeometry(400, 200)
const floorGeom = new THREE.BoxGeometry(400, 1, 400)
const wallMaterial = new THREE.MeshStandardMaterial({ color: "#151515", roughness: 1 })

export function SceneEnvironment() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <>
      <color attach="background" args={["#111111"]} />

      {/* Floor - Using shared geometry */}
      <mesh position={[0, -8.5, 0]} geometry={floorGeom} receiveShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Walls - Using shared geometry and material */}
      <mesh position={[0, 40, -100]} geometry={wallGeom} material={wallMaterial} />
      
      <mesh 
        position={[-100, 40, 0]} 
        rotation={[0, Math.PI / 2, 0]} 
        geometry={wallGeom} 
        material={wallMaterial} 
      />
      
      <mesh 
        position={[100, 40, 0]} 
        rotation={[0, -Math.PI / 2, 0]} 
        geometry={wallGeom} 
        material={wallMaterial} 
      />

      {/* Lights */}
      <ambientLight intensity={0.2} />
      
      <spotLight
        position={[0, 60, 20]}
        angle={0.4}
        penumbra={0.5}
        intensity={isMobile ? 5 : 10}
        // PERFORMANCE BOOST: Disable shadow maps on mobile
        castShadow={!isMobile} 
        shadow-mapSize={1024}
      />
      
      <pointLight position={[0, 20, -80]} intensity={0.5} color="#444444" />

      {/* Grid - Optimized for mobile vision */}
      <Grid
        position={[0, -7.95, 0]}
        args={[150, 150]}
        sectionColor="#333333"
        cellColor="#222222"
        sectionThickness={isMobile ? 1 : 1.5}
        infiniteGrid
        fadeDistance={isMobile ? 60 : 150}
        fadeStrength={5}
      />

      {/* Contact Shadows - THE PERFORMANCE KILLER FIXED */}
      <ContactShadows
        position={[0, -7.9, 0]}
        opacity={isMobile ? 0.4 : 0.7}
        scale={40}
        blur={isMobile ? 2 : 1.5}
        far={15}
        color="#000000"
        // VERY IMPORTANT: Only render once. Zero performance hit after first frame.
        frames={1} 
      />
    </>
  )
}