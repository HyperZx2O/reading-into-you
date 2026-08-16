import { useEffect, useRef, useState } from 'react'

import useTypewriter from '../../hooks/useTypewriter.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Intro.module.css'

/**
 * Intro screen — typewriter cinematic (first visit only).
 * The six lines are typed one at a time with a pause between them so a
 * newcomer can read and the drama can build; the pause before the last line
 * is held longer so "Jane is watching." lands as the file closes.
 * A tap fast-forwards the current line or skips a pause (fix.md C2);
 * the 2s pause before onComplete is not skippable.
 * When the last line lands, the closing rule is pressed into the sheet
 * (450ms sealPress) — the file is sealed, then the 2s pause hands off.
 * Under reduced motion the full script appears at once — only the end pause
 * remains.
 * @param {{ onComplete: () => void }} props
 */

// Canonical intro script (plan Phase 6) — one line at a time.
const INTRO_LINES = [
  'Patrick Jane never claimed to be psychic.',
  'He just paid attention.',
  'He noticed what you tried to hide. What you forgot you were showing.',
  'He read people the way most people read headlines — fast, accurate, and completely without mercy.',
  'This is not a personality test.',
  'Jane is watching.',
]

const LINE_SPEED_MS = 65
const LINE_PAUSE_MS = 750
const FINAL_BEAT_MS = 1400 // the held breath before the last line
const END_PAUSE_MS = 2000

export default function Intro({ onComplete }) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // How many lines are fully revealed. Reaching the end seals the file.
  const [lineIndex, setLineIndex] = useState(0)
  const finished = lineIndex >= INTRO_LINES.length
  const pauseTimer = useRef(null)

  const currentLine = INTRO_LINES[Math.min(lineIndex, INTRO_LINES.length - 1)]
  const { displayedText, isDone, skip } = useTypewriter(
    reduceMotion || finished ? '' : currentLine,
    LINE_SPEED_MS,
    { sfx: true },
  )

  // Completed lines stay on the sheet; the current line types below them.
  const shown = reduceMotion
    ? INTRO_LINES.join('\n')
    : [...INTRO_LINES.slice(0, lineIndex), ...(finished ? [] : [displayedText])].join('\n')

  // The closing rule seals the file — a single dry `lock` (the world's
  // "file sealed" motif, shared with the reveal's Case Closed stamp).
  const sealSounded = useRef(false)
  useEffect(() => {
    if (!finished || sealSounded.current) return undefined
    sealSounded.current = true
    playSfx('lock')
    return undefined
  }, [finished])
  // Drive the sequence: type -> pause -> next line -> seal -> end pause.
  useEffect(() => {
    if (reduceMotion) {
      // No pacing: show the full script, then only the end pause.
      if (!finished) {
        setLineIndex(INTRO_LINES.length)
        return undefined
      }
      pauseTimer.current = window.setTimeout(onComplete, END_PAUSE_MS)
      return () => clearTimeout(pauseTimer.current)
    }

    if (finished) {
      pauseTimer.current = window.setTimeout(onComplete, END_PAUSE_MS)
      return () => clearTimeout(pauseTimer.current)
    }

    if (!isDone) return undefined

    const pause =
      lineIndex === INTRO_LINES.length - 2 ? FINAL_BEAT_MS : LINE_PAUSE_MS
    pauseTimer.current = window.setTimeout(
      () => setLineIndex((i) => i + 1),
      pause,
    )
    return () => clearTimeout(pauseTimer.current)
  }, [reduceMotion, finished, isDone, lineIndex, onComplete])

  const handleTap = () => {
    if (!isDone) {
      skip() // finish the current line instantly
      return
    }
    if (finished) return // the end pause is not skippable (spec)
    if (pauseTimer.current) clearTimeout(pauseTimer.current)
    setLineIndex((i) => i + 1) // skip a pause between lines
  }

  return (
    <main className={styles.screen} onClick={handleTap}>
      <div className={styles.file}>
        <header className={styles.fileHead}>
          <div className={styles.referenceRow}>
            <p className={styles.reference}>Case File N° 000 — Subject Unknown</p>
            <p className={styles.classification} aria-hidden="true">
              Confidential
            </p>
          </div>
          <h1 className={styles.letterhead}>Reading Into You</h1>
          <div className={styles.rule} aria-hidden="true" />
        </header>
        <p className={styles.script}>
          {shown}
          {!isDone && !reduceMotion && (
            <span className={styles.caret} aria-hidden="true" />
          )}
        </p>
        <div
          className={`${styles.rule} ${styles.seal}${
            finished ? ` ${styles.sealVisible}` : ''
          }`}
          aria-hidden="true"
        />
      </div>
    </main>
  )
}
