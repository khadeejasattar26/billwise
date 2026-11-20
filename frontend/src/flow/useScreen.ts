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
    if (options.replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
    setScreen(next)
  }, [])

  return { screen, go }
}
