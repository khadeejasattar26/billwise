import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ApiError, askAboutBill, askWithBill, listHistory, speechUrl, uploadBill, wakeBackend, type Bill, type BillFields, type Comparison, type Insight, type UploadResult } from './api'
import { STRINGS, discoName, formatDate, formatNumber, insightText, type Lang, type Strings } from './i18n'

type Status = 'idle' | 'loading' | 'success' | 'error'

const LANG_KEY = 'billwise-lang'
const AC_KW = 1.5 // a 1.5-ton split AC draws roughly 1.5 kW
const PROTECTED_LIMIT = 200 // units per month (NEPRA protected-consumer limit)
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

  const [consent, setConsent] = useState(false)
  const [storage, setStorage] = useState<'postgres' | 'off' | null>(null)

  // The free backend sleeps after 15 idle minutes and takes about a minute to wake: start now.
  // Its answer also says whether bills are stored, for the privacy notice.
  useEffect(() => {
    wakeBackend().then((health) => setStorage(health?.storage ?? null))
  }, [])

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
      setHistory(uploaded.bill.public_id ? await listHistory(uploaded.bill.public_id) : [uploaded.bill])
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
          // Opened by the visible upload button. Kept out of the Tab order and the accessibility
          // tree, so keyboard and screen-reader users don't land on an invisible control (QA, axe).
          tabIndex={-1}
          aria-hidden="true"
          aria-label={t.upload}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <label className="mb-4 flex max-w-2xl cursor-pointer items-start gap-3 rounded-2xl border-2 border-slate-200 p-4">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className={`mt-2 size-6 shrink-0 accent-emerald-700 ${focusRing}`}
          />
          <span>{t.consent}</span>
        </label>
        <button
          type="button"
          disabled={status === 'loading' || !consent}
          onClick={() => inputRef.current?.click()}
          className={`w-full rounded-2xl bg-emerald-700 px-6 py-5 text-2xl font-bold text-white shadow hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${focusRing}`}
        >
          📷 {status === 'loading' ? t.uploading : t.upload}
        </button>
        <p className="mt-2 text-base text-slate-600">{t.uploadHint}</p>
        {storage && <p className="mt-2 max-w-2xl text-sm text-slate-500">🔒 {storage === 'off' ? t.privacyNothing : t.privacyStored}</p>}
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
  const company = discoName(fields.disco, lang)
  // "OCR failed" only when OCR actually ran first; with OCR switched off (the free host) the photo
  // is the first and only reading, which the old text wrongly reported as a failure.
  const readMode = bill.extraction_mode === 'ocr' ? t.readOcr : result.attempts > 1 ? t.readVision : t.readPhoto
  const technical = `${readMode} ${t.attempts(result.attempts)}.`
    + (result.reminder_scheduled ? ` ${t.reminderOn}` : '')
  return (
    <div className="space-y-8">
      {company && (
        <p className="text-base text-slate-600">
          {t.issuedBy}: <span className="font-semibold text-slate-900">{company}</span>
        </p>
      )}

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

      <ChargesCard fields={fields} lang={lang} t={t} />
      <WhyCard insights={result.insights} printed={comparison?.source === 'printed'} lang={lang} t={t} />
      <PerUnit result={result} t={t} />
      <WhatIsAUnit comparison={comparison} t={t} />
      <UnitsChart fields={fields} bills={history} currentId={bill.public_id} lang={lang} t={t} />
      <AskBox bill={bill} t={t} />
      <BillDetails fields={fields} warnings={bill.warnings} technical={technical} lang={lang} t={t} />
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
  // Audio comes from the server (Pakistani Urdu neural voice), so it works on any phone or browser.
  // play() is called inside the tap, which iPhone Safari requires; if the server audio fails,
  // fall back to the device's own voice when it has one.
  const [state, setState] = useState<'idle' | 'loading' | 'playing' | 'failed'>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  function speakWithDevice(): boolean {
    if (!('speechSynthesis' in window)) return false
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
    if (!voice) return false
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.rate = 0.9
    utterance.onend = () => setState('idle')
    window.speechSynthesis.speak(utterance)
    return true
  }

  function toggle() {
    if (state === 'playing' || state === 'loading') {
      audioRef.current?.pause()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      setState('idle')
      return
    }
    if (!audioRef.current) {
      const audio = new Audio(speechUrl(text, lang))
      audio.onplaying = () => setState('playing')
      audio.onended = () => setState('idle')
      audio.onerror = () => setState(speakWithDevice() ? 'playing' : 'failed')
      audioRef.current = audio
    }
    audioRef.current.currentTime = 0
    setState('loading')
    audioRef.current.play().catch(() => setState(speakWithDevice() ? 'playing' : 'failed'))
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={state === 'playing'}
        className={`rounded-full bg-emerald-700 px-5 py-2 text-lg font-semibold text-white hover:bg-emerald-800 ${focusRing}`}
      >
        {state === 'playing' ? t.stop : state === 'loading' ? t.listenLoading : t.listen}
      </button>
      {state === 'failed' && <p role="status" className="mt-2 max-w-xs text-base text-slate-700">{t.listenFailed}</p>}
    </div>
  )
}

