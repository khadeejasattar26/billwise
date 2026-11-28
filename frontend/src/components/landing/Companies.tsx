import { PITC_DISCO_CODES } from '../../lib/constants'
import type { Strings } from '../../i18n'
import { sectionTitle } from '../ui/styles'

export function Companies({ t }: { t: Strings }) {
  return (
    <section aria-labelledby="companies-h" className="min-w-0">
      <h2 id="companies-h" className={sectionTitle}>{t.companiesTitle}</h2>
      <p className="mt-3 text-base text-slate-700">{t.companiesText}</p>
      <ul role="list" className="mt-5 flex flex-wrap gap-2">
        {PITC_DISCO_CODES.map((code) => (
          <li key={code} className="latin rounded border border-brand-900/10 bg-white px-2.5 py-1 text-sm font-semibold text-brand-800">{code}</li>
        ))}
      </ul>
    </section>
  )
}
