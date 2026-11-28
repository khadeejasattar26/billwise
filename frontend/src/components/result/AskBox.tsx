import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ApiError, askAboutBill, askWithBill, type Bill } from '../../api'
import type { Strings } from '../../i18n'
import { isUrduScript } from '../../lib/format'
import { button, card, focusRing } from '../ui/styles'

const MIN_QUESTION = 3

/** Ready-made question chips spare older users from typing; tapping one asks it straight away. */
export function AskBox({ bill, t, suggestions = [], showTitle = true }: { bill: Bill; t: Strings; suggestions?: string[]; showTitle?: boolean }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ready = question.trim().length >= MIN_QUESTION
  const answerRef = useRef<HTMLParagraphElement>(null)

  // The answer appears below the chips and the box: bring it into view when it arrives.
  useEffect(() => {
    if (answer) answerRef.current?.scrollIntoView?.({ block: 'nearest' })
  }, [answer])

  async function ask(text: string) {
    const q = text.trim()
    if (q.length < MIN_QUESTION || loading) return
    setLoading(true)
    setAnswer(null)
    setError(null)
    try {
      // A stored bill is looked up by its random id; otherwise the browser sends the bill itself.
      setAnswer(bill.public_id ? await askAboutBill(bill.public_id, q) : await askWithBill(bill, q))
    } catch (err) {
      setError(err instanceof ApiError ? (t.errors[err.code] ?? t.errors.default) : t.errors.default)
    } finally {
      setLoading(false)
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    void ask(question)
  }

  // An Urdu answer gets the Urdu font and right-to-left layout, whatever the page language.
  const urdu = answer ? isUrduScript(answer) : false

  return (
    <section aria-labelledby={showTitle ? 'ask-h' : 'screen-title'} className={card}>
      {showTitle && <h2 id="ask-h" className="text-2xl text-ink ltr:font-bold">{t.askTitle}</h2>}
      <p className="mb-4 mt-1 text-base text-slate-600">{t.askHint}</p>
      {suggestions.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-base text-slate-700">{t.suggestionsTitle}</p>
          <ul className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <li key={s}>
                <button type="button" disabled={loading} onClick={() => { setQuestion(s); void ask(s) }}
                        className={`min-h-12 rounded-full bg-brand-50 px-4 text-lg text-brand-900 ring-1 ring-brand-200 hover:bg-brand-100 disabled:opacity-50 ${focusRing}`}>
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="question" className="sr-only">{t.askLabel}</label>
        <input id="question" dir="auto" value={question} onChange={(e) => setQuestion(e.target.value)}
               placeholder={t.askPlaceholder} maxLength={500} autoComplete="off" readOnly={loading}
               className={`min-h-14 min-w-0 flex-1 rounded-2xl border border-slate-400 bg-white px-4 text-lg ${focusRing}`} />
        <button type="submit" disabled={loading || !ready} className={`${button.dark} min-h-14 px-6 text-xl`}>
          {t.ask}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {/* Announced by screen readers when it arrives. */}
      <div role="status">{loading && <p className="mt-4 text-base text-slate-600">{t.asking}</p>}{answer && (
        <p ref={answerRef} data-testid="answer" lang={urdu ? 'ur' : 'en'} dir={urdu ? 'rtl' : 'ltr'} className="mt-4 rounded-2xl bg-brand-50 p-4 text-lg whitespace-pre-line [overflow-wrap:anywhere]">
          {answer}
        </p>
      )}</div>
    </section>
  )
}
