import { useEffect, useState } from 'react'

import { QUESTIONS } from '../../data/questions.js'
import { getArchetypeById } from '../../data/archetypes.js'
import useQuestionPool from '../../hooks/useQuestionPool.js'
import useScoring, { resolveArchetype } from '../../hooks/useScoring.js'
import QuestionRenderer from './QuestionRenderer.jsx'
import Reveal from './Reveal.jsx'

/**
 * SubjectGame — owns the Mode 1 game loop. Renders one question at a time,
 * silently accumulates scores, then resolves the archetype and shows Reveal.
 * @param {{ onReplay: () => void }} props
 */
export default function SubjectGame({ onReplay }) {
  const questions = useQuestionPool(QUESTIONS)
  const { scores, recordAnswer } = useScoring()
  const [index, setIndex] = useState(0)
  const [resultId, setResultId] = useState(null)

  // Once the last answer is in, resolve the archetype exactly once (the effect
  // sees the final scores; the result is stored so re-renders can't re-roll a tie).
  useEffect(() => {
    if (index >= questions.length && resultId === null) {
      setResultId(resolveArchetype(scores))
    }
  }, [index, questions.length, resultId, scores])

  const handleAnswer = (answer) => {
    recordAnswer(questions[index], answer)
    setIndex((i) => i + 1)
  }

  if (resultId !== null) {
    const archetype = getArchetypeById(resultId)
    if (!archetype) {
      // Phase 9: unknown archetype id must not white-screen.
      console.warn(`SubjectGame: unknown archetype id "${resultId}"`)
      return <p>Jane is at a loss for words. Please replay.</p>
    }
    return <Reveal archetype={archetype} onReplay={onReplay} />
  }

  // On the render right after the final answer, index has reached
  // questions.length but the effect that resolves the archetype hasn't run
  // yet (effects run after commit). Rendering QuestionRenderer here would
  // crash on questions[index] === undefined — hold the frame instead.
  if (index >= questions.length) return null

  return (
    <QuestionRenderer
      question={questions[index]}
      questionNumber={index + 1}
      onAnswer={handleAnswer}
    />
  )
}
