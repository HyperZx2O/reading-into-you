import { useRef } from 'react'

import PickOne from './PickOne.jsx'
import WordInput from './WordInput.jsx'
import DragRank from './DragRank.jsx'
import Timer from './Timer.jsx'
import styles from '../../styles/Subject.module.css'

/**
 * QuestionRenderer — routes to the interaction component matching
 * question.interactionType. Act 2 (Pressure) questions get a depleting timer;
 * if it expires unanswered, a null answer is submitted.
 * Each question is framed as a page of the case file: the act it belongs to,
 * the case progress rail, and the question index.
 * @param {{ question: object, questionNumber: number, onAnswer: Function }} props
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

export default function QuestionRenderer({ question, questionNumber, onAnswer }) {
  const interaction = INTERACTIONS[question.interactionType]
  const Interaction = interaction?.component
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

  const pct = Math.round((questionNumber / 12) * 100)

  return (
    <main className={styles.question}>
      <h1 className="sr-only" role="status">Question {questionNumber} of 12</h1>
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
          aria-valuemax={12}
          aria-label="Question progress"
        >
          <div
            className={styles.progressFill}
            style={{ transform: `scaleX(${pct / 100})`, transformOrigin: 'left' }}
          />
        </div>
        <p className={styles.questionIndex}>Question {questionNumber} of 12</p>
      </div>
      {question.act === 2 && (
        <Timer seconds={ACT2_SECONDS} onExpire={() => handleAnswer(null)} />
      )}
      <Interaction question={question} onAnswer={handleAnswer} cardLayout={interaction.cardLayout} />
    </main>
  )
}
