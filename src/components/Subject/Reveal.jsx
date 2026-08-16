import { useEffect, useState } from 'react'

import { getArchetypeById } from '../../data/archetypes.js'
import useTypewriter from '../../hooks/useTypewriter.js'
import styles from '../../styles/Reveal.module.css'

/**
 * Reveal — three-beat archetype reveal: name, monologue, "How Jane Knew".
 * @param {{ archetype: object, onReplay: () => void }} props
 */
export default function Reveal({ archetype, onReplay }) {
  const [beat, setBeat] = useState(1)
  const [line, setLine] = useState(0)
  const [showShadow, setShowShadow] = useState(false)
  const { displayedText, isDone } = useTypewriter(
    beat === 2 ? archetype.monologue[line] : '',
  )

  // Beat 1: auto-advance after 2s (click also advances).
  useEffect(() => {
    if (beat !== 1) return undefined
    const timer = window.setTimeout(() => setBeat(2), 2000)
    return () => clearTimeout(timer)
  }, [beat])

  const advance = () => {
    if (beat !== 2 || !isDone) return
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
        <h1 className={styles.title}>{archetype.name}</h1>
        <p className={styles.subtitle}>Jane has read you.</p>
      </main>
    )
  }

  if (beat === 2) {
    return (
      <main key={beat} className={styles.screen}>
        <p className={styles.monologue}>{displayedText}</p>
        {isDone && (
          <button type="button" className={styles.continue} onClick={advance}>
            Continue →
          </button>
        )}
      </main>
    )
  }

  return (
    <main key={beat} className={styles.screen}>
      <section className={styles.card}>
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
                onClick={() => setShowShadow((shown) => !shown)}
              >
                {shadow.name}
              </button>
            </p>
            {showShadow && <p className={styles.shadowProfile}>{shadow.oceanProfile}</p>}
          </>
        )}
        <button type="button" className={styles.playAgain} onClick={onReplay}>
          Play again
        </button>
      </section>
    </main>
  )
}
