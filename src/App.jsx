import { useState } from 'react'

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

  const goTo = (nextScreen) => setScreen(nextScreen)

  const handleIntroComplete = () => {
    try { localStorage.setItem(STORAGE_KEY_INTRO, 'true') } catch {}
    goTo('modeSelect')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        <PlaceholderScreen label="Mode 2: The Observer" onNext={() => goTo('mode2Rating')} />
      )}
      {screen === 'mode2Rating' && (
        <PlaceholderScreen label="Mode 2: Perception Rating" onNext={() => goTo('modeSelect')} />
      )}
    </div>
  )
}

/**
 * Temporary placeholder — replace each screen with its real component.
 */
function PlaceholderScreen({ label, onNext, actions }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      fontFamily: 'var(--font-heading)',
    }}>
      <h2 style={{ color: 'var(--color-gold)' }}>{label}</h2>
      <p style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-ui)' }}>
        — placeholder screen —
      </p>
      {actions
        ? actions.map(({ label: btnLabel, next }) => (
            <button
              key={next}
              onClick={() => onNext(next)}
              style={btnStyle}
            >
              {btnLabel}
            </button>
          ))
        : (
          <button onClick={onNext} style={btnStyle}>
            Continue →
          </button>
        )
      }
    </div>
  )
}

const btnStyle = {
  padding: '0.75rem 2rem',
  border: '1px solid var(--color-gold)',
  background: 'transparent',
  color: 'var(--color-gold)',
  fontFamily: 'var(--font-ui)',
  fontSize: '0.95rem',
  letterSpacing: '0.05em',
  cursor: 'pointer',
  borderRadius: 'var(--radius-sm)',
  transition: 'background var(--transition-fast)',
}
