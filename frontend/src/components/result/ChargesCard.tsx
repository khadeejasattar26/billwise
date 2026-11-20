import type { BillFields } from '../../api'
import type { Strings } from '../../i18n'
import { formatNumber } from '../../lib/format'
import { card } from '../ui/styles'

/** This month + unpaid arrears + FPA = total. Shown only when the bill has more than one part. */
export function ChargesCard({ fields, t }: { fields: BillFields; t: Strings }) {
  const parts: [string, number][] = []
  if (fields.current_bill) parts.push([t.chargeCurrent, fields.current_bill])
  if (fields.arrears) parts.push([t.chargeArrears, fields.arrears])
  if (fields.fpa) parts.push([t.chargeFpa, fields.fpa])
  if (parts.length < 2 || !fields.amount) return null
  const other = fields.amount - parts.reduce((sum, [, value]) => sum + value, 0)
  if (Math.abs(other) >= 1) parts.push([t.chargeOther, other])
  const money = (n: number) => t.rupees(formatNumber(n))
  return (
    <section aria-labelledby="charges-h" className={card}>
      <h2 id="charges-h" className="mb-3 text-2xl font-bold text-ink">{t.chargesTitle}</h2>
      <table className="w-full">
        <tbody>
          {parts.map(([label, value]) => (
            <tr key={label} className="border-b border-slate-900/10">
              <th scope="row" className="py-3 pe-4 text-start font-medium">{label}</th>
              <td className="whitespace-nowrap py-3 text-end font-semibold">{money(value)}</td>
            </tr>
          ))}
          <tr>
            <th scope="row" className="pt-4 text-start text-xl font-bold">{t.chargeTotal}</th>
            <td className="whitespace-nowrap pt-4 text-end text-xl font-extrabold">{money(fields.amount)}</td>
          </tr>
        </tbody>
      </table>
      {fields.payable_after_due && <p className="mt-3 text-base text-slate-600">{t.afterDue(money(fields.payable_after_due))}</p>}
    </section>
  )
}
