// Shared class strings. Kept as plain strings (no styling library) so the bundle stays small.

/** Thick amber outline for keyboard focus: visible on green, white and amber backgrounds. */
export const focusRing = 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500'

const buttonBase = `inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

export const button = {
  primary: `${buttonBase} bg-brand-700 text-white shadow-sm hover:bg-brand-800`,
  secondary: `${buttonBase} border-2 border-brand-700 bg-white text-brand-800 hover:bg-brand-50`,
  dark: `${buttonBase} bg-slate-800 text-white hover:bg-slate-900`,
  /** For dark green panels: white button, green text. */
  light: `${buttonBase} bg-white text-brand-800 shadow-sm hover:bg-brand-50`,
}

export const card = 'rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-slate-900/5 sm:p-6'

export const sectionTitle = 'text-2xl font-bold text-ink sm:text-3xl'

export const container = 'mx-auto w-full max-w-6xl px-4 sm:px-6'
