import type { Bill } from '../api'
import { FlowLayout } from '../components/layout/FlowLayout'
import { AskBox } from '../components/result/AskBox'
import type { Strings } from '../i18n'

export function AskScreen({ bill, t, onBack }: { bill: Bill; t: Strings; onBack: () => void }) {
  return (
    <FlowLayout t={t} title={t.askScreenTitle} onBack={onBack}>
      <AskBox bill={bill} t={t} suggestions={t.suggestions} showTitle={false} />
    </FlowLayout>
  )
}
