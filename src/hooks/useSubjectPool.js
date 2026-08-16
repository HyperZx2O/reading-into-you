import { useState } from 'react'
import { SUBJECTS } from '../data/subjects.js'
import shuffle from '../utils/shuffle.js'

const SESSION_SUBJECT_COUNT = 5

/**
 * Returns a stable array of 5 randomly selected subjects for the session.
 * Selection is made once on mount and does not change mid-session.
 */
export function useSubjectPool() {
  const [subjects] = useState(() => shuffle(SUBJECTS).slice(0, SESSION_SUBJECT_COUNT))
  return subjects
}
