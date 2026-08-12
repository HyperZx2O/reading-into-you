import styles from '../../styles/ModeSelect.module.css'

/**
 * Mode select screen — choose The Subject or The Observer.
 * @param {{ onSelectMode: (mode: 'mode1' | 'mode2') => void }} props
 */
export default function ModeSelect({ onSelectMode }) {
  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>Choose your role.</h1>
      <div className={styles.modes}>
        <section className={styles.mode}>
          <p className={styles.tagline}>Be read — twelve questions, one reveal.</p>
          <button
            type="button"
            className={styles.modeButton}
            onClick={() => onSelectMode('mode1')}
          >
            The Subject
          </button>
        </section>
        <section className={styles.mode}>
          <p className={styles.tagline}>Read others — five dossiers, one rating.</p>
          <button
            type="button"
            className={styles.modeButton}
            onClick={() => onSelectMode('mode2')}
          >
            The Observer
          </button>
        </section>
      </div>
    </main>
  )
}
