import { useRef } from 'react'

import PickOne from './PickOne.jsx'
import WordInput from './WordInput.jsx'
import DragRank from './DragRank.jsx'
import FaceDown from './FaceDown.jsx'
import Timer from './Timer.jsx'
import useTypewriter from '../../hooks/useTypewriter.js'
import styles from '../../styles/Subject.module.css'

/**
 * QuestionRenderer — routes to the interaction component matching
 * question.interactionType. Act 2 (Pressure) questions get a depleting timer;
 * if it expires unanswered, a null answer is submitted.
 * Each question is framed as a page of the case file: the act it belongs to,
 * the case progress rail, and the question index. A Jane reaction (P3)
 * rides in above the interaction, typed in her voice.
 * @param {{ question: object, questionNumber: number, reaction: string|null,
 *           onAnswer: Function }} props
 */
const INTERACTIONS = {
  multipleChoice: { component: PickOne, cardLayout: false },
  imagePick: { component: PickOne, cardLayout: true },
  wordInput: { component: WordInput },
  dragRank: { component: DragRank },
}

const ACT2_SECONDS = 30

// Act labels are case-file chrome, not Jane's voice (the typewriter rule).
const ACT_LABELS = {
  1: 'Act I — Calibration',
  2: 'Act II — Pressure',
  3: 'Act III — Misdirection',
}

/** Jane's mid-session remark — types in her voice; the full line is read
 * once by assistive tech, never per keystroke. */
function ReactionLine({ text }) {
  const { displayedText, isDone } = useTypewriter(text, 40, { sfx: true })
  return (
    <>
      <p className={styles.reaction} aria-hidden="true">
        {displayedText}
        {!isDone && <span className={styles.reactionCaret} aria-hidden="true" />}
      </p>
      <span className="sr-only">{text}</span>
    </>
  )
}

export default function QuestionRenderer({ question, questionNumber, totalQuestions, reaction = null, onAnswer }) {
  const interaction = INTERACTIONS[question.interactionType]
  const Interaction = interaction?.component
  // P7 — Jane waits: a prelude question types her line before the options
  // render. No prelude -> '' -> done instantly (the interaction mounts as
  // before). QuestionRenderer is keyed per question, so the typewriter resets
  // cleanly between questions. Called before the early return — hooks order.
  const prelude = question.prelude ?? ''
  const { displayedText: preludeText, isDone: preludeDone } = useTypewriter(
    prelude,
    40,
    { sfx: true }
  )

  // Guard: answer fires exactly once even if the timer and an interaction race.
  // reset via `key` on this component (remount per question).
  const answered = useRef(false)
  const handleAnswer = (answer) => {
    if (answered.current) return
    answered.current = true
    onAnswer(answer)
  }

  if (!Interaction) {
    // Edge case: unknown interactionType. Phase 9 hardens this path.
    console.warn(`QuestionRenderer: unknown interactionType "${question.interactionType}"`)
    return null
  }

  const pct = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <main className={styles.question}>
      <h1 className="sr-only" role="status">Question {questionNumber} of {totalQuestions}</h1>
      <div className={styles.caseHeader}>
        {/* keyed by act: the label re-enters only when the act changes */}
        <p
          key={question.act}
          className={`${styles.actLabel}${
            question.act === 2 ? ` ${styles.actLabelPressure}` : ''
          }`}
        >
          {ACT_LABELS[question.act]}
        </p>
        <div
          className={styles.progressRail}
          role="progressbar"
          aria-valuenow={questionNumber}
          aria-valuemin={0}
          aria-valuemax={totalQuestions}
          aria-label="Question progress"
        >
          <div
            className={styles.progressFill}
            style={{ transform: `scaleX(${pct / 100})`, transformOrigin: 'left' }}
          />
        </div>
        <p className={styles.questionIndex}>Question {questionNumber} of {totalQuestions}</p>
      </div>
      {reaction && (
        <ReactionLine text={reaction} />
      )}
      {/* P7 prelude — Jane's typed line, above the interaction she is
       * withholding. Same voice and sr-only pattern as the P3 reactions. */}
      {question.prelude && (
        <>
          <p className={styles.reaction} aria-hidden="true">
            {preludeText}
            {!preludeDone && <span className={styles.reactionCaret} aria-hidden="true" />}
          </p>
          <span className="sr-only">{question.prelude}</span>
        </>
      )}
      {question.act === 2 && (
        <Timer seconds={ACT2_SECONDS} onExpire={() => handleAnswer(null)} />
      )}
      {question.faceDown ? (
        <FaceDown
          question={question}
          onAnswer={handleAnswer}
          cardLayout={interaction.cardLayout}
        />
      ) : (
        <>
          {/* While Jane waits, the prompt stays visible — she studies you as
           * you read. Once the line lands, the interaction mounts (PickOne
           * suppresses its own prompt then, so there is exactly one h2). */}
          {question.prelude && !preludeDone && (
            <h2 className={styles.prompt}>{question.prompt}</h2>
          )}
          {preludeDone && (
            <Interaction
              question={question}
              onAnswer={handleAnswer}
              cardLayout={interaction.cardLayout}
              showPrompt={!question.prelude}
            />
          )}
        </>
      )}
    </main>
  )
}
