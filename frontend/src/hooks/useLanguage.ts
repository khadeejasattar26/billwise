import { useEffect, useState } from 'react'
import { STRINGS, type Lang } from '../i18n'

const LANG_KEY = 'billwise-lang'

function savedLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ur'
  } catch {
    return 'ur' // storage blocked (private mode): default to Urdu
  }
}

/** Page language: Urdu by default, remembered per browser, applied to <html lang dir>. */
export function useLanguage() {
  const [lang, setLang] = useState<Lang>(savedLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* storage blocked: the choice just won't be remembered */
    }
  }, [lang])

  return { lang, t: STRINGS[lang], toggle: () => setLang((l) => (l === 'ur' ? 'en' : 'ur')) }
}
