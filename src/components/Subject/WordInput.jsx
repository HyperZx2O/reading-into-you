import { useId, useState } from 'react'

import { WORD_INPUT_ERROR } from '../../data/flavor.js'
import { playSfx, TYPING_CUE, TYPING_VOLUME } from '../../audio/uiSfx.js'
import styles from '../../styles/Subject.module.css'

/**
 * WordInput interaction — free-text answer, scored by keyword matching in
 * utils/scoring.js (Phase 5). onAnswer receives the trimmed string, never an index.
 * Sound mapping: one brief `typing` key contact per input event (never
 * throttled); an empty submit is `blocked` (the action cannot continue); a
 * committed answer plays `select` — all guarded so a resubmit can't double.
 * @param {{ question: object, onAnswer: (text: string) => void }} props
 */
export default function WordInput({ question, onAnswer }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  // The prompt names the field for assistive tech (WCAG 4.1.2) — the visible
  // question is the label, associated by id rather than a hidden <label>.
  const promptId = useId()

  const submit = (event) => {
    event.preventDefault()
    if (submitted) return
    const text = value.trim()
    if (!text) {
      setError(true)
      playSfx('blocked')
      return
    }
    setSubmitted(true)
    playSfx('select')
    onAnswer(text)
  }

  return (
    <form className={styles.wordForm} onSubmit={submit}>
      <h2 id={promptId} className={styles.prompt}>
        {question.prompt}
      </h2>
      <input
        className={styles.wordInput}
        type="text"
        value={value}
        onChange={(event) => {
          setValue(event.target.value)
          if (error) setError(false)
          // Every local text-entry input event gets one brief key contact.
          playSfx(TYPING_CUE, { volume: TYPING_VOLUME, cooldownMs: 0 })
        }}
        autoComplete="off"
        spellCheck="false"
        // A single-line field can't scroll gracefully; the questions want a
        // word or a short phrase, so cap the input rather than fight a paste.
        maxLength={160}
        disabled={submitted}
        aria-labelledby={promptId}
        aria-invalid={error || undefined}
        aria-describedby={error ? 'word-input-error' : undefined}
      />
      {error && (
        <p id="word-input-error" className={styles.error}>
          {WORD_INPUT_ERROR}
        </p>
      )}
      <button type="submit" className={styles.primaryBtn} disabled={submitted}>
        Submit
      </button>
    </form>
  )
}
