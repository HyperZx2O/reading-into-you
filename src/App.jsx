import { useState } from 'react'
import ObserverGame from './components/Observer/ObserverGame.jsx'
import PerceptionRating from './components/Observer/PerceptionRating.jsx'
import AudioToggle from './components/UI/AudioToggle.jsx'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'

import Intro from './components/Intro/Intro.jsx'
import ModeSelect from './components/ModeSelect/ModeSelect.jsx'
import SubjectGame from './components/Subject/SubjectGame.jsx'

/**
 * Screen names:
 *  'intro'       — unskippable typewriter cinematic (first visit only)
 *  'modeSelect'  — choose Mode 1 or Mode 2
 *  'mode1'       — The Subject (Mode 1 game flow, includes the reveal)
 *  'mode2'       — The Observer (Mode 2 game flow, Person B's screen)
 *  'mode2Rating' — Perception Rating screen (Person B's screen)
 */

const STORAGE_KEY_INTRO = 'jane_intro_seen'

function getInitialScreen() {
  try {
    return localStorage.getItem(STORAGE_KEY_INTRO) ? 'modeSelect' : 'intro'
  } catch {
    return 'intro'
  }
}

export default function App() {
  const [screen, setScreen] = useState(getInitialScreen)
  const [leaving, setLeaving] = useState(false)

  // Screen change = fade out 400ms, swap, then the next screen's own 400ms fade-in.
  const goTo = (nextScreen) => {
    if (leaving) return
    setLeaving(true)
    window.setTimeout(() => {
      setScreen(nextScreen)
      setLeaving(false)
    }, 400)
  }

  // Final Mode 2 score, passed to the Perception Rating screen.
  const [mode2Score, setMode2Score] = useState(0)

  const handleIntroComplete = () => {
    try { localStorage.setItem(STORAGE_KEY_INTRO, 'true') } catch {}
    goTo('modeSelect')
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        opacity: leaving ? 0 : 1,
        transition: 'opacity 400ms ease',
      }}
    >
      {/* Single global ambient control — spec: mute toggle always visible. */}
      <AudioToggle />
      {/* A render error on any screen must never white-screen the game. */}
      <ErrorBoundary>
        {screen === 'intro' && (
          <Intro onComplete={handleIntroComplete} />
        )}
        {screen === 'modeSelect' && (
          <ModeSelect onSelectMode={(mode) => goTo(mode === 'mode1' ? 'mode1' : 'mode2')} />
        )}
        {screen === 'mode1' && (
          <SubjectGame onReplay={() => goTo('modeSelect')} />
        )}
        {screen === 'mode2' && (
          <ObserverGame
            onComplete={(score) => {
              setMode2Score(score)
              goTo('mode2Rating')
            }}
          />
        )}
        {screen === 'mode2Rating' && (
          <PerceptionRating score={mode2Score} onPlayAgain={() => goTo('modeSelect')} />
        )}
      </ErrorBoundary>
    </div>
  )
}


