import { Section, SectionMark } from '../components/Section'
import { WorldMap } from '../components/WorldMap'

export function Deployment({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Section index={4} wide>
      <div data-ui>
        <SectionMark index={4} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
          <div>
            <h2
              id="deployment-heading"
              className="m-0 text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.04] tracking-[-0.03em]"
            >
              Deployment
            </h2>
            <p className="mt-6 text-sm leading-relaxed text-g4">
              Supply is export-controlled. Jatayu sells to allied governments and
              to their prime contractors, under licences issued by [AUTHORITY]
              and, where applicable, [SECOND AUTHORITY].
            </p>
            <p className="mt-4 text-sm leading-relaxed text-g4">
              [PARAGRAPH ON PARTNERSHIP MODEL — local assembly, technology
              transfer, sustainment, and what a partner nation gets access to
              versus what stays here.]
            </p>
            <p className="mt-4 text-sm leading-relaxed text-g4">
              We do not sell to non-state end users, and we do not broker.
              [ADJUST TO MATCH YOUR ACTUAL POLICY.]
            </p>
          </div>

          <div className="panel scrim p-5 sm:p-7">
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-4 border-b border-g2 pb-3">
              <span className="tick-label">
                Sites and partners — <span className="live">ILLUSTRATIVE</span>
              </span>
              <span className="tick-label">PLATE CARRÉE / WGS-84</span>
            </div>
            <WorldMap reducedMotion={reducedMotion} />
          </div>
        </div>
      </div>
    </Section>
  )
}
