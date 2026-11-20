import type { Lang, Strings } from '../../i18n'
import { container, focusRing } from '../ui/styles'
import { Logo } from './Logo'

type Props = { lang: Lang; t: Strings; onToggleLanguage: () => void }

export function SiteHeader({ lang, t, onToggleLanguage }: Props) {
  const navLink = `rounded-lg px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-ink ${focusRing}`
  return (
    <>
      {/* First Tab stop: lets keyboard and screen-reader users jump past the header. */}
      <a href="#main" className={`sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:start-4 focus:top-4 ${focusRing}`}>
        {t.skipToContent}
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-paper/85 backdrop-blur">
        <div className={`${container} flex h-16 items-center justify-between gap-4`}>
          <a href="#top" className={`rounded-xl ${focusRing}`} aria-label="BillWise">
            <Logo />
          </a>
          <nav aria-label={lang === 'ur' ? 'صفحے کے حصے' : 'Page sections'} className="hidden md:block">
            <ul className="flex items-center gap-1">
              <li><a className={navLink} href="#how">{t.navHow}</a></li>
              <li><a className={navLink} href="#checks">{t.navChecks}</a></li>
              <li><a className={navLink} href="#faq">{t.navFaq}</a></li>
            </ul>
          </nav>
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label={t.switchLabel}
            lang={lang === 'ur' ? 'en' : 'ur'}
            className={`rounded-full border-2 border-brand-700 bg-white px-4 py-1.5 font-semibold text-brand-800 hover:bg-brand-50 ${focusRing}`}
          >
            {t.switchTo}
          </button>
        </div>
      </header>
    </>
  )
}
