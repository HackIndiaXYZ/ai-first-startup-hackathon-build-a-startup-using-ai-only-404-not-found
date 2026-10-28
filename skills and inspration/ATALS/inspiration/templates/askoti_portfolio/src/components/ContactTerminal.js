import React, { useRef } from "react"
import { Html } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function ContactTerminal({ visible }) {
  const ring1Ref = useRef()
  const ring2Ref = useRef()

  // High-performance rotation for the "Tech Rings"
  useFrame((state) => {
    if (!ring1Ref.current) return
    const t = state.clock.getElapsedTime()
    ring1Ref.current.rotation.z = t * 0.7
    ring2Ref.current.rotation.z = -t * 0.3
  })

  const contacts = [
    { label: "GITHUB", desc: "Source Code", link: "https://github.com/askoti", color: "hover:text-purple-400" },
    { label: "EMAIL", desc: "Direct Contact", link: "mailto:kastriootaliiu@gmail.com", color: "hover:text-blue-400" },
    { label: "LINKEDIN", desc: "Professional", link: "#", color: "hover:text-blue-600" },
    { label: "UPWORK", desc: "Freelance", link: "#", color: "hover:text-green-500" }
  ]

  return (
<group position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
  
        {/* 3D VISUALS: Expanded Deco Rings */}
        {/* Inner Ring: Increased from 6 to 12 */}
        <mesh ref={ring1Ref}>
          <ringGeometry args={[7.3, 8, 80]} /> 
          <meshBasicMaterial color="#ffffff" transparent opacity={0.15} wireframe />
        </mesh>
        
        {/* Outer Decorative Ring: Increased from 5.5 to 14 */}
        <mesh ref={ring2Ref}>
          <ringGeometry args={[12, 12.1, 4]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} wireframe />
        </mesh>
      <Html
        transform
        distanceFactor={8.1}
        position={[0, 0, 0.1]}
        style={{
          transition: 'all 0.8s ease',
          opacity: visible ? 1 : 0,
          transform: `scale(${visible ? 1 : 0.5})`,
          pointerEvents: visible ? 'auto' : 'none'
        }}
      >
        <div className="flex items-center justify-center w-[600px] h-[600px] relative">
          
          {/* Central Pulsing Core */}
          <div className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          
          {/* Floating Buttons in a Diamond Grid */}
          <div className="grid grid-cols-2 gap-12 relative z-10">
              {contacts.map((c, i) => (
                <a
                  key={i}
                  href={c.link}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center w-54 h-54 md:w-56 md:h-56 bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 hover:border-white/40 hover:bg-white/5 hover:-translate-y-2 group overflow-hidden"
                >
                  {/* --- ROTATED CONTENT START --- */}
                  <div className="flex flex-col items-center justify-center rotate-[-90deg]"> 
                    <span className="text-white text-3xl md:text-2xl font-black tracking-widest group-hover:text-blue-400 transition-colors">
                      {c.label}
                    </span>
                    <span className="text-[17px] text-gray-300 uppercase tracking-[0.2em] mt-2">
                      {c.desc}
                    </span>
                  </div>
                  {/* --- ROTATED CONTENT END --- */}
                  
                  {/* Corner Accents (These stay fixed to the box corners) */}
                  <div className="absolute top-4 left-4 w-3 h-3 border-l border-t border-white/20 group-hover:border-blue-400" />
                  <div className="absolute bottom-4 right-4 w-3 h-3 border-r border-b border-white/20 group-hover:border-blue-400" />
                </a>
              ))}
          </div>

          {/* Rotating Data Labels (Outer CSS Decoration) */}
          <div className="absolute inset-0 rounded-full border border-dashed border-white/5 animate-[spin_20s_linear_infinite]" />
        </div>
      </Html>
    </group>
  )
}