// Shared class strings. Kept as plain strings (no styling library) so the bundle stays small.

/** Thick amber outline for keyboard focus on light and dark surfaces. */
export const focusRing = 'focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-amber-500'

const buttonBase = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`

export const button = {
  primary: `${buttonBase} bg-brand-700 text-white shadow-sm hover:bg-brand-800`,
  secondary: `${buttonBase} border border-brand-200 bg-white text-brand-800 hover:border-brand-600 hover:bg-brand-50`,
  dark: `${buttonBase} bg-slate-800 text-white hover:bg-slate-900`,
  /** For dark panels. */
  light: `${buttonBase} bg-accent text-brand-900 shadow-sm hover:bg-brand-50`,
}

export const card = 'min-w-0 rounded-[var(--radius-card)] border border-brand-900/10 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6'

export const sectionTitle = 'text-2xl font-bold text-ink ltr:tracking-tight sm:text-3xl'

export const container = 'mx-auto w-full max-w-[78rem] px-4 sm:px-8 lg:px-12'
