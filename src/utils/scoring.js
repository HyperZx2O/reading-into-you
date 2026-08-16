import { ARCHETYPES } from '../data/archetypes.js'
import { RATING_REMARKS } from '../data/flavor.js'

// ── Mode 2 — Perception Rating ladder (plan Phase 5, exact text) ────────────
// Ladder: 0–19 Rookie, 20–39 Investigator, 40–59 Consultant, 60–79 Senior
// Agent, 80–100 Patrick Jane. Remarks come from data/flavor.js.

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
  return { label, remark: RATING_REMARKS[label] }
}

/**
 * Final Mode 2 score from correct/total, 0–100. NaN-safe and clamped.
 */
export function getPerceptionRating(correctCount, totalQuestions) {
  const raw = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  return Number.isFinite(raw) ? Math.max(0, Math.min(100, Math.round(raw))) : 0
}

// ── Mode 1 — archetype scoring (plan Phase 3) ────────────────────────────────
// Pure one-pass scoring for a Mode 1 session: computeScores(questions, answers)
// returns the winning archetype id. No React state, no DOM — testable in console.

/** The fixed archetype id set, derived from data so the two can't drift. */
const ARCHETYPE_IDS = ARCHETYPES.map((archetype) => archetype.id)

/**
 * scoreQuestion — pure scoring for a single answer. Returns a delta map
 * (archetypeId -> points added), never mutates inputs.
 *
 * @param {object} question — a question from data/questions.js
 * @param {number|string|number[]} answer —
 *   number for multipleChoice/imagePick (option index),
 *   string for wordInput (keyword-matched),
 *   number[] for dragRank (original indices, top to bottom)
 * @returns {Record<string, number>} points delta per archetype
 */
function scoreQuestion(question, answer) {
  const delta = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]))

  if (question.interactionType === 'wordInput') {
    const text = String(answer).toLowerCase()
    for (const id of ARCHETYPE_IDS) {
      const weight = question.scoringMap[id][0]
      const keywords = question.keywords?.[id] ?? []
      if (weight > 0 && keywords.some((keyword) => text.includes(keyword))) {
        delta[id] = weight
      }
    }
    return delta
  }

  if (Array.isArray(answer)) {
    // dragRank: entry [i] is the points for ranking option i first; scale
    // linearly by the option's actual position (rank 1 = full, rank 4 = 0).
    for (const id of ARCHETYPE_IDS) {
      const map = question.scoringMap[id]
      const weight = Math.max(...map)
      if (weight === 0) continue
      const itemIndex = map.indexOf(weight)
      const position = answer.indexOf(itemIndex)
      if (position === -1) continue
      delta[id] = Math.round((weight * (3 - position)) / 3)
    }
    return delta
  }

  // multipleChoice / imagePick: value at the chosen option index
  for (const id of ARCHETYPE_IDS) {
    delta[id] = question.scoringMap[id][answer] ?? 0
  }
  return delta
}

/**
 * resolveArchetype — pure. Returns the highest-scoring archetype id; ties are
 * broken randomly. All-zero scores fall back to the first archetype.
 *
 * @param {Record<string, number>} scores — archetypeId -> total points
 * @returns {string} the winning archetype id
 */
function resolveArchetype(scores) {
  const max = Math.max(...ARCHETYPE_IDS.map((id) => scores[id] ?? 0))
  if (max === 0) return ARCHETYPE_IDS[0]
  const tied = ARCHETYPE_IDS.filter((id) => (scores[id] ?? 0) === max)
  return tied[Math.floor(Math.random() * tied.length)]
}

/**
 * computeScores — one-pass scoring for a full session (plan Phase 3).
 * Sums per-question deltas, then resolves the winning archetype.
 *
 * @param {Array} questions — the selected 12 questions, in answer order
 * @param {Array} answers — one answer per question (index-aligned)
 * @returns {{ scores: Record<string, number>, resultArchetypeId: string }}
 */
export function computeScores(questions, answers) {
  const scores = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]))
  questions.forEach((question, i) => {
    const delta = scoreQuestion(question, answers[i])
    for (const id of ARCHETYPE_IDS) scores[id] += delta[id]
  })
  return { scores, resultArchetypeId: resolveArchetype(scores) }
}
