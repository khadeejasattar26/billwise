import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { STRINGS } from '../../i18n'
import { PITC_RESULT } from '../../test/fixtures'
import { ResultView } from './ResultView'

afterEach(cleanup)

describe('ResultView', () => {
  it('puts the answer first, then why, then the numbers (UI review order)', () => {
    const t = STRINGS.en
    render(<ResultView result={PITC_RESULT} history={[PITC_RESULT.bill]} lang="en" t={t} onNewBill={() => {}} />)
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    expect(headings.slice(0, 5)).toEqual([t.plainWords, t.whyTitle, t.glance, t.chargesTitle, t.chartTitle])
  })

  it('lists arrears before the other reasons and adds up the charges', () => {
    const t = STRINGS.en
    render(<ResultView result={PITC_RESULT} history={[PITC_RESULT.bill]} lang="en" t={t} onNewBill={() => {}} />)
    const reasons = screen.getByRole('heading', { name: t.whyTitle }).parentElement!.querySelectorAll('li')
    expect(reasons[0].textContent).toContain('unpaid money from earlier bills')
    expect(screen.getByRole('row', { name: /Total/ }).textContent).toContain('Rs 9,600')
  })

  it('shows the Urdu explanation and Urdu warnings on the Urdu page', () => {
    const t = STRINGS.ur
    const result = { ...PITC_RESULT, bill: { ...PITC_RESULT.bill, warnings: ['Missing due date.'] } }
    render(<ResultView result={result} history={[result.bill]} lang="ur" t={t} onNewBill={() => {}} />)
    expect(screen.getByText(PITC_RESULT.bill.explanation_ur)).toBeTruthy()
    expect(screen.getByText('بل پر آخری تاریخ نہیں پڑھا جا سکا۔')).toBeTruthy()
  })
})
