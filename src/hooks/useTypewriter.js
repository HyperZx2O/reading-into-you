import { useCallback, useEffect, useRef, useState } from 'react'
import { playSfx, TYPING_CUE, TYPING_VOLUME } from '../audio/uiSfx.js'

/**
 * useTypewriter — reveals `text` one character at a time.
 *
 * @param {string} text — the full text to type
 * @param {number} [speed=40] — milliseconds per character
 * @param {{ sfx?: boolean }} [options] — when sfx is true, each typed
 *   character plays the brief `typing` cue at low volume (Jane's key contact).
 *   Sound only ever accompanies real typing: reduced-motion renders the full
 *   text instantly, so no typing cue plays there. Until the player is
 *   unlocked by a user gesture, playSfx returns null and the typewriter is
 *   silent rather than queued.
 * @returns {{ displayedText: string, isDone: boolean, skip: () => void }}
 *   displayedText — text typed so far (full text immediately under reduced motion)
 *   isDone — true once the full text has been displayed
 *   skip — jump to the full string instantly (plan Phase 3 / spec §10 mitigation)
 *
 * Resets on `text` change; cleans up its interval on unmount.
 */
export default function useTypewriter(text, speed = 40, options = {}) {
  const { sfx = false } = options
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)

  // sfx is read inside the interval via a ref so the interval never needs
  // re-creating when the flag changes.
  const sfxRef = useRef(sfx)
  sfxRef.current = sfx

  useEffect(() => {
    setDisplayed('')
    setIsDone(false)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(text)
      setIsDone(true)
      return undefined
    }

    let i = 0
    const timer = setInterval(() => {
      i += 1
      setDisplayed(text.slice(0, i))
      // One brief key contact per character — never throttled (the typing cue
      // is exempt from the player's cooldowns per the uisfx guide).
      if (sfxRef.current) {
        playSfx(TYPING_CUE, { volume: TYPING_VOLUME, cooldownMs: 0 })
      }
      if (i >= text.length) {
        clearInterval(timer)
        setIsDone(true)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  const skip = useCallback(() => {
    setDisplayed(text)
    setIsDone(true)
  }, [text])

  return { displayedText: displayed, isDone, skip }
}
