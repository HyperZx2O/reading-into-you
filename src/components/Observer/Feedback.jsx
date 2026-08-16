import useTypewriter from '../../hooks/useTypewriter.js'
import styles from '../../styles/Observer.module.css'

/**
 * Full-width feedback panel — Jane's response, gold for correct, red for
 * wrong. Her verdict is dictated, not printed: the line types out in Special
 * Elite (B1). The Next button stays available immediately, so a fast reader
 * never waits on the typing.
 */
export default function Feedback({ correct, text, onNext }) {
  const panelClass = correct ? styles.feedbackCorrect : styles.feedbackWrong
  const { displayedText, isDone } = useTypewriter(text, 14, { sfx: true })
  const typing = !isDone

  return (
    <div role="status" className={`${styles.feedbackPanel} ${panelClass}`}>
      <p className={styles.feedbackText} aria-hidden="true">
        {displayedText}
        {typing && <span className={styles.feedbackCaret} aria-hidden="true" />}
      </p>
      {/* role=status announces the full verdict once, not per keystroke. */}
      <span className="sr-only">{text}</span>
      {/* autoFocus: keep keyboard focus after the option group unmounts. */}
      <button className={styles.nextButton} onClick={onNext} autoFocus>
        Next
      </button>
    </div>
  )
}
