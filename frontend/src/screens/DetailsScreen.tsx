import type { Bill, UploadResult } from '../api'
import { FlowLayout } from '../components/layout/FlowLayout'
import { BillDetails } from '../components/result/BillDetails'
import { ChargesCard } from '../components/result/ChargesCard'
import { PerUnit, WhatIsAUnit } from '../components/result/MoreAboutUnits'
import { SummaryCards } from '../components/result/SummaryCards'
import { UnitsChart } from '../components/result/UnitsChart'
import { WhyCard } from '../components/result/WhyCard'
import { card } from '../components/ui/styles'
import type { Lang, Strings } from '../i18n'

type Props = { result: UploadResult; history: Bill[]; lang: Lang; t: Strings; onBack: () => void }

export function DetailsScreen({ result, history, lang, t, onBack }: Props) {
  const { bill, fields, comparison } = result
  const readMode = bill.extraction_mode === 'ocr' ? t.readOcr : result.attempts > 1 ? t.readVision : t.readPhoto
  const technical = `${readMode} ${t.attempts(result.attempts)}.`
  return (
    <FlowLayout t={t} title={t.detailsScreenTitle} onBack={onBack} wide>
      <WhyCard insights={result.insights} printed={comparison?.source === 'printed'} lang={lang} t={t} />
      <SummaryCards bill={bill} comparison={comparison} lang={lang} t={t} />
      <ChargesCard fields={fields} t={t} />
      <UnitsChart fields={fields} bills={history} currentId={bill.public_id} lang={lang} t={t} />
      <PerUnit result={result} t={t} />
      <WhatIsAUnit comparison={comparison} t={t} />
      {/* Octopus Energy and the National Literacy Trust: explain the words printed on the bill. */}
      <section aria-labelledby="glossary-h" className={card}>
        <h2 id="glossary-h" className="text-2xl text-ink ltr:font-bold">{t.glossaryTitle}</h2>
        <dl className="mt-4 divide-y divide-slate-900/10">
          {t.glossary.map((entry) => (
            <div key={entry.term} className="py-3">
              <dt className="text-lg text-brand-800 ltr:font-bold">{entry.term}</dt>
              <dd className="mt-0.5 text-base text-slate-700">{entry.text}</dd>
            </div>
          ))}
        </dl>
      </section>
      <BillDetails fields={fields} warnings={bill.warnings} technical={technical} lang={lang} t={t} />
    </FlowLayout>
  )
}
