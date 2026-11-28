import { BoltIcon } from '../ui/icons'

/** Brand mark: a bolt in a blue square, with the name in Latin letters on every page.
 *  Sized in px, not rem, so the larger-text setting enlarges content but never pushes the header
 *  wider than a small phone (it grew to 424 px on a 360 px screen). */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-[36px] place-items-center rounded-[8px] bg-brand-700 text-white">
        <BoltIcon className="size-[22px]" />
      </span>
      <span className="latin text-[22px] font-extrabold tracking-tight text-brand-900 max-[300px]:hidden">BillWise</span>
    </span>
  )
}
