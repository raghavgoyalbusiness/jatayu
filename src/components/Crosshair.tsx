import { useEffect, useRef, useState } from 'react'
import { scrollState } from '../lib/scrollStore'

/** Anything the native cursor should be visible over. */
const UI_SELECTOR =
  '[data-ui], a, button, input, textarea, select, p, h1, h2, h3, dt, dd, li, figcaption, label'

/**
 * Replaces the pointer with a thin crosshair while it is over the canvas, and
 * trails a coordinate readout beside it. Coordinates are synthetic — they are
 * a plausible cursor-in-world reading, not a raycast.
 *
 * Also the single writer of `scrollState.pointer`, which the camera rig reads
 * for parallax. Touch devices skip the whole thing.
 */
export function Crosshair() {
  const [enabled, setEnabled] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const readout = useRef<HTMLDivElement>(null)
  const visible = useRef(false)
  const frame = useRef(0)
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    const sync = () => setEnabled(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove('hide-cursor')
      scrollState.pointerActive = false
      return
    }

    const paint = () => {
      frame.current = 0
      const { x, y } = pos.current
      if (root.current) {
        root.current.style.transform = `translate3d(${x}px, ${y}px, 0)`
        root.current.style.opacity = visible.current ? '1' : '0'
      }
      if (readout.current && visible.current) {
        const nx = (x / window.innerWidth) * 2 - 1
        const ny = -((y / window.innerHeight) * 2 - 1)
        // Synthetic world-frame reading, in metres.
        const wx = nx * 14.5
        const wy = ny * 9.2
        const wz = -6.5 - scrollState.progress * 3.1
        readout.current.textContent = `X ${fmt(wx)}  Y ${fmt(wy)}  Z ${fmt(wz)}`
      }
    }

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }

      scrollState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      scrollState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      scrollState.pointerActive = true

      // Over real UI the native cursor comes back — the crosshair belongs to
      // the canvas, not to links, controls, or anything the reader might want
      // to select. Text elements are included deliberately: a hidden caret over
      // a paragraph is worse than losing the crosshair for a moment.
      const overUi = !!(e.target as Element | null)?.closest?.(UI_SELECTOR)
      const next = !overUi
      if (next !== visible.current) {
        visible.current = next
        document.body.classList.toggle('hide-cursor', next)
      }

      if (!frame.current) frame.current = requestAnimationFrame(paint)
    }

    const onLeave = () => {
      visible.current = false
      document.body.classList.remove('hide-cursor')
      if (root.current) root.current.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      if (frame.current) cancelAnimationFrame(frame.current)
      document.body.classList.remove('hide-cursor')
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div ref={root} aria-hidden="true" className="crosshair">
      <svg width="46" height="46" viewBox="0 0 46 46" className="crosshair__mark">
        <path d="M23 3v11M23 32v11M3 23h11M32 23h11" />
        <circle cx="23" cy="23" r="7.5" />
        <circle cx="23" cy="23" r="0.9" className="crosshair__dot" />
      </svg>
      <div ref={readout} className="crosshair__readout mono" />
    </div>
  )
}

function fmt(v: number) {
  const s = Math.abs(v).toFixed(2).padStart(5, '0')
  return `${v < 0 ? '-' : '+'}${s}`
}
