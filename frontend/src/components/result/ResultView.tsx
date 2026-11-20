import type { Bill, UploadResult } from '../../api'
import { discoName, type Lang, type Strings } from '../../i18n'
import { CameraIcon } from '../ui/icons'
import { button } from '../ui/styles'
import { AskBox } from './AskBox'
import { BillDetails } from './BillDetails'
import { ChargesCard } from './ChargesCard'
import { PerUnit, WhatIsAUnit } from './MoreAboutUnits'
import { PlainWords } from './PlainWords'
import { SummaryCards } from './SummaryCards'
import { UnitsChart } from './UnitsChart'
import { WarningsBox } from './WarningsBox'
import { WhyCard } from './WhyCard'

type Props = { result: UploadResult; history: Bill[]; lang: Lang; t: Strings; onNewBill: () => void }

/**
 * Order decided in the UI review for older readers on phones: the answer first, then why, then the
 * numbers, then everything else folded or further down.
 */
export function ResultView({ result, history, lang, t, onNewBill }: Props) {
  const { bill, fields, comparison } = result
  const explanation = lang === 'ur' && bill.explanation_ur ? bill.explanation_ur : bill.explanation
  const company = discoName(fields.disco, lang)
  // "OCR failed" only when OCR ran first; with OCR off (the free host) the photo is the only reading.
  const readMode = bill.extraction_mode === 'ocr' ? t.readOcr : result.attempts > 1 ? t.readVision : t.readPhoto
  const technical = `${readMode} ${t.attempts(result.attempts)}.` + (result.reminder_scheduled ? ` ${t.reminderOn}` : '')

  return (
    <div className="space-y-6">
      {company && (
        <p className="text-base text-slate-600">
          {t.issuedBy}: <span className="font-semibold text-ink">{company}</span>
        </p>
      )}
      <WarningsBox warnings={bill.warnings} lang={lang} t={t} />
      <PlainWords text={explanation} lang={lang} t={t} />
      <WhyCard insights={result.insights} printed={comparison?.source === 'printed'} lang={lang} t={t} />
      <SummaryCards bill={bill} comparison={comparison} lang={lang} t={t} />
      <ChargesCard fields={fields} t={t} />
      <UnitsChart fields={fields} bills={history} currentId={bill.public_id} lang={lang} t={t} />
      <AskBox bill={bill} t={t} />
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <PerUnit result={result} t={t} />
        <WhatIsAUnit comparison={comparison} t={t} />
      </div>
      <BillDetails fields={fields} warnings={bill.warnings} technical={technical} lang={lang} t={t} />
      <button type="button" onClick={onNewBill} className={`${button.secondary} w-full px-6 py-4 text-xl`}>
        <CameraIcon className="size-6" /> <span>{t.newBill}</span>
      </button>
    </div>
  )
}
