import { useState, useCallback, useEffect } from 'react'
import ObserverGame from './components/Observer/ObserverGame.jsx'
import PerceptionRating from './components/Observer/PerceptionRating.jsx'
import AudioToggle from './components/UI/AudioToggle.jsx'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'

import Intro from './components/Intro/Intro.jsx'
import ModeSelect from './components/ModeSelect/ModeSelect.jsx'
import SubjectGame from './components/Subject/SubjectGame.jsx'
import StatsPage from './components/Stats/StatsPage.jsx'
import EmbedWidget from './components/Results/EmbedWidget.jsx'
import { readUrlParams, clearUrlParams } from './utils/urlParams.js'
import { incrementReferral, getUserId } from './utils/caseMemory.js'

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
  // Check URL params first for challenge/redirect flows
  const urlParams = readUrlParams()

  // If role=observer is set, auto-start Mode 2
  if (urlParams.role === 'observer') {
    // Record referral if ref param exists
    if (urlParams.ref) {
      incrementReferral()
    }
    return 'mode2'
  }

  // Normal flow: check if intro has been seen
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

  // Final Mode 2 result — the score plus the casebook (the player's reads
  // and the session subjects), passed to the Perception Rating screen (P2).
  const [mode2Result, setMode2Result] = useState(null)

  const handleIntroComplete = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY_INTRO, 'true') } catch {}
    goTo('modeSelect')
  }, [])

  const handleSelectMode = useCallback((mode) => {
    goTo(mode === 'mode1' ? 'mode1' : 'mode2')
  }, [])

  const handleReplay = useCallback(() => goTo('modeSelect'), [])

  const handleObserverComplete = useCallback((result) => {
    setMode2Result(result)
    goTo('mode2Rating')
  }, [])

  const handlePlayAgain = useCallback(() => {
    clearUrlParams()
    goTo('modeSelect')
  }, [])

  // The player's cursor becomes the role's instrument (P4): a pen while being
  // read, a gloved hand while reading others.
  const cursorClass =
    screen === 'mode1'
      ? 'mode1'
      : screen === 'mode2' || screen === 'mode2Rating'
        ? 'mode2'
        : ''

  const containerStyle = {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    opacity: leaving ? 0 : 1,
    transition: 'opacity 400ms ease',
  }

  return (
    <div className={cursorClass} style={containerStyle}>
      {/* A render error on any screen must never white-screen the game. */}
      <ErrorBoundary>
        {/* Single global ambient control — spec: mute toggle always visible. */}
        <AudioToggle />
        {screen === 'intro' && (
          <Intro onComplete={handleIntroComplete} />
        )}
        {screen === 'modeSelect' && (
          <ModeSelect onSelectMode={handleSelectMode} onStats={() => goTo('stats')} />
        )}
        {screen === 'mode1' && (
          <SubjectGame onReplay={handleReplay} />
        )}
        {screen === 'mode2' && (
          <ObserverGame onComplete={handleObserverComplete} />
        )}
        {screen === 'mode2Rating' && (
          <PerceptionRating
            score={mode2Result?.score ?? 0}
            subjects={mode2Result?.subjects ?? []}
            reads={mode2Result?.reads ?? []}
            onPlayAgain={handlePlayAgain}
          />
        )}
        {screen === 'stats' && (
          <StatsPage onBack={() => goTo('modeSelect')} />
        )}
        {screen === 'embed' && (
          <EmbedWidget archetype="sentinel" onBack={() => goTo('modeSelect')} />
        )}
      </ErrorBoundary>
    </div>
  )
}


