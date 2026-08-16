import styles from '../../styles/Observer.module.css'

/**
 * Subtle progress bar for question progress within a subject.
 * `current` is 1-based (1..total).
 */
export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div
      className={styles.progressBar}
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Question progress"
    >
      <div className={styles.progressFill} style={{ width: `${pct}%` }} />
    </div>
  )
}
