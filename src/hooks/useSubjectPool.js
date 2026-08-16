import { useState } from 'react'
import { SUBJECTS } from '../data/subjects.js'

/**
 * Pure selection logic — extracted from the hook so it can be self-checked.
 * Fisher-Yates shuffle on a copy, then take the first `count`.
 */
export function selectRandomSubjects(pool, count) {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, count)
}

/**
 * Returns a stable array of 5 randomly selected subjects for the session.
 * Selection is made once on mount and does not change mid-session.
 */
export function useSubjectPool() {
  const [subjects] = useState(() => selectRandomSubjects(SUBJECTS, 5))
  return subjects
}
