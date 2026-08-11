import { useEffect, useState } from 'react'

/**
 * Live `prefers-reduced-motion` reading. Re-evaluates if the OS setting changes
 * mid-session, so the rig can drop to static renders without a reload.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window === 'undefined'
      ? false
      : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return reduced
}

export type DeviceTier = 'high' | 'low'

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

/**
 * Coarse capability split. We are not trying to be clever — we only need to
 * know whether it is safe to spend budget on post-processing and DPR > 1.
 *
 * Anything touch-first, narrow, thin on cores or thin on RAM is treated as low
 * tier: DPR 1, no EffectComposer, frozen globe.
 */
function detectTier(): DeviceTier {
  if (typeof window === 'undefined') return 'high'

  const coarse = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.matchMedia('(max-width: 900px)').matches
  const cores = navigator.hardwareConcurrency ?? 8
  const memory = (navigator as NavigatorWithMemory).deviceMemory ?? 8

  if (coarse || narrow) return 'low'
  if (cores <= 4) return 'low'
  if (memory <= 4) return 'low'
  return 'high'
}

export function useDeviceTier(): DeviceTier {
  const [tier, setTier] = useState<DeviceTier>(detectTier)

  useEffect(() => {
    // Only width and pointer can change at runtime (rotation, external display).
    const mqs = [
      window.matchMedia('(pointer: coarse)'),
      window.matchMedia('(max-width: 900px)'),
    ]
    const onChange = () => setTier(detectTier())
    mqs.forEach((mq) => mq.addEventListener('change', onChange))
    return () => mqs.forEach((mq) => mq.removeEventListener('change', onChange))
  }, [])

  return tier
}
