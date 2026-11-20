const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type HistoryRow = {
  month: string
  units: number | null
  bill: number | null
  payment: number | null
}

export type Insight = {
  code: string
  values: Record<string, number | string>
}

export type BillFields = {
  account_no: string | null
  billing_month: string | null
  previous_reading: number | null
  current_reading: number | null
  units: number | null
  amount: number | null
  due_date: string | null
  disco: string | null
  category: string | null
  multiplying_factor: number | null
  current_bill: number | null
  arrears: number | null
  fpa: number | null
  taxes: number | null
  subsidy: number | null
  payable_after_due: number | null
  history: HistoryRow[]
}

export type Bill = {
  public_id: string | null  // null when the server stores nothing (STORAGE=off)
  account_no: string
  billing_month: string
  units: number
  amount: number
  due_date: string
  explanation: string
  explanation_ur: string
  warnings: string[]
  extraction_mode: 'ocr' | 'vision'
  details: Record<string, unknown>
  created_at?: string  // absent when nothing is stored
}

export type Comparison = {
  source: 'saved' | 'printed'
  previous_month: string
  previous_units: number
  previous_amount: number
  units_change_pct: number | null
  amount_change_pct: number | null
  units_diff: number
  amount_diff: number
  previous_cost_per_unit: number | null
}

export type UploadResult = {
  bill: Bill
  fields: BillFields
  comparison: Comparison | null
  cost_per_unit: number | null
  insights: Insight[]
  attempts: number
  reminder_scheduled: boolean
  stored: boolean
}

export class ApiError extends Error {
  code: string
  details?: { warnings?: string[]; fields?: BillFields }
  constructor(code: string, message: string, details?: ApiError['details']) {
    super(message)
    this.code = code
    this.details = details
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, init)
  } catch {
    throw new ApiError('network_error', `Cannot reach the BillWise API at ${API_URL}. Is the backend running?`)
  }
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const err = body?.error
    throw new ApiError(err?.code ?? 'http_error', err?.message ?? `Request failed (${response.status}).`, err?.details)
  }
  return body as T
}

/** Fire-and-forget request that wakes a sleeping free-tier backend while the user picks a photo. */
export async function wakeBackend(): Promise<{ storage: 'postgres' | 'off' } | null> {
  try {
    const response = await fetch(`${API_URL}/health`)
    return response.ok ? await response.json() : null
  } catch {
    return null
  }
}

export function uploadBill(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('image', file)
  form.append('consent', 'true') // the upload button is disabled until the consent box is ticked
  return request('/bills', { method: 'POST', body: form })
}

/** Earlier uploads for the same account, found through the bill's random id (never an account number). */
export async function listHistory(publicId: string): Promise<Bill[]> {
  const data = await request<{ bills: Bill[] }>(`/bills/${encodeURIComponent(publicId)}/history`)
  return data.bills
}

export async function askAboutBill(publicId: string, question: string): Promise<string> {
  const data = await request<{ answer: string }>(`/bills/${encodeURIComponent(publicId)}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  return data.answer
}

/** Ask about a bill the browser holds, for when the server stores nothing. */
export async function askWithBill(bill: Bill, question: string): Promise<string> {
  const { billing_month, units, amount, due_date, warnings, details } = bill
  const data = await request<{ answer: string }>('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, bill: { billing_month, units, amount, due_date, warnings, details } }),
  })
  return data.answer
}

/** URL of an MP3 of the text in a Pakistani Urdu (or English) voice, generated on the server.
 *  A URL (not a fetch) so the audio can start inside the user's tap, as iPhone Safari requires. */
export function speechUrl(text: string, lang: 'ur' | 'en'): string {
  return `${API_URL}/speech?${new URLSearchParams({ text, lang })}`
}
