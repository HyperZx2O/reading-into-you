import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({
  playSfx: vi.fn(),
  TYPING_CUE: 'typing',
  TYPING_VOLUME: 0.05,
}))

const memory = vi.hoisted(() => ({ getLastArchetype: vi.fn(() => null), recordSession: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)
vi.mock('../../utils/caseMemory.js', () => memory)
vi.mock('../../utils/rateLimit.js', () => ({
  canStartSession: () => ({ allowed: true, remainingMs: 0 }),
  markSessionStarted: vi.fn(),
  hasReachedDailyLimit: () => false,
}))
vi.mock('../../data/archetypes.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    // Deterministic name for the seeded memory — independent of real data.
    getArchetypeById: (id) =>
      id === 'outlaw'
        ? { id: 'outlaw', name: 'The Outlaw' }
        : actual.getArchetypeById(id),
  }
})
vi.mock('../../hooks/useTypewriter.js', () => ({
  default: () => ({ displayedText: 'typed', isDone: true, skip: vi.fn() }),
}))

// Fixed 5-subject session — two deductions per subject to keep the flow fast.
// Hoisted so the mocked module factory can reference it (vi.mock is hoisted).
const SUBJECTS = vi.hoisted(() => {
  const makeSubject = (id, name) => ({
    id,
    name,
    behavioralNote: `Note about ${name}.`,
    clues: [`Clue about ${name}.`],
    questions: [
      { id: `${id}q1`, prompt: `${name}: first read?`, options: ['yes', 'no'], correctIndex: 0, correctFeedback: `Right about ${name}.` },
      { id: `${id}q2`, prompt: `${name}: second read?`, options: ['yes', 'no'], correctIndex: 0, correctFeedback: `Also right.` },
    ],
  })
  return [
    makeSubject('a', 'Alpha'),
    makeSubject('b', 'Bravo'),
    makeSubject('c', 'Charlie'),
    makeSubject('d', 'Delta'),
    makeSubject('e', 'Echo'),
  ]
})

vi.mock('../../hooks/useSubjectPool.js', () => ({
  useSubjectPool: () => SUBJECTS,
}))

import ObserverGame from './ObserverGame.jsx'
import { COMMIT_BEAT_MS } from './DeductionQuestion.jsx'
import { ROW_STAGGER_MS } from './BatchReveal.jsx'
import { REVEAL_COPY } from '../../data/flavor.js'

const advanceQuestion = () => act(() => vi.advanceTimersByTime(COMMIT_BEAT_MS))
// Step one row at a time — chained stagger timers need React to flush between.
const advanceReveal = () => {
  for (let row = 0; row < 2; row += 1) {
    act(() => vi.advanceTimersByTime(ROW_STAGGER_MS))
  }
}

/** Open the dossier, answer the subject's two deductions, then reveal. */
const playSubject = (correct) => {
  fireEvent.click(screen.getByRole('button', { name: 'Begin Deduction' }))
  for (let q = 0; q < 2; q += 1) {
    fireEvent.click(screen.getByRole('button', { name: correct ? /yes/ : /no/ }))
    advanceQuestion()
  }
  advanceReveal()
}

afterEach(() => {
  vi.useRealTimers()
  sfx.playSfx.mockClear()
  memory.getLastArchetype.mockClear()
  memory.recordSession.mockClear()
})

describe('ObserverGame (P1 flow)', () => {
  it('withholds the verdict until the reveal, then scores correctly', () => {
    vi.useFakeTimers()
    const onComplete = vi.fn()
    render(<ObserverGame onComplete={onComplete} />)

    // Subject 1 (Alpha) — file a casebook read, then both reads correct.
    const noteInput = screen.getByRole('textbox', { name: /my read/i })
    fireEvent.change(noteInput, { target: { value: 'Tidy, hiding something' } })
    fireEvent.submit(screen.getByRole('form', { name: /my read of alpha/i }))
    fireEvent.click(screen.getByRole('button', { name: 'Begin Deduction' }))
    // The deduction itself must be silent on correctness.
    fireEvent.click(screen.getByRole('button', { name: /yes/ }))
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
    expect(sfx.playSfx).not.toHaveBeenCalledWith('success')
    expect(sfx.playSfx).not.toHaveBeenCalledWith('error')
    advanceQuestion()

    fireEvent.click(screen.getByRole('button', { name: /yes/ }))
    advanceQuestion()
    advanceReveal()

    // Jane turned the page — the verdict appears here, not on the clicks.
    expect(screen.getByText(REVEAL_COPY.heading)).toBeTruthy()
    expect(screen.getByText('2 of 2 read correctly.')).toBeTruthy()
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'success')).toHaveLength(2)

    // Subjects 1–2 correct (4), subjects 3–5 wrong (0) → 4 of 10 = 40.
    fireEvent.click(screen.getByRole('button', { name: REVEAL_COPY.turnPage }))
    playSubject(true) // Bravo — correct pair
    fireEvent.click(screen.getByRole('button', { name: REVEAL_COPY.turnPage }))
    playSubject(false) // Charlie — both wrong
    fireEvent.click(screen.getByRole('button', { name: REVEAL_COPY.turnPage }))
    playSubject(false) // Delta — both wrong
    fireEvent.click(screen.getByRole('button', { name: REVEAL_COPY.turnPage }))
    playSubject(false) // Echo — both wrong

    // The final reveal closes the case and lands the Perception Rating,
    // carrying the casebook: the filed read plus the session subjects.
    expect(screen.getByRole('button', { name: REVEAL_COPY.closeCase })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: REVEAL_COPY.closeCase }))
    const result = onComplete.mock.calls[0][0]
    expect(result.score).toBe(40)
    expect(result.reads).toEqual([
      { subjectId: 'a', note: 'Tidy, hiding something' },
    ])
    expect(result.subjects.map((s) => s.id)).toEqual(['a', 'b', 'c', 'd', 'e'])
  })
})

describe('ObserverGame (P6 — Jane knows your type)', () => {
  it('names your Mode 1 type on the first dossier when one is remembered', () => {
    memory.getLastArchetype.mockReturnValue('outlaw')
    render(<ObserverGame onComplete={() => {}} />)
    expect(
      screen.getByText('You came in as The Outlaw last time. I have not forgotten.')
    ).toBeTruthy()
  })

  it('stays silent about your type when none is remembered', () => {
    memory.getLastArchetype.mockReturnValue(null)
    render(<ObserverGame onComplete={() => {}} />)
    expect(screen.queryByText(/came in as/)).toBeNull()
  })
})
