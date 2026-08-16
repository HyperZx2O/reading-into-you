import { useCallback, useState } from 'react'

/**
 * Word-input keyword lists (per question id, per archetype).
 * A wordInput answer scores an archetype's full weight when it contains any
 * of that archetype's keywords (case-insensitive substring match).
 * Defined here in the scoring logic, per the plan's Phase 5 spec.
 */
const WORD_INPUT_KEYWORDS = {
  q05: {
    sentinel: ['keys', 'security', 'safety', 'home', 'routine'],
    architect: ['planner', 'plan', 'schedule', 'laptop', 'notebook', 'to-do'],
    dreamer: ['music', 'book', 'imagination', 'dream', 'art'],
    outlaw: ['freedom', 'independence', 'liberty', 'spontaneity'],
    ghost: ['silence', 'privacy', 'solitude', 'quiet', 'peace'],
    spark: ['people', 'friends', 'music', 'laughter', 'attention'],
    pillar: ['family', 'faith', 'friends', 'love', 'health'],
  },
  q11: {
    sentinel: ['reliable', 'loyal', 'steady', 'dependable', 'honest'],
    architect: ['prepared', 'precise', 'logical', 'smart', 'organized'],
    mask: ['charming', 'easygoing', 'fun', 'funny', 'likeable'],
    outlaw: ['honest', 'real', 'direct', 'blunt'],
    spark: ['fun', 'funny', 'outgoing', 'lively', 'warm'],
    pillar: ['honest', 'reliable', 'kind', 'consistent', 'true'],
  },
  q19: {
    sentinel: ['safe', 'secure', 'warm', 'protected'],
    mask: ['hidden', 'private', 'mine'],
    dreamer: ['free', 'imaginative', 'magical', 'endless', 'wonder'],
    outlaw: ['trapped', 'caged', 'bored', 'small'],
    ghost: ['alone', 'quiet', 'still', 'empty'],
    pillar: ['loved', 'warm', 'safe'],
  },
  q25: {
    sentinel: ['door', 'lock', 'alarm', 'windows'],
    architect: ['plan', 'tomorrow', 'schedule', 'list', 'alarm'],
    mask: ['phone', 'message', 'notification', 'social'],
    dreamer: ['nothing', 'music', 'thought'],
    outlaw: ['window', 'nothing', 'escape'],
    spark: ['phone', 'message', 'notification'],
    pillar: ['prayer', 'family', 'nothing'],
  },
}

/** The fixed archetype id set (matches data/archetypes.js). */
export const ARCHETYPE_IDS = [
  'sentinel',
  'architect',
  'mask',
  'dreamer',
  'outlaw',
  'ghost',
  'spark',
  'pillar',
]

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
export function scoreQuestion(question, answer) {
  const delta = Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0]))

  if (question.interactionType === 'wordInput') {
    const text = String(answer).toLowerCase()
    for (const id of ARCHETYPE_IDS) {
      const weight = question.scoringMap[id][0]
      const keywords = WORD_INPUT_KEYWORDS[question.id]?.[id] ?? []
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
export function resolveArchetype(scores) {
  const max = Math.max(...ARCHETYPE_IDS.map((id) => scores[id] ?? 0))
  if (max === 0) return ARCHETYPE_IDS[0]
  const tied = ARCHETYPE_IDS.filter((id) => (scores[id] ?? 0) === max)
  return tied[Math.floor(Math.random() * tied.length)]
}

/**
 * useScoring — silent background scoring for a Mode 1 session.
 * @returns {{ scores: Record<string, number>, recordAnswer: Function }}
 */
export default function useScoring() {
  const [scores, setScores] = useState(() =>
    Object.fromEntries(ARCHETYPE_IDS.map((id) => [id, 0])),
  )

  const recordAnswer = useCallback((question, answer) => {
    setScores((prev) => {
      const delta = scoreQuestion(question, answer)
      const next = { ...prev }
      for (const id of ARCHETYPE_IDS) next[id] += delta[id]
      return next
    })
  }, [])

  return { scores, recordAnswer }
}
