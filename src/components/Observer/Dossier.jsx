import ClueScene from './ClueScene.jsx'
import styles from '../../styles/Observer.module.css'

/** Subject overview card: name, behavioral note, clue scene, begin button. */
export default function Dossier({ subject, reaction, onBegin }) {
  return (
    <section className={styles.dossier}>
      <h2 className={styles.dossierName}>{subject.name}</h2>
      <p className={styles.dossierNote}>{subject.behavioralNote}</p>
      {reaction && <p className={styles.reaction}>{reaction}</p>}
      <ClueScene clues={subject.clues} />
      <button className={styles.beginButton} onClick={onBegin}>
        Begin Deduction
      </button>
    </section>
  )
}
