import * as THREE from 'three'

/** Palette mirrored from the CSS tokens so canvas and DOM never drift. */
export const PALETTE = {
  ground: '#08090a',
  g1: '#101215',
  g2: '#1c2025',
  g3: '#4d545d',
  g4: '#9aa1a9',
  accent: '#ffb020',
} as const

/** Matte dark fill. Flat-shaded so the low-poly facets stay legible. */
export const hullMaterial = new THREE.MeshStandardMaterial({
  color: '#13171b',
  roughness: 0.86,
  metalness: 0.22,
  flatShading: true,
  side: THREE.DoubleSide,
})

/** Slightly lighter fill for sub-assemblies, to separate them from the hull. */
export const subMaterial = new THREE.MeshStandardMaterial({
  color: '#191e23',
  roughness: 0.78,
  metalness: 0.3,
  flatShading: true,
  side: THREE.DoubleSide,
})

/** Hairline wireframe over the fill. */
export const edgeMaterial = new THREE.LineBasicMaterial({
  color: '#9aa5b2',
})

/** Wireframe for the intruder — colder and dimmer than the primary. */
export const hostileEdgeMaterial = new THREE.LineBasicMaterial({
  color: '#666f7a',
})

export const hostileHullMaterial = new THREE.MeshStandardMaterial({
  color: '#0a0c0e',
  roughness: 0.95,
  metalness: 0.1,
  flatShading: true,
  side: THREE.DoubleSide,
})
