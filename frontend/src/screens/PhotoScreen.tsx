import { useRef } from 'react'
import { FlowLayout } from '../components/layout/FlowLayout'
import { CameraIcon, CornersIcon, FlatIcon, ImageIcon, SunIcon } from '../components/ui/icons'
import { button, card } from '../components/ui/styles'
import type { Strings } from '../i18n'

const TIP_ICONS = [FlatIcon, SunIcon, CornersIcon]
const ACCEPT = '.jpg,.jpeg,.png,image/jpeg,image/png' // iPhones convert HEIC to JPEG for this list

/**
 * Guidance before the photo (document-capture practice: flat, good light, all four corners), then
 * the camera directly (capture="environment") or the gallery. The inputs are opened by the visible
 * buttons and stay out of the Tab order and the accessibility tree.
 */
export function PhotoScreen({ t, onBack, onFile }: { t: Strings; onBack: () => void; onFile: (file: File) => void }) {
  const camera = useRef<HTMLInputElement>(null)
  const gallery = useRef<HTMLInputElement>(null)
  const take = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // the same photo can be chosen again
    if (file) onFile(file)
  }
  return (
    <FlowLayout t={t} title={t.photoTitle} step={2} onBack={onBack} actions={<>
        <button type="button" onClick={() => camera.current?.click()} className={`${button.primary} min-h-16 w-full px-6 text-xl`}>
          <CameraIcon className="size-7" /> {t.cameraCta}
        </button>
        <button type="button" onClick={() => gallery.current?.click()} className={`${button.secondary} min-h-14 w-full px-6 text-lg`}>
          <ImageIcon className="size-6" /> {t.galleryCta}
        </button>
    </>}>
      <ol className={`${card} space-y-5`}>
        {t.photoTips.map((tip, i) => {
          const Icon = TIP_ICONS[i]
          return (
            <li key={tip.title} className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Icon className="size-7" /></span>
              <div>
                <h2 className="text-xl text-ink ltr:font-bold">{tip.title}</h2>
                <p className="text-base text-slate-700">{tip.text}</p>
              </div>
            </li>
          )
        })}
      </ol>
      <input ref={camera} id="camera-input" type="file" accept={ACCEPT} capture="environment" className="sr-only" tabIndex={-1} aria-hidden="true" onChange={take} />
      <input ref={gallery} id="gallery-input" type="file" accept={ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={take} />
    </FlowLayout>
  )
}
