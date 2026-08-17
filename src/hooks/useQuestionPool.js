import { useMemo } from 'react'
import shuffle from '../utils/shuffle.js'
import { getPerformanceMetrics } from '../utils/caseMemory.js'

/** Questions to pick per act (1, 2, 3): 4 + 5 + 3 = 12. */
const PER_ACT = [4, 5, 3]

/**
 * Get difficulty level based on performance metrics.
 * - Session 1-3: all difficulties (learning phase)
 * - Fast + consistent: hard questions prioritized
 * - Slow + uncertain: easy questions prioritized
 * @param {Object} metrics - Performance metrics from localStorage
 * @returns {string[]} Array of preferred difficulty levels
 */
function getPreferredDifficulties(metrics) {
  const { sessionCount, averageResponseTime, answerConsistency } = metrics

  // Learning phase: all difficulties
  if (sessionCount < 3) {
    return ['easy', 'medium', 'hard']
  }

  // Fast (< 5s avg) and consistent (> 0.6): prioritize hard
  if (averageResponseTime < 5000 && answerConsistency > 0.6) {
    return ['hard', 'medium', 'easy']
  }

  // Slow (> 12s avg) or inconsistent (< 0.3): prioritize easy
  if (averageResponseTime > 12000 || answerConsistency < 0.3) {
    return ['easy', 'medium', 'hard']
  }

  // Balanced: medium first
  return ['medium', 'easy', 'hard']
}

/**
 * Filter questions by difficulty, ensuring variety.
 * Always includes at least 1 of each difficulty when available.
 * @param {Array} questions - Questions for an act
 * @param {string[]} preferred - Preferred difficulty order
 * @param {number} count - How many to select
 * @returns {Array} Selected questions
 */
function filterByDifficulty(questions, preferred, count) {
  if (questions.length <= count) return questions

  const selected = []
  const remaining = [...questions]

  // First pass: ensure at least 1 of each preferred difficulty
  for (const difficulty of preferred) {
    if (selected.length >= count) break
    const idx = remaining.findIndex((q) => q.difficulty === difficulty)
    if (idx !== -1) {
      selected.push(remaining[idx])
      remaining.splice(idx, 1)
    }
  }

  // Fill remaining slots with shuffled mix
  const shuffled = shuffle(remaining)
  while (selected.length < count && shuffled.length > 0) {
    selected.push(shuffled.pop())
  }

  return selected
}

/**
 * useQuestionPool — returns the 12-question session pool (4 act 1, 5 act 2,
 * 3 act 3, in act order), computed once on mount. A remount (new game) gets a
 * fresh random selection. Uses adaptive difficulty based on performance.
 *
 * @param {Array} allQuestions — the full question pool
 * @returns {Array} the selected questions for this session
 */
export default function useQuestionPool(allQuestions) {
  return useMemo(() => {
    const metrics = getPerformanceMetrics()
    const preferred = getPreferredDifficulties(metrics)

    return [1, 2, 3].flatMap((act) => {
      const actQuestions = allQuestions.filter((q) => q.act === act)
      const shuffled = shuffle(actQuestions)
      return filterByDifficulty(shuffled, preferred, PER_ACT[act - 1])
    })
  }, [allQuestions])
}
