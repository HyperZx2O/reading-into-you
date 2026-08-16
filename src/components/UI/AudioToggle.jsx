import { useEffect, useRef, useState } from 'react'
import styles from '../../styles/Observer.module.css'

/**
 * Persistent ambient audio control. Browsers block autoplay, so playback
 * starts on the first click/keydown anywhere on the document (ADR-2).
 * Toggling mutes (pauses/resumes) — it never restarts the track.
 */
export default function AudioToggle() {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [broken, setBroken] = useState(false)

  useEffect(() => {
    // BASE_URL keeps this working even if the app is deployed under a subpath.
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/ambient.mp3`)
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    const start = () => {
      audio.play().catch(() => setBroken(true))
      document.removeEventListener('click', start)
      document.removeEventListener('keydown', start)
    }
    document.addEventListener('click', start)
    document.addEventListener('keydown', start)

    return () => {
      document.removeEventListener('click', start)
      document.removeEventListener('keydown', start)
      audio.pause()
    }
  }, [])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }

  // Audio failed to load — hide the control silently rather than show a
  // broken button (Phase 9 guard, applied here at the source).
  if (broken) return null

  return (
    <button
      className={styles.audioToggle}
      onClick={toggleMute}
      aria-label={muted ? 'Unmute ambient audio' : 'Mute ambient audio'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '✕♪' : '♪'}
    </button>
  )
}
