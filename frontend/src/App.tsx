import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { SiteFooter } from './components/layout/SiteFooter'
import { SiteHeader } from './components/layout/SiteHeader'
import { SAMPLE_RESULT } from './data/sampleBill'
import { screenFromHash } from './flow/screens'
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
  const { storage } = useBackendInfo()
  const { screen, go, back } = useScreen()
  const analysis = useBillAnalysis()
  const [consent, setConsent] = useState(false)
  const [photo, setPhoto] = useState<Photo | null>(null)
  const pendingUpload = useRef<AbortController | null>(null)
  const previousScreen = useRef(screen)

  // Guards: a refresh or a typed address can land on a screen whose inputs are gone.
  useEffect(() => {
    if ((screen === 'photo' || screen === 'check') && !consent) go('consent', { replace: true })
    else if (screen === 'check' && !photo) go('photo', { replace: true })
    else if (screen === 'reading' && !pendingUpload.current && analysis.status !== 'error') go(photo ? 'check' : 'home', { replace: true })
    else if (['answer', 'details', 'ask'].includes(screen) && !analysis.result) go('home', { replace: true })
  }, [screen, consent, photo, analysis.status, analysis.result, go])

  useEffect(() => {
    if (screen === 'reading') return
    pendingUpload.current?.abort()
    pendingUpload.current = null
  }, [screen])

  // Each new screen: name it in the tab title; when the screen actually changes, start at the top. Comparing with the previous screen (not "first render") also holds in
  // React's development mode, which runs effects twice and once moved focus on page load.
  useEffect(() => {
    document.title = screen === 'reading' && analysis.error ? `${t.errorTitle} · BillWise` : t.docTitles[screen]
    if (previousScreen.current === screen) return
    previousScreen.current = screen
    window.scrollTo(0, 0)
    // Step screens focus their own heading when they appear (FlowLayout); home is not lazy-loaded.
    if (screen === 'home') requestAnimationFrame(() => document.getElementById('screen-title')?.focus())
  }, [screen, t, analysis.error])

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
      const issues = assess(analyzePhoto(img))
      setPhoto((current) => current?.url === base.url ? { ...current, img, issues } : current)
    } catch {
      setPhoto((current) => current?.url === base.url ? { ...current, unreadable: true } : current)
    }
  }

  async function submitPhoto() {
    if (!consent || !photo || photo.unreadable || !photo.img || pendingUpload.current) return
    const controller = new AbortController()
    pendingUpload.current = controller
    analysis.start()
    go('reading')
    try {
      const upload = await prepareForUpload(photo.img, photo.file).catch(() => photo.file)
      if (controller.signal.aborted || screenFromHash(window.location.hash) !== 'reading') return
      if (await analysis.analyze(upload, controller.signal) && screenFromHash(window.location.hash) === 'reading') {
        go('answer', { replace: true })
      }
    } finally {
      if (pendingUpload.current === controller) pendingUpload.current = null
    }
  }

  function showSample() {
    analysis.showSample(SAMPLE_RESULT)
    go('answer')
  }

  function goHome() {
    if (screen === 'home') {
      go('home', { replace: true })
      window.scrollTo(0, 0)
    } else go('home')
  }

  const result = analysis.result
  return (
    <>
      <SiteHeader lang={lang} t={t} showNav={screen === 'home'} largeText={large}
                  onToggleLanguage={toggleLanguage} onToggleTextSize={toggleTextSize} onHome={goHome} />
      <main id="main" tabIndex={-1} className="text-lg outline-none">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
        {screen === 'home' && <HomeScreen lang={lang} t={t} onStart={() => go(consent ? 'photo' : 'consent')} onSample={showSample} />}
        {screen === 'consent' && <ConsentScreen t={t} stored={storage === 'postgres'} onBack={() => back('home')} onAgree={() => { setConsent(true); go('photo', { replace: true }) }} />}
        {screen === 'photo' && consent && <PhotoScreen t={t} onBack={() => back('home')} onFile={choosePhoto} />}
        {screen === 'check' && consent && photo && <CheckScreen t={t} photo={photo} onBack={() => back('photo')} onRetake={() => back('photo')} onUse={submitPhoto} />}
        {screen === 'reading' && <ReadingScreen key={analysis.error ? 'error' : 'reading'} lang={lang} t={t} error={analysis.error}
          onBack={() => back(photo ? 'check' : 'home')} onRetake={() => go('photo', { replace: true })} onRetry={submitPhoto} />}
        {screen === 'answer' && result && (
          <AnswerScreen result={result} sample={analysis.sample} lang={lang} t={t} onBack={() => back('home')}
                        onDetails={() => go('details')} onAsk={() => go('ask')} onNewBill={() => go(consent ? 'photo' : 'consent')} />
        )}
        {screen === 'details' && result && <DetailsScreen result={result} history={analysis.history} lang={lang} t={t} onBack={() => back('answer')} />}
        {screen === 'ask' && result && <AskScreen bill={result.bill} t={t} onBack={() => back('answer')} />}
        </Suspense>
      </main>
      {screen === 'home' && <SiteFooter t={t} />}
    </>
  )
}
