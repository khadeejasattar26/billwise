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
  const action = `min-h-14 w-full justify-start px-5 text-lg`
  return (
    <FlowLayout t={t} title={t.answerTitle} onBack={onBack}>
      {sample && <p className="rounded-2xl bg-sky-50 p-4 text-base text-sky-950 ring-1 ring-sky-200">{t.sampleBanner}</p>}
      {company && <p className="text-base text-slate-600">{t.issuedBy}: <span className="text-ink">{company}</span></p>}
      <WarningsBox warnings={bill.warnings} lang={lang} t={t} />
      <PayCard bill={bill} fields={fields} lang={lang} t={t} />
      <PlainWords text={explanation} lang={lang} t={t} />
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
      <nav aria-label={t.answerTitle} className="space-y-3">
        <button type="button" onClick={onDetails} className={`${button.secondary} ${action}`}><ChartIcon className="size-6" /> {t.seeDetails}</button>
        <button type="button" onClick={onAsk} className={`${button.secondary} ${action}`}><MessageIcon className="size-6" /> {t.askCta}</button>
        <button type="button" onClick={onNewBill} className={`${button.secondary} ${action}`}><CameraIcon className="size-6" /> {t.newBillCta}</button>
      </nav>
      <p className="text-sm text-slate-500">{t.footerDisclaimer}</p>
    </FlowLayout>
  )
}
