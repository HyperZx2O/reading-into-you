import { useEffect, useRef, useState } from 'react'

import PickOne from './PickOne.jsx'
import { playSfx } from '../../audio/uiSfx.js'
import { SUBJECT_COPY } from '../../data/flavor.js'
import styles from '../../styles/Subject.module.css'

/**
 * FaceDown gate (P7) — one question presents its options face-down behind a
 * single "Turn over" tap. The hidden state contains zero interactive
 * controls: just the prompt and the turn-over button, so tab order and
 * screen readers never land on invisible cards. Clicking folds the face-down
 * cards up over the top edge (the envelope's motion — a click that reveals,
 * not advances), then the real option buttons mount and focus moves to the
 * first one.
 *
 * Keyboard navigation:
 * - Space: Flip the face-down card
 *
 * Sound: the turn-over is a reveal (`open` — the same cue as the page-turn).
 * @param {{ question: object, onAnswer: (index: number) => void, cardLayout?: boolean }} props
 */
export default function FaceDown({ question, onAnswer, cardLayout = false }) {
  const [turned, setTurned] = useState(false) // the fold is playing
  const [revealed, setRevealed] = useState(false) // the options are up
  const frontRef = useRef(null)
  const settleTimer = useRef(null)

  useEffect(() => () => clearTimeout(settleTimer.current), [])

  const turnOver = () => {
    if (turned) return
    setTurned(true)
    playSfx('open')
    // Reduced motion collapses the fold — the options just appear.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    settleTimer.current = window.setTimeout(
      () => setRevealed(true),
      reduced ? 0 : FLIP_MS
    )
  }

  // Keyboard navigation: Space to flip card
  useEffect(() => {
    if (turned) return

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        turnOver()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [turned])

  // After the reveal, land keyboard focus on the first revealed option.
  useEffect(() => {
    if (!revealed) return undefined
    frontRef.current?.querySelector('button')?.focus()
    return undefined
  }, [revealed])

  return (
    <div className={styles.interaction}>
      <h2 className={styles.prompt}>{question.prompt}</h2>
      <div className={styles.faceDownStage}>
        {!revealed ? (
          <div
            className={`${styles.faceDownGrid}${
              turned ? ` ${styles.faceDownTurned}` : ''
            }`}
          >
            {question.options.map((_, index) => (
              <div key={index} className={styles.faceDownCard}>
                <span className={styles.faceDownIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.faceDownFront} ref={frontRef}>
            <PickOne
              question={question}
              onAnswer={onAnswer}
              cardLayout={cardLayout}
              showPrompt={false}
            />
          </div>
        )}
      </div>
      {!turned && (
        <button type="button" className={styles.primaryBtn} onClick={turnOver}>
          {SUBJECT_COPY.turnOver}
        </button>
      )}
    </div>
  )
}

/** Duration of the fold — matched to the envelope flap's 650ms motion. */
export const FLIP_MS = 650
