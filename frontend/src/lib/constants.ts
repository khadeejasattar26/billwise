/** A 1.5-ton split AC draws roughly 1.5 kW, so one unit (kWh) runs it for about 40 minutes. */
export const AC_KW = 1.5

/** NEPRA protected-consumer limit: 200 units a month, every month for 6 months. */
export const PROTECTED_LIMIT = 200

/** Where testers send feedback (Google Form or WhatsApp link), set in Vercel; hidden when empty. */
export const FEEDBACK_URL: string = import.meta.env.VITE_FEEDBACK_URL ?? ''


/** Distribution companies that use the shared PITC bill format. */
export const PITC_DISCO_CODES = ['LESCO', 'IESCO', 'FESCO', 'GEPCO', 'MEPCO', 'PESCO', 'HAZECO', 'TESCO', 'HESCO', 'SEPCO', 'QESCO'] as const
