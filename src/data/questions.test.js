import { describe, expect, it } from 'vitest'
import { QUESTIONS } from './questions.js'

describe('question data invariants (P7 — rhythm breaks)', () => {
  it('never puts a prelude on an Act 2 (pressure) question', () => {
    const preludes = QUESTIONS.filter((q) => q.prelude)
    // The wait is authored, and it is rare.
    expect(preludes.length).toBeGreaterThan(0)
    for (const q of preludes) expect(q.act).not.toBe(2)
  })

  it('marks exactly one face-down question, on an option interaction', () => {
    const faceDown = QUESTIONS.filter((q) => q.faceDown)
    expect(faceDown).toHaveLength(1)
    expect(['multipleChoice', 'imagePick']).toContain(faceDown[0].interactionType)
  })

  it('never stacks a prelude and face-down on the same question', () => {
    for (const q of QUESTIONS) {
      expect(q.prelude && q.faceDown).toBeFalsy()
    }
  })
})
