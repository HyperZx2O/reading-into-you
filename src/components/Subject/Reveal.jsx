import { useEffect, useRef, useState } from 'react'

import { getArchetypeById } from '../../data/archetypes.js'
import useTypewriter from '../../hooks/useTypewriter.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Reveal.module.css'

/**
 * Reveal — three-beat archetype reveal: name, monologue, "How Jane Knew".
 * Sound: the archetype landing is a rank increase (`level-up`), the Case
 * Closed stamp seals the file (`lock`, the shared seal motif), the shadow
 * toggle expands/collapses, replay navigates back — and Jane's typing
 * (subtitle + monologue) carries the key-contact cue.
 * @param {{ archetype: object, onReplay: () => void }} props
 */
export default function Reveal({ archetype, onReplay }) {
  const [beat, setBeat] = useState(1)
  const [line, setLine] = useState(0)
  const [showShadow, setShowShadow] = useState(false)
  const { displayedText, isDone, skip } = useTypewriter(
    beat === 2 ? archetype.monologue[line] : '',
    40,
    { sfx: true },
  )
  // Beat 1 subtitle — types itself beneath the name as the rules draw (A1).
  const { displayedText: subtitle, isDone: subtitleDone } = useTypewriter(
    beat === 1 ? 'Jane has read you.' : '',
    45,
    { sfx: true },
  )
  // Sound guards — each beat's cue fires exactly once per playthrough.
  const beat1Sounded = useRef(false)
  const beat3Sounded = useRef(false)

  // Beat 1: the archetype name strikes the page (level-up), then auto-advance
  // after 2s (click also advances).
  useEffect(() => {
    if (beat !== 1) return undefined
    if (!beat1Sounded.current) {
      beat1Sounded.current = true
      playSfx('level-up')
    }
    const timer = window.setTimeout(() => setBeat(2), 2000)
    return () => clearTimeout(timer)
  }, [beat])

  // Beat 3: the file is stamped "Case Closed" — the sealed-file motif.
  useEffect(() => {
    if (beat !== 3 || beat3Sounded.current) return undefined
    beat3Sounded.current = true
    playSfx('lock')
    return undefined
  }, [beat])

  const toggleShadow = () => {
    const next = !showShadow
    setShowShadow(next)
    // Choose the cue from the resulting state: detail revealed or receded.
    playSfx(next ? 'expand' : 'collapse')
  }

  const advance = () => {
    if (beat !== 2) return
    // Clicking mid-type finishes the line; once done, advances the line.
    if (!isDone) {
      skip()
      return
    }
    if (line < archetype.monologue.length - 1) {
      setLine((current) => current + 1)
    } else {
      setBeat(3)
    }
  }

  const shadow = getArchetypeById(archetype.shadowArchetypeId)

  if (beat === 1) {
    return (
      <main key={beat} className={styles.screen} onClick={() => setBeat(2)}>
        <div className={styles.verdict}>
          <div className={styles.rule} aria-hidden="true" />
          <h1 className={styles.title}>{archetype.name}</h1>
          <p className={styles.subtitle} aria-hidden="true">
            {subtitle}
            {!subtitleDone && (
              <span className={styles.subtitleCaret} aria-hidden="true" />
            )}
          </p>
          <span className="sr-only">Jane has read you.</span>
          <div
            className={styles.rule}
            aria-hidden="true"
            style={{ animationDelay: '220ms' }}
          />
        </div>
      </main>
    )
  }

  if (beat === 2) {
    return (
      <main key={beat} className={styles.screen} onClick={advance}>
        <h1 className="sr-only">{archetype.name}</h1>
        {/* key={line}: each new line strikes the paper as a fresh sheet (B3). */}
        <p key={line} className={styles.monologue}>
          {displayedText}
        </p>
        {isDone && (
          <button
            type="button"
            className={styles.continue}
            onClick={(event) => {
              event.stopPropagation()
              advance()
            }}
          >
            Continue →
          </button>
        )}
      </main>
    )
  }

  return (
    <main key={beat} className={styles.screen}>
      <h1 className="sr-only">How Jane Knew</h1>
      <section className={styles.card}>
        <span className={styles.stamp} aria-hidden="true">
          Case Closed
        </span>
        <h2 className={styles.cardTitle}>How Jane Knew</h2>
        <ul className={styles.callouts}>
          {archetype.howJaneKnew.map((callout) => (
            <li key={callout} className={styles.callout}>
              {callout}
            </li>
          ))}
        </ul>
        {shadow && (
          <>
            <p className={styles.shadowLine}>
              Your shadow:{' '}
              <button
                type="button"
                className={styles.shadowButton}
                aria-expanded={showShadow}
                onClick={toggleShadow}
              >
                {shadow.name}
              </button>
            </p>
            {showShadow && <p className={styles.shadowProfile}>{shadow.oceanProfile}</p>}
          </>
        )}
        <button
          type="button"
          className={styles.playAgain}
          onClick={() => {
            playSfx('back')
            onReplay()
          }}
        >
          Play again
        </button>
      </section>
    </main>
  )
}
