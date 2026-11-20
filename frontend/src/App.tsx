import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError, askAboutBill, listBills, uploadBill, type Bill, type BillFields, type Comparison, type UploadResult } from './api'
import { STRINGS, formatDate, formatNumber, type Lang, type Strings } from './i18n'

type Status = 'idle' | 'loading' | 'success' | 'error'

const LANG_KEY = 'billwise-lang'
const AC_KW = 1.5 // a 1.5-ton split AC draws roughly 1.5 kW
const focusRing = 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500'

function savedLang(): Lang {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ur'
  } catch {
    return 'ur'
  }
}

export default function App() {
  const [lang, setLang] = useState<Lang>(savedLang)
  const t = STRINGS[lang]
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<ApiError | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [history, setHistory] = useState<Bill[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr'
    try {
      localStorage.setItem(LANG_KEY, lang)
    } catch {
      /* storage blocked: the choice just won't be remembered */
    }
  }, [lang])

  async function handleFile(file: File | undefined) {
    if (!file) return
    setStatus('loading')
    setError(null)
    try {
      const uploaded = await uploadBill(file)
      setResult(uploaded)
      setHistory(await listBills(uploaded.bill.account_no))
      setStatus('success')
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('unknown', ''))
      setStatus('error')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-lg text-slate-800 sm:text-xl">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="latin text-4xl font-bold text-emerald-800">BillWise</h1>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{t.tagline}</p>
          <p className="mt-3 text-slate-700">{t.intro}</p>
        </div>
        <button
          type="button"
          onClick={() => setLang(lang === 'ur' ? 'en' : 'ur')}
          aria-label={t.switchLabel}
          lang={lang === 'ur' ? 'en' : 'ur'}
          className={`shrink-0 rounded-full border-2 border-emerald-700 px-5 py-2 font-semibold text-emerald-800 hover:bg-emerald-50 ${focusRing}`}
        >
          {t.switchTo}
        </button>
      </header>

      <section aria-label={t.upload} className="mb-8">
        <input
          ref={inputRef}
          id="bill-file"
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={status === 'loading'}
          onClick={() => inputRef.current?.click()}
          className={`w-full rounded-2xl bg-emerald-700 px-6 py-5 text-2xl font-bold text-white shadow hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 sm:w-auto ${focusRing}`}
        >
          📷 {status === 'loading' ? t.uploading : t.upload}
        </button>
        <p className="mt-2 text-base text-slate-600">{t.uploadHint}</p>
      </section>

      <div aria-live="polite">
        {status === 'idle' && (
          <p className="rounded-2xl border-2 border-dashed border-slate-300 p-6 text-center text-slate-600">{t.idle}</p>
        )}
        {status === 'loading' && (
          <p role="status" className="rounded-2xl bg-slate-100 p-6 text-center text-slate-700">{t.loading}</p>
        )}
        {status === 'error' && error && <ErrorPanel error={error} t={t} lang={lang} />}
        {status === 'success' && result && <Result result={result} history={history} lang={lang} t={t} />}
      </div>
    </main>
  )
}

