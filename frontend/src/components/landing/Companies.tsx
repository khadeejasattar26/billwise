import { DISCO_CODES } from '../../lib/constants'
import type { Strings } from '../../i18n'
import { container, sectionTitle } from '../ui/styles'

export function Companies({ t }: { t: Strings }) {
  return (
    <section aria-labelledby="companies-h" className={`${container} py-12`}>
      <h2 id="companies-h" className={sectionTitle}>{t.companiesTitle}</h2>
      <p className="mt-3 max-w-3xl text-lg text-slate-700">{t.companiesText}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {DISCO_CODES.map((code) => (
          <li key={code} className="latin rounded-xl bg-white px-3 py-1.5 text-base font-bold text-slate-800 ring-1 ring-slate-900/10">{code}</li>
        ))}
      </ul>
    </section>
  )
}
