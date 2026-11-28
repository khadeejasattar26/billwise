import { act, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { SAMPLE_RESULT } from '../data/sampleBill'
import { useBillAnalysis } from './useBillAnalysis'

afterEach(() => vi.unstubAllGlobals())

it('shows the new bill even if its earlier history cannot be loaded', async () => {
  const uploaded = { ...SAMPLE_RESULT, bill: { ...SAMPLE_RESULT.bill, public_id: 'test-bill' } }
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(uploaded), { status: 201 }))
    .mockResolvedValueOnce(new Response(null, { status: 503 }))
  vi.stubGlobal('fetch', fetchMock)

  const { result } = renderHook(useBillAnalysis)
  await act(async () => {
    result.current.start()
    const ok = await result.current.analyze(new File([], 'bill.jpg'), new AbortController().signal)
    expect(ok).toBe(true)
  })

  expect(fetchMock).toHaveBeenCalledTimes(2)
  expect(result.current.status).toBe('success')
  expect(result.current.result).toEqual(uploaded)
  expect(result.current.history).toEqual([uploaded.bill])
  expect(result.current.error).toBeNull()
})
