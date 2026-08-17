import { useId, useState } from 'react'
import ClueScene from './ClueScene.jsx'
import { CASEBOOK_COPY } from '../../data/flavor.js'
import { playSfx, TYPING_CUE, TYPING_VOLUME } from '../../audio/uiSfx.js'
import styles from '../../styles/Observer.module.css'

/**
 * Subject overview card: reference row, name, behavioral note, clue scene,
 * the player's optional "my read" note (P2), and the begin button. Framed as
 * the subject file Jane hands you to study.
 *
 * The note is the player's honest prediction — filed BEFORE the verdict, so
 * the rating screen can hold it beside Jane's. Filing is explicit (Enter or
 * submit), optional, and never gates the deduction. Sound: filing commits
 * the read (`select`), typing carries the key-contact cue, and beginning the
 * deduction starts a session (`start`).
 *
 * @param {{ subject: object, index: number, total: number, reaction: string|null,
 *           note: string, onFileRead: (text: string) => void,
 *           onBegin: () => void }} props
 */
export default function Dossier({ subject, index, total, reaction, note = '', onFileRead, onBegin }) {
  const [value, setValue] = useState(note)
  const [filed, setFiled] = useState(Boolean(note))
  const noteId = useId()

  const fileRead = (event) => {
    event.preventDefault()
    if (filed) return
    const text = value.trim()
    if (!text) return // an empty read is not a read
    setFiled(true)
    playSfx('select')
    onFileRead(text)
  }

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
      <form
        className={styles.noteForm}
        onSubmit={fileRead}
        aria-label={`My read of ${subject.name}`}
      >
        <label className={styles.noteLabel} htmlFor={noteId}>
          {CASEBOOK_COPY.noteLabel}
        </label>
        <input
          id={noteId}
          className={styles.noteInput}
          type="text"
          value={value}
          placeholder={CASEBOOK_COPY.notePlaceholder}
          autoComplete="off"
          spellCheck="false"
          maxLength={160}
          disabled={filed}
          onChange={(event) => {
            setValue(event.target.value)
            // Every local text-entry input event gets one brief key contact.
            playSfx(TYPING_CUE, { volume: TYPING_VOLUME, cooldownMs: 0 })
          }}
        />
      </form>
      <button className={styles.beginButton} onClick={begin}>
        Begin Deduction
      </button>
    </section>
  )
}
