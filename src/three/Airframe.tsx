import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { G, ROTOR_POSITIONS, edgesOf } from './geometry'
import { edgeMaterial, hullMaterial, subMaterial, PALETTE } from './materials'

interface PartProps {
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number] | number
  sub?: boolean
  children?: ReactNode
}

/**
 * One structural part: matte fill plus a hairline wireframe of its hard edges.
 * Every visible piece of the airframe goes through here, so the schematic
 * treatment is applied uniformly and edge geometry is built once per shape.
 */
function Part({ geometry, position, rotation, scale, sub, children }: PartProps) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={sub ? subMaterial : hullMaterial} />
      <lineSegments geometry={edgesOf(geometry)} material={edgeMaterial} />
      {children}
    </group>
  )
}

function LiftUnit({
  position,
  spin,
  reversed,
}: {
  position: [number, number, number]
  spin: boolean
  reversed: boolean
}) {
  const disc = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!spin || !disc.current) return
    // Idling, not flying. Slow enough to read as "armed" rather than "in lift".
    disc.current.rotation.y += delta * (reversed ? -0.9 : 0.9)
  })

  return (
    <group position={position}>
      <Part geometry={G.rotorPod} sub />
      <Part geometry={G.rotorRing} position={[0, 0.1, 0]} sub />
      <group ref={disc} position={[0, 0.1, 0]}>
        {[0, 1, 2].map((i) => (
          <Part
            key={i}
            geometry={G.rotorBlade}
            rotation={[0, (i * Math.PI * 2) / 3, 0]}
            sub
          />
        ))}
      </group>
    </group>
  )
}

/** Single accent element on the airframe: the anti-collision strobe. */
function Strobe({ animate }: { animate: boolean }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    if (!animate || !mat.current) return
    t.current += delta
    // Double-flash pattern on a 1.6 s cycle.
    const c = t.current % 1.6
    const flash = c < 0.06 || (c > 0.18 && c < 0.24) ? 1 : 0.06
    mat.current.opacity = flash
  })

  return (
    <mesh position={[0, 0.28, -0.32]}>
      <sphereGeometry args={[0.028, 6, 5]} />
      <meshBasicMaterial
        ref={mat}
        color={PALETTE.accent}
        transparent
        opacity={animate ? 0.06 : 0.85}
        toneMapped={false}
      />
    </mesh>
  )
}

export interface AirframeProps {
  /** Idle drift, rotor spin and strobe are all suppressed when false. */
  animate: boolean
  /**
   * Exposed so the detection cone and the callouts can read live world
   * transforms off the airframe each frame.
   */
  groupRef: React.RefObject<THREE.Group | null>
}

export function Airframe({ animate, groupRef }: AirframeProps) {
  const drift = useRef<THREE.Group>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    if (!animate) return
    t.current += delta

    // Slow yaw: one revolution roughly every 75 s.
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.084

    // Idle drift. Three incommensurate periods so it never visibly loops.
    if (drift.current) {
      const s = t.current
      drift.current.rotation.x = Math.sin(s * 0.31) * 0.035 + Math.sin(s * 0.13) * 0.02
      drift.current.rotation.z = Math.sin(s * 0.23) * 0.045
      drift.current.position.y = Math.sin(s * 0.19) * 0.055
      drift.current.position.x = Math.sin(s * 0.11) * 0.03
    }
  })

  return (
    <group ref={groupRef} rotation={[0, animate ? 0 : 0.55, 0]}>
      <group ref={drift}>
        {/* Fuselage */}
        <Part geometry={G.noseCone} position={[0, 0, 1.34]} />
        <Part geometry={G.midBody} position={[0, 0, 0.34]} />
        <Part geometry={G.tailCone} position={[0, 0, -0.92]} rotation={[0, Math.PI, 0]} />
        <Part geometry={G.dorsalSpine} position={[0, 0.19, -0.1]} sub />

        {/* Main wing and winglets */}
        <Part geometry={G.wing} position={[0, -0.03, -0.1]} />
        <Part geometry={G.winglet} position={[1.44, 0.06, -0.34]} sub />
        <Part geometry={G.winglet} position={[-1.44, 0.06, -0.34]} sub />

        {/* V-tail */}
        <Part geometry={G.tailFin} position={[0.06, 0.06, -1.18]} rotation={[0, 0, -0.62]} />
        <Part
          geometry={G.tailFin}
          position={[-0.06, 0.06, -1.18]}
          rotation={[0, 0, Math.PI + 0.62]}
        />

        {/* Lift-rotor booms and the four lift units */}
        <Part geometry={G.rotorBoom} position={[1.02, -0.02, -0.15]} sub />
        <Part geometry={G.rotorBoom} position={[-1.02, -0.02, -0.15]} sub />
        {ROTOR_POSITIONS.map((p, i) => (
          <LiftUnit key={i} position={p} spin={animate} reversed={i % 2 === 1} />
        ))}

        {/* Visual-inertial sensor head */}
        <Part geometry={G.sensorMount} position={[0, -0.13, 0.98]} sub />
        <Part geometry={G.sensorHead} position={[0, -0.24, 0.98]} sub />

        {/* Payload bay and terrain-correlation pod */}
        <Part geometry={G.payloadBay} position={[0, -0.24, 0.2]} sub />
        <Part geometry={G.terrainPod} position={[0, -0.31, -0.3]} sub />

        {/* Comms mast */}
        <Part geometry={G.commsMast} position={[0, 0.34, -0.9]} sub />

        <Strobe animate={animate} />
      </group>
    </group>
  )
}