function ChargesCard({ fields, lang, t }: { fields: BillFields; lang: Lang; t: Strings }) {
  // Only worth showing when the bill has more than one part (e.g. this month + unpaid arrears).
  const parts: [string, number][] = []
  if (fields.current_bill) parts.push([t.chargeCurrent, fields.current_bill])
  if (fields.arrears) parts.push([t.chargeArrears, fields.arrears])
  if (fields.fpa) parts.push([t.chargeFpa, fields.fpa])
  if (parts.length < 2 || !fields.amount) return null
  const other = fields.amount - parts.reduce((sum, [, value]) => sum + value, 0)
  if (Math.abs(other) >= 1) parts.push([t.chargeOther, other])
  const money = (n: number) => t.rupees(formatNumber(n))
  return (
    <section aria-labelledby="charges-h" className="rounded-2xl border-2 border-slate-200 p-5">
      <h2 id="charges-h" className="mb-3 text-2xl font-bold">{t.chargesTitle}</h2>
      <table className="w-full">
        <tbody>
          {parts.map(([label, value]) => (
            <tr key={label} className="border-b border-slate-200">
              <th scope="row" className="py-2 pe-4 text-start font-medium">{label}</th>
              <td className="whitespace-nowrap py-2 text-end font-semibold">{money(value)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="pt-3 text-start text-xl font-bold">{t.chargeTotal}</th>
            <td className="whitespace-nowrap pt-3 text-end text-xl font-bold">{money(fields.amount)}</td>
          </tr>
        </tbody>
      </table>
      {fields.payable_after_due && <p className="mt-2 text-base text-slate-600">{t.afterDue(money(fields.payable_after_due))}</p>}
      <span className="sr-only" lang={lang} />
    </section>
  )
}

function WhyCard({ insights, printed, lang, t }: { insights: Insight[]; printed: boolean; lang: Lang; t: Strings }) {
  const sentences = insights
    .map((i) => ({ code: i.code, text: insightText(i.code, i.values, lang) }))
    .filter((s): s is { code: string; text: string } => s.text !== null)
  if (sentences.length === 0) return null
  const important = new Set(['arrears', 'unprotected_because', 'unprotected', 'over_limit'])
  return (
    <section aria-labelledby="why-h" className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-5">
      <h2 id="why-h" className="mb-3 text-2xl font-bold">{t.whyTitle}</h2>
      <ul className="space-y-3">
        {sentences.map((s) => (
          <li key={s.code} className={`flex gap-3 ${important.has(s.code) ? 'font-semibold' : ''}`}>
            <span aria-hidden="true">{important.has(s.code) ? '⚠️' : '•'}</span>
            <span>{s.text}</span>
          </li>
        ))}
      </ul>
      {printed && <p className="mt-3 text-base text-slate-600">{t.whyFromPrinted}</p>}
    </section>
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

function monthName(iso: string, lang: Lang): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-GB', { month: lang === 'ur' ? 'long' : 'short' })
}

function UnitsChart({ fields, bills, currentId, lang, t }: { fields: BillFields; bills: Bill[]; currentId: string | null; lang: Lang; t: Strings }) {
  // Prefer the 12-month history printed on the bill; otherwise use bills uploaded to BillWise.
  // Geometry: 16rem chart = 2.5rem month label + 0.25rem gap + 1.5rem top padding + 11.75rem of bar space.
  type Point = { key: string; month: string; units: number; current: boolean }
  let points: Point[]
  const printed = fields.history.filter((r) => r.units !== null && r.month !== fields.billing_month)
  if (printed.length >= 2 && fields.billing_month && fields.units !== null) {
    points = [...printed]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map((r) => ({ key: r.month, month: r.month, units: r.units as number, current: false }))
    points.push({ key: fields.billing_month, month: fields.billing_month, units: fields.units, current: true })
  } else {
    points = bills.map((b) => ({ key: b.public_id ?? b.billing_month, month: b.billing_month, units: b.units, current: b.public_id === currentId }))
  }
  if (points.length === 0) return null
  const top = Math.max(PROTECTED_LIMIT * 1.15, ...points.map((p) => p.units))
  const limitPct = (PROTECTED_LIMIT / top) * 100
  return (
    <section aria-labelledby="chart-h">
      <h2 id="chart-h" className="mb-3 text-2xl font-bold">{t.chartTitle}</h2>
      {points.length === 1 && <p className="mb-2 text-base text-slate-600">{t.chartOne}</p>}
      {/* Months read left to right as on a calendar, even on the Urdu page. */}
      <div dir="ltr" className="rounded-2xl border-2 border-slate-200 p-3 sm:p-4">
        <div className="relative h-64">
          <div className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-red-500" style={{ bottom: `calc(2.75rem + ${limitPct / 100} * 11.75rem)` }} />
          <ul className="flex h-full items-end gap-1 sm:gap-2" aria-label={t.chartLabel}>
            {points.map((p, i) => (
              <li key={p.key} className="flex h-full min-w-0 flex-1 flex-col items-center gap-1">
                <div className="flex min-h-0 w-full flex-1 items-end justify-center pt-6">
                  <div
                    className={`relative w-full max-w-12 rounded-t ${p.current ? 'bg-emerald-600' : p.units > PROTECTED_LIMIT ? 'bg-red-400' : 'bg-slate-400'}`}
                    style={{ height: `${Math.max(3, (p.units / top) * 100)}%` }}
                  >
                    <span className="latin absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold sm:text-sm">{p.units}</span>
                  </div>
                </div>
                <span lang={lang} className="flex h-10 w-full flex-col items-center overflow-hidden text-center text-[11px] leading-tight text-slate-700 sm:text-xs">
                  <span className="max-w-full truncate">{monthName(p.month, lang)}</span>
                  {(i === 0 || p.month.slice(5, 7) === '01') && <span className="latin text-slate-500">{p.month.slice(0, 4)}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm text-red-700" dir={lang === 'ur' ? 'rtl' : 'ltr'}>
          <span aria-hidden="true" className="inline-block w-6 border-t-2 border-dashed border-red-500" /> {t.chartLimit}
        </p>
      </div>
    </section>
  )
}

function AskBox({ bill, t }: { bill: Bill; t: Strings }) {
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
      // A stored bill is looked up by its random id; otherwise the browser sends the bill itself.
      setAnswer(bill.public_id ? await askAboutBill(bill.public_id, question.trim()) : await askWithBill(bill, question.trim()))
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

function BillDetails({ fields, warnings, technical, lang, t }: { fields: BillFields; warnings: string[]; technical: string; lang: Lang; t: Strings }) {
  type CoreField = 'account_no' | 'billing_month' | 'previous_reading' | 'current_reading' | 'units' | 'amount' | 'due_date'
  const warnWords: Record<CoreField, string> = {
    account_no: 'account no', billing_month: 'billing month', previous_reading: 'readings',
    current_reading: 'readings', units: 'units', amount: 'amount', due_date: 'due date',
  }
  const keys = Object.keys(warnWords) as CoreField[]
  const flagged = (key: CoreField) => warnings.some((w) => w.toLowerCase().includes(warnWords[key]))

  function show(key: CoreField): string {
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
      <p className="mt-3 text-base text-slate-500">{t.technical}: {technical}</p>
    </details>
  )
}
