import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({
  playSfx: vi.fn(),
  TYPING_CUE: 'typing',
  TYPING_VOLUME: 0.05,
}))

const memory = vi.hoisted(() => ({ rememberArchetype: vi.fn(), updatePerformanceMetrics: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)
vi.mock('../../utils/caseMemory.js', () => memory)
vi.mock('../../utils/rateLimit.js', () => ({
  canStartSession: () => ({ allowed: true, remainingMs: 0 }),
  markSessionStarted: vi.fn(),
  hasReachedDailyLimit: () => false,
}))
vi.mock('../../hooks/useTypewriter.js', () => ({
  default: () => ({ displayedText: 'typed', isDone: true, skip: vi.fn() }),
}))

// A fixed 4-question session, all act 1 so no Timer renders. Option 0 is
// always the security-themed read; scoring is minimal but valid.
const QUESTIONS = vi.hoisted(() => {
  const make = (id, prompt) => ({
    id,
    act: 1,
    prompt,
    interactionType: 'multipleChoice',
    options: ['security', 'people', 'whichever', 'other'],
    scoringMap: {
      sentinel: [1, 0, 0, 0],
      architect: [0, 0, 0, 0],
      mask: [0, 0, 0, 0],
      dreamer: [0, 0, 0, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 0, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [0, 0, 0, 0],
    },
    themes: { security: [0] },
  })
  // q2 also carries a prelude (P7) — Jane waits before its options render.
  const PRELUDE = 'A free afternoon is a confession. I am watching.'
  return ['q1', 'q2', 'q3', 'q4'].map((id, i) => ({
    ...make(id, `Prompt ${i + 1}?`),
    ...(id === 'q2' ? { prelude: PRELUDE } : {}),
  }))
})

vi.mock('../../hooks/useQuestionPool.js', () => ({ default: () => QUESTIONS }))

import SubjectGame from './SubjectGame.jsx'
import { REACTIONS } from '../../data/flavor.js'

const PICK_BEAT_MS = 300

const pickSecurity = () => {
  fireEvent.click(screen.getByRole('button', { name: /security/ }))
  act(() => vi.advanceTimersByTime(PICK_BEAT_MS))
}

afterEach(() => {
  vi.useRealTimers()
  sfx.playSfx.mockClear()
  memory.rememberArchetype.mockClear()
})

describe('SubjectGame (P3 — Jane notices patterns)', () => {
  it('rides the repeat reaction in with the question after the third pick', () => {
    vi.useFakeTimers()
    render(<SubjectGame onReplay={() => {}} />)
    pickSecurity() // q1
    pickSecurity() // q2
    pickSecurity() // q3 — third security pick; Jane speaks on q4
    const line = REACTIONS.repeat('the locked door')
    expect(screen.getByText('Prompt 4?')).toBeTruthy()
    expect(screen.getByText(line)).toBeTruthy() // sr-only full line
    // The reaction is a remark, never a verdict: the question still answers.
    fireEvent.click(screen.getByRole('button', { name: /people/ }))
    act(() => vi.advanceTimersByTime(PICK_BEAT_MS))
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
  })

  it('flags a hesitation on the next question', () => {
    vi.useFakeTimers()
    render(<SubjectGame onReplay={() => {}} />)
    pickSecurity() // q1 — fast
    // The player stares at q2 for 20 seconds…
    act(() => vi.advanceTimersByTime(20000))
    pickSecurity() // q2 — slow; Jane speaks on q3
    expect(screen.getByText(REACTIONS.hesitation)).toBeTruthy()
  })

  it('remembers the archetype when the session completes', () => {
    vi.useFakeTimers()
    render(<SubjectGame onReplay={() => {}} />)
    // All four answers pick option 0, which scores only for sentinel.
    for (let i = 0; i < 4; i += 1) pickSecurity()
    expect(memory.rememberArchetype).toHaveBeenCalledWith('sentinel')
  })

  it('types the prelude and still answers when Jane waits (P7)', () => {
    vi.useFakeTimers()
    render(<SubjectGame onReplay={() => {}} />)
    pickSecurity() // q1 — Jane waits on q2, which carries the prelude
    // The full prelude line is present (read once by assistive tech).
    expect(
      screen.getByText('A free afternoon is a confession. I am watching.')
    ).toBeTruthy()
    // The wait is a remark, never a blocker — the question still answers.
    fireEvent.click(screen.getByRole('button', { name: /people/ }))
    act(() => vi.advanceTimersByTime(PICK_BEAT_MS))
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
  })
})
