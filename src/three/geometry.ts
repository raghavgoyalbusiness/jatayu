import * as THREE from 'three'

/**
 * The airframe is generated from primitives — no GLTF, nothing to fetch.
 * Everything is low-poly on purpose: six-sided bodies, flat shading, and hard
 * edges that read as a technical schematic rather than a render.
 *
 * Local frame: +Z forward (nose), +Y up, +X starboard. Roughly 3m fuselage,
 * 2.9m span, expressed 1:1 in world units.
 */

/** Extruded trapezoidal planform: span on X, chord on Z, thickness on Y. */
function planform(points: [number, number][], thickness: number) {
  const shape = new THREE.Shape()
  shape.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1])
  shape.closePath()

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: false,
    curveSegments: 1,
  })
  geo.rotateX(Math.PI / 2)
  geo.translate(0, thickness / 2, 0)
  geo.computeVertexNormals()
  return geo
}

function hexBody(rTop: number, rBottom: number, length: number) {
  const geo = new THREE.CylinderGeometry(rTop, rBottom, length, 6, 1, false)
  geo.rotateX(Math.PI / 2)
  return geo
}

function hexCone(radius: number, length: number) {
  const geo = new THREE.ConeGeometry(radius, length, 6, 1, false)
  // Cone points +Y by default; lay it down so it points +Z.
  geo.rotateX(Math.PI / 2)
  return geo
}

// --- Primary airframe -------------------------------------------------------

export const G = {
  noseCone: hexCone(0.19, 0.58),
  midBody: hexBody(0.19, 0.21, 1.42),
  tailCone: hexCone(0.21, 1.1),

  /** Main wing. Tapered, mildly swept, 2.9 m span. */
  wing: planform(
    [
      [-1.45, -0.11],
      [-0.22, 0.31],
      [0.22, 0.31],
      [1.45, -0.11],
      [1.45, -0.37],
      [0.22, -0.31],
      [-0.22, -0.31],
      [-1.45, -0.37],
    ],
    0.05,
  ),

  winglet: new THREE.BoxGeometry(0.035, 0.2, 0.24),

  /** Longitudinal rotor boom, one per side, carrying fore and aft lift units. */
  rotorBoom: new THREE.BoxGeometry(0.075, 0.075, 1.78),

  rotorPod: (() => {
    const g = new THREE.CylinderGeometry(0.058, 0.07, 0.13, 6)
    return g
  })(),

  rotorRing: (() => {
    const g = new THREE.TorusGeometry(0.36, 0.007, 3, 20)
    g.rotateX(Math.PI / 2)
    return g
  })(),

  rotorBlade: new THREE.BoxGeometry(0.66, 0.006, 0.05),

  /** V-tail fin, canted outboard on the tail cone. */
  tailFin: planform(
    [
      [0, 0.22],
      [0.44, 0.02],
      [0.44, -0.12],
      [0, -0.2],
    ],
    0.035,
  ),

  /** Under-nose gimbal — the visual-inertial sensor head. */
  sensorHead: new THREE.IcosahedronGeometry(0.14, 0),

  sensorMount: new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6),

  /** Modular payload bay, conformal to the belly. */
  payloadBay: new THREE.BoxGeometry(0.32, 0.2, 0.66),

  /** Downward-looking terrain-correlation pod. */
  terrainPod: new THREE.BoxGeometry(0.24, 0.09, 0.42),

  commsMast: new THREE.BoxGeometry(0.045, 0.34, 0.13),

  dorsalSpine: new THREE.BoxGeometry(0.1, 0.06, 1.0),
} as const

// --- Hostile airframe -------------------------------------------------------

/** Deliberately a different silhouette: flying-wing delta, no lift rotors. */
export const H = {
  body: planform(
    [
      [0, 0.62],
      [0.62, -0.36],
      [0.36, -0.44],
      [-0.36, -0.44],
      [-0.62, -0.36],
    ],
    0.09,
  ),
  spine: hexBody(0.07, 0.09, 0.72),
  fin: new THREE.BoxGeometry(0.03, 0.16, 0.2),
} as const

// --- Shared ----------------------------------------------------------------

/** Cached edge geometry so each part builds its wireframe overlay once. */
const edgeCache = new WeakMap<THREE.BufferGeometry, THREE.EdgesGeometry>()

export function edgesOf(geometry: THREE.BufferGeometry, threshold = 22) {
  let e = edgeCache.get(geometry)
  if (!e) {
    e = new THREE.EdgesGeometry(geometry, threshold)
    edgeCache.set(geometry, e)
  }
  return e
}

/** Positions of the four lift units, in airframe-local space. */
export const ROTOR_POSITIONS: [number, number, number][] = [
  [1.02, 0.06, 0.62],
  [-1.02, 0.06, 0.62],
  [1.02, 0.06, -0.92],
  [-1.02, 0.06, -0.92],
]

/** Nose tip, used as the apex of the detection cone. */
export const NOSE_TIP = new THREE.Vector3(0, 0, 1.63)
