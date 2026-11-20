import { FlowLayout } from '../components/layout/FlowLayout'
import { CheckIcon, ShieldIcon } from '../components/ui/icons'
import { button, card } from '../components/ui/styles'
import type { Strings } from '../i18n'

/** One question, one big answer: replaces the small checkbox that sat above the upload button. */
export function ConsentScreen({ t, onBack, onAgree }: { t: Strings; onBack: () => void; onAgree: () => void }) {
  return (
    <FlowLayout
      t={t}
      title={t.consentTitle}
      step={1}
      onBack={onBack}
      actions={
        <button type="button" onClick={onAgree} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>
          {t.consentYes}
        </button>
      }
    >
      <ul className={`${card} space-y-4`}>
        {t.consentPoints.map((point, i) => (
          <li key={point} className="flex gap-3 text-lg">
            {i === 2 ? <ShieldIcon className="mt-1 size-6 shrink-0 text-brand-700" /> : <CheckIcon className="mt-1 size-6 shrink-0 text-brand-700" />}
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </FlowLayout>
  )
}
