import { useRef } from 'react'
import { SECTIONS } from '../lib/sections'
import { scrollToSection, useActiveSection } from '../lib/scrollStore'

/**
 * Fixed progress rail. Every tick is a real button, so tabbing through the page
 * reaches the navigation before the content, and arrow keys move between ticks
 * the way a listbox would.
 */
export function SectionRail({ reducedMotion }: { reducedMotion: boolean }) {
  const active = useActiveSection()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const go = (i: number) => scrollToSection(i, reducedMotion)

  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = SECTIONS.length - 1
    let next = -1
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = Math.min(last, i + 1)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = Math.max(0, i - 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    if (next < 0) return
    e.preventDefault()
    buttons.current[next]?.focus()
    go(next)
  }

  return (
    <nav
      aria-label="Section navigation"
      data-ui
      // Left edge on desktop. On a phone there is no room for labels beside the
      // copy, so it moves to the right edge and shows ticks only — still
      // tappable, still keyboard-navigable.
      className="fixed top-1/2 right-0 z-30 -translate-y-1/2 pr-3 sm:right-auto sm:left-0 sm:pr-0 sm:pl-6"
    >
      <ol className="relative flex flex-col gap-0">
        {/* Continuous hairline behind the ticks. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-3 right-0 bottom-3 w-px bg-g2 sm:right-auto sm:left-0"
        />
        {SECTIONS.map((s, i) => {
          const current = i === active
          return (
            <li key={s.id}>
              <button
                ref={(el) => {
                  buttons.current[i] = el
                }}
                type="button"
                onClick={() => go(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                aria-current={current ? 'true' : undefined}
                aria-label={`${s.index} — ${s.rail}`}
                className="group flex w-full flex-row-reverse items-center justify-start gap-3 py-3 text-left sm:flex-row sm:py-2.5"
              >
                <span
                  aria-hidden="true"
                  className={[
                    'h-px transition-all duration-500 ease-inst',
                    current
                      ? 'w-7 bg-accent'
                      : 'w-3.5 bg-g3 group-hover:w-5 group-hover:bg-g4',
                  ].join(' ')}
                />
                <span
                  aria-hidden="true"
                  className={[
                    'tick-label hidden transition-colors duration-500 ease-inst sm:inline',
                    current ? 'text-g5' : 'group-hover:text-g4',
                  ].join(' ')}
                >
                  <span className={current ? 'live' : undefined}>{s.index}</span>
                  <span className="ml-2 hidden lg:inline">{s.rail}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
