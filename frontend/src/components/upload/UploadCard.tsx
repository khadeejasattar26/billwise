import { forwardRef, useState } from 'react'
import type { Strings } from '../../i18n'
import { CameraIcon, ChevronIcon, ShieldIcon } from '../ui/icons'
import { button, card, focusRing } from '../ui/styles'

type Props = {
  t: Strings
  busy: boolean
  storage: 'postgres' | 'off' | null
  onFile: (file: File) => void
}

/**
 * Consent, then the photo. The real <input type="file"> is hidden and opened by the visible button;
 * it stays out of the Tab order and the accessibility tree (QA: it was an invisible Tab stop).
 * The ref lets "upload another bill" further down the page open the same picker.
 */
export const UploadCard = forwardRef<HTMLInputElement, Props>(function UploadCard({ t, busy, storage, onFile }, inputRef) {
  const [consent, setConsent] = useState(false)
  const openPicker = () => (inputRef && 'current' in inputRef ? inputRef.current?.click() : undefined)

  return (
    <div className={`${card} space-y-4`}>
      <h2 className="text-xl font-bold text-ink">{t.uploadCardTitle}</h2>
      <input
        ref={inputRef}
        id="bill-file"
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        aria-label={t.upload}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = '' // the same photo can be chosen again
          if (file) onFile(file)
        }}
      />
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-900/10 hover:bg-slate-100">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className={`mt-1.5 size-6 shrink-0 accent-brand-700 ${focusRing}`}
        />
        <span className="text-base sm:text-lg">{t.consent}</span>
      </label>
      <button type="button" disabled={busy || !consent} onClick={openPicker} className={`${button.primary} w-full px-6 py-4 text-xl sm:text-2xl`}>
        <CameraIcon className="size-7 shrink-0" />
        <span>{busy ? t.uploading : t.upload}</span>
      </button>
      <p className="text-base text-slate-700">{t.uploadHint}</p>
      {storage && (
        <details className="group text-base text-slate-700">
          <summary className={`flex cursor-pointer items-center gap-2 rounded-lg font-semibold ${focusRing}`}>
            <ShieldIcon className="size-5 shrink-0 text-brand-700" />
            <span>{storage === 'off' ? t.privacyShortNothing : t.privacyShortStored}</span>
            <ChevronIcon className="size-4 shrink-0 transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-2 text-slate-600">{storage === 'off' ? t.privacyNothing : t.privacyStored}</p>
        </details>
      )}
    </div>
  )
})
