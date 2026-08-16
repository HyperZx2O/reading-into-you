import { Component, useState } from 'react'
import { useSubjectPool } from '../../hooks/useSubjectPool.js'
import { getPerceptionRating } from '../../utils/scoring.js'
import Dossier from './Dossier.jsx'
import DeductionQuestion from './DeductionQuestion.jsx'
import Feedback from './Feedback.jsx'
import ProgressBar from '../UI/ProgressBar.jsx'
import styles from '../../styles/Observer.module.css'

/** Error boundary — never show a blank screen (Phase 9). */
class GameErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.shell}>
          <p className={styles.errorState}>
            Something went wrong. Please refresh.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

const REACTIONS_GOOD = [
  'Hmm. You are picking up what I am putting down.',
  'Careful — an eye that sharp starts to look like cheating.',
]

const REACTIONS_ROUGH = [
  'You are reading the words, not the person. Try the spaces between.',
  'Still staring at the obvious. The obvious is where I hide things.',
]

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
    onComplete(getPerceptionRating(correctCount, totalQuestions).score)

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
          Not enough subjects to begin. Please refresh.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.shell}>
      {phase === 'dossier' && (
        <Dossier subject={subject} reaction={reaction} onBegin={beginDeduction} />
      )}

      {phase !== 'dossier' && (
        <ProgressBar
          current={questionIndex + 1}
          total={subject.questions.length}
        />
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
    </div>
  )
}

export default function ObserverGame(props) {
  return (
    <GameErrorBoundary>
      <ObserverGameInner {...props} />
    </GameErrorBoundary>
  )
}