function ErrorPanel({ error, t, lang }: { error: ApiError; t: Strings; lang: Lang }) {
  const message = lang === 'en' && error.message ? error.message : (t.errors[error.code] ?? t.errors.default)
  return (
    <div role="alert" className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-red-900">
      <p className="text-xl font-bold">{t.errorTitle}</p>
      <p className="mt-1">{message}</p>
      {error.details?.warnings && error.details.warnings.length > 0 && (
        <ul lang="en" dir="ltr" className="latin mt-2 list-disc pl-6 text-base">
          {error.details.warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}
    </div>
  )
}

function Result({ result, history, lang, t }: { result: UploadResult; history: Bill[]; lang: Lang; t: Strings }) {
  const { bill, fields, comparison } = result
  const explanation = lang === 'ur' && bill.explanation_ur ? bill.explanation_ur : bill.explanation
  return (
    <div className="space-y-8">
      {bill.warnings.length > 0 && (
        <div role="alert" className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 text-amber-900">
          <p className="font-bold">{t.warningsTitle}</p>
          <ul lang="en" dir="ltr" className="latin mt-1 list-disc pl-6 text-base">
            {bill.warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}

      <section aria-labelledby="glance-h">
        <h2 id="glance-h" className="mb-3 text-2xl font-bold">{t.glance}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card label={t.units} value={formatNumber(bill.units)} change={<Change diff={comparison?.units_diff} t={t} format={(n) => formatNumber(n)} />} />
          <Card label={t.bill} value={t.rupees(formatNumber(bill.amount))} change={<Change diff={comparison?.amount_diff} t={t} format={(n) => t.rupees(formatNumber(n))} />} />
          <Card label={t.dueDate} value={formatDate(bill.due_date, lang, true, true)} />
        </div>
      </section>

      <section aria-labelledby="plain-h" className="rounded-2xl bg-emerald-50 p-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h2 id="plain-h" className="text-2xl font-bold">{t.plainWords}</h2>
          <ListenButton key={lang + explanation} text={explanation} lang={lang} t={t} />
        </div>
        <p className="text-xl sm:text-2xl">{explanation}</p>
      </section>

      <PerUnit result={result} t={t} />
      <WhatIsAUnit comparison={comparison} t={t} />
      <AmountChart bills={history} currentId={bill.id} lang={lang} t={t} />
      <AskBox billId={bill.id} t={t} />
      <BillDetails fields={fields} warnings={bill.warnings} lang={lang} t={t} />

      <p className="text-base text-slate-600">
        {bill.extraction_mode === 'vision' ? t.readVision : t.readOcr} {t.attempts(result.attempts)}.{' '}
        {result.reminder_scheduled ? t.reminderOn : t.reminderOff}
      </p>
    </div>
  )
}

function Card({ label, value, change }: { label: string; value: string; change?: ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-slate-200 bg-white p-5">
      <p className="text-lg text-slate-600">{label}</p>
      <p className="mt-1 whitespace-nowrap text-3xl font-bold text-slate-900">{value}</p>
      {change && <div className="mt-2">{change}</div>}
    </div>
  )
}

function Change({ diff, t, format }: { diff: number | undefined; t: Strings; format: (n: number) => string }) {
  if (diff === undefined) return <p className="text-base text-slate-500">{t.firstBill}</p>
  if (diff === 0) return <p className="text-base text-slate-600">{t.same}</p>
  const up = diff > 0
  return (
    <p className={`text-base font-semibold ${up ? 'text-red-700' : 'text-emerald-700'}`}>
      <span aria-hidden="true">{up ? '▲ ' : '▼ '}</span>
      {up ? t.more(format(Math.abs(diff))) : t.less(format(Math.abs(diff)))}
    </p>
  )
}

function ListenButton({ text, lang, t }: { text: string; lang: Lang; t: Strings }) {
  const [speaking, setSpeaking] = useState(false)
  const [noVoice, setNoVoice] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Stop reading when the button goes away. The parent keys it on text + language,
  // so switching language also remounts it with fresh state.
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel()
    }
  }, [supported])

  if (!supported) return null

  function toggle() {
    const synth = window.speechSynthesis
    if (speaking) {
      synth.cancel()
      setSpeaking(false)
      return
    }
    const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
    if (!voice) {
      setNoVoice(true)
      return
    }
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.rate = 0.9 // a little slower than normal, easier to follow
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    synth.speak(utterance)
    setSpeaking(true)
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={speaking}
        className={`rounded-full bg-emerald-700 px-5 py-2 text-lg font-semibold text-white hover:bg-emerald-800 ${focusRing}`}
      >
        {speaking ? t.stop : t.listen}
      </button>
      {noVoice && <p role="status" className="mt-2 max-w-xs text-base text-slate-700">{t.noVoice}</p>}
    </div>
  )
}

function PerUnit({ result, t }: { result: UploadResult; t: Strings }) {
  if (result.cost_per_unit === null) return null
  const before = result.comparison?.previous_cost_per_unit
  return (
    <section aria-labelledby="per-unit-h" className="rounded-2xl border-2 border-slate-200 p-5">
      <h2 id="per-unit-h" className="mb-2 text-2xl font-bold">{t.perUnitTitle}</h2>
      <p className="text-xl font-semibold">{t.perUnitNow(formatNumber(result.cost_per_unit, 2))}</p>
      {before != null && <p className="text-slate-700">{t.perUnitBefore(formatNumber(before, 2))}</p>}
    </section>
  )
}

function WhatIsAUnit({ comparison, t }: { comparison: Comparison | null; t: Strings }) {
  const diff = comparison?.units_diff ?? 0
  return (
    <details className="group rounded-2xl border-2 border-slate-200 p-5">
      <summary className={`cursor-pointer rounded text-2xl font-bold ${focusRing}`}>{t.whatIsUnit}</summary>
      <div className="mt-3 space-y-3">
        <p>{t.unitDefinition}</p>
        <ul className="list-disc space-y-1 ps-6">
          {t.unitExamples.map((example) => <li key={example}>{example}</li>)}
        </ul>
        {diff > 0 && <p className="font-semibold">{t.extraUnits(formatNumber(diff), formatNumber(diff / AC_KW))}</p>}
        {diff < 0 && <p className="font-semibold">{t.fewerUnits(formatNumber(-diff))}</p>}
        <p className="text-base text-slate-600">{t.approxNote}</p>
      </div>
    </details>
  )
}

function AmountChart({ bills, currentId, lang, t }: { bills: Bill[]; currentId: number; lang: Lang; t: Strings }) {
  if (bills.length === 0) return null
  const max = Math.max(...bills.map((b) => b.amount))
  return (
    <section aria-labelledby="chart-h">
      <h2 id="chart-h" className="mb-3 text-2xl font-bold">{t.chartTitle}</h2>
      {bills.length === 1 && <p className="mb-2 text-base text-slate-600">{t.chartOne}</p>}
      {/* Months read left to right as on a calendar, even on the Urdu page. */}
      <ul dir="ltr" className="flex h-64 items-end gap-4 rounded-2xl border-2 border-slate-200 p-4" aria-label={t.chartLabel}>
        {bills.map((b) => (
          <li key={b.id} className="flex h-full flex-1 flex-col items-center gap-1">
            {/* The bar area alone sets the 100% height, so labels never squeeze the bars. */}
            <div className="flex min-h-0 w-full flex-1 items-end justify-center pt-7">
              <div
                className={`relative w-full max-w-20 rounded-t-lg ${b.id === currentId ? 'bg-emerald-600' : 'bg-slate-400'}`}
                style={{ height: `${Math.max(4, (b.amount / max) * 100)}%` }}
              >
                <span className="latin absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-base font-bold">
                  {formatNumber(b.amount)}
                </span>
              </div>
            </div>
            <span lang={lang} className="text-base text-slate-700">{formatDate(b.billing_month, lang, false)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AskBox({ billId, t }: { billId: number; t: Strings }) {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (question.trim().length < 3) return
    setLoading(true)
    setError(null)
    try {
      setAnswer(await askAboutBill(billId, question.trim()))
    } catch (err) {
      setError(err instanceof ApiError ? (t.errors[err.code] ?? err.message) : t.errors.default)
    } finally {
      setLoading(false)
    }
  }

  // An answer in Urdu script gets the Urdu font and right-to-left layout, whatever the page language.
  const answerIsUrdu = answer ? /[؀-ۿ]/.test(answer) : false

  return (
    <section aria-labelledby="ask-h">
      <h2 id="ask-h" className="mb-1 text-2xl font-bold">{t.askTitle}</h2>
      <p className="mb-3 text-base text-slate-600">{t.askHint}</p>
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="question" className="sr-only">{t.askLabel}</label>
        <input
          id="question"
          dir="auto"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t.askPlaceholder}
          className={`flex-1 rounded-2xl border-2 border-slate-300 px-4 py-3 text-xl ${focusRing}`}
        />
        <button
          type="submit"
          disabled={loading || question.trim().length < 3}
          className={`rounded-2xl bg-slate-800 px-6 py-3 text-xl font-bold text-white hover:bg-slate-900 disabled:opacity-50 ${focusRing}`}
        >
          {loading ? t.asking : t.ask}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
      {answer && (
        <p lang={answerIsUrdu ? 'ur' : 'en'} dir={answerIsUrdu ? 'rtl' : 'ltr'} className="mt-3 rounded-2xl bg-slate-100 p-5 text-xl">
          {answer}
        </p>
      )}
    </section>
  )
}

function BillDetails({ fields, warnings, lang, t }: { fields: BillFields; warnings: string[]; lang: Lang; t: Strings }) {
  const warnWords: Record<keyof BillFields, string> = {
    account_no: 'account no', billing_month: 'billing month', previous_reading: 'readings',
    current_reading: 'readings', units: 'units', amount: 'amount', due_date: 'due date',
  }
  const keys = Object.keys(warnWords) as (keyof BillFields)[]
  const flagged = (key: keyof BillFields) => warnings.some((w) => w.toLowerCase().includes(warnWords[key]))

  function show(key: keyof BillFields): string {
    const value = fields[key]
    if (value === null || value === '') return '—'
    if (key === 'billing_month') return formatDate(String(value), lang, false)
    if (key === 'due_date') return formatDate(String(value), lang)
    if (key === 'amount') return t.rupees(formatNumber(Number(value), 2))
    return String(value)
  }

  return (
    <details open={warnings.length > 0} className="rounded-2xl border-2 border-slate-200 p-5">
      <summary className={`cursor-pointer rounded text-2xl font-bold ${focusRing}`}>{t.detailsTitle}</summary>
      <table className="mt-3 w-full text-start">
        <tbody>
          {keys.map((key) => (
            <tr key={key} className={`border-b border-slate-200 last:border-0 ${flagged(key) ? 'bg-amber-100' : ''}`}>
              <th scope="row" className="w-1/2 py-2 pe-4 text-start font-medium text-slate-600">
                {t.fields[key]} {flagged(key) && <span className="text-amber-700" aria-label={t.hasWarning}>⚠</span>}
              </th>
              <td className="latin py-2 font-semibold">{show(key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
