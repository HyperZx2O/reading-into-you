// Phase 16 nice-to-have: last 3 Mode 2 scores in localStorage.
// Key matches the spec: `jane_mode2_scores` (number[]).

const STORAGE_KEY = 'jane_mode2_scores'
const MAX_ENTRIES = 3

/** Last up-to-3 recorded scores, newest first. Never throws. */
export function getScoreHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((n) => typeof n === 'number').slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

/** Prepend a score, keep the newest 3. Returns the new history. */
export function recordScore(score) {
  try {
    const next = [score, ...getScoreHistory()].slice(0, MAX_ENTRIES)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    return [score]
  }
}
