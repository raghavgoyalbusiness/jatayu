import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Annotation } from '../lib/sections'
import { scrollState } from '../lib/scrollStore'
import { PALETTE } from './materials'

/** Scratch for the camera basis, so the per-frame path allocates nothing. */
const SCRATCH_FWD = new THREE.Vector3()

/**
 * A single schematic callout: a marker fixed to a point on the airframe, a
 * two-segment leader, and an HTML label at the far end.
 *
 * The anchor rides the model's transform, but the label is offset along the
 * camera's own right and up axes. That keeps callouts sitting exactly where
 * they were composed while the airframe rotates underneath them — a label
 * anchored in model space would swing across the copy once per revolution.
 *
 * The label is real DOM (drei portals it out of the canvas), so it is
 * selectable and readable by assistive tech. It fades with proximity to its
 * owning section rather than snapping on and off.
 */
function Callout({
  ann,
  section,
  parentRef,
}: {
  ann: Annotation
  section: number
  parentRef: React.RefObject<THREE.Object3D | null>
}) {
  const dot = useRef<THREE.Mesh>(null)
  const label = useRef<THREE.Group>(null)
  const leader = useRef<THREE.BufferAttribute>(null)
  const lineMat = useRef<THREE.LineBasicMaterial>(null)
  const dotMat = useRef<THREE.MeshBasicMaterial>(null)
  const html = useRef<HTMLDivElement>(null)
  const lastOpacity = useRef(-1)

  const anchorLocal = useMemo(() => new THREE.Vector3(...ann.anchor), [ann.anchor])
  const anchorWorld = useMemo(() => new THREE.Vector3(), [])
  const labelWorld = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(), [])
  const positions = useMemo(() => new Float32Array(9), [])

  useFrame(({ camera }) => {
    // Full opacity while its section is settled, gone by the time the next
    // section's keyframe is reached.
    const d = Math.abs(scrollState.progress - section)
    const o = Math.min(1, Math.max(0, 1 - (d - 0.15) / 0.5))

    if (lineMat.current) lineMat.current.opacity = o * 0.7
    if (dotMat.current) dotMat.current.opacity = o
    if (html.current && lastOpacity.current !== o) {
      lastOpacity.current = o
      html.current.style.opacity = String(o)
      html.current.style.visibility = o < 0.01 ? 'hidden' : 'visible'
    }
    if (o < 0.01) return

    anchorWorld.copy(anchorLocal)
    if (parentRef.current) anchorWorld.applyMatrix4(parentRef.current.matrixWorld)

    camera.matrixWorld.extractBasis(right, up, SCRATCH_FWD)
    labelWorld
      .copy(anchorWorld)
      .addScaledVector(right, ann.offset[0])
      .addScaledVector(up, ann.offset[1])

    dot.current?.position.copy(anchorWorld)
    label.current?.position.copy(labelWorld)

    // Anchor → elbow → label. The last run is horizontal, as on a drawing.
    const elbowX = anchorWorld.x + (labelWorld.x - anchorWorld.x) * 0.45
    const elbowY = labelWorld.y
    const elbowZ = anchorWorld.z + (labelWorld.z - anchorWorld.z) * 0.45
    positions.set([
      anchorWorld.x, anchorWorld.y, anchorWorld.z,
      elbowX, elbowY, elbowZ,
      labelWorld.x, labelWorld.y, labelWorld.z,
    ])
    if (leader.current) leader.current.needsUpdate = true
  })

  return (
    <group>
      <mesh ref={dot}>
        <sphereGeometry args={[0.017, 6, 5]} />
        <meshBasicMaterial
          ref={dotMat}
          color={PALETTE.accent}
          transparent
          opacity={0}
          toneMapped={false}
          depthTest={false}
        />
      </mesh>

      <line>
        <bufferGeometry>
          <bufferAttribute ref={leader} attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          ref={lineMat}
          color={PALETTE.g3}
          transparent
          opacity={0}
          depthTest={false}
        />
      </line>

      <group ref={label}>
        <Html pointerEvents="none" zIndexRange={[20, 0]} wrapperClass="annotation-wrapper">
          <div
            ref={html}
            className="annotation"
            data-side={ann.offset[0] >= 0 ? 'right' : 'left'}
            style={{ opacity: 0, visibility: 'hidden' }}
            aria-hidden="true"
          >
            <span className="annotation__label">{ann.label}</span>
            <span className="annotation__value">{ann.value}</span>
          </div>
        </Html>
      </group>
    </group>
  )
}

/**
 * Renders only the callouts for sections adjacent to the active one. Mounting
 * every callout for the whole page would keep nine portalled DOM nodes under
 * per-frame transform updates for no visual benefit.
 */
export function Callouts({
  annotations,
  active,
  parentRef,
}: {
  annotations: { ann: Annotation; section: number }[]
  active: number
  parentRef: React.RefObject<THREE.Object3D | null>
}) {
  return (
    <>
      {annotations
        .filter(({ section }) => Math.abs(section - active) <= 1)
        .map(({ ann, section }) => (
          <Callout key={ann.id} ann={ann} section={section} parentRef={parentRef} />
        ))}
    </>
  )
}
