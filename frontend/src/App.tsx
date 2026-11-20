import { useEffect, useRef } from 'react'
import { Companies } from './components/landing/Companies'
import { Faq } from './components/landing/Faq'
import { Hero } from './components/landing/Hero'
import { HowItWorks } from './components/landing/HowItWorks'
import { WhatWeCheck } from './components/landing/WhatWeCheck'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { ResultView } from './components/result/ResultView'
import { ErrorPanel, LoadingPanel } from './components/result/StatusPanels'
import { container } from './components/ui/styles'
import { UploadCard } from './components/upload/UploadCard'
import { useBackendInfo } from './hooks/useBackendInfo'
import { useBillAnalysis } from './hooks/useBillAnalysis'
import { useLanguage } from './hooks/useLanguage'

export default function App() {
  const { lang, t, toggle } = useLanguage()
  const { storage } = useBackendInfo()
  const { status, error, result, history, analyze } = useBillAnalysis()
  const fileInput = useRef<HTMLInputElement>(null)
  const outcome = useRef<HTMLElement>(null)

  // On a phone the waiting panel and the result appear below the screen; without this the page
  // looked unchanged after an upload. Bring them into view and move focus for screen readers.
  useEffect(() => {
    if (status === 'idle') return
    outcome.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    outcome.current?.focus({ preventScroll: true })
  }, [status])

  return (
    <>
      <SiteHeader lang={lang} t={t} onToggleLanguage={toggle} />
      <main id="main" tabIndex={-1} className="text-lg outline-none">
        <Hero t={t}>
          <UploadCard ref={fileInput} t={t} busy={status === 'loading'} storage={storage} onFile={analyze} />
        </Hero>

        {status !== 'idle' && (
          <section ref={outcome} tabIndex={-1} aria-label={t.resultTitle} className={`${container} scroll-mt-20 py-6 outline-none`}>
            <div className="mx-auto max-w-3xl">
              {status === 'loading' && <LoadingPanel t={t} />}
              {status === 'error' && error && <ErrorPanel error={error} t={t} lang={lang} />}
              {status === 'success' && result && (
                <ResultView result={result} history={history} lang={lang} t={t} onNewBill={() => fileInput.current?.click()} />
              )}
            </div>
          </section>
        )}

        <HowItWorks t={t} />
        <WhatWeCheck t={t} />
        <Companies t={t} />
        <Faq t={t} />
      </main>
      <SiteFooter t={t} />
    </>
  )
}
