import { useEffect, useRef, useState } from 'react'

import styles from '../../styles/Subject.module.css'

/**
 * MultipleChoice interaction — one option per button.
 * Highlights the selection, then calls onAnswer(index) after a short beat.
 * @param {{ question: object, onAnswer: (index: number) => void }} props
 */
export default function MultipleChoice({ question, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const choose = (index) => {
    if (disabled) return
    setSelected(index)
    setDisabled(true)
    // ponytail: 300ms beat so the player sees their selection before advancing
    timerRef.current = window.setTimeout(() => onAnswer(index), 300)
  }

  return (
    <div>
      <p className={styles.prompt}>{question.prompt}</p>
      <div className={styles.options}>
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`${styles.option}${selected === index ? ` ${styles.selected}` : ''}`}
            onClick={() => choose(index)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
