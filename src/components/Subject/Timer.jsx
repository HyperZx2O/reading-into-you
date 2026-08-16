import { useEffect, useRef, useState } from 'react'

import { playSfx, startSfxLoop, stopSfxLoop } from '../../audio/uiSfx.js'
import styles from '../../styles/Subject.module.css'

/**
 * Timer — thin depleting progress bar (plan Phase 4). Renders for Act 2
 * (Pressure) questions. Calls `onExpire` once after `seconds`; a null answer
 * is submitted by QuestionRenderer if the player did not answer in time.
 * The aria-label holds a static description until the final 10 seconds, then
 * ticks per second — the countdown is announced without 30 live-region
 * announcements per question (see the label logic below).
 * The fill animates via transform: scaleX (origin left) rather than width, so
 * the 30s depletion runs on the compositor instead of re-layouting per frame.
 * Sound: Act II is the pressure act — "Jane is watching", so the visible
 * countdown runs a quiet `recording` loop (idempotent start) and one
 * `warning` lands when the final 5 seconds begin. The loop is stopped on
 * expiry and on unmount (answer given, route change, mute) — every exit
 * path, with the retained handle cleared.
 * @param {{ seconds: number, onExpire: () => void }} props
 */
export default function Timer({ seconds, onExpire }) {
  const [pct, setPct] = useState(100)
  const [remaining, setRemaining] = useState(seconds)
  const loopRef = useRef(null)
  const warned = useRef(false)

  useEffect(() => {
    setPct(0)
    loopRef.current = startSfxLoop('recording', { volume: 0.07 })
    const timer = window.setTimeout(() => {
      stopSfxLoop(loopRef.current)
      loopRef.current = null
      onExpire()
    }, seconds * 1000)
    const tick = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1))
    }, 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(tick)
      stopSfxLoop(loopRef.current)
      loopRef.current = null
    }
  }, [seconds, onExpire])

  // One warning when the final 5 seconds begin — pressure has a voice.
  useEffect(() => {
    if (remaining > 5 || warned.current) return undefined
    warned.current = true
    playSfx('warning')
    return undefined
  }, [remaining])

  // role="timer" is a live region — announcing every second for the full
  // 30s is 30 announcements per question. The label holds one static
  // description until the final 10 seconds, when the pressure is real and
  // the per-second tick is worth the noise.
  const label =
    remaining <= 10 ? `${remaining} seconds remaining` : 'Countdown in progress'

  return (
    <div className={styles.timer} role="timer" aria-label={label}>
      <div
        className={`${styles.timerFill}${
          remaining <= 5 ? ` ${styles.timerUrgent}` : ''
        }`}
        style={{
          transform: `scaleX(${pct / 100})`,
          transformOrigin: 'left',
          transition: `transform ${seconds}s linear`,
        }}
      />
    </div>
  )
}
