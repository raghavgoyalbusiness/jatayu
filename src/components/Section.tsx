import { useEffect, useRef, type ReactNode } from 'react'
import { registerSection, remeasure } from '../lib/scrollStore'
import { SECTIONS } from '../lib/sections'

export interface SectionProps {
  index: number
  children: ReactNode
  className?: string
  /**
   * Give the camera room to travel. The copy is pinned for the duration, so a
   * long section reads as one held frame rather than as drifting text.
   */
  travel?: boolean
  /** Widen the content column — for the sections where the canvas steps back. */
  wide?: boolean
}

/**
 * Registers itself with the scroll store so the camera rig, the rail and the
 * annotations all measure against the same element.
 */
export function Section({ index, children, className = '', travel, wide }: SectionProps) {
  const ref = useRef<HTMLElement>(null)
  const def = SECTIONS[index]

  useEffect(() => {
    registerSection(index, ref.current)
    remeasure()
    return () => registerSection(index, null)
  }, [index])

  return (
    <section
      ref={ref}
      id={def.id}
      aria-labelledby={`${def.id}-heading`}
      className={[
        'relative px-6 sm:pl-24 lg:pl-64',
        travel ? 'min-h-[190svh]' : 'min-h-svh',
        className,
      ].join(' ')}
    >
      <div
        className={[
          'flex min-h-svh flex-col justify-center py-28',
          travel ? 'sticky top-0' : '',
          // The 3D subject lives in the right third on wide viewports, so the
          // copy column is deliberately narrow rather than full-bleed.
          wide ? 'max-w-[80rem]' : 'max-w-[34rem]',
        ].join(' ')}
      >
        {children}
      </div>
    </section>
  )
}

/** Section number and title, set as a survey marker rather than a headline. */
export function SectionMark({ index }: { index: number }) {
  const def = SECTIONS[index]
  return (
    <div className="mb-7 flex items-center gap-4">
      <span className="tick-label live">{def.index}</span>
      <span aria-hidden="true" className="h-px w-10 bg-g2" />
      <span className="tick-label">{def.rail}</span>
    </div>
  )
}

/** Bordered block with a scrim, so text stays legible over the canvas. */
export function Slab({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div data-ui className={`panel scrim p-6 sm:p-7 ${className}`}>
      {children}
    </div>
  )
}
