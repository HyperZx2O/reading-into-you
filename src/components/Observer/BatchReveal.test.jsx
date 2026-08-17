import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)

// Typewriter is deterministic in tests: text is full, typing is instant.
vi.mock('../../hooks/useTypewriter.js', () => ({
  default: () => ({ displayedText: 'typed', isDone: true, skip: vi.fn() }),
}))

import BatchReveal, { ROW_STAGGER_MS } from './BatchReveal.jsx'
import { REVEAL_COPY } from '../../data/flavor.js'

const SUBJECT = { id: 's01', name: 'Cameron Reed' }

const QUESTIONS = [
  { id: 'q1', prompt: 'Why the photo?', options: ['a', 'b'], correctIndex: 0, correctFeedback: 'The dust says it all.' },
  { id: 'q2', prompt: 'Why the coffee?', options: ['c', 'd'], correctIndex: 1, correctFeedback: 'A ritual, not a drink.' },
  { id: 'q3', prompt: 'Why the ring?', options: ['e', 'f'], correctIndex: 2, correctFeedback: 'It came off in a hurry.' },
  { id: 'q4', prompt: 'Why the drawer?', options: ['g', 'h'], correctIndex: 1, correctFeedback: 'His attention keeps going there.' },
]

const revealAll = () => {
  for (let i = 0; i < QUESTIONS.length; i += 1) {
    act(() => vi.advanceTimersByTime(ROW_STAGGER_MS))
  }
}

afterEach(() => {
  vi.useRealTimers()
  sfx.playSfx.mockClear()
})

describe('BatchReveal (P1 — Jane turns the page)', () => {
  it('opens the page with an open cue and announces the verdict once', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 0]} // 3 correct, 1 wrong
        isLast={false}
        onTurnPage={() => {}}
      />
    )
    expect(sfx.playSfx).toHaveBeenCalledWith('open')
    expect(screen.getByText(REVEAL_COPY.heading)).toBeTruthy()
    expect(screen.getByText(new RegExp(`Case notes — ${SUBJECT.name}`))).toBeTruthy()
    expect(screen.getByText('3 of 4 read correctly.')).toBeTruthy()
  })

  it('stamps only the correct deductions and confirms each with success', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 0]}
        isLast={false}
        onTurnPage={() => {}}
      />
    )
    revealAll()
    // 3 correct rows carry the gold stamp; the wrong row stays blank.
    expect(screen.getAllByText('✓')).toHaveLength(3)
    expect(screen.getAllByText('typed')).toHaveLength(3)
    // The wrong row is silent — no typed remark, no sr-only feedback.
    expect(screen.queryByText(QUESTIONS[3].correctFeedback)).toBeNull()
    // One success per correct confirmation, played as the row lands.
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'success')).toHaveLength(3)
  })

  it('rises the confirmation pitch with a correct streak (P5)', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 1]} // all four correct
        isLast={false}
        onTurnPage={() => {}}
      />
    )
    revealAll()
    const rates = sfx.playSfx.mock.calls
      .filter(([cue]) => cue === 'success')
      .map(([, options]) => options.playbackRate)
    expect(rates).toEqual([1, 1.06, 1.12, 1.18])
  })

  it('resets the streak when a read is wrong (P5)', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 0, 2, 1]} // correct, wrong, correct, correct
        isLast={false}
        onTurnPage={() => {}}
      />
    )
    revealAll()
    const rates = sfx.playSfx.mock.calls
      .filter(([cue]) => cue === 'success')
      .map(([, options]) => options.playbackRate)
    expect(rates).toEqual([1, 1, 1.06])
  })

  it('closes with Jane\u2019s remark — wrong reads stay unjudged', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 0]}
        isLast={false}
        onTurnPage={() => {}}
      />
    )
    revealAll()
    expect(screen.getByText(REVEAL_COPY.someWrong)).toBeTruthy()
  })

  it('lets Jane be impressed when every read lands', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 1]}
        isLast={false}
        onTurnPage={() => {}}
      />
    )
    revealAll()
    expect(screen.getByText(REVEAL_COPY.allCorrect)).toBeTruthy()
    expect(screen.queryByText(REVEAL_COPY.someWrong)).toBeNull()
  })

  it('skips the reveal, then turns the page with a forward cue', () => {
    vi.useFakeTimers()
    const onTurnPage = vi.fn()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 0]}
        isLast={false}
        onTurnPage={onTurnPage}
      />
    )
    // While rows are surfacing the button skips; it never advances.
    const skipButton = screen.getByRole('button', { name: REVEAL_COPY.skip })
    fireEvent.click(skipButton)
    expect(onTurnPage).not.toHaveBeenCalled()
    expect(screen.getByText(REVEAL_COPY.someWrong)).toBeTruthy()
    // Now the page is fully turned — the same button advances.
    fireEvent.click(screen.getByRole('button', { name: REVEAL_COPY.turnPage }))
    expect(onTurnPage).toHaveBeenCalledTimes(1)
    expect(sfx.playSfx).toHaveBeenCalledWith('forward')
  })

  it('closes the case on the final subject — once the page has turned', () => {
    vi.useFakeTimers()
    render(
      <BatchReveal
        subject={SUBJECT}
        questions={QUESTIONS}
        answers={[0, 1, 2, 0]}
        isLast
        onTurnPage={() => {}}
      />
    )
    revealAll()
    expect(screen.getByRole('button', { name: REVEAL_COPY.closeCase })).toBeTruthy()
  })
})
