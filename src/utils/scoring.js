import { ARCHETYPES } from '../data/archetypes.js'
import { RATING_REMARKS, REACTIONS } from '../data/flavor.js'

// ── Mode 1 — Jane's mid-session pattern reads (P3) ────────────────
// The theme pairs Jane weighs against each other. When both sides of a pair
// are read twice, the player is telling two stories at once.
const THEME_PAIRS = [
  ['security', 'freedom'],
  ['people', 'solitude'],
]

/** Count behavioral-theme picks across questions 0..upTo (inclusive). */
function countThemes(questions, answers, upTo) {
  const counts = {}
  for (let i = 0; i <= upTo; i += 1) {
    const answer = answers[i]
    if (answer === null) continue // the clock won — no theme read
    const question = questions[i]
    const chosen = Array.isArray(answer) ? answer[0] : answer // dragRank = top rank
    const themes = question?.themes
    if (!themes) continue
    for (const [theme, indexes] of Object.entries(themes)) {
      if (indexes.includes(chosen)) {
        counts[theme] = (counts[theme] ?? 0) + 1
        break
      }
    }
  }
  return counts
}

function medianOf(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * detectReactionAt — Jane's mid-session remark for the just-answered
 * question, or null when she stays silent (P3). Pure and deterministic on
 * the prefix, so incremental calls stay stable.
 *
 * Priority: inconsistency > repeat > hesitation. Each rule only fires at
 * the moment it is first satisfied — the third pick of a theme, the answer
 * that completes an opposing pair, the first answer slower than the
 * session's pace — so a capped or dropped remark never re-fires later.
 * Act 2 timed questions are pressure, not hesitation: only a timed-out
 * answer (null) speaks there.
 *
 * @param {Array} questions — the session's questions, in answer order
 * @param {Array} answers — one answer per question (index-aligned)
 * @param {Array} timings — ms spent on each answer (index-aligned)
 * @param {number} index — the question just answered
 * @returns {string | null} the reaction line, or null
 */
export function detectReactionAt(questions, answers, timings, index) {
  if (!questions[index]) return null
  const counts = countThemes(questions, answers, index)
  const before = index > 0 ? countThemes(questions, answers, index - 1) : {}

  // 1) Inconsistency — an opposing pair becomes satisfied on this question.
  for (const [a, b] of THEME_PAIRS) {
    const nowSatisfied = (counts[a] ?? 0) >= 2 && (counts[b] ?? 0) >= 2
    const wasSatisfied = (before[a] ?? 0) >= 2 && (before[b] ?? 0) >= 2
    if (nowSatisfied && !wasSatisfied) {
      return REACTIONS.inconsistency[`${a}-${b}`]
    }
  }

  // 2) Repeat — the third pick of a theme lands on this question.
  for (const [theme, count] of Object.entries(counts)) {
    if (count === 3 && (before[theme] ?? 0) === 2) {
      return REACTIONS.repeat(REACTIONS.themeNouns[theme] ?? theme)
    }
  }

  // 3) Hesitation / the clock.
  if (answers[index] === null) return REACTIONS.timedOut
  if (questions[index].act === 2) return null // pressure, not hesitation
  const timing = timings[index]
  if (typeof timing !== 'number' || timing < 0) return null
  const prior = timings
    .slice(0, index)
    .filter((t, i) => typeof t === 'number' && t >= 0 && questions[i].act !== 2)
  const median = prior.length >= 2 ? medianOf(prior) : null
  const threshold = median !== null ? Math.max(10000, 2 * median) : 10000
  if (timing > threshold) return REACTIONS.hesitation
  return null
}


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
 * pickWordQuote — the player's own words, thrown back at them (P2).
 * Returns the first word-input answer that scored for the winning archetype
 * (the most telling tell), falling back to any word-input answer, or null
 * when the session drew no word inputs.
 *
 * @param {Array} questions — the session's questions, in answer order
 * @param {Array} answers — one answer per question (index-aligned)
 * @param {string} archetypeId — the resolved winning archetype
 * @returns {{ question: object, answer: string } | null}
 */
export function pickWordQuote(questions, answers, archetypeId) {
  const wordInputs = questions
    .map((question, i) => ({ question, answer: answers[i] }))
    .filter(
      ({ question, answer }) =>
        question.interactionType === 'wordInput' &&
        typeof answer === 'string' &&
        answer.trim().length > 0
    )
  if (wordInputs.length === 0) return null
  const telling = wordInputs.find(({ question, answer }) => {
    const weight = question.scoringMap?.[archetypeId]?.[0] ?? 0
    const keywords = question.keywords?.[archetypeId] ?? []
    const text = answer.toLowerCase()
    return weight > 0 && keywords.some((keyword) => text.includes(keyword))
  })
  return telling ?? wordInputs[0]
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
