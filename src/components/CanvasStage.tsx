import { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react'
import { useActiveSection } from '../lib/scrollStore'
import type { DeviceTier } from '../lib/useEnvironment'

// The whole 3D payload — three, fiber, drei, postprocessing — is behind this
// boundary. Nothing above the fold waits on it.
const Scene = lazy(() => import('../three/Scene'))

const BOOT_LINES = [
  ['RENDER CONTEXT', 'WEBGL2'],
  ['AIRFRAME GEOMETRY', 'PROCEDURAL'],
  ['SHADER PROGRAMS', 'COMPILING'],
  ['CAMERA RIG', 'ARMED'],
] as const

function LoadingReadout() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 180)
    return () => window.clearInterval(id)
  }, [])

  return (
    // Sits where the airframe will sit, so it never lands on top of the copy.
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 lg:justify-end lg:pr-[14%]">
      <div className="w-[min(22rem,80vw)]" role="status" aria-live="polite">
        <p className="tick-label mb-4 text-g4">Initialising scene</p>
        <dl className="m-0 space-y-1.5">
          {BOOT_LINES.map(([k, v], i) => (
            <div key={k} className="flex items-baseline justify-between gap-4">
              <dt className="tick-label">{k}</dt>
              <dd
                className={`tick-label m-0 ${i <= tick % (BOOT_LINES.length + 1) ? 'live' : 'text-g2'}`}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 h-px w-full bg-g2">
          <div
            className="h-px bg-accent transition-[width] duration-200 ease-inst"
            style={{ width: `${((tick % 12) / 11) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function StaticFallback({ reason }: { reason: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="panel max-w-sm p-6">
        <p className="tick-label mb-3">Scene unavailable</p>
        <p className="m-0 text-sm leading-relaxed text-g4">
          {reason} The page content below is complete and unaffected.
        </p>
      </div>
    </div>
  )
}

interface BoundaryProps {
  children: ReactNode
}

class SceneBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (this.state.failed) {
      return <StaticFallback reason="This browser could not create a WebGL context." />
    }
    return this.props.children
  }
}

export interface CanvasStageProps {
  tier: DeviceTier
  reducedMotion: boolean
}

/**
 * Fixed full-viewport stage behind the copy. It holds the canvas, controls when
 * that canvas is allowed to mount, and dims it once the narrative moves to the
 * deployment chart and the contact block, where 3D is not the subject.
 */
export function CanvasStage({ tier, reducedMotion }: CanvasStageProps) {
  const active = useActiveSection()
  const [mount, setMount] = useState(false)

  useEffect(() => {
    // Let first paint and font loading finish before the canvas competes.
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 400))
    const id = idle(() => setMount(true))
    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number)
      else window.clearTimeout(id as number)
    }
  }, [])

  // On a phone the copy runs full-bleed across the canvas, so the scene is
  // held back far enough to stay readable behind it.
  const full = tier === 'low' ? 0.5 : 1
  const opacity = active <= 3 ? full : active === 4 ? 0.16 : 0.09

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 overflow-hidden transition-opacity duration-[900ms] ease-inst"
      style={{ opacity }}
    >
      <SceneBoundary>
        {mount ? (
          <Suspense fallback={<LoadingReadout />}>
            <Scene tier={tier} reducedMotion={reducedMotion} />
          </Suspense>
        ) : (
          <LoadingReadout />
        )}
      </SceneBoundary>
    </div>
  )
}
