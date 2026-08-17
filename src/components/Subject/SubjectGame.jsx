import { useEffect, useRef, useState } from 'react'

import { QUESTIONS } from '../../data/questions.js'
import { getArchetypeById } from '../../data/archetypes.js'
import useQuestionPool from '../../hooks/useQuestionPool.js'
import { computeScores, detectReactionAt } from '../../utils/scoring.js'
import { rememberArchetype, updatePerformanceMetrics } from '../../utils/caseMemory.js'
import { canStartSession, markSessionStarted, hasReachedDailyLimit } from '../../utils/rateLimit.js'
import QuestionRenderer from './QuestionRenderer.jsx'
import Reveal from './Reveal.jsx'

/** Jane is never a commentator — at most two remarks per session. */
const MAX_REACTIONS = 2

/**
 * SubjectGame — owns the Mode 1 game loop. Renders one question at a time,
 * collects answers, then scores the whole session in one pass and shows Reveal.
 * Jane notices patterns mid-session (P3): answer timings are captured here
 * and each answer is checked for a remark, which rides in with the next
 * question. See utils/scoring.js detectReactionAt.
 * @param {{ onReplay: () => void }} props
 */
export default function SubjectGame({ onReplay }) {
  const questions = useQuestionPool(QUESTIONS)
  const [answers, setAnswers] = useState([])
  const [index, setIndex] = useState(0)
  const [resultId, setResultId] = useState(null)
  const [reactions, setReactions] = useState({}) // answeredIndex -> line
  const [cooldownError, setCooldownError] = useState(null)

  // The question's start time — reset when the next question mounts.
  const questionStartRef = useRef(null)
  const timingsRef = useRef([])
  const reactionCountRef = useRef(0)
  const sessionRecordedRef = useRef(false)

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

  useEffect(() => {
    questionStartRef.current = Date.now()
  }, [index])

  // Once the last answer is in, score the session exactly once (the effect
  // sees the full answers array; the result is stored so re-renders can't re-roll a tie).
  useEffect(() => {
    if (index >= questions.length && resultId === null) {
      const archetypeId = computeScores(questions, answers).resultArchetypeId
      setResultId(archetypeId)
      // The world remembers completed sessions only (P6) — an abandoned run
      // leaves no trace.
      rememberArchetype(archetypeId)

      // Update performance metrics for adaptive difficulty
      if (!sessionRecordedRef.current) {
        sessionRecordedRef.current = true
        updatePerformanceMetrics({
          timings: timingsRef.current,
          answers,
        })
      }
    }
  }, [index, questions, answers, resultId])

  const handleAnswer = (answer) => {
    const timing = Date.now() - (questionStartRef.current ?? Date.now())
    timingsRef.current = [...timingsRef.current, timing]
    const nextAnswers = [...answers, answer]
    setAnswers(nextAnswers)
    // Jane's remark about the question just answered, if any — capped, and
    // shown with the question that follows.
    if (reactionCountRef.current < MAX_REACTIONS) {
      const line = detectReactionAt(
        questions,
        nextAnswers,
        timingsRef.current,
        nextAnswers.length - 1
      )
      if (line) {
        reactionCountRef.current += 1
        setReactions((previous) => ({ ...previous, [nextAnswers.length - 1]: line }))
      }
    }
    setIndex((i) => i + 1)
  }

  if (resultId !== null) {
    const archetype = getArchetypeById(resultId)
    if (!archetype) {
      // Phase 9: unknown archetype id must not white-screen.
      console.warn(`SubjectGame: unknown archetype id "${resultId}"`)
      return <p>Jane is at a loss for words. Please replay.</p>
    }
    return (
      <Reveal
        archetype={archetype}
        questions={questions}
        answers={answers}
        onReplay={onReplay}
      />
    )
  }

  // Rate limiting error
  if (cooldownError) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
        <p>{cooldownError}</p>
        <button
          type="button"
          onClick={onReplay}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 2rem',
            border: '1px solid var(--color-gold)',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'var(--color-gold)',
            cursor: 'pointer',
          }}
        >
          Back to Menu
        </button>
      </div>
    )
  }

  // On the render right after the final answer, index has reached
  // questions.length but the effect that resolves the archetype hasn't run
  // yet (effects run after commit). Rendering QuestionRenderer here would
  // crash on questions[index] === undefined — hold the frame instead.
  if (index >= questions.length) return null

  return (
    <QuestionRenderer
      key={questions[index].id}
      question={questions[index]}
      questionNumber={index + 1}
      totalQuestions={questions.length}
      reaction={index > 0 ? (reactions[index - 1] ?? null) : null}
      onAnswer={handleAnswer}
    />
  )
}
