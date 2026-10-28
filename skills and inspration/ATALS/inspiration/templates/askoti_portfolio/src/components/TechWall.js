import { useMemo } from "react"
import { Text, useTexture, Float } from "@react-three/drei"
import * as THREE from "three"

/* =========================
   PERFORMANCE-CRITICAL CONSTANTS
========================= */
const boxGeom = new THREE.BoxGeometry(8, 12, 0.5)
const sideGeom = new THREE.BoxGeometry(0.1, 12, 0.6)
const iconGeom = new THREE.PlaneGeometry(3.5, 3.5)

// One material for all slabs (Frosted Glass Look)
const sharedSlabMaterial = new THREE.MeshStandardMaterial({
  color: "#ffffff",
  transparent: true,
  opacity: 0.4,       // High enough to see, low enough to look like glass
  roughness: 0.1,
  metalness: 0.2,
  side: THREE.DoubleSide
})

const sharedSideMaterial = new THREE.MeshStandardMaterial({ 
  color: "#111111", 
  metalness: 0.8, 
  roughness: 0.2 
})

const techColors = {
  HTML5: "#E34F26", CSS3: "#1572B6", Javascript: "#F7DF1E", NEXT: "#fff",
  REACT: "#61DAFB", TAILWIND: "#38BDF8", NODE: "#339933", PYTHON: "#3776AB",
  DJANGO: "#092E20", GIT: "#F05032", DOCKER: "#2496ED", PostgreSQL: "#336791",
  MONGO: "#47A248", SQL: "#CC2927", PANDAS: "#150458", NUMPY: "#013243",
  GITHUB: "#fff", N8N: "#EA4B71", Three: "#fff", Blender: "#F5792A"
}

/* =========================
   PANEL COMPONENT
========================= */
function Panel({ position, rotation, name, iconTexture, color, isMobile }) {
  return (
    <Float 
      speed={isMobile ? 0 : 1.2} 
      rotationIntensity={0.1} 
      floatIntensity={isMobile ? 0.1 : 0.5}
    >
      <group position={position} rotation={rotation}>
        {/* The Glass Slab */}
        <mesh geometry={boxGeom} material={sharedSlabMaterial} />

        {/* Side Accent Line */}
        <mesh position={[4.1, 0, 0]} geometry={sideGeom} material={sharedSideMaterial} />

        <group position={[0, 0, 0.3]}>
          {/* Tech Icon - FIXED BLACK BACKGROUND */}
          <mesh position={[0, 1.8, 0.1]} geometry={iconGeom}>
            <meshStandardMaterial
              map={iconTexture}
              transparent={true}
              alphaTest={0.1} // Discards pixels that are almost transparent
              depthWrite={false} // Prevents "box" clipping artifacts
              emissive={color}
              emissiveIntensity={0.5}
              color={color}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Tech Name */}
          <Text
            position={[0, -2.5, 0.1]}
            fontSize={0.8}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {name.toUpperCase()}
          </Text>
        </group>
      </group>
    </Float>
  )
}

/* =========================
   TECH WALL
========================= */
export function TechWall() {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  const techGroups = {
    back: { names: ["HTML5", "CSS3", "Javascript", "NEXT", "REACT"], rot: [0, 0, 0], startIdx: 0 },
    left: { names: ["TAILWIND", "NODE", "PYTHON", "DJANGO", "GIT"], rot: [0, Math.PI / 2, 0], startIdx: 5 },
    right: { names: ["DOCKER", "PostgreSQL", "MONGO", "SQL", "PANDAS"], rot: [0, -Math.PI / 2, 0], startIdx: 10 },
    front: { names: ["NUMPY", "GITHUB", "N8N", "Three", "Blender"], rot: [0, Math.PI, 0], startIdx: 15 }
  }

  const allIconsList = useMemo(() => Object.values(techGroups).flatMap(g => g.names), [])
  const textures = useTexture(allIconsList.map(name => `/icons/${name.toLowerCase()}.svg`))

  const positions = [-45, -22, 0, 22, 45]
  const dist = 70

  return (
    <group position={[0, 5, 0]}>
      {Object.entries(techGroups).map(([key, group]) => 
        group.names.map((name, i) => {
          // Calculate if it's an X-axis or Z-axis wall
          const isSide = key === 'left' || key === 'right'
          const pos = isSide 
            ? [key === 'left' ? -dist : dist, 0, positions[i]]
            : [positions[i], 0, key === 'back' ? -dist : dist]

          return (
            <Panel
              key={`${key}-${name}`}
              position={pos}
              rotation={group.rot}
              name={name}
              iconTexture={textures[group.startIdx + i]}
              color={techColors[name]}
              isMobile={isMobile}
            />
          )
        })
      )}
    </group>
  )
}