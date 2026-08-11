import { Section } from '../components/Section'
import { TelemetryStrip } from '../components/Readouts'

export function Hero({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Section index={0} travel wide>
      <div className="max-w-[46rem]">
        <div className="mb-9 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="tick-label">[JURISDICTION] REGISTERED</span>
          <span aria-hidden="true" className="h-px w-8 bg-g2" />
          <span className="tick-label">CAGE [XXXXX]</span>
          <span aria-hidden="true" className="h-px w-8 bg-g2" />
          <span className="tick-label">EST. [YYYY]</span>
        </div>

        <h1
          id="hero-heading"
          className="m-0 text-[clamp(3rem,8vw,6.5rem)] leading-[0.9] font-medium tracking-[-0.04em]"
        >
          Jatayu
        </h1>

        <p className="mt-9 max-w-xl text-[clamp(1.05rem,1.7vw,1.375rem)] leading-snug tracking-tight text-g5">
          Autonomous aerial systems and counter-autonomy for allied government
          customers.
        </p>

        <p className="mt-6 max-w-lg text-sm leading-relaxed text-g4">
          [ONE-LINE QUALIFIER — for example: designed, built and sustained in
          [COUNTRY], to [STANDARD] airworthiness, for operations in contested
          electromagnetic environments.]
        </p>
      </div>

      <div className="mt-14 max-w-[46rem]">
        <TelemetryStrip reducedMotion={reducedMotion} />
      </div>
    </Section>
  )
}
