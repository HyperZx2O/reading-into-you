import styles from '../../styles/Observer.module.css'

/** Dark card with text-annotation clues. Display only — no interactivity. */
export default function ClueScene({ clues }) {
  return (
    <div className={styles.clueScene}>
      <h3 className={styles.clueHeading}>Scene Notes</h3>
      <ul className={styles.clueList}>
        {clues.length > 0 ? (
          clues.map((clue, i) => (
            <li key={i} className={styles.clue}>
              {clue}
            </li>
          ))
        ) : (
          <li className={styles.clue}>No clues available.</li>
        )}
      </ul>
    </div>
  )
}
