import { useSyncExternalStore } from 'react'
import { SECTION_COUNT } from './sections'

/**
 * Scroll state lives outside React.
 *
 * The 3D rig samples `state.progress` every frame; re-rendering the React tree
 * at 60fps to move a camera would be indefensible. Only the integer active
 * section is published to React, for the rail and for section highlighting.
 */
interface ScrollState {
  /**
   * Eased position in section space, 0 → SECTION_COUNT-1. Each section dwells
   * on its own keyframe for the first part of its span, then eases into the
   * next. This is what the camera rig reads.
   */
  progress: number
  /** Unramped position in section space. Used for the rail readout. */
  raw: number
  /** Integer active section. */
  active: number
  /** Pointer in normalised device coordinates, -1 → 1. */
  pointer: { x: number; y: number }
  /** True once the pointer has been over the canvas at least once. */
  pointerActive: boolean
}

export const scrollState: ScrollState = {
  progress: 0,
  raw: 0,
  active: 0,
  pointer: { x: 0, y: 0 },
  pointerActive: false,
}

/** Where the transition out of a section begins, as a fraction of its span. */
const DWELL_END = 0.55

const listeners = new Set<() => void>()
let publishedActive = 0

function publish() {
  if (scrollState.active === publishedActive) return
  publishedActive = scrollState.active
  listeners.forEach((l) => l())
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const sectionEls: (HTMLElement | null)[] = new Array(SECTION_COUNT).fill(null)

export function registerSection(index: number, el: HTMLElement | null) {
  sectionEls[index] = el
}

function measure() {
  const line = window.scrollY + window.innerHeight * 0.4

  let idx = 0
  let frac = 0

  for (let i = 0; i < SECTION_COUNT; i++) {
    const el = sectionEls[i]
    if (!el) continue
    const top = el.offsetTop
    const height = el.offsetHeight || 1
    if (line >= top || i === 0) {
      idx = i
      frac = Math.min(1, Math.max(0, (line - top) / height))
    }
  }

  scrollState.raw = idx + frac
  scrollState.progress = Math.min(
    SECTION_COUNT - 1,
    idx + smoothstep(DWELL_END, 1, frac),
  )
  scrollState.active = idx
  publish()
}

let frame = 0
let started = false

function onScroll() {
  if (frame) return
  frame = requestAnimationFrame(() => {
    frame = 0
    measure()
  })
}

/** Called once from the app root. Idempotent. */
export function startScrollTracking(): () => void {
  if (started) return () => {}
  started = true

  measure()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })

  return () => {
    started = false
    if (frame) cancelAnimationFrame(frame)
    frame = 0
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}

/** Re-measure after content reflow (fonts, lazy canvas mount). */
export function remeasure() {
  onScroll()
}

export function useActiveSection(): number {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => publishedActive,
    () => 0,
  )
}

export function scrollToSection(index: number, instant: boolean) {
  const el = sectionEls[index]
  if (!el) return
  window.scrollTo({
    top: el.offsetTop - window.innerHeight * 0.39,
    behavior: instant ? 'auto' : 'smooth',
  })
}
