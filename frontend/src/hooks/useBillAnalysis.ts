import { useState } from 'react'
import { ApiError, listHistory, uploadBill, type Bill, type UploadResult } from '../api'

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error'

/** Upload a bill photo and hold the outcome: one place for the request, its states and errors. */
export function useBillAnalysis() {
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [error, setError] = useState<ApiError | null>(null)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [history, setHistory] = useState<Bill[]>([])
  const [sample, setSample] = useState(false)

  async function analyze(file: File): Promise<boolean> {
    setStatus('loading')
    setError(null)
    setSample(false)
    try {
      const uploaded = await uploadBill(file)
      // With storage on, earlier uploads for the account feed the chart; otherwise just this bill.
      const bills = uploaded.bill.public_id ? await listHistory(uploaded.bill.public_id) : [uploaded.bill]
      setResult(uploaded)
      setHistory(bills)
      setStatus('success')
      return true
    } catch (e) {
      setError(e instanceof ApiError ? e : new ApiError('unknown', ''))
      setStatus('error')
      return false
    }
  }

  /** The pre-computed example: shown instantly, no upload and no API cost. */
  function showSample(example: UploadResult) {
    setResult(example)
    setHistory([example.bill])
    setError(null)
    setSample(true)
    setStatus('success')
  }

  return { status, error, result, history, sample, analyze, showSample }
}
