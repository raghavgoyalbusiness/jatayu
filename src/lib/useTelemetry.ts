import { useEffect, useState } from 'react'

export interface Telemetry {
  altitude: number
  heading: number
  groundSpeed: number
  latencyMs: number
  link: 'NOMINAL' | 'DEGRADED'
  frame: number
}

/**
 * Synthetic telemetry. The numbers are not real and are not claimed to be —
 * they exist so the hero readout behaves like an instrument rather than a
 * static graphic. Replace the generator when a real feed exists.
 */
const SEED: Telemetry = {
  altitude: 1247,
  heading: 214,
  groundSpeed: 31.4,
  latencyMs: 42,
  link: 'NOMINAL',
  frame: 0,
}

export function useTelemetry(active: boolean): Telemetry {
  const [t, setT] = useState<Telemetry>(SEED)

  useEffect(() => {
    if (!active) return

    let cancelled = false
    let phase = 0

    const id = window.setInterval(() => {
      if (cancelled) return
      phase += 1
      setT((prev) => {
        const wander = (amp: number, rate: number, off: number) =>
          Math.sin(phase * rate + off) * amp
        return {
          altitude: Math.round(1247 + wander(38, 0.07, 0) + wander(9, 0.31, 1.2)),
          heading: (SEED.heading + phase * 0.22) % 360,
          groundSpeed: 31.4 + wander(1.8, 0.05, 2.1),
          latencyMs: Math.round(42 + wander(11, 0.13, 0.7) + wander(4, 0.6, 3)),
          // A brief degradation every ~40 s keeps the readout honest about
          // what a contested link actually looks like.
          link: phase % 160 > 150 ? 'DEGRADED' : 'NOMINAL',
          frame: prev.frame + 1,
        }
      })
    }, 250)

    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [active])

  return t
}
