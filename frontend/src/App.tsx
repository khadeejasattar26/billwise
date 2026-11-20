import { useRef, useState, type FormEvent } from 'react'
import { ApiError, askAboutBill, listBills, uploadBill, type Bill, type BillFields, type UploadResult } from './api'

type Status = 'idle' | 'loading' | 'success' | 'error'

const FIELD_ROWS: { key: keyof BillFields; label: string; warnWord: string }[] = [
  { key: 'account_no', label: 'Account number', warnWord: 'account no' },
  { key: 'billing_month', label: 'Billing month', warnWord: 'billing month' },
  { key: 'previous_reading', label: 'Previous reading (kWh)', warnWord: 'readings' },
  { key: 'current_reading', label: 'Current reading (kWh)', warnWord: 'readings' },
  { key: 'units', label: 'Units used (kWh)', warnWord: 'units' },
  { key: 'amount', label: 'Amount (Rs)', warnWord: 'amount' },
  { key: 'due_date', label: 'Due date', warnWord: 'due date' },
]

const focusRing = 'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'

function formatMonth(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function formatValue(key: keyof BillFields, value: BillFields[keyof BillFields]) {
  if (value === null || value === '') return '—'
  if (key === 'billing_month') return formatMonth(String(value))
  if (key === 'amount') return `Rs ${Number(value).toLocaleString('en-PK', { minimumFractionDigits: 2 })}`
  return String(value)
}

export default function App() {
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<ApiError | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [history, setHistory] = useState<Bill[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

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
      setError(e instanceof ApiError ? e : new ApiError('unknown', 'Something went wrong.'))
      setStatus('error')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-slate-800">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">BillWise</h1>
        <p className="mt-1 text-slate-600">
          Upload a photo of your electricity bill. BillWise reads it, checks the numbers and explains the change.
        </p>
      </header>

      <section aria-label="Upload" className="mb-8">
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
          className={`rounded-lg bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60 ${focusRing}`}
        >
          {status === 'loading' ? 'Reading bill…' : 'Upload bill photo'}
        </button>
        <p className="mt-2 text-sm text-slate-500">JPG or PNG, up to 5 MB.</p>
      </section>

      <div aria-live="polite">
        {status === 'idle' && (
          <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-500">
            No bill yet. Try <code>samples/bill_2026_10.png</code>, then <code>bill_2026_11.png</code>.
          </p>
        )}

        {status === 'loading' && (
          <p className="rounded-lg bg-slate-100 p-6 text-center text-slate-600" role="status">
            Cleaning the image, running OCR and asking the local LLM. This takes 10–60 seconds.
          </p>
        )}

        {status === 'error' && error && <ErrorPanel error={error} />}

        {status === 'success' && result && (
          <div className="space-y-8">
            <FieldsTable fields={result.fields} warnings={result.bill.warnings} />
            <section aria-labelledby="explain-h">
              <h2 id="explain-h" className="mb-2 text-xl font-semibold">What changed</h2>
              <p className="rounded-lg bg-emerald-50 p-4 leading-relaxed">{result.bill.explanation}</p>
              <p className="mt-2 text-sm text-slate-500">
                Read with {result.bill.extraction_mode === 'vision' ? 'vision model (OCR retry)' : 'OCR + LLM'} in{' '}
                {result.attempts} attempt{result.attempts > 1 ? 's' : ''}.{' '}
                {result.reminder_scheduled ? 'Due-date reminder scheduled.' : 'Reminder not scheduled (n8n not reachable).'}
              </p>
            </section>
            <AmountChart bills={history} currentId={result.bill.id} />
            <AskBox billId={result.bill.id} />
          </div>
        )}
      </div>
    </main>
  )
}

function ErrorPanel({ error }: { error: ApiError }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">Could not process the bill</p>
      <p className="mt-1">{error.message}</p>
      {error.details?.warnings && error.details.warnings.length > 0 && (
        <ul className="mt-2 list-disc pl-5 text-sm">
          {error.details.warnings.map((w) => <li key={w}>{w}</li>)}
        </ul>
      )}
    </div>
  )
}

function FieldsTable({ fields, warnings }: { fields: BillFields; warnings: string[] }) {
  const flagged = (word: string) => warnings.some((w) => w.toLowerCase().includes(word))
  return (
    <section aria-labelledby="fields-h">
      <h2 id="fields-h" className="mb-2 text-xl font-semibold">Extracted fields</h2>
      {warnings.length > 0 && (
        <div role="alert" className="mb-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900">
          <p className="font-semibold">Check these before you rely on them:</p>
          <ul className="list-disc pl-5 text-sm">
            {warnings.map((w) => <li key={w}>{w}</li>)}
          </ul>
        </div>
      )}
      <table className="w-full overflow-hidden rounded-lg border border-slate-200 text-left">
        <tbody>
          {FIELD_ROWS.map(({ key, label, warnWord }) => {
            const warn = flagged(warnWord)
            return (
              <tr key={key} className={`border-b border-slate-200 last:border-0 ${warn ? 'bg-amber-100' : ''}`}>
                <th scope="row" className="w-1/2 px-4 py-2 font-medium text-slate-600">
                  {label} {warn && <span className="text-amber-700" aria-label="has a warning">⚠</span>}
                </th>
                <td className="px-4 py-2 font-mono">{formatValue(key, fields[key])}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </section>
  )
}

function AmountChart({ bills, currentId }: { bills: Bill[]; currentId: number }) {
  if (bills.length === 0) return null
  const max = Math.max(...bills.map((b) => b.amount))
  return (
    <section aria-labelledby="chart-h">
      <h2 id="chart-h" className="mb-2 text-xl font-semibold">Amount by month</h2>
      {bills.length === 1 && <p className="mb-2 text-sm text-slate-500">Upload next month's bill to see a comparison.</p>}
      <ul className="flex h-56 items-end gap-4 rounded-lg border border-slate-200 p-4" aria-label="Bill amount per month">
        {bills.map((b) => (
          <li key={b.id} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="text-xs font-semibold">Rs {Math.round(b.amount).toLocaleString('en-PK')}</span>
            <div
              className={`w-full max-w-16 rounded-t ${b.id === currentId ? 'bg-emerald-600' : 'bg-slate-400'}`}
              style={{ height: `${Math.max(4, (b.amount / max) * 100)}%` }}
            />
            <span className="text-xs text-slate-600">{formatMonth(b.billing_month)}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AskBox({ billId }: { billId: number }) {
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
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-labelledby="ask-h">
      <h2 id="ask-h" className="mb-2 text-xl font-semibold">Ask about this bill</h2>
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="question" className="sr-only">Your question</label>
        <input
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Why is this month higher?"
          className={`flex-1 rounded-lg border border-slate-300 px-3 py-2 ${focusRing}`}
        />
        <button
          type="submit"
          disabled={loading || question.trim().length < 3}
          className={`rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white hover:bg-slate-900 disabled:opacity-50 ${focusRing}`}
        >
          {loading ? 'Asking…' : 'Ask'}
        </button>
      </form>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
      {answer && <p className="mt-3 rounded-lg bg-slate-100 p-4">{answer}</p>}
    </section>
  )
}
