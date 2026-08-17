import { useEffect, useRef, useState } from 'react'
import useTypewriter from '../../hooks/useTypewriter.js'
import { REVEAL_COPY } from '../../data/flavor.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Observer.module.css'

/**
 * Rows surface one at a time so the verdict lands deduction by deduction.
 * Exported so tests can time the stagger.
 */
export const ROW_STAGGER_MS = 450

/**
 * One deduction on the turned page. Correct reads stamp gold and Jane's
 * remark types out beneath them; wrong reads stay blank — the chosen option
 * sits unmarked and silent. The typewriter only runs while the row is
 * active; `skipAll` force-completes it when the player skips the reveal.
 */
function RevealRow({ prompt, choice, correct, feedback, active, skipAll }) {
  const { displayedText, isDone, skip } = useTypewriter(
    active ? feedback : '',
    14,
    { sfx: true }
  )

  useEffect(() => {
    if (skipAll && active && !isDone) skip()
  }, [skipAll, active, isDone, skip])

  return (
    <li
      className={`${styles.revealRow}${
        active ? ` ${styles.revealRowActive}` : ''
      }${correct ? ` ${styles.revealRowCorrect}` : ` ${styles.revealRowBlank}`}`}
    >
      <p className={styles.revealPrompt}>{prompt}</p>
      <p className={styles.revealChoice}>
        {correct && (
          <span className={styles.revealStamp} aria-hidden="true">
            ✓
          </span>
        )}
        {choice}
      </p>
      {correct && (
        <p className={styles.revealFeedback} aria-hidden="true">
          {displayedText}
        </p>
      )}
      {/* role=status summary announces the verdict; the full remark is read
       * once here rather than per keystroke (same pattern as Feedback). */}
      {correct && <span className="sr-only">{feedback}</span>}
    </li>
  )
}

/**
 * The batch confirmation — Jane turns the page after all four deductions.
 * Correct reads are stamped and confirmed with her typed remark; wrong ones
 * stay blank. The page opening plays `open`, each correct confirmation
 * `success`, and turning the page `forward` — all after their state changes.
 */
export default function BatchReveal({ subject, questions, answers, isLast, onTurnPage }) {
  const [revealed, setRevealed] = useState(0)
  const [skipped, setSkipped] = useState(false)
  const opened = useRef(false)

  const correctCount = questions.reduce(
    (n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0),
    0
  )
  const hasWrong = correctCount < questions.length
  const revealing = revealed < questions.length

  // One row surfaces per stagger beat until the page is fully turned.
  useEffect(() => {
    if (revealed >= questions.length) return undefined
    const timer = window.setTimeout(
      () => setRevealed((r) => r + 1),
      ROW_STAGGER_MS
    )
    return () => window.clearTimeout(timer)
  }, [revealed, questions.length])

  // The page opening is a state change — one `open`, guarded for StrictMode.
  useEffect(() => {
    if (opened.current) return undefined
    opened.current = true
    playSfx('open')
    return undefined
  }, [])

  // Each correct deduction earns its confirmation as it lands. A run of
  // correct reads subtly rises the chime — the pitch climbs with the streak
  // (P5) — and a wrong read resets it.
  const sounded = useRef(new Set())
  const streakRef = useRef(0)
  useEffect(() => {
    if (revealed === 0) return undefined
    const index = revealed - 1
    const correct = answers[index] === questions[index]?.correctIndex
    if (!correct) {
      streakRef.current = 0
      return undefined
    }
    if (sounded.current.has(index)) return undefined
    sounded.current.add(index)
    streakRef.current += 1
    const playbackRate = Math.min(1 + 0.06 * (streakRef.current - 1), 1.24)
    playSfx('success', { playbackRate })
    return undefined
  }, [revealed, answers, questions])

  const skipReveal = () => {
    setRevealed(questions.length)
    setSkipped(true)
  }

  const handleButton = () => {
    if (revealing) {
      skipReveal()
      return
    }
    playSfx('forward')
    onTurnPage()
  }

  const buttonLabel = revealing
    ? REVEAL_COPY.skip
    : isLast
      ? REVEAL_COPY.closeCase
      : REVEAL_COPY.turnPage

  return (
    <div className={styles.reveal}>
      <p className={styles.revealEyebrow}>
        {REVEAL_COPY.eyebrow} {subject.name}
      </p>
      <h2 className={styles.revealHeading}>{REVEAL_COPY.heading}</h2>

      {/* The verdict summary — announced once on the turned page. */}
      <p className={styles.revealSummary} role="status">
        {REVEAL_COPY.summary(correctCount, questions.length)}
      </p>

      <ol className={styles.revealList}>
        {questions.map((question, i) => (
          <RevealRow
            key={question.id}
            prompt={question.prompt}
            choice={question.options[answers[i]]}
            correct={answers[i] === question.correctIndex}
            feedback={question.correctFeedback}
            active={revealed > i}
            skipAll={skipped}
          />
        ))}
      </ol>

      {!revealing && (
        <p className={styles.revealCaption}>
          {hasWrong ? REVEAL_COPY.someWrong : REVEAL_COPY.allCorrect}
        </p>
      )}

      <button className={styles.nextButton} onClick={handleButton} autoFocus>
        {buttonLabel}
      </button>
    </div>
  )
}
