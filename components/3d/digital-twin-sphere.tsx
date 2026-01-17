"use client"

import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Sphere, MeshDistortMaterial, Float, OrbitControls } from "@react-three/drei"
import type * as THREE from "three"

interface AnimatedSphereProps {
  status: "synced" | "learning" | "predicting"
}

function AnimatedSphere({ status }: AnimatedSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  const config = useMemo(() => {
    switch (status) {
      case "synced":
        return { distort: 0.2, speed: 1, color: "#6b7280" }
      case "learning":
        return { distort: 0.4, speed: 2, color: "#9ca3af" }
      case "predicting":
        return { distort: 0.3, speed: 1.5, color: "#d1d5db" }
    }
  }, [status])

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color={config.color}
          attach="material"
          distort={config.distort}
          speed={config.speed}
          roughness={0.4}
          metalness={0.8}
        />
      </Sphere>

      {/* Wireframe overlay */}
      <Sphere args={[1.6, 32, 32]}>
        <meshBasicMaterial color="#4b5563" wireframe transparent opacity={0.15} />
      </Sphere>
    </Float>
  )
}

interface DigitalTwinSphereProps {
  status?: "synced" | "learning" | "predicting"
  className?: string
}

export function DigitalTwinSphere({ status = "synced", className }: DigitalTwinSphereProps) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <AnimatedSphere status={status} />
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  )
}
