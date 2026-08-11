import { Section, SectionMark, Slab } from '../components/Section'
import { SpecTable } from '../components/Readouts'

const NAV_SPECS: [string, string, string?][] = [
  ['Position source', 'Visual-inertial odometry', 'Stereo pair and IMU, tightly coupled at [XXX] Hz.'],
  ['Absolute fix', 'Terrain-relative navigation', 'Downward imagery correlated against an onboard elevation model.'],
  ['Drift, unaided', '[X.X] % of distance travelled', 'Over [XXX] km of [TERRAIN TYPE], no GNSS.'],
  ['GNSS', 'Optional, never assumed', 'One input among several. Spoofed or absent, the flight continues.'],
]

export function Navigation() {
  return (
    <Section index={2} travel>
      <SectionMark index={2} />
      <h2
        id="navigation-heading"
        className="m-0 text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.04] tracking-[-0.03em]"
      >
        Navigation without GPS
      </h2>
      <p className="mt-6 text-sm leading-relaxed text-g4">
        Satellite navigation is the first thing an adversary takes away. The
        aircraft is built to fly a full mission without it, and treats a GNSS fix
        as corroboration rather than as truth.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-g4">
        Between fixes, position is carried by visual-inertial odometry: the
        stereo sensor head tracks ground features and fuses that motion estimate
        with the inertial unit. Absolute position comes from terrain-relative
        navigation — the downward sensor builds a local elevation profile and
        correlates it against an onboard model, bounding accumulated error
        against the ground itself.
      </p>

      <Slab className="mt-9">
        <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-g2 pb-3">
          <span className="tick-label">Navigation subsystem</span>
          <span className="tick-label live">GNSS-INDEPENDENT</span>
        </div>
        <SpecTable rows={NAV_SPECS} caption="Navigation subsystem characteristics" />
      </Slab>
    </Section>
  )
}
