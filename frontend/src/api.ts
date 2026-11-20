const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export type BillFields = {
  account_no: string | null
  billing_month: string | null
  previous_reading: number | null
  current_reading: number | null
  units: number | null
  amount: number | null
  due_date: string | null
}

export type Bill = {
  id: number
  account_no: string
  billing_month: string
  units: number
  amount: number
  due_date: string
  explanation: string
  warnings: string[]
  extraction_mode: 'ocr' | 'vision'
  created_at: string
}

export type Comparison = {
  previous_month: string
  previous_units: number
  previous_amount: number
  units_change_pct: number | null
  amount_change_pct: number | null
}

export type UploadResult = {
  bill: Bill
  fields: BillFields
  comparison: Comparison | null
  attempts: number
  reminder_scheduled: boolean
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

export function uploadBill(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('image', file)
  return request('/bills', { method: 'POST', body: form })
}

export async function listBills(accountNo: string): Promise<Bill[]> {
  const data = await request<{ bills: Bill[] }>(`/bills?account_no=${encodeURIComponent(accountNo)}`)
  return data.bills
}

export async function askAboutBill(billId: number, question: string): Promise<string> {
  const data = await request<{ answer: string }>(`/bills/${billId}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  return data.answer
}
