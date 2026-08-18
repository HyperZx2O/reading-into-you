import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))
const memory = vi.hoisted(() => ({ getPlayerName: vi.fn(() => 'Test'), setPlayerName: vi.fn(), recordSession: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)
vi.mock('../../utils/caseMemory.js', () => memory)
vi.mock('../../hooks/useTypewriter.js', () => ({
  default: () => ({ displayedText: 'typed', isDone: true, skip: vi.fn() }),
}))

import Reveal from './Reveal.jsx'
import { getArchetypeById } from '../../data/archetypes.js'
import { QUESTIONS } from '../../data/questions.js'

const OUTLAW = getArchetypeById('outlaw')

// Beat 1 is the envelope: open it, click to advance to the monologue, then
// click through the monologue lines to reach beat 3 — the How Jane Knew card.
const reachCard = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Open the envelope' }))
  fireEvent.click(screen.getByRole('main')) // beat 1 -> 2
  for (let i = 0; i < OUTLAW.monologue.length; i += 1) {
    fireEvent.click(screen.getByRole('main'))
  }
}

const q05 = QUESTIONS.find((q) => q.id === 'q05')

afterEach(() => {
  vi.useRealTimers()
  sfx.playSfx.mockClear()
})

describe('Reveal (P2 — the player\u2019s own words)', () => {
  it('quotes the player\u2019s word answer back in the How Jane Knew card', () => {
    vi.useFakeTimers()
    render(
      <Reveal
        archetype={OUTLAW}
        questions={[q05]}
        answers={['honesty']}
        onReplay={() => {}}
      />
    )
    reachCard()
    // The personal callout opens the card, the answer raised and bolded.
    expect(
      screen.getByText(/You said you could not live without/)
    ).toBeTruthy()
    expect(screen.getByText('Honesty')).toBeTruthy()
    expect(
      screen.getByText(/That was the tell\./)
    ).toBeTruthy()
    // Jane's pre-written callouts still follow.
    expect(screen.getByText(OUTLAW.howJaneKnew[0])).toBeTruthy()
  })

  it('seals the name behind the envelope until the player opens it', () => {
    vi.useFakeTimers()
    render(
      <Reveal archetype={OUTLAW} questions={[]} answers={[]} onReplay={() => {}} />
    )
    // No verdict before the open.
    expect(sfx.playSfx).not.toHaveBeenCalledWith('level-up')
    const flap = screen.getByRole('button', { name: 'Open the envelope' })
    expect(flap.getAttribute('aria-expanded')).toBe('false')
    // Time alone never advances the reveal — the player performs it.
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByRole('button', { name: 'Open the envelope' })).toBeTruthy()
    expect(screen.getByText(OUTLAW.name)).toBeTruthy() // sealed in the DOM, hidden by the flap
    // Opening is the reveal: the rank cue fires, the flap announces itself.
    fireEvent.click(flap)
    expect(sfx.playSfx).toHaveBeenCalledWith('level-up')
    expect(flap.getAttribute('aria-expanded')).toBe('true')
    expect(flap.disabled).toBe(true)
  })

  it('renders the card normally when the session drew no word input', () => {
    vi.useFakeTimers()
    const mc = QUESTIONS.find((q) => q.id === 'q01')
    render(
      <Reveal
        archetype={OUTLAW}
        questions={[mc]}
        answers={[0]}
        onReplay={() => {}}
      />
    )
    reachCard()
    expect(screen.queryByText(/You said you could not live without/)).toBeNull()
    expect(screen.getByText(OUTLAW.howJaneKnew[0])).toBeTruthy()
  })
})
