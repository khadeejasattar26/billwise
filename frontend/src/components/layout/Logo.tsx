import { BoltIcon } from '../ui/icons'

/** Brand mark: a bolt in a rounded green square, with the name in Latin letters on every page. */
export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="grid size-10 place-items-center rounded-xl bg-brand-700 text-white shadow-sm">
        <BoltIcon className="size-6" />
      </span>
      <span className="latin text-2xl font-extrabold tracking-tight text-brand-800">BillWise</span>
    </span>
  )
}
