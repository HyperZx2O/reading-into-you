import { useEffect, useRef, useState } from 'react'
import styles from '../../styles/Observer.module.css'
import {
  disableSfx,
  enableSfx,
  isSoundEnabled,
  playSfx,
  unlockSfx,
} from '../../audio/uiSfx.js'

/**
 * Master sound control — one toggle for the whole audio layer (the ambient
 * bed AND the UI sound effects). Browsers block autoplay, so audio starts on
 * the first click/keydown anywhere on the document: that gesture also unlocks
 * the SFX player (uiSfx.unlockSfx). The on/off state is persisted in
 * localStorage (jane_sound_enabled), so a muted session stays muted.
 * Toggling off stops SFX loops immediately and pauses the ambient track;
 * toggling on resumes both. The ♪ glyph and aria-label carry the state, and
 * the toggle cue itself plays from the resulting state (toggle-off before the
 * mute applies, toggle-on after enabling) so the change is self-announcing.
 */
export default function AudioToggle() {
  const audioRef = useRef(null)
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())
  const [broken, setBroken] = useState(false)

  // The document gesture handler reads the current preference via a ref so the
  // Audio element is created exactly once (a [soundOn] dep would recreate and
  // pause the track on every toggle).
  const soundOnRef = useRef(soundOn)
  soundOnRef.current = soundOn

  useEffect(() => {
    // BASE_URL keeps this working even if the app is deployed under a subpath.
    const audio = new Audio(`${import.meta.env.BASE_URL}audio/ambient.mp3`)
    audio.loop = true
    audio.volume = 0.3
    // Defer the 361 KB track until the first interaction — it must not compete
    // with first paint. The play() in `start` below still begins it on the
    // first click/keydown, exactly as before.
    audio.preload = 'none'
    audioRef.current = audio

    const start = () => {
      // The gesture unlocks the SFX player (Web Audio requires trusted intent).
      unlockSfx()
      if (soundOnRef.current) {
        audio.play().catch(() => setBroken(true))
      }
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

  const toggleSound = () => {
    if (soundOn) {
      // Audible confirmation of the state you are leaving, then mute everything.
      playSfx('toggle-off')
      disableSfx()
      const audio = audioRef.current
      if (audio) audio.pause()
    } else {
      // The click is a genuine gesture, so enabling + resuming is allowed.
      enableSfx()
      playSfx('toggle-on')
      const audio = audioRef.current
      if (audio) audio.play().catch(() => setBroken(true))
    }
    setSoundOn((on) => !on)
  }

  // Audio failed to load — hide the control silently rather than show a
  // broken button (Phase 9 guard, applied here at the source).
  if (broken) return null

  return (
    <button
      className={styles.audioToggle}
      onClick={toggleSound}
      aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
      title={soundOn ? 'Mute sound' : 'Unmute sound'}
      aria-pressed={soundOn}
    >
      {soundOn ? '♪' : '✕♪'}
    </button>
  )
}
