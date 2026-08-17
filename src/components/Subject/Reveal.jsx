import { useEffect, useRef, useState } from 'react'

import { getArchetypeById } from '../../data/archetypes.js'
import { pickWordQuote } from '../../utils/scoring.js'
import { recordSession } from '../../utils/caseMemory.js'
import useTypewriter from '../../hooks/useTypewriter.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Reveal.module.css'
import ResultCard from '../Results/ResultCard.jsx'

/**
 * The player's own answer, made presentable for a sentence: trimmed,
 * first letter raised, capped so a long phrase cannot swallow the line.
 * Returns null for an empty answer.
 */
function formatWordAnswer(text) {
  const trimmed = String(text).trim()
  if (!trimmed) return null
  const capped =
    trimmed.length > 48 ? `${trimmed.slice(0, 48).trimEnd()}…` : trimmed
  return capped.charAt(0).toUpperCase() + capped.slice(1)
}

/**
 * Reveal — three-beat archetype reveal: name, monologue, "How Jane Knew".
 * Beat 3 also quotes the player's own word-input answer back at them (P2).
 * Sound: the archetype landing is a rank increase (`level-up`), the Case
 * Closed stamp seals the file (`lock`, the shared seal motif), the shadow
 * toggle expands/collapses, replay navigates back — and Jane's typing
 * (subtitle + monologue) carries the key-contact cue.
 * @param {{ archetype: object, questions: object[], answers: array, onReplay: () => void }} props
 */
export default function Reveal({ archetype, questions = [], answers = [], onReplay }) {
  const [beat, setBeat] = useState(1)
  const [line, setLine] = useState(0)
  const [showShadow, setShowShadow] = useState(false)
  const [envelopeOpen, setEnvelopeOpen] = useState(false)
  const [showResultCard, setShowResultCard] = useState(false)
  const titleRef = useRef(null)
  const sessionStartRef = useRef(Date.now())
  const { displayedText, isDone, skip } = useTypewriter(
    beat === 2 ? archetype.monologue[line] : '',
    40,
    { sfx: true },
  )
  // Beat 1 subtitle — types beneath the name once the envelope is opened.
  const { displayedText: subtitle, isDone: subtitleDone } = useTypewriter(
    beat === 1 && envelopeOpen ? 'Jane has read you.' : '',
    45,
    { sfx: true },
  )
  // Sound guard — the Case Closed stamp fires exactly once per playthrough.
  const beat3Sounded = useRef(false)

  // The envelope is the first click: opening it reveals the name (level-up),
  // then focus lands on the verdict once the flap has lifted. There is no
  // auto-advance — the reveal is a beat the player performs, not one that
  // runs past them.
  const openEnvelope = () => {
    if (envelopeOpen) return
    setEnvelopeOpen(true)
    playSfx('level-up')
    window.setTimeout(() => titleRef.current?.focus(), 650)
  }

  // While sealed, the whole screen opens the envelope; once open, it advances.
  const advanceFromReveal = () => {
    if (!envelopeOpen) {
      openEnvelope()
      return
    }
    setBeat(2)
  }

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

  // The personal callout — Jane quotes the player's own words back (P2).
  const wordQuote = pickWordQuote(questions, answers, archetype.id)
  const wordAnswer = wordQuote ? formatWordAnswer(wordQuote.answer) : null
  const personalCallout =
    wordQuote && wordAnswer && wordQuote.question.revealQuote
      ? wordQuote.question.revealQuote
      : null

  // Record session in case history when beat 3 is reached
  useEffect(() => {
    if (beat !== 3) return
    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000)
    recordSession({
      archetype: archetype.id,
      mode: 'subject',
      duration,
      answers,
      scores: {},
    })
  }, [beat, archetype.id, answers])

  if (beat === 1) {
    return (
      <main key={beat} className={styles.screen} onClick={advanceFromReveal}>
        <div className={styles.verdict}>
          <div className={styles.rule} aria-hidden="true" />
          {/* The name sits sealed behind the flap — a click reveals, it does
           * not advance. The flap is a real button (keyboard reachable). */}
          <div className={styles.envelope}>
            <button
              type="button"
              className={`${styles.flap}${envelopeOpen ? ` ${styles.flapOpen}` : ''}`}
              aria-label="Open the envelope"
              aria-expanded={envelopeOpen}
              disabled={envelopeOpen}
              onClick={(event) => {
                event.stopPropagation()
                openEnvelope()
              }}
            />
            <div className={styles.envelopeBody}>
              <h1 className={styles.title} tabIndex={-1} ref={titleRef}>
                {archetype.name}
              </h1>
              <p className={styles.subtitle} aria-hidden="true">
                {subtitle}
                {!subtitleDone && (
                  <span className={styles.subtitleCaret} aria-hidden="true" />
                )}
              </p>
              <span className="sr-only">Jane has read you.</span>
            </div>
          </div>
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

  const handleChallenge = () => {
    playSfx('click')
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
          {personalCallout && (
            <li key="personal" className={styles.calloutPersonal}>
              {personalCallout.before}
              <strong>{wordAnswer}</strong>
              {personalCallout.after}
            </li>
          )}
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

        {!showResultCard ? (
          <button
            type="button"
            className={styles.playAgain}
            onClick={() => {
              playSfx('back')
              setShowResultCard(true)
            }}
          >
            View Result Card
          </button>
        ) : (
          <ResultCard
            archetype={archetype}
            duration={Math.round((Date.now() - sessionStartRef.current) / 1000)}
            onChallenge={handleChallenge}
          />
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
