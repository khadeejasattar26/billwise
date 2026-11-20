import { useState, type FormEvent } from 'react'
import { ApiError, askAboutBill, askWithBill, type Bill } from '../../api'
import type { Strings } from '../../i18n'
import { isUrduScript } from '../../lib/format'
import { button, card, focusRing } from '../ui/styles'

const MIN_QUESTION = 3

export function AskBox({ bill, t }: { bill: Bill; t: Strings }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const ready = question.trim().length >= MIN_QUESTION

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!ready) return
    setLoading(true)
    setError(null)
    try {
      // A stored bill is looked up by its random id; otherwise the browser sends the bill itself.
      setAnswer(bill.public_id ? await askAboutBill(bill.public_id, question.trim()) : await askWithBill(bill, question.trim()))
    } catch (err) {
      setError(err instanceof ApiError ? (t.errors[err.code] ?? err.message) : t.errors.default)
    } finally {
      setLoading(false)
    }
  }

  // An Urdu answer gets the Urdu font and right-to-left layout, whatever the page language.
  const urdu = answer ? isUrduScript(answer) : false

  return (
    <section aria-labelledby="ask-h" className={card}>
      <h2 id="ask-h" className="text-2xl font-bold text-ink">{t.askTitle}</h2>
      <p className="mb-4 mt-1 text-base text-slate-600">{t.askHint}</p>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="question" className="sr-only">{t.askLabel}</label>
        <input id="question" dir="auto" value={question} onChange={(e) => setQuestion(e.target.value)}
               placeholder={t.askPlaceholder} maxLength={500} autoComplete="off"
               className={`flex-1 rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 text-xl ${focusRing}`} />
        <button type="submit" disabled={loading || !ready} className={`${button.dark} px-6 py-3 text-xl`}>
          {loading ? t.asking : t.ask}
        </button>
      </form>
      {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
      {answer && (
        <p data-testid="answer" lang={urdu ? 'ur' : 'en'} dir={urdu ? 'rtl' : 'ltr'} className="mt-4 rounded-2xl bg-slate-100 p-5 text-xl">
          {answer}
        </p>
      )}
    </section>
  )
}
