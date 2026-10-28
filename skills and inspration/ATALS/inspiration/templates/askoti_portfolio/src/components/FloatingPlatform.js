import React, { useMemo } from "react"
import { Float } from "@react-three/drei"
import { ContactTerminal } from "./ContactTerminal"
import { ServicesCard } from "./ServicesCard"
import { ProfileCard } from "./ProfileCard"
import { AboutCard } from "./AboutCard"
import { ProjectsCard } from "./ProjectsCard"

export function FloatingPlatform({ activeIndex }) {
  // Memoize cylinder geometry args for performance
  const cylinderArgs = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768
    return [11, 11.5, 2, isMobile ? 32 : 48] // fewer segments on mobile
  }, [])

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  return (
    <group position={[0, -7, 0]}>
      <Float
        speed={1}
        rotationIntensity={isMobile ? 0.01 : 0.02}
        floatIntensity={isMobile ? 0.05 : 0.1}
      >
        <mesh castShadow={!isMobile} receiveShadow={!isMobile}>
          <cylinderGeometry args={cylinderArgs} />
          <meshStandardMaterial color="#050505" roughness={0.4} />
        </mesh>

        <group position={[0, 1.4, 0]}>
          <ProfileCard visible={activeIndex === 0} />
          <AboutCard visible={activeIndex === 1} />
          <ProjectsCard visible={activeIndex === 2} />
          <ServicesCard visible={activeIndex === 3} />
          <ContactTerminal visible={activeIndex === 4} />
        </group>
      </Float>
    </group>
  )
}
