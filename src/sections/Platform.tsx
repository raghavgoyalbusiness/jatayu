import { Section, SectionMark, Slab } from '../components/Section'
import { SpecTable } from '../components/Readouts'

const SPECS: [string, string, string?][] = [
  ['Endurance', '[XX] h cruise / [XX] h loiter', 'At [XX] kg payload, ISA sea level, no reserve.'],
  ['Payload', '[X.X] kg — modular bay', 'Open mechanical and power interface; [STANDARD] data bus.'],
  ['Comms', '[BAND] mesh · [BAND] SATCOM', 'Autonomous behaviour continues without link.'],
  ['Operating envelope', '[XXXX] m MSL · [XX] kt · [-XX]/[+XX] °C', 'Vertical launch and recovery from unprepared ground.'],
  ['Span / MTOW', '[X.XX] m · [XX.X] kg'],
  ['Airworthiness', '[STANDARD] · [AUTHORITY]'],
]

export function Platform() {
  return (
    <Section index={1} travel>
      <SectionMark index={1} />
      <h2
        id="platform-heading"
        className="m-0 text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.04] tracking-[-0.03em]"
      >
        One airframe, two flight regimes
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-g4">
        [AIRFRAME DESIGNATION] launches and recovers vertically on four lift
        units, then transitions to fixed-wing cruise for the endurance the
        mission requires. There is no launcher, no net, and no prepared surface
        anywhere in the deployment chain.
      </p>

      <Slab className="mt-9">
        <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-g2 pb-3">
          <span className="tick-label">Specification — [AIRFRAME DESIGNATION]</span>
          <span className="tick-label">REV [X.X]</span>
        </div>
        <SpecTable rows={SPECS} caption="Airframe specification" />
        <p className="mt-5 mb-0 font-mono text-[0.6875rem] leading-relaxed text-g3">
          Figures are placeholders. Published performance is subject to
          configuration, and to the licence under which it is released.
        </p>
      </Slab>
    </Section>
  )
}
