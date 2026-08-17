import { useState, useRef, useEffect } from 'react'
import { useSubjectPool } from '../../hooks/useSubjectPool.js'
import { getPerceptionRating } from '../../utils/scoring.js'
import { getLastArchetype, recordSession } from '../../utils/caseMemory.js'
import { canStartSession, markSessionStarted, hasReachedDailyLimit } from '../../utils/rateLimit.js'
import { getArchetypeById } from '../../data/archetypes.js'
import { REACTIONS_GOOD, REACTIONS_ROUGH, KNOWN_TYPE_LINE } from '../../data/flavor.js'
import Dossier from './Dossier.jsx'
import DeductionQuestion from './DeductionQuestion.jsx'
import BatchReveal from './BatchReveal.jsx'
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
 * Flow: dossier -> question x4 (commit only) -> reveal (Jane turns the page)
 * -> next subject's dossier | done.
 */
function ObserverGameInner({ onComplete }) {
  const subjects = useSubjectPool()
  const sessionStartRef = useRef(Date.now())
  const [cooldownError, setCooldownError] = useState(null)

  const [subjectIndex, setSubjectIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [phase, setPhase] = useState('dossier')
  const [answers, setAnswers] = useState([]) // chosen option indexes, per subject
  const [reads, setReads] = useState([]) // { subjectId, note } per filed subject

  // Rate limiting: check cooldown on mount
  useEffect(() => {
    const { allowed, remainingMs } = canStartSession()
    if (!allowed) {
      setCooldownError(`Please wait ${Math.ceil(remainingMs / 1000)} seconds before starting a new session.`)
      return
    }
    if (hasReachedDailyLimit()) {
      setCooldownError('Daily session limit reached. Please try again tomorrow.')
      return
    }
    markSessionStarted()
  }, [])

  const subject = subjects[subjectIndex]
  const question = subject?.questions?.[questionIndex]
  const totalQuestions = subjects.reduce(
    (n, s) => n + (s.questions?.length ?? 0),
    0
  )

  // The casebook travels with the score — the rating screen holds the
  // player's reads beside Jane's notes (P2).
  const finishSession = () => {
    const duration = Math.round((Date.now() - sessionStartRef.current) / 1000)
    const score = getPerceptionRating(correctCount, totalQuestions)

    // Record session in case history
    recordSession({
      archetype: getLastArchetype() || 'unknown',
      mode: 'observer',
      duration,
      answers,
      scores: { correctCount, totalQuestions, score },
    })

    onComplete({
      score,
      reads: reads.filter(Boolean),
      subjects,
    })
  }

  // File the player's one-line read of the current subject (optional).
  const fileRead = (note) => {
    setReads((prev) => {
      const next = [...prev]
      next[subjectIndex] = { subjectId: subject.id, note }
      return next
    })
  }

  const beginDeduction = () => {
    if (!subject?.questions?.length) {
      console.warn('ObserverGame: subject has no questions')
      finishSession()
      return
    }
    setAnswers([])
    setQuestionIndex(0)
    setPhase('question')
  }

  // Commit the player's read — no correctness signal here. The verdict waits
  // for the batch reveal, where Jane confirms only the correct deductions.
  const handleAnswer = (index) => {
    if (!question) {
      console.warn('ObserverGame: missing question', subjectIndex, questionIndex)
      return
    }
    setAnswers((prev) => [...prev, index])
    if (index === question.correctIndex) {
      setCorrectCount((count) => count + 1)
    }
  }

  // Fires after the commit beat in DeductionQuestion: next question or the reveal.
  const handleAdvance = () => {
    const questions = subject?.questions
    if (!questions || questions.length === 0) {
      console.warn('ObserverGame: subject has no questions')
      finishSession()
      return
    }
    if (questionIndex < questions.length - 1) {
      setQuestionIndex((q) => q + 1)
    } else {
      setPhase('reveal')
    }
  }

  // Jane turns the page: the next dossier, or the rating when the case closes.
  const handleTurnPage = () => {
    if (subjectIndex < subjects.length - 1) {
      setSubjectIndex((s) => s + 1)
      setPhase('dossier')
    } else {
      finishSession()
    }
  }

  // P6 — Jane knows your type: the first dossier carries the memory of your
  // Mode 1 read, named only when a completed session left a trace.
  const knownTypeLine = (() => {
    const id = getLastArchetype()
    const archetype = id ? getArchetypeById(id) : null
    return archetype ? KNOWN_TYPE_LINE(archetype.name) : null
  })()

  // Nice-to-have: Jane reacts when the player reaches subjects 3 and 5.
  const answeredCount = subjects
    .slice(0, subjectIndex)
    .reduce((n, s) => n + (s.questions?.length ?? 0), 0)
  const reaction =
    phase === 'dossier' && subjectIndex === 0
      ? knownTypeLine
      : phase === 'dossier' && (subjectIndex === 2 || subjectIndex === 4)
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
          note={reads[subjectIndex]?.note ?? ''}
          onFileRead={fileRead}
          onBegin={beginDeduction}
        />
      )}

      {phase === 'question' && (
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
        <DeductionQuestion
          key={question.id}
          question={question}
          onAnswer={handleAnswer}
          onAdvance={handleAdvance}
        />
      )}

      {phase === 'reveal' && (
        <BatchReveal
          subject={subject}
          questions={subject.questions}
          answers={answers}
          isLast={subjectIndex === subjects.length - 1}
          onTurnPage={handleTurnPage}
        />
      )}
    </main>
  )
}

export default ObserverGameInner
