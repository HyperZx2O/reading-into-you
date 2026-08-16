import styles from '../../styles/Observer.module.css'

/** Full-width feedback panel — Jane's response, gold for correct, red for wrong. */
export default function Feedback({ correct, text, onNext }) {
  const panelClass = correct ? styles.feedbackCorrect : styles.feedbackWrong

  return (
    <div className={`${styles.feedbackPanel} ${panelClass}`}>
      <p className={styles.feedbackText}>{text}</p>
      {/* autoFocus: keep keyboard focus after the option group unmounts. */}
      <button className={styles.nextButton} onClick={onNext} autoFocus>
        Next
      </button>
    </div>
  )
}
