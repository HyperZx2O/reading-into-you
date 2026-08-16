import { MODE_SELECT_COPY } from '../../data/flavor.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/ModeSelect.module.css'

/**
 * Mode select screen — choose The Subject or The Observer.
 * Each mode is presented as a case file on the desk: reference number,
 * the note Jane files under it, and the action that opens it.
 * Choosing a mode begins a session, so the click plays `start` (a process
 * or session begins) — the only cue on this screen.
 * @param {{ onSelectMode: (mode: 'mode1' | 'mode2') => void }} props
 */
export default function ModeSelect({ onSelectMode }) {
  const chooseMode = (mode) => {
    playSfx('start')
    onSelectMode(mode)
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>{MODE_SELECT_COPY.title}</h1>
      <div className={styles.modes}>
        <section className={styles.modeStack}>
          <span className={styles.sheet} aria-hidden="true" />
          <span className={styles.sheet} aria-hidden="true" />
          <div className={styles.mode}>
            <p className={styles.reference}>Case File N° 01</p>
            <p className={styles.tagline}>{MODE_SELECT_COPY.mode1Tagline}</p>
            <p className={styles.duration}>{MODE_SELECT_COPY.mode1Duration}</p>
            <button
              type="button"
              className={styles.modeButton}
              onClick={() => chooseMode('mode1')}
            >
              {MODE_SELECT_COPY.mode1Name}
            </button>
          </div>
        </section>
        <section className={styles.modeStack}>
          <span className={styles.sheet} aria-hidden="true" />
          <span className={styles.sheet} aria-hidden="true" />
          <div className={styles.mode}>
            <p className={styles.reference}>Case File N° 02</p>
            <p className={styles.tagline}>{MODE_SELECT_COPY.mode2Tagline}</p>
            <p className={styles.duration}>{MODE_SELECT_COPY.mode2Duration}</p>
            <button
              type="button"
              className={styles.modeButton}
              onClick={() => chooseMode('mode2')}
            >
              {MODE_SELECT_COPY.mode2Name}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
