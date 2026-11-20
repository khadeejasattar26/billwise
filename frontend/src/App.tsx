import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { SAMPLE_RESULT } from './data/sampleBill'
import { useScreen } from './flow/useScreen'
import { useBackendInfo } from './hooks/useBackendInfo'
import { useBillAnalysis } from './hooks/useBillAnalysis'
import { useLanguage } from './hooks/useLanguage'
import { useTextSize } from './hooks/useTextSize'
import { analyze as analyzePhoto, assess, loadImage, prepareForUpload } from './lib/photo'
import type { PhotoState } from './screens/CheckScreen'
import { HomeScreen } from './screens/HomeScreen'

type Photo = PhotoState & { file: File; img: HTMLImageElement | null }

// Step screens load when first opened, so the home page downloads only what it shows.
const ConsentScreen = lazy(() => import('./screens/ConsentScreen').then((m) => ({ default: m.ConsentScreen })))
const PhotoScreen = lazy(() => import('./screens/PhotoScreen').then((m) => ({ default: m.PhotoScreen })))
const CheckScreen = lazy(() => import('./screens/CheckScreen').then((m) => ({ default: m.CheckScreen })))
const ReadingScreen = lazy(() => import('./screens/ReadingScreen').then((m) => ({ default: m.ReadingScreen })))
const AnswerScreen = lazy(() => import('./screens/AnswerScreen').then((m) => ({ default: m.AnswerScreen })))
const DetailsScreen = lazy(() => import('./screens/DetailsScreen').then((m) => ({ default: m.DetailsScreen })))
const AskScreen = lazy(() => import('./screens/AskScreen').then((m) => ({ default: m.AskScreen })))

export default function App() {
  const { lang, t, toggle: toggleLanguage } = useLanguage()
  const { large, toggle: toggleTextSize } = useTextSize(lang)
  useBackendInfo() // wakes the free backend while the visitor reads the page
  const { screen, go } = useScreen()
  const analysis = useBillAnalysis()
  const [consent, setConsent] = useState(false)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const previousScreen = useRef(screen)

  // Guards: a refresh or a typed address can land on a screen whose inputs are gone.
  useEffect(() => {
    if ((screen === 'photo' || screen === 'check') && !consent) go('consent', { replace: true })
    else if (screen === 'check' && !photo) go('photo', { replace: true })
    // `submitting` covers the moment between leaving the check screen and the upload starting.
    else if (screen === 'reading' && analysis.status === 'idle' && !submitting) go('home', { replace: true })
    else if (['answer', 'details', 'ask'].includes(screen) && !analysis.result) go('home', { replace: true })
  }, [screen, consent, photo, submitting, analysis.status, analysis.result, go])

  // Each new screen: name it in the tab title; when the screen actually changes, start at the top. Comparing with the previous screen (not "first render") also holds in
  // React's development mode, which runs effects twice and once moved focus on page load.
  useEffect(() => {
    document.title = t.docTitles[screen]
    if (previousScreen.current === screen) return
    previousScreen.current = screen
    window.scrollTo(0, 0)
    // Step screens focus their own heading when they appear (FlowLayout); home is not lazy-loaded.
    if (screen === 'home') requestAnimationFrame(() => document.getElementById('screen-title')?.focus())
  }, [screen, t])

  // Free the preview image's memory when a different photo is chosen. Keyed on the URL, not the
  // photo object: the check result updates the object but must keep showing the same preview.
  const photoUrl = photo?.url
  useEffect(() => () => { if (photoUrl) URL.revokeObjectURL(photoUrl) }, [photoUrl])

  async function choosePhoto(file: File) {
    const base = { file, url: URL.createObjectURL(file), img: null }
    setPhoto({ ...base, issues: null, unreadable: false })
    go('check')
    try {
      const img = await loadImage(file)
      setPhoto({ ...base, img, issues: assess(analyzePhoto(img)), unreadable: false })
    } catch {
      setPhoto({ ...base, issues: null, unreadable: true })
    }
  }

  async function submitPhoto() {
    if (!photo) return
    setSubmitting(true)
    go('reading')
    try {
      const upload = photo.img ? await prepareForUpload(photo.img, photo.file) : photo.file
      if (await analysis.analyze(upload)) go('answer', { replace: true })
    } finally {
      setSubmitting(false)
    }
  }

  function showSample() {
    analysis.showSample(SAMPLE_RESULT)
    go('answer')
  }

  const result = analysis.result
  return (
    <>
      <SiteHeader lang={lang} t={t} showNav={screen === 'home'} largeText={large}
                  onToggleLanguage={toggleLanguage} onToggleTextSize={toggleTextSize} onHome={() => go('home')} />
      <main id="main" tabIndex={-1} className="text-lg outline-none">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
        {screen === 'home' && <HomeScreen lang={lang} t={t} onStart={() => go(consent ? 'photo' : 'consent')} onSample={showSample} />}
        {screen === 'consent' && <ConsentScreen t={t} onBack={() => go('home')} onAgree={() => { setConsent(true); go('photo', { replace: true }) }} />}
        {screen === 'photo' && consent && <PhotoScreen t={t} onBack={() => go('home')} onFile={choosePhoto} />}
        {screen === 'check' && photo && <CheckScreen t={t} photo={photo} onBack={() => go('photo')} onRetake={() => go('photo')} onUse={submitPhoto} />}
        {screen === 'reading' && <ReadingScreen lang={lang} t={t} error={analysis.error} onRetake={() => go('photo')} onRetry={submitPhoto} />}
        {screen === 'answer' && result && (
          <AnswerScreen result={result} sample={analysis.sample} lang={lang} t={t} onBack={() => go('home')}
                        onDetails={() => go('details')} onAsk={() => go('ask')} onNewBill={() => go(consent ? 'photo' : 'consent')} />
        )}
        {screen === 'details' && result && <DetailsScreen result={result} history={analysis.history} lang={lang} t={t} onBack={() => go('answer')} />}
        {screen === 'ask' && result && <AskScreen bill={result.bill} t={t} onBack={() => go('answer')} />}
        </Suspense>
      </main>
      {screen === 'home' && <SiteFooter t={t} />}
    </>
  )
}
