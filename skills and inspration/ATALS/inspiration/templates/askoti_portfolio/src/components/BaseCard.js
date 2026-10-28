import React from "react"
import { Html } from "@react-three/drei"

export function BaseCard({ visible, children }) {
  return (
    <Html
      transform // HTML follows 3D rotation
      distanceFactor={15} // controls "size" in 3D
      position={[0, 9, 0]}
      style={{
        transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: visible ? 1 : 0,
        transform: `scale(${visible ? 1 : 0.5})`,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      {/* Glass slab */}
      <div className="
        relative
        w-[95vw] max-w-[1100px] 
        min-w-[620px] 
        h-auto sm:h-[600px] 
        bg-black/50 backdrop-blur-base border border-white/10 
        rounded-3xl 
        p-6 sm:p-8 md:p-10
        shadow-2xl 
        flex flex-col md:flex-row 
        items-center 
        gap-6 md:gap-12
        overflow-hidden
      ">
        {/* Subtle gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 w-full flex flex-col md:flex-row items-center gap-6 md:gap-12">
          {children}
        </div>
      </div>
    </Html>
  )
}
