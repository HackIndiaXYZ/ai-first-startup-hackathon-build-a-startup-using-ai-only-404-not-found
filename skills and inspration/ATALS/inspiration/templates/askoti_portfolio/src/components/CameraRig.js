import { useRef, useState, useEffect, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

export function CameraRig({ onIndexChange }) {
  const [targetIndex, setTargetIndex] = useState(0)
  const isTransitioning = useRef(false)
  const lastScrollTime = useRef(0)
  const touchStart = useRef(0)

  // Memoized vectors for zero-allocation frames
  const lerpPos = useRef(new THREE.Vector3(0, 0, 70))
  const lerpLook = useRef(new THREE.Vector3(0, 0, 0))
  const vTargetP = useMemo(() => new THREE.Vector3(), [])
  const vTargetL = useMemo(() => new THREE.Vector3(), [])

  const shots = useMemo(() => [
    { pos: [0, 0, 55], look: [0, 0, 0] },      
    { pos: [-55, 0, 0], look: [0, 0, 0] },     
    { pos: [0, 0, -55], look: [0, 0, 0] },     
    { pos: [55, 0, 0], look: [0, 0, 0] },      
    { pos: [0, 43, 0], look: [0, -10, 0] }
  ], [])

  useEffect(() => {
    const changeScene = (direction) => {
      const now = Date.now()
      // 1200ms cooldown is the "sweet spot" to prevent double-jumping
      if (now - lastScrollTime.current < 1200) return
      
      let nextIndex = targetIndex
      if (direction > 0 && targetIndex < shots.length - 1) nextIndex++
      else if (direction < 0 && targetIndex > 0) nextIndex--

      if (nextIndex !== targetIndex) {
        setTargetIndex(nextIndex)
        if (onIndexChange) onIndexChange(nextIndex)
        lastScrollTime.current = now
      }
    }

    const handleWheel = (e) => {
      // Ignore tiny micro-scrolls from trackpads
      if (Math.abs(e.deltaY) < 10) return
      changeScene(e.deltaY)
    }

    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientY
    }

    const handleTouchMove = (e) => {
      if (e.cancelable) e.preventDefault()
      
      const deltaY = touchStart.current - e.touches[0].clientY
      // Higher threshold for mobile swipes (60px) to ensure it's intentional
      if (Math.abs(deltaY) > 60) { 
        changeScene(deltaY)
        touchStart.current = e.touches[0].clientY
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    window.addEventListener("touchstart", handleTouchStart, { passive: true })
    window.addEventListener("touchmove", handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener("wheel", handleWheel)
      window.removeEventListener("touchstart", handleTouchStart)
      window.removeEventListener("touchmove", handleTouchMove)
    }
  }, [targetIndex, shots.length, onIndexChange])

  useFrame((state) => {
    const shot = shots[targetIndex]
    vTargetP.set(...shot.pos)
    vTargetL.set(...shot.look)

    // Smooth lerp factor - looks cinematic but feels responsive
    const lerpFactor = 0.045
    lerpPos.current.lerp(vTargetP, lerpFactor)
    lerpLook.current.lerp(vTargetL, lerpFactor)

    state.camera.position.copy(lerpPos.current)
    state.camera.lookAt(lerpLook.current)
  })

  return null
}