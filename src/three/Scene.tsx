import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { Airframe } from './Airframe'
import { Callouts } from './Annotations'
import { CameraRig } from './CameraRig'
import { Globe, Lighting, TerrainGrid } from './Environment'
import { DetectionCone, Hostile } from './Hostile'
import { SECTIONS, type Annotation } from '../lib/sections'
import { useActiveSection } from '../lib/scrollStore'
import type { DeviceTier } from '../lib/useEnvironment'

export interface SceneProps {
  tier: DeviceTier
  reducedMotion: boolean
}

/** In demand mode nothing renders unless something asks. Sections do the asking. */
function DemandInvalidator({ active }: { active: number }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    // A short burst so drei's HTML transforms settle after the camera moves.
    invalidate()
    const id = setTimeout(invalidate, 60)
    return () => clearTimeout(id)
  }, [active, invalidate])
  return null
}

function SceneContents({ tier, reducedMotion }: SceneProps) {
  const active = useActiveSection()
  const width = useThree((s) => s.size.width)
  const airframeRef = useRef<THREE.Group>(null)
  const hostileRef = useRef<THREE.Group>(null)

  const animate = !reducedMotion

  const { airframeCallouts, hostileCallouts } = useMemo(() => {
    const all: { ann: Annotation; section: number }[] = []
    SECTIONS.forEach((s, i) => s.annotations.forEach((ann) => all.push({ ann, section: i })))
    return {
      airframeCallouts: all.filter((a) => a.ann.frame === 'airframe'),
      hostileCallouts: all.filter((a) => a.ann.frame === 'hostile'),
    }
  }, [])

  return (
    <>
      <color attach="background" args={['#08090a']} />
      <fog attach="fog" args={['#08090a', 16, 52]} />

      <Lighting />
      <CameraRig reducedMotion={reducedMotion} />
      {reducedMotion && <DemandInvalidator active={active} />}

      <Globe spin={animate && tier === 'high'} />
      <TerrainGrid animate={animate} divisions={tier === 'low' ? 26 : 44} />

      <Airframe animate={animate} groupRef={airframeRef} />
      <Hostile animate={animate} hostileRef={hostileRef} />
      <DetectionCone animate={animate} airframeRef={airframeRef} hostileRef={hostileRef} />

      {/* Callouts live at the scene root: their anchors track the models, but
          their labels are placed against the camera basis, not model space.
          Below ~900px there is nowhere for a leader line to go without landing
          on the copy, and every callout duplicates text that is already in the
          DOM — so they are dropped rather than crammed in. */}
      {width >= 900 && (
        <>
          <Callouts annotations={airframeCallouts} active={active} parentRef={airframeRef} />
          <Callouts annotations={hostileCallouts} active={active} parentRef={hostileRef} />
        </>
      )}
    </>
  )
}

/**
 * Canvas root. Post-processing, DPR and the frame loop are all decided here
 * from device tier and motion preference — the scene graph itself does not
 * need to know which budget it is running under.
 */
export default function Scene({ tier, reducedMotion }: SceneProps) {
  // Post-processing is a desktop-only luxury. Grain is motion, so it also goes
  // when the user has asked for less of it.
  const postFx = tier === 'high'
  const grain = postFx && !reducedMotion

  return (
    <Canvas
      flat
      dpr={tier === 'low' ? 1 : [1, 1.75]}
      frameloop={reducedMotion ? 'demand' : 'always'}
      gl={{
        antialias: tier === 'high',
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      camera={{
        position: SECTIONS[0].camera.position,
        fov: SECTIONS[0].camera.fov,
        near: 0.1,
        far: 140,
      }}
    >
      <SceneContents tier={tier} reducedMotion={reducedMotion} />

      {postFx && grain && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.42}
            luminanceSmoothing={0.3}
            mipmapBlur
            radius={0.6}
          />
          <Vignette offset={0.22} darkness={0.72} />
          <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.42} />
        </EffectComposer>
      )}

      {postFx && !grain && (
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={0.7}
            luminanceThreshold={0.42}
            luminanceSmoothing={0.3}
            mipmapBlur
            radius={0.6}
          />
          <Vignette offset={0.22} darkness={0.72} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
