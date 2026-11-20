import { useState } from 'react'
import { ApiError, listHistory, uploadBill, type Bill, type UploadResult } from '../api'

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

/** Upload a bill photo and hold the outcome: one place for the request, its states and errors. */
export function useBillAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [error, setError] = useState<ApiError | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [history, setHistory] = useState<Bill[]>([])

  async function analyze(file: File) {
    setStatus('loading')
    setError(null)
    try {
      const uploaded = await uploadBill(file)
      // With storage on, earlier uploads for the account feed the chart; otherwise just this bill.
      const bills = uploaded.bill.public_id ? await listHistory(uploaded.bill.public_id) : [uploaded.bill]
      setResult(uploaded)
      setHistory(bills)
      setStatus('success')
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('unknown', ''))
      setStatus('error')
    }
  }

  return { status, error, result, history, analyze }
}
