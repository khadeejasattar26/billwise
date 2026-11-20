// The guided flow, one thing per screen (GOV.UK "question pages"). Screens live in the URL hash so
// the browser's back button, refresh and shared links behave as people expect.

export type Screen = 'home' | 'consent' | 'photo' | 'check' | 'reading' | 'answer' | 'details' | 'ask'

const SCREENS: Screen[] = ['home', 'consent', 'photo', 'check', 'reading', 'answer', 'details', 'ask']

export function screenFromHash(hash: string): Screen {
  const name = hash.replace(/^#\/?/, '')
  return (SCREENS as string[]).includes(name) ? (name as Screen) : 'home'
}

export function hashFor(screen: Screen): string {
  return screen === 'home' ? '#/' : `#/${screen}`
}

/** Steps shown as "step N of 3" while collecting the photo. */
export const STEP_OF: Partial<Record<Screen, number>> = { consent: 1, photo: 2, check: 3 }
export const STEP_COUNT = 3
