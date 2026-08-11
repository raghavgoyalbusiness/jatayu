import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { PALETTE } from './materials'
import { scrollState } from '../lib/scrollStore'

/** Flat XZ line grid, built as one LineSegments buffer. */
function gridGeometry(size: number, divisions: number) {
  const half = size / 2
  const step = size / divisions
  const verts: number[] = []
  for (let i = 0; i <= divisions; i++) {
    const p = -half + i * step
    verts.push(-half, 0, p, half, 0, p)
    verts.push(p, 0, -half, p, 0, half)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  return geo
}

const GRID_VERT = /* glsl */ `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const GRID_FRAG = /* glsl */ `
  precision mediump float;
  uniform vec3  uBase;
  uniform vec3  uAccent;
  uniform float uSweep;    // world Z of the scan line
  uniform float uActive;   // 0 = dormant grid, 1 = full scan
  uniform float uOpacity;  // global master fade
  uniform float uFadeIn;
  uniform float uFadeOut;
  varying vec3 vPos;

  void main() {
    float r = length(vPos.xz);
    float fade = 1.0 - smoothstep(uFadeIn, uFadeOut, r);
    if (fade <= 0.001) discard;

    // Gaussian band around the scan line, with a short trailing wash behind it.
    float d     = vPos.z - uSweep;
    float head  = exp(-d * d * 0.24);
    float trail = exp(-max(-d, 0.0) * 0.28) * 0.28;
    float pulse = clamp((head + trail) * uActive, 0.0, 1.0);

    vec3  c = mix(uBase, uAccent, pulse);
    float a = fade * (0.16 + pulse * 0.68) * uOpacity;
    if (a < 0.003) discard;
    gl_FragColor = vec4(c, a);
  }
`

const SWEEP_SPAN = 26

export interface TerrainGridProps {
  animate: boolean
  /** Reduced density on low-tier devices. */
  divisions: number
}

/**
 * The ground reference under the airframe. Dormant grey for most of the page;
 * during section 03 a scan line runs the length of it, standing in for the
 * terrain-relative navigation fix.
 */
export function TerrainGrid({ animate, divisions }: TerrainGridProps) {
  const geo = useMemo(() => gridGeometry(SWEEP_SPAN * 2, divisions), [divisions])
  const mat = useRef<THREE.ShaderMaterial>(null)
  const t = useRef(0)

  const uniforms = useMemo(
    () => ({
      uBase: { value: new THREE.Color(PALETTE.g2) },
      uAccent: { value: new THREE.Color(PALETTE.accent) },
      uSweep: { value: animate ? -SWEEP_SPAN : 1.5 },
      uActive: { value: 0 },
      uOpacity: { value: 1 },
      uFadeIn: { value: 5 },
      uFadeOut: { value: SWEEP_SPAN * 0.92 },
    }),
    [animate],
  )

  useFrame((_, delta) => {
    const u = mat.current?.uniforms
    if (!u) return

    const p = scrollState.progress
    // Section 03 is the navigation section; activation is a bell around it.
    const near = Math.max(0, 1 - Math.abs(p - 2) / 1.1)
    u.uActive.value = animate ? near : near * 0.7
    // Grid recedes once we leave the airframe sections.
    u.uOpacity.value = Math.max(0, 1 - Math.max(0, p - 3.4) / 1.2)

    if (!animate) return
    t.current += delta
    u.uSweep.value = ((t.current * 8) % (SWEEP_SPAN * 2)) - SWEEP_SPAN
  })

  return (
    <lineSegments geometry={geo} position={[0, -1.9, 0]} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={GRID_VERT}
        fragmentShader={GRID_FRAG}
        transparent
        depthWrite={false}
      />
    </lineSegments>
  )
}

/**
 * Wireframe globe far behind the airframe, parallaxing on scroll. Deliberately
 * near the noise floor — it should register as depth, not as an object.
 *
 * `spin` is separate from the scroll parallax: low-end devices freeze the
 * rotation but the globe still tracks the narrative.
 */
export function Globe({ spin }: { spin: boolean }) {
  const ref = useRef<THREE.Group>(null)

  const geo = useMemo(() => new THREE.IcosahedronGeometry(9, 3), [])
  const wire = useMemo(() => new THREE.WireframeGeometry(geo), [geo])

  useFrame((_, delta) => {
    if (!ref.current) return
    if (spin) ref.current.rotation.y += delta * 0.014
    // Parallax: the globe drifts down and back as the narrative advances.
    const target = -3 - scrollState.progress * 1.6
    ref.current.position.y += (target - ref.current.position.y) * (1 - Math.exp(-2 * delta))
  })

  return (
    <group ref={ref} position={[-4, -3, -22]} rotation={[0.32, 0.4, 0.1]}>
      <lineSegments geometry={wire}>
        <lineBasicMaterial color={PALETTE.g3} transparent opacity={0.075} depthWrite={false} />
      </lineSegments>
    </group>
  )
}

/** Restrained three-point rig. Nothing here should read as "product render". */
export function Lighting() {
  return (
    <>
      <ambientLight intensity={0.34} color="#8fa0b4" />
      <directionalLight position={[5, 8, 4]} intensity={2.2} color="#c6d3e2" />
      <directionalLight position={[-6, -2, -5]} intensity={0.55} color="#3a4a5e" />
      {/* Faint accent rim so the silhouette separates from the ground. */}
      <directionalLight position={[-3, 1.5, 6]} intensity={0.3} color={PALETTE.accent} />
    </>
  )
}
