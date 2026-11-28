import type { UploadResult } from '../api'
import { FlowLayout } from '../components/layout/FlowLayout'
import { PayCard } from '../components/result/PayCard'
import { PlainWords } from '../components/result/PlainWords'
import { WarningsBox } from '../components/result/WarningsBox'
import { AlertIcon, CameraIcon, ChartIcon, MessageIcon } from '../components/ui/icons'
import { button, card } from '../components/ui/styles'
import { discoName, insightText, type Lang, type Strings } from '../i18n'

const IMPORTANT = ['arrears', 'unprotected_because', 'unprotected', 'over_limit']

type Props = {
  result: UploadResult; sample: boolean; lang: Lang; t: Strings
  onBack: () => void; onDetails: () => void; onAsk: () => void; onNewBill: () => void
}

/**
 * Progressive disclosure (NN/g): only what matters first: how much, by when, the main reason and a
 * way to listen. Everything else is one tap away on the details screen.
 */
export function AnswerScreen({ result, sample, lang, t, onBack, onDetails, onAsk, onNewBill }: Props) {
  const { bill, fields } = result
  const explanation = lang === 'ur' && bill.explanation_ur ? bill.explanation_ur : bill.explanation
  const main = result.insights.filter((i) => IMPORTANT.includes(i.code)).slice(0, 2)
  const company = discoName(fields.disco, lang)
  const action = 'min-h-14 w-full px-4 py-1.5 text-lg'
  return (
    <FlowLayout t={t} title={t.answerTitle} onBack={onBack}>
      {sample && <p className="rounded-xl border border-brand-900/10 bg-brand-50 px-3 py-2 text-base text-brand-900">{t.sampleBanner}</p>}
      {!sample && company && <p className="text-base text-slate-600">{t.issuedBy}: <span className="text-ink">{company}</span></p>}
      <WarningsBox warnings={bill.warnings} lang={lang} t={t} />
      <PayCard bill={bill} fields={fields} lang={lang} t={t} />
      <PlainWords text={explanation} lang={lang} t={t} />
      <nav aria-label={t.answerTitle} className="grid gap-2.5 sm:grid-cols-2">
        <button type="button" onClick={onDetails} className={`${button.secondary} ${action}`}><ChartIcon className="size-5 shrink-0" /> {t.seeDetails}</button>
        <button type="button" onClick={onAsk} className={`${button.secondary} ${action}`}><MessageIcon className="size-5 shrink-0" /> {t.askCta}</button>
      </nav>
      {main.length > 0 && (
        <section aria-labelledby="main-h" className={card}>
          <h2 id="main-h" className="text-xl text-ink ltr:font-bold">{t.mainReasons}</h2>
          <ul className="mt-3 space-y-3">
            {main.map((i) => (
              <li key={i.code} className="flex gap-3 text-lg">
                <AlertIcon className="mt-1 size-6 shrink-0 text-amber-700" /> <span>{insightText(i.code, i.values, lang)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <button type="button" onClick={onNewBill} className={`${button.primary} ${action}`}><CameraIcon className="size-5 shrink-0" /> {t.newBillCta}</button>
      <p className="text-sm text-slate-600">{t.footerDisclaimer}</p>
    </FlowLayout>
  )
}
