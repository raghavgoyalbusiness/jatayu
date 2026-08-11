import { useEffect } from 'react'
import { CanvasStage } from './components/CanvasStage'
import { Crosshair } from './components/Crosshair'
import { SectionRail } from './components/SectionRail'
import { Hero } from './sections/Hero'
import { Platform } from './sections/Platform'
import { Navigation } from './sections/Navigation'
import { CounterAutonomy } from './sections/CounterAutonomy'
import { Deployment } from './sections/Deployment'
import { Contact } from './sections/Contact'
import { startScrollTracking } from './lib/scrollStore'
import { useDeviceTier, usePrefersReducedMotion } from './lib/useEnvironment'

export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const tier = useDeviceTier()

  useEffect(() => startScrollTracking(), [])

  return (
    <>
      <a
        href="#platform"
        data-ui
        className="tick-label sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-ground focus:p-3 focus:text-g5 focus:outline focus:outline-accent"
      >
        Skip to content
      </a>

      <CanvasStage tier={tier} reducedMotion={reducedMotion} />
      <SectionRail reducedMotion={reducedMotion} />
      {!reducedMotion && <Crosshair />}

      <main className="relative z-10">
        <Hero reducedMotion={reducedMotion} />
        <Platform />
        <Navigation />
        <CounterAutonomy />
        <Deployment reducedMotion={reducedMotion} />
        <Contact />
      </main>
    </>
  )
}
