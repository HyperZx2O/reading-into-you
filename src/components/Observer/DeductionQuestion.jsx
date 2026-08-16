import { useState } from 'react'
import styles from '../../styles/Observer.module.css'

/**
 * Single deduction question. Selecting an option calls `onAnswer(index)` and
 * disables the rest — correct/wrong is revealed by Feedback, not here.
 */
export default function DeductionQuestion({ question, onAnswer }) {
  const [selected, setSelected] = useState(null)

  const handleClick = (index) => {
    if (selected !== null) return
    setSelected(index)
    onAnswer(index)
  }

  return (
    <div className={styles.question}>
      <h3 className={styles.questionPrompt}>{question.prompt}</h3>
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
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
