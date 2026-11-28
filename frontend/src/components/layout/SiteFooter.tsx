import { FEEDBACK_URL } from '../../lib/constants'
import type { Strings } from '../../i18n'
import { MessageIcon } from '../ui/icons'
import { button, container } from '../ui/styles'
import { Logo } from './Logo'

const YEAR = new Date().getFullYear() // read once at load, not on every render

export function SiteFooter({ t }: { t: Strings }) {
  return (
    <footer className="border-t border-brand-900/10 bg-white">
      <div className={`${container} grid gap-6 py-7 md:grid-cols-[1.4fr_1fr] md:items-start sm:py-9`}>
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xl text-base text-slate-600">{t.footerDisclaimer}</p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          {FEEDBACK_URL && (
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className={`${button.secondary} px-5 py-3 text-base`}>
              <MessageIcon className="size-5" /> {t.feedback}
            </a>
          )}
          <p className="latin text-sm text-slate-500">© {YEAR} BillWise</p>
        </div>
      </div>
    </footer>
  )
}
