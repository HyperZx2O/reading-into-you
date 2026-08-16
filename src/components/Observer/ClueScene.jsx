import styles from '../../styles/Observer.module.css'

/** Dark card with text-annotation clues. Display only — no interactivity. */
export default function ClueScene({ clues }) {
  return (
    <div className={styles.clueScene}>
      <h3 className={styles.clueHeading}>Scene Notes</h3>
      <ul className={styles.clueList}>
        {/* Each note surfaces in turn — Jane walks you down the file (B2).
         * The dossier remounts per subject, so the stagger replays fresh. */}
        {clues.map((clue, i) => (
          <li
            key={i}
            className={styles.clue}
            style={{ animationDelay: `${i * 200}ms` }}
          >
            {clue}
          </li>
        ))}
      </ul>
    </div>
  )
}
