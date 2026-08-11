import { Section, SectionMark } from '../components/Section'

const EMAIL = '[contact@example.com]'

export function Contact() {
  return (
    <Section index={5} wide>
      <div data-ui className="max-w-3xl">
        <SectionMark index={5} />
        <h2
          id="contact-heading"
          className="m-0 text-[clamp(1.9rem,4vw,3rem)] leading-[1.02] tracking-[-0.03em]"
        >
          Contact
        </h2>

        <p className="mt-8 text-sm leading-relaxed text-g4">
          Enquiries from government customers and prime contractors only.
        </p>

        <a
          href={`mailto:${EMAIL}`}
          className="mt-6 inline-block font-mono text-[clamp(1.1rem,3.2vw,2rem)] tracking-tight text-g5 underline decoration-g3 decoration-1 underline-offset-[0.35em] transition-colors duration-300 ease-inst hover:decoration-accent focus-visible:decoration-accent"
        >
          {EMAIL}
        </a>

        <hr className="rule mt-14" />

        <p className="mt-8 max-w-prose font-mono text-xs leading-relaxed text-g3">
          All engagements are subject to export licensing. Nothing on this page
          constitutes an offer to supply. Technical data is released only under
          an approved licence and an executed non-disclosure agreement.
        </p>

        <div className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-g2 pt-8">
          <span className="tick-label">© [YYYY] Jatayu [LEGAL SUFFIX]</span>
          <span className="tick-label">[REGISTERED ADDRESS]</span>
          <span className="tick-label">CO. NO. [XXXXXXXX]</span>
        </div>
      </div>
    </Section>
  )
}
