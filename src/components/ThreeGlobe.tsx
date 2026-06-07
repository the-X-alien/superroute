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
      groupRef.current.rotation.y += delta * 0.12
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.04
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <MeshDistortMaterial
          color="#0a0806"
          emissive="#c99f2e"
          emissiveIntensity={0.06}
          roughness={0.5}
          metalness={0.3}
          wireframe
          distort={0.08}
          speed={0.4}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshBasicMaterial color="#c99f2e" wireframe transparent opacity={0.06} />
      </mesh>

      {routePoints && (
        <Line
          points={routePoints}
          color="#c99f2e"
          lineWidth={2}
          dashed={false}
        />
      )}

      {routePoints && routePoints.map((p, i) => (
        <mesh key={`marker-${i}`} position={p}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshBasicMaterial color={i === 0 ? "#c99f2e" : "#f0d080"} />
        </mesh>
      ))}

      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#c99f2e" />
      <pointLight position={[-5, -3, 2]} intensity={0.3} color="#d4a030" />
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
