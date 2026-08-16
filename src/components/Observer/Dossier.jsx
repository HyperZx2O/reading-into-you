import ClueScene from './ClueScene.jsx'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Observer.module.css'

/**
 * Subject overview card: reference row, name, behavioral note, clue scene,
 * begin button. Framed as the subject file Jane hands you to study.
 * Beginning the deduction starts a session, so the click plays `start`.
 */
export default function Dossier({ subject, index, total, reaction, onBegin }) {
  const begin = () => {
    playSfx('start')
    onBegin()
  }

  return (
    <section className={styles.dossier}>
      <div className={styles.referenceRow}>
        <p className={styles.reference}>
          Subject File — N° {index + 1} of {total}
        </p>
        <p className={styles.classification} aria-hidden="true">
          Confidential
        </p>
      </div>
      <h2 className={styles.dossierName}>{subject.name}</h2>
      <p className={styles.dossierNote}>{subject.behavioralNote}</p>
      {reaction && <p className={styles.reaction}>{reaction}</p>}
      <ClueScene clues={subject.clues} />
      <button className={styles.beginButton} onClick={begin}>
        Begin Deduction
      </button>
    </section>
  )
}
