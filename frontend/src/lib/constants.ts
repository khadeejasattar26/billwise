/** A 1.5-ton split AC draws roughly 1.5 kW, so one unit (kWh) runs it for about 40 minutes. */
export const AC_KW = 1.5

/** NEPRA protected-consumer limit: 200 units a month, every month for 6 months. */
export const PROTECTED_LIMIT = 200

/** Where testers send feedback (Google Form or WhatsApp link), set in Vercel; hidden when empty. */
export const FEEDBACK_URL: string = import.meta.env.VITE_FEEDBACK_URL ?? ''

export const SOURCE_URL = 'https://github.com/khadeejasattar26/billwise'

/** Every DISCO named on the page, in the order Pakistanis usually list them. */
export const DISCO_CODES = ['LESCO', 'IESCO', 'FESCO', 'GEPCO', 'MEPCO', 'PESCO', 'HAZECO', 'TESCO', 'HESCO', 'SEPCO', 'QESCO', 'K-Electric'] as const
