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

  function start() {
    setStatus('loading')
    setError(null)
  }

  async function analyze(file: File, signal: AbortSignal): Promise<boolean> {
    try {
      const uploaded = await uploadBill(file, signal)
      if (signal.aborted) return false
      setResult(uploaded)
      setHistory([uploaded.bill])
      setSample(false)
      setStatus('success')
      // Earlier bills are optional. A slow or failed history request must not hide this bill.
      if (uploaded.bill.public_id) {
        void listHistory(uploaded.bill.public_id, signal).then((bills) => {
          if (!signal.aborted) setHistory((current) => current[0] === uploaded.bill ? bills : current)
        }).catch(() => {})
      }
      return true
    } catch (e) {
      if (signal.aborted) return false
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

  return { status, error, result, history, sample, start, analyze, showSample }
}
