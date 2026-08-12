import { useMemo } from 'react'

/**
 * selectQuestions — pure selection logic (testable without React).
 * Picks `perAct` random questions from each act, in act order (1, 2, 3).
 *
 * @param {Array} allQuestions — the full question pool
 * @param {number} [perAct=4] — questions per act
 * @returns {Array} selected questions — act 1 first, then 2, then 3
 */
export function selectQuestions(allQuestions, perAct = 4) {
  const selected = [1, 2, 3].flatMap((act) =>
    shuffle(allQuestions.filter((q) => q.act === act)).slice(0, perAct),
  )
  if (selected.length < perAct * 3) {
    console.warn(`useQuestionPool: only ${selected.length} questions available — using all of them`)
  }
  return selected
}

/** Fisher–Yates shuffle (returns a new array, input untouched). */
function shuffle(items) {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * useQuestionPool — returns the 12-question session pool, computed once per
 * session (on mount). A remount (new game) gets a fresh random selection.
 *
 * @param {Array} allQuestions — the full question pool
 * @returns {Array} the selected questions for this session
 */
export default function useQuestionPool(allQuestions) {
  return useMemo(() => selectQuestions(allQuestions), [allQuestions])
}
