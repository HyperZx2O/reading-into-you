import { useMemo } from 'react'
import shuffle from '../utils/shuffle.js'

/** Questions to pick per act (1, 2, 3): 4 + 5 + 3 = 12. */
const PER_ACT = [4, 5, 3]

/**
 * useQuestionPool — returns the 12-question session pool (4 act 1, 5 act 2,
 * 3 act 3, in act order), computed once on mount. A remount (new game) gets a
 * fresh random selection.
 *
 * @param {Array} allQuestions — the full question pool
 * @returns {Array} the selected questions for this session
 */
export default function useQuestionPool(allQuestions) {
  return useMemo(
    () =>
      [1, 2, 3].flatMap((act) =>
        shuffle(allQuestions.filter((q) => q.act === act)).slice(0, PER_ACT[act - 1]),
      ),
    [allQuestions],
  )
}
