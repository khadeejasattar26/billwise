import { useSpeech } from '../../hooks/useSpeech'
import type { Lang, Strings } from '../../i18n'
import { SpeakerIcon, StopIcon } from '../ui/icons'
import { button } from '../ui/styles'

/** The answer itself, first and largest, with the Listen button beside the heading. */
export function PlainWords({ text, lang, t }: { text: string; lang: Lang; t: Strings }) {
  return (
    <section aria-labelledby="plain-h" className="rounded-[var(--radius-card)] bg-brand-800 p-6 text-white shadow-[var(--shadow-card)] sm:p-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="plain-h" className="text-2xl font-bold">{t.plainWords}</h2>
        {/* Keyed by text + language so switching language starts with fresh audio. */}
        <ListenButton key={lang + text} text={text} lang={lang} t={t} />
      </div>
      <p className="text-xl ltr:leading-relaxed sm:text-2xl">{text}</p>
    </section>
  )
}

function ListenButton({ text, lang, t }: { text: string; lang: Lang; t: Strings }) {
  const { state, toggle } = useSpeech(text, lang)
  const playing = state === 'playing'
  return (
    <div>
      <button type="button" onClick={toggle} aria-pressed={playing}
              className={`${button.light} px-5 py-2 text-lg`}>
        {playing ? <StopIcon className="size-5" /> : <SpeakerIcon className="size-5" />}
        <span>{playing ? t.stop : state === 'loading' ? t.listenLoading : t.listen}</span>
      </button>
      {state === 'failed' && <p role="status" className="mt-2 max-w-xs text-base text-brand-100">{t.listenFailed}</p>}
    </div>
  )
}
