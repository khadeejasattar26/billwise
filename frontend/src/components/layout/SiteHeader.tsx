import type { Lang, Strings } from '../../i18n'
import { TextSizeIcon } from '../ui/icons'
import { container, focusRing } from '../ui/styles'
import { Logo } from './Logo'

type Props = {
  lang: Lang
  t: Strings
  showNav: boolean
  largeText: boolean
  onToggleLanguage: () => void
  onToggleTextSize: () => void
  onHome: () => void
}

/** Logo (home), section links on the home page only, larger-text and language switches (48 px targets). */
export function SiteHeader({ lang, t, showNav, largeText, onToggleLanguage, onToggleTextSize, onHome }: Props) {
  const navLink = `inline-flex min-h-12 items-center rounded-lg px-3 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-ink ${focusRing}`
  // px sizes: header controls stay the same size whatever the text setting (48 px tall targets).
  const pill = `inline-flex min-h-[48px] items-center gap-[6px] rounded-full border-2 border-brand-700 bg-white px-[14px] text-[16px] leading-none text-brand-800 hover:bg-brand-50 ${focusRing}`
  return (
    <>
      <a href="#main" className={`sr-only z-50 rounded-lg bg-white px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:start-4 focus:top-4 ${focusRing}`}
         onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }}>
        {t.skipToContent}
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-900/5 bg-paper/90 backdrop-blur">
        <div className={`${container} flex h-[64px] items-center justify-between gap-2`}>
          <button type="button" onClick={onHome} className={`inline-flex min-h-[48px] items-center rounded-xl ${focusRing}`} aria-label="BillWise">
            <Logo />
          </button>
          {showNav && (
            <nav aria-label={lang === 'ur' ? 'صفحے کے حصے' : 'Page sections'} className="hidden lg:block">
              <ul className="flex items-center gap-1">
                <li><a className={navLink} href="#how">{t.navHow}</a></li>
                <li><a className={navLink} href="#checks">{t.navChecks}</a></li>
                <li><a className={navLink} href="#faq">{t.navFaq}</a></li>
              </ul>
            </nav>
          )}
          <div className="flex items-center gap-2">
            <button type="button" onClick={onToggleTextSize} aria-pressed={largeText} className={`${pill} px-[12px]`}
                    aria-label={largeText ? t.normalText : t.largerText}>
              <TextSizeIcon className="size-[20px]" />
              <span className="hidden sm:inline">{largeText ? t.normalText : t.largerText}</span>
            </button>
            <button type="button" onClick={onToggleLanguage} aria-label={t.switchLabel} lang={lang === 'ur' ? 'en' : 'ur'} className={pill}>
              {t.switchTo}
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
