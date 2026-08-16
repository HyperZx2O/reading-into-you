import { useEffect, useRef, useState } from 'react'

import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Subject.module.css'

/**
 * PickOne interaction — one option per button. Serves both multipleChoice
 * (option buttons) and imagePick (placeholder cards) — the only difference is
 * the grid/option class, switched by `cardLayout`.
 * Options are numbered as case-file exhibits; selecting highlights, then calls
 * onAnswer(index) after a short beat. The option entering the active set
 * plays `select` — once, guarded by the disabled flag so a second click or
 * a keyboard re-activation can never double-play.
 * @param {{ question: object, onAnswer: (index: number) => void, cardLayout?: boolean }} props
 */
export default function PickOne({ question, onAnswer, cardLayout = false }) {
  const [selected, setSelected] = useState(null)
  const [disabled, setDisabled] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  const choose = (index) => {
    if (disabled) return
    setSelected(index)
    setDisabled(true)
    playSfx('select')
    // ponytail: 300ms beat so the player sees their selection before advancing
    timerRef.current = window.setTimeout(() => onAnswer(index), 300)
  }

  const gridClass = cardLayout ? styles.pickGrid : styles.options
  const optionClass = cardLayout ? styles.card : styles.option

  return (
    <div className={styles.interaction}>
      {/* The visible question is the screen's real heading (the sr-only h1 in
       * QuestionRenderer carries the index); h2 keeps heading navigation
       * reachable, matching Mode 2's dossier/question pattern. */}
      <h2 className={styles.prompt}>{question.prompt}</h2>
      <div className={gridClass}>
        {question.options.map((option, index) => (
          <button
            key={option}
            type="button"
            className={`${optionClass}${selected === index ? ` ${styles.selected}` : ''}`}
            onClick={() => choose(index)}
            disabled={disabled}
          >
            <span className={styles.exhibitIndex} aria-hidden="true">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className={styles.exhibitText}>{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
