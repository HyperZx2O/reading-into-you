import useTypewriter from '../../hooks/useTypewriter.js'
import styles from '../../styles/Intro.module.css'

/**
 * Intro screen — unskippable typewriter cinematic (first visit only).
 * @param {{ onComplete: () => void }} props
 */

// Intro script — TRACKED NOTE: the spec's content inventory marks the real
// intro text as done, but the script itself is missing from the repo (it was
// not in the scaffold zip). This stand-in is swapped for the real script when
// it's provided. Paragraphs separated by newlines — the typewriter types the
// whole block.
const INTRO_SCRIPT = [
  'Some people think a mentalist reads minds.',
  'They do not. They read people.',
  'They watch the small choices you make when you think no one is looking.',
  'Tonight, you are the one being read.',
].join('\n')

export default function Intro({ onComplete }) {
  const { displayedText, isDone } = useTypewriter(INTRO_SCRIPT)

  return (
    <main className={styles.screen}>
      <p className={styles.script}>
        {displayedText}
        {!isDone && <span className={styles.caret} aria-hidden="true" />}
      </p>
      {isDone && (
        <button type="button" className={styles.ready} onClick={onComplete}>
          {"I'm ready."}
        </button>
      )}
    </main>
  )
}
