import { useEffect, useRef, useState } from 'react'

import styles from '../../styles/Subject.module.css'

/**
 * ImagePick interaction — placeholder cards instead of real images.
 * Same selection beat as MultipleChoice; cards in a 2x2 grid (stacked on mobile).
 * @param {{ question: object, onAnswer: (index: number) => void }} props
 */
export default function ImagePick({ question, onAnswer }) {
  const [selected, setSelected] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const choose = (index) => {
    if (disabled) return
    setSelected(index)
    setDisabled(true)
    // ponytail: same 300ms beat as MultipleChoice
    timerRef.current = window.setTimeout(() => onAnswer(index), 300)
  }

  return (
    <div>
      <p className={styles.prompt}>{question.prompt}</p>
      <div className={styles.pickGrid}>
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`${styles.card}${selected === index ? ` ${styles.selected}` : ''}`}
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
