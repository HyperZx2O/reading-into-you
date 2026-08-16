import { useState } from 'react'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Observer.module.css'

/**
 * Single deduction question. Selecting an option calls `onAnswer(index)` and
 * disables the rest — correct/wrong is revealed by Feedback, not here.
 * The answer is judged the moment it lands (the state change is synchronous),
 * so the outcome cue plays after resolution: `success` when correct,
 * `error` when wrong. One cue per answer — the guarded selected state keeps
 * pointer and keyboard re-activations from double-playing.
 */
export default function DeductionQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null)

  const handleClick = (index) => {
    if (selected !== null) return
    setSelected(index)
    onAnswer(index)
    playSfx(index === question.correctIndex ? 'success' : 'error')
  }

  return (
    <div className={styles.question}>
      <h2 className={styles.questionPrompt}>{question.prompt}</h2>
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
