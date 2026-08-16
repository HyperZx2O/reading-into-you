import { useEffect, useRef, useState } from 'react'
import { getRatingDetails } from '../../utils/scoring.js'
import { recordScore } from '../../utils/scoreHistory.js'
import styles from '../../styles/Observer.module.css'

/**
 * Final Mode 2 screen. Receives the 0–100 score, derives label + remark
 * from the rating ladder, and types out Jane's closing remark.
 */
export default function PerceptionRating({ score, onPlayAgain }) {
  // Defensive clamp — score must be a finite 0–100 number (Phase 9).
  const safeScore = Number.isFinite(score)
    ? Math.max(0, Math.min(100, Math.round(score)))
    : 0
  const { label, remark } = getRatingDetails(safeScore)
  const [typed, setTyped] = useState('')
  const [history, setHistory] = useState([])
  const recorded = useRef(false)

  // Record this run once — the ref guards against StrictMode double-effects.
  useEffect(() => {
    if (recorded.current) return
    recorded.current = true
    setHistory(recordScore(safeScore))
  }, [safeScore])

  // Local typewriter for the remark (Mode 1's useTypewriter is Person A's).
  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i += 1
      setTyped(remark.slice(0, i))
      if (i >= remark.length) clearInterval(id)
    }, 30)
    return () => clearInterval(id)
  }, [remark])

  const typing = typed.length < remark.length

  return (
    <div className={styles.ratingScreen}>
      <h2 className={styles.ratingScore}>{safeScore}</h2>
      <p className={styles.ratingLabel}>{label}</p>
      <p className={styles.ratingRemark} aria-hidden="true">
        {typed}
        {typing && <span className={styles.ratingCursor} aria-hidden="true" />}
      </p>
      <span className={styles.srOnly}>{remark}</span>
      {history.length > 1 && (
        <p className={styles.scoreHistory}>
          Previous runs: {history.slice(1).join(' · ')}
        </p>
      )}
      <button className={styles.playAgainButton} onClick={onPlayAgain}>
        Play Again
      </button>
    </div>
  )
}
