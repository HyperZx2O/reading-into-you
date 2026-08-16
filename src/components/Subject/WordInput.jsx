import { useState } from 'react'

import styles from '../../styles/Subject.module.css'

/**
 * WordInput interaction — free-text answer, scored by keyword matching in
 * useScoring (Phase 5). onAnswer receives the trimmed string, never an index.
 * @param {{ question: object, onAnswer: (text: string) => void }} props
 */
export default function WordInput({ question, onAnswer }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const submit = (event) => {
    event.preventDefault()
    if (submitted) return
    const text = value.trim()
    if (!text) {
      setError(true)
      return
    }
    setSubmitted(true)
    onAnswer(text)
  }

  return (
    <form className={styles.wordForm} onSubmit={submit}>
      <p className={styles.prompt}>{question.prompt}</p>
      <input
        className={styles.wordInput}
        type="text"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          if (error) setError(false)
        }}
        autoComplete="off"
        spellCheck="false"
        disabled={submitted}
        aria-invalid={error || undefined}
        aria-describedby={error ? 'word-input-error' : undefined}
      />
      {error && (
        <p id="word-input-error" className={styles.error}>
          Please enter something.
        </p>
      )}
      <button type="submit" className={styles.primaryBtn} disabled={submitted}>
        Submit
      </button>
    </form>
  )
}
