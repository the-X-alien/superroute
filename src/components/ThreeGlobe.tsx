import { useRef, useMemo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Line, MeshDistortMaterial } from "@react-three/drei"
import * as THREE from "three"

function GlobeInner({ autoRotate = true, routeCoords }: { autoRotate?: boolean; routeCoords?: [number, number][] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  const routePoints = useMemo(() => {
    if (!routeCoords?.length) return null
    return routeCoords.map(([lng, lat]) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const r = 2.05
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      )
    })
  }, [routeCoords])

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.15
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <MeshDistortMaterial
          color="#0a1628"
          emissive="#00f0d8"
          emissiveIntensity={0.08}
          roughness={0.4}
          metalness={0.6}
          wireframe
          distort={0.1}
          speed={0.5}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshBasicMaterial color="#00f0d8" wireframe transparent opacity={0.08} />
      </mesh>

      {routePoints && (
        <Line
          points={routePoints}
          color="#00f0d8"
          lineWidth={2}
          dashed={false}
        />
      )}

      {routePoints && routePoints.map((p, i) => (
        <mesh key={`marker-${i}`} position={p}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={i === 0 ? "#7c3aed" : "#00f0d8"} />
        </mesh>
      ))}

      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#00f0d8" />
      <pointLight position={[-5, -3, 2]} intensity={0.4} color="#7c3aed" />
    </group>
  )
}

export default function ThreeGlobe({
  className,
  routeCoords,
  autoRotate = true,
}: {
  className?: string
  routeCoords?: [number, number][]
  autoRotate?: boolean
}) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <GlobeInner autoRotate={autoRotate} routeCoords={routeCoords} />
        <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
