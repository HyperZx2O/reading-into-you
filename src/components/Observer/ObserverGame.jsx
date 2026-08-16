import { useState } from 'react'
import { useSubjectPool } from '../../hooks/useSubjectPool.js'
import { getPerceptionRating } from '../../utils/scoring.js'
import { REACTIONS_GOOD, REACTIONS_ROUGH } from '../../data/flavor.js'
import Dossier from './Dossier.jsx'
import DeductionQuestion from './DeductionQuestion.jsx'
import Feedback from './Feedback.jsx'
import styles from '../../styles/Observer.module.css'

// Render errors are caught app-wide by components/UI/ErrorBoundary.jsx (Phase 9).

/**
 * Nice-to-have: Jane's dry mid-session comment at subjects 3 and 5,
 * based on running accuracy (>=60% earns a nod).
 */
function getMidSessionReaction(subjectIndex, correctCount, answeredCount) {
  if (answeredCount === 0) return null
  const lines =
    correctCount / answeredCount >= 0.6 ? REACTIONS_GOOD : REACTIONS_ROUGH
  return lines[subjectIndex === 2 ? 0 : 1]
}

/**
 * Top-level Mode 2 session controller.
 * Flow: dossier -> question -> feedback -> (next question | next subject | done).
 */
function ObserverGameInner({ onComplete }) {
  const subjects = useSubjectPool()

  const [subjectIndex, setSubjectIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState('dossier')
  const [selectedIndex, setSelectedIndex] = useState(null)

  const subject = subjects[subjectIndex]
  const question = subject?.questions?.[questionIndex]
  const totalQuestions = subjects.reduce(
    (n, s) => n + (s.questions?.length ?? 0),
    0
  )

  const finishSession = () =>
    onComplete(getPerceptionRating(correctCount, totalQuestions))

  const handleAnswer = (index) => {
    if (selectedIndex !== null) return
    if (!question) {
      console.warn('ObserverGame: missing question', subjectIndex, questionIndex)
      return
    }
    setSelectedIndex(index)
    if (index === question.correctIndex) {
      setCorrectCount((count) => count + 1)
    }
    setPhase('feedback')
  }

  const beginDeduction = () => {
    if (!subject?.questions?.length) {
      console.warn('ObserverGame: subject has no questions')
      finishSession()
      return
    }
    setPhase('question')
  }

  const handleNext = () => {
    const questions = subject?.questions
    if (!questions || questions.length === 0) {
      console.warn('ObserverGame: subject has no questions')
      finishSession()
      return
    }
    setSelectedIndex(null)
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((q) => q + 1)
      setPhase('question')
    } else if (subjectIndex < subjects.length - 1) {
      setSubjectIndex((s) => s + 1)
      setQuestionIndex(0)
      setPhase('dossier')
    } else {
      finishSession()
    }
  }

  // Nice-to-have: Jane reacts when the player reaches subjects 3 and 5.
  const answeredCount = subjects
    .slice(0, subjectIndex)
    .reduce((n, s) => n + (s.questions?.length ?? 0), 0)
  const reaction =
    phase === 'dossier' && (subjectIndex === 2 || subjectIndex === 4)
      ? getMidSessionReaction(subjectIndex, correctCount, answeredCount)
      : null

  // Data-integrity guard: the game is designed around 5 subjects.
  if (subjects.length < 5) {
    return (
      <div className={styles.shell}>
        <p className={styles.errorState}>
          Not enough subjects to begin. Please reload.
        </p>
      </div>
    )
  }

  return (
    <main className={styles.shell}>
      <h1 className="sr-only">The Observer</h1>
      {phase === 'dossier' && (
        <Dossier
          subject={subject}
          index={subjectIndex}
          total={subjects.length}
          reaction={reaction}
          onBegin={beginDeduction}
        />
      )}

      {phase !== 'dossier' && (
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-valuenow={questionIndex + 1}
          aria-valuemin={0}
          aria-valuemax={subject.questions.length}
          aria-label="Question progress"
        >
          <div
            className={styles.progressFill}
            style={{
              transform: `scaleX(${
                Math.round(((questionIndex + 1) / subject.questions.length) * 100) / 100
              })`,
              transformOrigin: 'left',
            }}
          />
        </div>
      )}

      {phase === 'question' && question && (
        <DeductionQuestion question={question} onAnswer={handleAnswer} />
      )}

      {phase === 'feedback' && question && (
        <Feedback
          correct={selectedIndex === question.correctIndex}
          text={
            selectedIndex === question.correctIndex
              ? question.correctFeedback
              : question.wrongFeedback
          }
          onNext={handleNext}
        />
      )}
    </main>
  )
}

export default ObserverGameInner
