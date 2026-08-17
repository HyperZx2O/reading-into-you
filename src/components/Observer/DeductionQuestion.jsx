import { useEffect, useRef, useState } from 'react'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Observer.module.css'

/**
 * How long the chosen option stays highlighted before the next question (or
 * the reveal) mounts. Long enough for the read to register, short enough that
 * a fast player never waits. Exported so tests can time against it.
 */
export const COMMIT_BEAT_MS = 350

/**
 * Single deduction question. Selecting an option commits the player's read —
 * `onAnswer(index)` records it and the option locks highlighted for a beat.
 * Correctness is deliberately NOT revealed here: it surfaces only when Jane
 * turns the page at the batch confirmation. One cue per answer (`select`),
 * guarded so pointer and keyboard re-activations never double-play.
 */
export default function DeductionQuestion({ question, onAnswer, onAdvance }) {
  const [selected, setSelected] = useState(null)
  const promptRef = useRef(null)
  const advanceTimer = useRef(null)

  // Land keyboard and screen-reader focus on the fresh question. The dossier
  // button (or the previous option) unmounts with the phase change.
  useEffect(() => {
    promptRef.current?.focus()
  }, [])

  // Never advance a question that has already unmounted.
  useEffect(
    () => () => {
      if (advanceTimer.current) window.clearTimeout(advanceTimer.current)
    },
    []
  )

  const handleClick = (index) => {
    if (selected !== null) return
    setSelected(index)
    onAnswer(index)
    playSfx('select')
    advanceTimer.current = window.setTimeout(onAdvance, COMMIT_BEAT_MS)
  }

  return (
    <div className={styles.question}>
      <h2 className={styles.questionPrompt} tabIndex={-1} ref={promptRef}>
        {question.prompt}
      </h2>
      <div className={styles.options}>
        {question.options.map((option, i) => (
          <button
            key={i}
            className={
              selected === i
                ? `${styles.option} ${styles.optionSelected}`
                : styles.option
            }
            disabled={selected !== null}
            onClick={() => handleClick(i)}
          >
            <span className={styles.exhibitIndex} aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className={styles.exhibitText}>{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
