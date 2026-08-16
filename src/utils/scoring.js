// Perception Rating helpers for Mode 2 (The Observer).
// Ladder matches the plan exactly: 0–19 Rookie, 20–39 Investigator, 40–59
// Consultant, 60–79 Senior Agent, 80–100 Patrick Jane.

const REMARKS = {
  Rookie:
    'The signs were all there, my dear. You simply were not looking at them.',
  Investigator:
    'You catch what people show you. Now learn to notice what they hide.',
  Consultant:
    'A respectable read. You see the lines — most people never even look for them.',
  'Senior Agent':
    'Impressive. You read between the lines with a steady hand. Jane would approve.',
  'Patrick Jane':
    'Either you are cheating, or you are a natural. I suspect the latter. Well played.',
}

/** Label for a score (0–100). Unbounded input still maps onto the ladder. */
export function getRatingLabel(score) {
  if (score < 20) return 'Rookie'
  if (score < 40) return 'Investigator'
  if (score < 60) return 'Consultant'
  if (score < 80) return 'Senior Agent'
  return 'Patrick Jane'
}

/** Label + closing remark for a final score. */
export function getRatingDetails(score) {
  const label = getRatingLabel(score)
  return { label, remark: REMARKS[label] }
}

/**
 * Final score from correct/total.
 * Returns { score: 0–100, label, remark }. Score is clamped; NaN-safe.
 */
export function getPerceptionRating(correctCount, totalQuestions) {
  const raw = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const score = Number.isFinite(raw)
    ? Math.max(0, Math.min(100, Math.round(raw)))
    : 0
  return { score, ...getRatingDetails(score) }
}
