import { useEffect, useState } from 'react'
import type { Lang } from '../i18n'

const KEY = 'billwise-large-text'

/**
 * Bigger text on request (NN/g: let users enlarge text). Everything is sized in rem, so changing the
 * root size scales the whole page. Urdu starts larger: Nastaliq looks smaller than Latin at one size.
 */
export function useTextSize(lang: Lang) {
  const [large, setLarge] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const base = lang === 'ur' ? 112.5 : 100
    document.documentElement.style.fontSize = `${base * (large ? 1.2 : 1)}%`
    try {
      localStorage.setItem(KEY, large ? '1' : '0')
    } catch {
      /* not remembered */
    }
  }, [lang, large])

  return { large, toggle: () => setLarge((v) => !v) }
}
