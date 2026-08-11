import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { H, NOSE_TIP, edgesOf } from './geometry'
import { hostileEdgeMaterial, hostileHullMaterial, PALETTE } from './materials'
import { scrollState } from '../lib/scrollStore'

/** Where the intruder settles once it is being tracked. */
const STATION = new THREE.Vector3(3.05, 1.15, -2.6)
/** Where it comes in from. */
const INGRESS = new THREE.Vector3(10, 3.2, -10)

/** Section 04 window, in section-space units. */
const ENTER = 2.5
const LOCK_START = 2.7
const LOCK_END = 2.94
const EXIT = 3.72

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

function HostilePart({
  geometry,
  position,
  rotation,
}: {
  geometry: THREE.BufferGeometry
  position?: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={hostileHullMaterial} />
      <lineSegments geometry={edgesOf(geometry)} material={hostileEdgeMaterial} />
    </group>
  )
}

/** Billboarded corner brackets that appear at lock. */
function Reticle({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<THREE.LineBasicMaterial[]>([])
  const t = useRef(0)

  const corners = useMemo(() => {
    const s = 0.58
    const arm = 0.2
    const pts: [number, number][][] = []
    for (const [sx, sy] of [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ] as const) {
      pts.push([
        [sx * s, sy * (s - arm)],
        [sx * s, sy * s],
        [sx * (s - arm), sy * s],
      ])
    }
    return pts.map((p) => p.map(([x, y]) => new THREE.Vector3(x, y, 0)))
  }, [])

  useFrame((_, delta) => {
    t.current += delta
    const lock = smoothstep(LOCK_START, LOCK_END, scrollState.progress)
    const out = 1 - smoothstep(EXIT - 0.35, EXIT, scrollState.progress)
    const pulse = animate ? 0.72 + Math.sin(t.current * 3.4) * 0.28 : 1
    const o = lock * out * pulse

    if (group.current) {
      group.current.visible = o > 0.01
      const s = 1 + (1 - lock) * 0.9
      group.current.scale.setScalar(s)
    }
    for (const m of mats.current) if (m) m.opacity = o
  })

  return (
    <Billboard>
      <group ref={group}>
        {corners.map((pts, i) => (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              ref={(m) => {
                if (m) mats.current[i] = m
              }}
              color={PALETTE.accent}
              transparent
              opacity={0}
              toneMapped={false}
              depthTest={false}
            />
          </line>
        ))}
      </group>
    </Billboard>
  )
}

export interface HostileProps {
  animate: boolean
  hostileRef: React.RefObject<THREE.Group | null>
}

/**
 * The intruder. Flying-wing delta so the silhouette can never be confused with
 * the primary airframe at a glance.
 */
export function Hostile({ animate, hostileRef }: HostileProps) {
  const drift = useRef<THREE.Group>(null)
  const t = useRef(0)

  useFrame((_, delta) => {
    t.current += delta
    const p = scrollState.progress
    const inT = smoothstep(ENTER, LOCK_END, p)
    const outT = 1 - smoothstep(EXIT - 0.4, EXIT, p)

    const g = hostileRef.current
    if (!g) return
    g.visible = inT > 0.002 && outT > 0.002
    g.position.lerpVectors(INGRESS, STATION, inT)
    g.scale.setScalar(0.9 * outT + 0.0001)
    // Nose held roughly toward the primary, with a slow yaw wander.
    g.rotation.y = Math.PI * 0.78 + (animate ? Math.sin(t.current * 0.4) * 0.12 : 0)

    if (drift.current && animate) {
      drift.current.rotation.z = Math.sin(t.current * 0.7) * 0.09
      drift.current.position.y = Math.sin(t.current * 0.55) * 0.05
    }
  })

  return (
    <group ref={hostileRef} position={INGRESS.toArray()} visible={false}>
      <group ref={drift}>
        <HostilePart geometry={H.body} position={[0, 0, 0]} />
        <HostilePart geometry={H.spine} position={[0, 0.07, 0.02]} />
        <HostilePart geometry={H.fin} position={[0.34, 0.11, -0.32]} rotation={[0, 0, -0.3]} />
        <HostilePart geometry={H.fin} position={[-0.34, 0.11, -0.32]} rotation={[0, 0, 0.3]} />
        <Reticle animate={animate} />
      </group>
    </group>
  )
}

/**
 * Detection volume projected from the primary's nose. It sweeps while
 * searching, then narrows onto the intruder as the track is established.
 */
export function DetectionCone({
  animate,
  airframeRef,
  hostileRef,
}: {
  animate: boolean
  airframeRef: React.RefObject<THREE.Group | null>
  hostileRef: React.RefObject<THREE.Group | null>
}) {
  const cone = useRef<THREE.Group>(null)
  const fill = useRef<THREE.MeshBasicMaterial>(null)
  const rim = useRef<THREE.LineBasicMaterial>(null)
  const axisRef = useRef<THREE.LineBasicMaterial>(null)
  const t = useRef(0)

  // Unit cone: apex at the origin, axis along +Z, base radius 1 at z = 1.
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(1, 1, 10, 1, true)
    g.translate(0, -0.5, 0)
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  /**
   * Deliberately not a wireframe of the cone. Seen near-axially — which is
   * exactly how section 04 frames it — every generatrix piles up into what
   * looks like a searchlight. Two range rings on the boresight carry the same
   * information and stay a diagram.
   */
  const wire = useMemo(() => {
    const verts: number[] = []
    const ring = (z: number, r: number, segs = 28) => {
      for (let i = 0; i < segs; i++) {
        const a = (i / segs) * Math.PI * 2
        const b = ((i + 1) / segs) * Math.PI * 2
        verts.push(Math.cos(a) * r, Math.sin(a) * r, z, Math.cos(b) * r, Math.sin(b) * r, z)
      }
    }
    ring(1, 1)
    ring(0.52, 0.52)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    return g
  }, [])

  const apex = useMemo(() => new THREE.Vector3(), [])
  const aim = useMemo(() => new THREE.Vector3(), [])
  const search = useMemo(() => new THREE.Vector3(), [])
  const hostilePos = useMemo(() => new THREE.Vector3(), [])

  useFrame((_, delta) => {
    t.current += delta
    const p = scrollState.progress
    const vis = smoothstep(ENTER - 0.15, LOCK_START, p) * (1 - smoothstep(EXIT - 0.4, EXIT, p))

    const g = cone.current
    if (!g) return
    g.visible = vis > 0.004
    if (!g.visible) return

    // Apex rides the airframe's nose through its live world transform.
    apex.copy(NOSE_TIP)
    if (airframeRef.current) apex.applyMatrix4(airframeRef.current.matrixWorld)
    g.position.copy(apex)

    const lock = smoothstep(LOCK_START, LOCK_END, p)
    if (hostileRef.current) hostilePos.setFromMatrixPosition(hostileRef.current.matrixWorld)

    // Pre-lock the aperture sweeps a slow arc; post-lock it sits on the track.
    const s = animate ? t.current : 0
    search.set(
      Math.sin(s * 0.55) * 7 + 3,
      1.6 + Math.sin(s * 0.4) * 1.1,
      -6 + Math.cos(s * 0.55) * 3,
    )
    aim.lerpVectors(search, hostilePos, lock)

    g.lookAt(aim)
    const dist = apex.distanceTo(aim)
    // Aperture narrows from 6° searching to 2° tracking.
    const halfAngle = THREE.MathUtils.lerp(0.105, 0.035, lock)
    const radius = Math.tan(halfAngle) * dist
    g.scale.set(radius, radius, dist)

    if (fill.current) fill.current.opacity = vis * (0.006 + lock * 0.012)
    if (rim.current) rim.current.opacity = vis * (0.08 + lock * 0.3)
    if (axisRef.current) axisRef.current.opacity = vis * lock * 0.6
  })

  return (
    <>
      <group ref={cone} visible={false}>
        <mesh geometry={geo}>
          <meshBasicMaterial
            ref={fill}
            color={PALETTE.accent}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <lineSegments geometry={wire}>
          <lineBasicMaterial
            ref={rim}
            color={PALETTE.accent}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </lineSegments>
        {/* Boresight down the centre of the volume. */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[new Float32Array([0, 0, 0, 0, 0, 1]), 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={axisRef}
            color={PALETTE.accent}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </line>
      </group>
    </>
  )
}
