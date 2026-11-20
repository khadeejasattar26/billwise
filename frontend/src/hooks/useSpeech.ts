import { useEffect, useRef, useState } from 'react'
import { speechUrl } from '../api'
import type { Lang } from '../i18n'

export type SpeechState = 'idle' | 'loading' | 'playing' | 'failed'

/**
 * Read text aloud with the server's Pakistani Urdu (or English) voice, so it works on phones with no
 * Urdu voice installed. play() runs inside the tap, as iPhone Safari requires. If the server audio
 * fails, fall back to the device's own voice when it has one.
 */
export function useSpeech(text: string, lang: Lang) {
  const [state, setState] = useState<SpeechState>('idle')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      audioRef.current?.pause()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  function speakWithDevice(): boolean {
    if (!('speechSynthesis' in window)) return false
    const voice = window.speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
    if (!voice) return false
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.voice = voice
    utterance.lang = voice.lang
    utterance.rate = 0.9 // a little slower than normal, easier to follow
    utterance.onend = () => setState('idle')
    window.speechSynthesis.speak(utterance)
    return true
  }

  function toggle() {
    if (state === 'playing' || state === 'loading') {
      audioRef.current?.pause()
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
      setState('idle')
      return
    }
    if (!audioRef.current) {
      const audio = new Audio(speechUrl(text, lang))
      audio.onplaying = () => setState('playing')
      audio.onended = () => setState('idle')
      audio.onerror = () => setState(speakWithDevice() ? 'playing' : 'failed')
      audioRef.current = audio
    }
    audioRef.current.currentTime = 0
    setState('loading')
    audioRef.current.play().catch(() => setState(speakWithDevice() ? 'playing' : 'failed'))
  }

  return { state, toggle }
}
