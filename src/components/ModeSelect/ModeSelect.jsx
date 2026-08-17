import { MODE_SELECT_COPY } from '../../data/flavor.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/ModeSelect.module.css'

/**
 * Mode select screen — choose The Subject or The Observer.
 * Each mode is presented as a case file on the desk: reference number,
 * the note Jane files under it, and the action that opens it.
 * Choosing a mode begins a session, so the click plays `start` (a process
 * or session begins) — the only cue on this screen.
 * @param {{ onSelectMode: (mode: 'mode1' | 'mode2') => void, onStats?: () => void }} props
 */
export default function ModeSelect({ onSelectMode, onStats }) {
  const chooseMode = (mode) => {
    playSfx('start')
    onSelectMode(mode)
  }

  const handleStats = () => {
    playSfx('click')
    if (onStats) onStats()
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>{MODE_SELECT_COPY.title}</h1>
      <div className={styles.modes}>
        <section className={styles.modeStack}>
          <span className={styles.sheet} aria-hidden="true" />
          <span className={styles.sheet} aria-hidden="true" />
          <div className={styles.mode}>
            <span className={styles.glyph} aria-hidden="true">✦</span>
            <p className={styles.reference}>Case File N° 01</p>
            <h2 className={styles.modeName}>{MODE_SELECT_COPY.mode1Name}</h2>
            <p className={styles.tagline}>{MODE_SELECT_COPY.mode1Tagline}</p>
            <p className={styles.duration}>{MODE_SELECT_COPY.mode1Duration}</p>
            <button
              type="button"
              className={styles.modeButton}
              onClick={() => chooseMode('mode1')}
            >
              Open file →
            </button>
          </div>
        </section>
        <section className={styles.modeStack}>
          <span className={styles.sheet} aria-hidden="true" />
          <span className={styles.sheet} aria-hidden="true" />
          <div className={styles.mode}>
            <span className={styles.glyph} aria-hidden="true">◉</span>
            <p className={styles.reference}>Case File N° 02</p>
            <h2 className={styles.modeName}>{MODE_SELECT_COPY.mode2Name}</h2>
            <p className={styles.tagline}>{MODE_SELECT_COPY.mode2Tagline}</p>
            <p className={styles.duration}>{MODE_SELECT_COPY.mode2Duration}</p>
            <button
              type="button"
              className={styles.modeButton}
              onClick={() => chooseMode('mode2')}
            >
              Open file →
            </button>
          </div>
        </section>
      </div>
      {onStats && (
        <button
          type="button"
          className={styles.statsLink}
          onClick={handleStats}
        >
          View Statistics →
        </button>
      )}
    </main>
  )
}
