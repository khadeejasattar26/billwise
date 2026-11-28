import { useCallback, useEffect, useState } from 'react'
import { hashFor, screenFromHash, type Screen } from './screens'

/** Current screen from the URL hash, and a way to move: push (back works) or replace (skip in history). */
export function useScreen() {
  const [screen, setScreen] = useState<Screen>(() => screenFromHash(window.location.hash))

  useEffect(() => {
    const sync = () => setScreen(screenFromHash(window.location.hash))
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const go = useCallback((next: Screen, options: { replace?: boolean } = {}) => {
    const url = hashFor(next)
    if (window.location.hash === url) return
    if (options.replace) window.history.replaceState(window.history.state, '', url)
    else window.history.pushState({ billwisePrevious: screenFromHash(window.location.hash) }, '', url)
    setScreen(next)
  }, [])

  const back = useCallback((fallback: Screen) => {
    if (window.history.state?.billwisePrevious) window.history.back()
    else go(fallback, { replace: true })
  }, [go])

  return { screen, go, back }
}
