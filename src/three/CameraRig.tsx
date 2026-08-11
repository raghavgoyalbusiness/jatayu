import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { SECTIONS, SECTION_COUNT } from '../lib/sections'
import { scrollState } from '../lib/scrollStore'

const POSITIONS = SECTIONS.map((s) => new THREE.Vector3(...s.camera.position))
const TARGETS = SECTIONS.map((s) => new THREE.Vector3(...s.camera.target))
const FOVS = SECTIONS.map((s) => s.camera.fov)

/** How hard the camera is pulled toward its keyframe. Higher = tighter. */
const LAMBDA = 3.2
/** Pointer parallax, in world units at the extremes of the viewport. */
const PARALLAX = 0.42

/**
 * Scroll-driven camera. Scroll position selects a point between two keyframes;
 * the camera is then critically damped toward it, so a fast flick still
 * arrives smoothly and a slow scroll tracks one-to-one. Never a snap.
 *
 * With reduced motion the damping is bypassed entirely: the camera is placed on
 * the keyframe for the current section and stays there.
 */
export function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const size = useThree((s) => s.size)
  const appliedShift = useRef(Number.NaN)

  const desiredPos = useMemo(() => new THREE.Vector3(), [])
  const desiredTgt = useMemo(() => new THREE.Vector3(), [])
  const currentTgt = useRef(new THREE.Vector3().copy(TARGETS[0]))
  const currentFov = useRef(FOVS[0])
  const initialised = useRef(false)

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 1 / 20)
    // Reduced motion snaps to whole sections: static renders, no in-between.
    const p = reducedMotion ? scrollState.active : scrollState.progress

    const i = Math.min(SECTION_COUNT - 1, Math.floor(p))
    const j = Math.min(SECTION_COUNT - 1, i + 1)
    const f = p - i

    desiredPos.lerpVectors(POSITIONS[i], POSITIONS[j], f)
    desiredTgt.lerpVectors(TARGETS[i], TARGETS[j], f)
    const desiredFov = THREE.MathUtils.lerp(FOVS[i], FOVS[j], f)

    // Narrow viewports have no free column to put the subject in, so the
    // keyframes are dollied back along their own view axis. The airframe
    // becomes atmosphere behind the copy rather than a competitor for it.
    const narrow = size.width < 1024
    if (narrow) {
      desiredPos.sub(desiredTgt).multiplyScalar(1.6).add(desiredTgt)
    }

    if (!reducedMotion) {
      // Pointer parallax rides on top of the keyframe, scaled down as the
      // camera pulls away so it never overwhelms the wide shots.
      const scale = 1 / (1 + desiredPos.length() * 0.06)
      desiredPos.x += scrollState.pointer.x * PARALLAX * scale
      desiredPos.y += scrollState.pointer.y * PARALLAX * 0.7 * scale
    }

    if (reducedMotion || !initialised.current) {
      initialised.current = true
      camera.position.copy(desiredPos)
      currentTgt.current.copy(desiredTgt)
      currentFov.current = desiredFov
    } else {
      const k = 1 - Math.exp(-LAMBDA * delta)
      camera.position.lerp(desiredPos, k)
      currentTgt.current.lerp(desiredTgt, k)
      currentFov.current += (desiredFov - currentFov.current) * k
    }

    camera.lookAt(currentTgt.current)

    const fovChanged = Math.abs(camera.fov - currentFov.current) > 0.001
    if (fovChanged) camera.fov = currentFov.current

    // The copy occupies the left of a wide viewport, so the frustum is offset
    // to push the subject into the free space on the right. Doing it on the
    // projection rather than the camera target keeps the framing identical
    // regardless of where the camera happens to be orbiting.
    const shift = narrow ? 0 : 0.15
    if (shift !== appliedShift.current) {
      appliedShift.current = shift
      if (shift === 0) camera.clearViewOffset()
    }
    if (shift !== 0) {
      camera.setViewOffset(
        size.width,
        size.height,
        -size.width * shift,
        0,
        size.width,
        size.height,
      )
    } else if (fovChanged) {
      camera.updateProjectionMatrix()
    }
  })

  return null
}
