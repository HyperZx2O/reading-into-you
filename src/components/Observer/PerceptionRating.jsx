import { useEffect, useRef, useState } from 'react'
import useTypewriter from '../../hooks/useTypewriter.js'
import { getRatingDetails, getRatingLabel } from '../../utils/scoring.js'
import { recordScore } from '../../utils/scoreHistory.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Observer.module.css'

/**
 * Final Mode 2 screen. Receives the 0–100 score, derives label + remark
 * from the rating ladder, and types out Jane's closing remark.
 * Sound: the tier landing is a rank increase (`level-up`, played once when
 * the score count-up completes and the label stamps), Jane's remark types
 * with key-contact cues, and Play again navigates back.
 */
export default function PerceptionRating({ score, onPlayAgain }) {
  // Defensive clamp — score must be a finite 0–100 number (Phase 9).
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : 0
  const { label, remark } = getRatingDetails(safeScore)
  const { displayedText: typed, isDone } = useTypewriter(remark, 30, { sfx: true })
  const levelSounded = useRef(false)

  const [displayScore, setDisplayScore] = useState(0)
  const [stamped, setStamped] = useState(false)

  // The score counts up 0 → safeScore (700ms, ease-out) so the lamp visibly
  // burns by tier as the number climbs; the tier label stamps in once it
  // lands. Reduced motion jumps straight to the final value.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayScore(safeScore)
      setStamped(true)
      return undefined
    }
    const DURATION = 700
    const STEP = 30
    let elapsed = 0
    const timer = window.setInterval(() => {
      elapsed += STEP
      const t = Math.min(1, elapsed / DURATION)
      setDisplayScore(Math.round(safeScore * (1 - (1 - t) ** 3)))
      if (t >= 1) {
        window.clearInterval(timer)
        setStamped(true)
      }
    }, STEP)
    return () => window.clearInterval(timer)
  }, [safeScore])

  // One `level-up` when the tier stamps — guarded against StrictMode remounts.
  useEffect(() => {
    if (!stamped || levelSounded.current) return undefined
    levelSounded.current = true
    playSfx('level-up')
    return undefined
  }, [stamped])

  // The lamp burns by tier — Rookie earns no gold, Patrick Jane earns it all.
  // Senior Agent and Patrick Jane keep the full gold from .ratingScore.
  const SCORE_TONE = {
    Rookie: styles.scoreRookie,
    Investigator: styles.scoreInvestigator,
    Consultant: styles.scoreConsultant,
    'Senior Agent': null,
    'Patrick Jane': null,
  }
  // The lamp burns by tier during the climb — the hue steps with the number.
  const toneClass = SCORE_TONE[getRatingLabel(displayScore)]
  const [history, setHistory] = useState([])
  const recorded = useRef(false)

  // Record this run once — the ref guards against StrictMode double-effects.
  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    setHistory(recordScore(safeScore))
  }, [safeScore])

  const typing = !isDone

  return (
    <main className={styles.ratingScreen}>
      <span className={styles.stamp} aria-hidden="true">
        Case Closed
      </span>
      <h1 className={`${styles.ratingScore}${toneClass ? ` ${toneClass}` : ''}`}>
        {displayScore}
      </h1>
      <p
        className={`${styles.ratingLabel}${
          label === 'Patrick Jane' ? ` ${styles.labelJane}` : ''
        }${stamped ? ` ${styles.labelStamp}` : ''}`}
      >
        {label}
      </p>
      <p className={styles.ratingRemark} aria-hidden="true">
        {typed}
        {typing && <span className={styles.ratingCursor} aria-hidden="true" />}
      </p>
      <span className="sr-only">{remark}</span>
      {history.length > 1 && (
        <p className={styles.scoreHistory}>
          Previous runs: {history.slice(1).join(' · ')}
        </p>
      )}
      <button
        className={styles.playAgainButton}
        onClick={() => {
          playSfx('back')
          onPlayAgain()
        }}
      >
        Play again
      </button>
    </main>
  )
}
