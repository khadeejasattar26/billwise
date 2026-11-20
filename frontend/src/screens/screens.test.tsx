import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SAMPLE_RESULT } from '../data/sampleBill'
import { STRINGS } from '../i18n'
import { AnswerScreen } from './AnswerScreen'
import { AskScreen } from './AskScreen'
import { CheckScreen } from './CheckScreen'
import { ConsentScreen } from './ConsentScreen'
import { DetailsScreen } from './DetailsScreen'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const ur = STRINGS.ur
const en = STRINGS.en
const noop = () => {}

describe('ConsentScreen', () => {
  it('asks one question with one big answer, as step 1 of 3', () => {
    const onAgree = vi.fn()
    render(<ConsentScreen t={ur} onBack={noop} onAgree={onAgree} />)
    expect(screen.getByText(ur.stepOf(1, 3))).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: ur.consentYes }))
    expect(onAgree).toHaveBeenCalledOnce()
  })
})

describe('CheckScreen', () => {
  const photo = { url: 'blob:x', unreadable: false }
  it('makes "retake" the main action when the photo looks blurry, but still allows using it', () => {
    const onUse = vi.fn()
    render(<CheckScreen t={en} photo={{ ...photo, issues: ['blurry'] }} onBack={noop} onRetake={noop} onUse={onUse} />)
    const buttons = screen.getAllByRole('button').map((b) => b.textContent)
    expect(buttons.slice(-2)).toEqual([en.retake, en.usePhotoAnyway])
    expect(screen.getByText(en.checkIssues.blurry)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: en.usePhotoAnyway }))
    expect(onUse).toHaveBeenCalledOnce()
  })
  it('makes "use this photo" the main action when the photo is clear', () => {
    render(<CheckScreen t={en} photo={{ ...photo, issues: [] }} onBack={noop} onRetake={noop} onUse={noop} />)
    expect(screen.getAllByRole('button').map((b) => b.textContent).slice(-2)).toEqual([en.usePhoto, en.retake])
  })
  it('offers only a retake when the photo cannot be opened', () => {
    render(<CheckScreen t={en} photo={{ url: 'blob:x', issues: null, unreadable: true }} onBack={noop} onRetake={noop} onUse={noop} />)
    expect(screen.queryByRole('button', { name: en.usePhotoAnyway })).toBeNull()
    expect(screen.getByText(en.checkUnreadable)).toBeTruthy()
  })
})

describe('AnswerScreen', () => {
  it('leads with how much, by when, and the main reason; everything else is one tap away', () => {
    render(<AnswerScreen result={SAMPLE_RESULT} sample lang="en" t={en} onBack={noop} onDetails={noop} onAsk={noop} onNewBill={noop} />)
    expect(screen.getByText(en.sampleBanner)).toBeTruthy()
    expect(screen.getByRole('heading', { name: en.payLabel }).parentElement!.textContent).toContain('Rs 9,600')
    expect(screen.getByText(en.payBy('5 Nov 2026'))).toBeTruthy()
    expect(screen.getByRole('heading', { name: en.mainReasons }).parentElement!.textContent).toContain('unpaid money from earlier bills')
    for (const name of [en.seeDetails, en.askCta, en.newBillCta]) expect(screen.getByRole('button', { name })).toBeTruthy()
  })
})

describe('DetailsScreen', () => {
  it('explains the words printed on the bill', () => {
    render(<DetailsScreen result={SAMPLE_RESULT} history={[SAMPLE_RESULT.bill]} lang="ur" t={ur} onBack={noop} />)
    expect(screen.getByRole('heading', { name: ur.glossaryTitle })).toBeTruthy()
    expect(screen.getByText('بقایا')).toBeTruthy()
  })
})

describe('AskScreen', () => {
  it('asks a ready-made question with one tap', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ answer: 'جواب' }), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    render(<AskScreen bill={SAMPLE_RESULT.bill} t={ur} onBack={noop} />)
    fireEvent.click(screen.getByRole('button', { name: ur.suggestions[0] }))
    await waitFor(() => expect(screen.getByTestId('answer').textContent).toBe('جواب'))
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(JSON.parse(String(init.body)).question).toBe(ur.suggestions[0])
  })
})
