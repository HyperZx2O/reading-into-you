import { useEffect, useState } from 'react'

/**
 * useTypewriter — reveals `text` one character at a time.
 *
 * @param {string} text — the full text to type
 * @param {number} [speed=40] — milliseconds per character
 * @returns {{ displayedText: string, isDone: boolean }}
 *   displayedText — text typed so far (full text immediately under reduced motion)
 *   isDone — true once the full text has been displayed
 *
 * Resets on `text` change; cleans up its interval on unmount.
 */
export default function useTypewriter(text, speed = 40) {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)

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
      if (i >= text.length) {
        clearInterval(timer)
        setIsDone(true)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return { displayedText: displayed, isDone }
}
