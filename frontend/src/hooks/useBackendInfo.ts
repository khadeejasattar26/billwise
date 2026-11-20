import { useEffect, useState } from 'react'
import { wakeBackend } from '../api'

/**
 * Pings the backend on page load. The free host sleeps after 15 idle minutes and takes about a
 * minute to wake, so starting now hides most of that wait. The answer also says whether bills are
 * stored, which decides the privacy notice.
 */
export function useBackendInfo() {
  const [storage, setStorage] = useState<'postgres' | 'off' | null>(null)
  useEffect(() => {
    let alive = true
    wakeBackend().then((health) => alive && setStorage(health?.storage ?? null))
    return () => {
      alive = false
    }
  }, [])
  return { storage }
}
