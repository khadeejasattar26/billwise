import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { STRINGS } from '../../i18n'
import { UploadCard } from './UploadCard'

afterEach(cleanup)
const t = STRINGS.ur

describe('UploadCard', () => {
  it('keeps the upload button disabled until consent is ticked', () => {
    render(<UploadCard ref={createRef()} t={t} busy={false} storage="off" onFile={() => {}} />)
    const upload = screen.getByRole('button', { name: t.upload }) as HTMLButtonElement
    expect(upload.disabled).toBe(true)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(upload.disabled).toBe(false)
  })

  it('passes the chosen photo on and shows the store-nothing notice', () => {
    const onFile = vi.fn()
    const { container } = render(<UploadCard ref={createRef()} t={t} busy={false} storage="off" onFile={onFile} />)
    const photo = new File(['x'], 'bill.png', { type: 'image/png' })
    fireEvent.change(container.querySelector('#bill-file')!, { target: { files: [photo] } })
    expect(onFile).toHaveBeenCalledWith(photo)
    expect(screen.getByText(t.privacyShortNothing)).toBeTruthy()
  })

  it('keeps the hidden file input out of the Tab order', () => {
    const { container } = render(<UploadCard ref={createRef()} t={t} busy={false} storage={null} onFile={() => {}} />)
    expect(container.querySelector('#bill-file')!.getAttribute('tabindex')).toBe('-1')
  })
})
