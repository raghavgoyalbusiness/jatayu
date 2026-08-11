import type { ReactNode } from 'react'
import { useTelemetry } from '../lib/useTelemetry'

/**
 * Two-column monospace specification table with dotted leaders. Used for the
 * platform specs and anywhere else a keyed list of values is needed.
 */
export function SpecTable({
  rows,
  caption,
}: {
  rows: [string, string, string?][]
  caption?: string
}) {
  return (
    <dl className="m-0" aria-label={caption}>
      {rows.map(([k, v, note]) => (
        <div
          key={k}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-g2 py-3 last:border-b-0"
        >
          <dt className="tick-label">{k}</dt>
          <dd className="m-0 text-right font-mono text-sm tracking-tight text-g5 tabular-nums">
            {v}
          </dd>
          {note && (
            <dd className="col-span-2 m-0 mt-1 font-mono text-[0.6875rem] leading-relaxed text-g3">
              {note}
            </dd>
          )}
        </div>
      ))}
    </dl>
  )
}

function Field({
  label,
  children,
  live,
}: {
  label: string
  children: ReactNode
  live?: boolean
}) {
  return (
    <div className="min-w-0">
      <div className="tick-label mb-1.5">{label}</div>
      <div
        className={`font-mono text-sm tracking-tight tabular-nums ${live ? 'live' : 'text-g5'}`}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Hero telemetry strip. Synthetic values on a 4 Hz tick — see useTelemetry.
 * Frozen to a single representative frame when motion is reduced.
 *
 * The "SIMULATED" label and the caption are not decoration and must not be
 * dropped for visual tidiness. A ticking altitude/heading/link readout on a
 * defence company's home page states, by implication, that an aircraft is
 * airborne and talking to this page. Neither is true, so the page has to say
 * so — and say it before the numbers, since that is the order a screen reader
 * and a skim-reader both take.
 */
export function TelemetryStrip({ reducedMotion }: { reducedMotion: boolean }) {
  const t = useTelemetry(!reducedMotion)

  return (
    <figure
      data-ui
      className="panel scrim m-0 inline-block max-w-full p-5 sm:p-6"
      aria-labelledby="telemetry-caption"
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`block size-1.5 ${t.link === 'NOMINAL' ? 'bg-accent' : 'bg-g3'}`}
        />
        <span className="tick-label">
          Simulated downlink — not a live feed{reducedMotion ? ' (static)' : ''}
        </span>
      </div>

      <figcaption
        id="telemetry-caption"
        className="mb-5 max-w-md font-mono text-[0.6875rem] leading-relaxed text-g3"
      >
        Illustrative readout. These values are generated in your browser from a
        fixed formula. No aircraft is being tracked, and no vehicle data is
        transmitted by or to this site.
      </figcaption>

      <div className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4">
        <Field label="Altitude AGL">{t.altitude.toFixed(0).padStart(5, '0')} m</Field>
        <Field label="Heading">{t.heading.toFixed(0).padStart(3, '0')}°</Field>
        <Field label="Ground speed">{t.groundSpeed.toFixed(1)} m/s</Field>
        <Field label="Link" live={t.link === 'NOMINAL'}>
          {t.link} · {t.latencyMs} ms
        </Field>
      </div>
    </figure>
  )
}
