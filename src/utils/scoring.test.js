import { describe, expect, it } from 'vitest'
import { detectReactionAt, pickWordQuote } from './scoring.js'
import { REACTIONS } from '../data/flavor.js'

const wordInput = (id, keywords, weight) => ({
  id,
  interactionType: 'wordInput',
  scoringMap: { outlaw: [weight], sentinel: [0] },
  keywords: { outlaw: keywords, sentinel: [] },
})

const q05 = wordInput('q05', ['freedom', 'independence'], 3)
const q11 = wordInput('q11', ['honest', 'real'], 2)

describe('pickWordQuote (P2)', () => {
  it('picks the answer that scored for the winning archetype, not the first one', () => {
    // q05's answer misses outlaw keywords; q11's "honest" scores — the telling
    // answer wins even though it is not the session's first word input.
    const quote = pickWordQuote([q05, q11], ['music', 'honest'], 'outlaw')
    expect(quote).toEqual({ question: q11, answer: 'honest' })
  })

  it('falls back to any word answer when none scored for the archetype', () => {
    const quote = pickWordQuote([q05, q11], ['music', 'art'], 'outlaw')
    expect(quote).toEqual({ question: q05, answer: 'music' })
  })

  it('returns null when the session drew no word inputs', () => {
    const mc = { id: 'q01', interactionType: 'multipleChoice' }
    expect(pickWordQuote([mc], [0], 'outlaw')).toBeNull()
  })

  it('skips empty or non-string answers', () => {
    expect(pickWordQuote([q05], ['   '], 'outlaw')).toBeNull()
    expect(pickWordQuote([q05], [undefined], 'outlaw')).toBeNull()
    expect(pickWordQuote([q05], [0], 'outlaw')).toBeNull()
  })
})

const themed = (id, act, themes) => ({
  id,
  act,
  interactionType: 'multipleChoice',
  themes,
  options: ['a', 'b', 'c', 'd'],
})

const qSec = themed('sec', 1, { security: [0] })
const qFree = themed('free', 1, { freedom: [1] })
const qPeople = themed('ppl', 1, { people: [0] })
const qSolo = themed('sol', 1, { solitude: [1] })
const qAct2 = themed('act2', 2, { security: [0] })

const Q = (questions, answers, timings) => (index) =>
  detectReactionAt(questions, answers, timings, index)

describe('detectReactionAt (P3)', () => {
  it('flags the third pick of a theme — not the first two', () => {
    const questions = [qSec, qSec, qSec]
    const answers = [0, 0, 0]
    const at = Q(questions, answers, [1000, 1000, 1000])
    expect(at(0)).toBeNull()
    expect(at(1)).toBeNull()
    expect(at(2)).toBe(REACTIONS.repeat('the locked door'))
  })

  it('names the theme the player kept choosing', () => {
    const questions = [qPeople, qPeople, qPeople]
    const at = Q(questions, [0, 0, 0], [1000, 1000, 1000])
    expect(at(2)).toBe(REACTIONS.repeat('the crowded room'))
  })

  it('reads an inconsistency the moment an opposing pair is satisfied', () => {
    const questions = [qSec, qSec, qFree, qFree]
    const answers = [0, 0, 1, 1]
    const at = Q(questions, answers, [1000, 1000, 1000, 1000])
    expect(at(3)).toBe(REACTIONS.inconsistency['security-freedom'])
  })

  it('does not re-read the same inconsistency later', () => {
    const questions = [qSec, qSec, qFree, qFree, qPeople]
    const answers = [0, 0, 1, 1, 0]
    const at = Q(questions, answers, [1000, 1000, 1000, 1000, 1000])
    expect(at(3)).toBe(REACTIONS.inconsistency['security-freedom'])
    expect(at(4)).toBeNull()
  })

  it('reads the people-solitude pair too', () => {
    const questions = [qPeople, qPeople, qSolo, qSolo]
    const at = Q(questions, [0, 0, 1, 1], [1000, 1000, 1000, 1000])
    expect(at(3)).toBe(REACTIONS.inconsistency['people-solitude'])
  })

  it('flags an answer slower than the session pace', () => {
    // Untagged questions — no repeat or inconsistency can preempt the read.
    const questions = [themed('p1', 1), themed('p2', 1), themed('p3', 1)]
    const at = Q(questions, [0, 0, 0], [3000, 4000, 25000])
    expect(at(2)).toBe(REACTIONS.hesitation)
  })

  it('stays silent on a merely human pause', () => {
    const questions = [themed('p1', 1), themed('p2', 1), themed('p3', 1)]
    const at = Q(questions, [0, 0, 0], [3000, 4000, 8000])
    expect(at(2)).toBeNull()
  })

  it('uses a flat floor when the session has no pace yet', () => {
    const at = Q([qSec], [0], [20000])
    expect(at(0)).toBe(REACTIONS.hesitation)
  })

  it('never calls ordinary pressure hesitation', () => {
    const at = Q([qAct2], [0], [20000])
    expect(at(0)).toBeNull()
  })

  it('speaks up when the clock wins — even on Act 2', () => {
    const at = Q([qAct2], [null], [30000])
    expect(at(0)).toBe(REACTIONS.timedOut)
  })

  it('lets inconsistency outrank hesitation', () => {
    const questions = [qSec, qSec, qFree, qFree]
    const answers = [0, 0, 1, 1]
    const at = Q(questions, answers, [1000, 1000, 1000, 25000])
    expect(at(3)).toBe(REACTIONS.inconsistency['security-freedom'])
  })

  it('reads dragRank by its top-ranked item', () => {
    const q = themed('rank', 1, { freedom: [1] })
    // Freedom (option 1) ranked first all three times — the top rank is the read.
    const at = Q([q, q, q], [[1, 0, 2, 3], [1, 0, 2, 3], [1, 2, 0, 3]], [1000, 1000, 1000])
    expect(at(2)).toBe(REACTIONS.repeat('the open road'))
  })

  it('ignores timed-out answers in the theme count', () => {
    const questions = [qSec, qAct2, qSec]
    const at = Q(questions, [0, null, 0], [1000, 30000, 1000])
    expect(at(2)).toBeNull() // only two security picks
  })

  it('returns null for untagged questions', () => {
    const plain = themed('plain', 1, undefined)
    const at = Q([plain, plain, plain], [0, 0, 0], [1000, 1000, 1000])
    expect(at(2)).toBeNull()
  })
})
