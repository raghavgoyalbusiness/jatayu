import { Section, SectionMark, Slab } from '../components/Section'

const CHAIN: [string, string, string][] = [
  ['01', 'Detect', 'Passive RF survey and EO/IR search, fused onboard. No emission required to see.'],
  ['02', 'Classify', 'Airframe and controller signature matched against an onboard library.'],
  ['03', 'Track', 'Continuous custody through manoeuvre and occlusion, with handover between aircraft.'],
  ['04', 'Effect', '[DESCRIBE ONLY WHAT YOU ARE LICENSED TO DESCRIBE.]'],
]

export function CounterAutonomy() {
  return (
    <Section index={3} travel>
      <SectionMark index={3} />
      <h2
        id="counter-autonomy-heading"
        className="m-0 text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.04] tracking-[-0.03em]"
      >
        Counter-autonomy
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-g4">
        The same sensing that lets an aircraft navigate without help lets it find
        other aircraft. Counter-autonomy is not a separate product line here; it
        is the detection chain running outward instead of inward.
      </p>

      <Slab className="mt-9">
        <div className="mb-1 flex items-baseline justify-between gap-4 border-b border-g2 pb-3">
          <span className="tick-label">Engagement chain</span>
          <span className="tick-label">ONBOARD 01–03</span>
        </div>
        <ol className="m-0 list-none p-0">
          {CHAIN.map(([n, title, body]) => (
            <li
              key={n}
              className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-g2 py-4 last:border-b-0"
            >
              <span className="tick-label pt-1">{n}</span>
              <div>
                <h3 className="m-0 text-[0.9375rem] leading-tight tracking-tight">{title}</h3>
                <p className="mt-1.5 mb-0 text-[0.8125rem] leading-relaxed text-g4">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Slab>
    </Section>
  )
}
