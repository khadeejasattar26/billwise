import { BoltIcon } from '../ui/icons'

/** Brand mark: a bolt in a rounded green square, with the name in Latin letters on every page.
 *  Sized in px, not rem, so the larger-text setting enlarges content but never pushes the header
 *  wider than a small phone (it grew to 424 px on a 360 px screen). */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-[40px] place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
        <BoltIcon className="size-[24px]" />
      </span>
      <span className="latin text-[22px] font-extrabold tracking-tight text-brand-800 max-[359px]:hidden">BillWise</span>
    </span>
  )
}
