import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)

import DeductionQuestion, { COMMIT_BEAT_MS } from './DeductionQuestion.jsx'

const QUESTION = {
  prompt: 'Elena crossed her arms when you mentioned…',
  options: ['money', 'her mother', 'the trip'],
  correctIndex: 1,
}

afterEach(() => {
  vi.useRealTimers()
  sfx.playSfx.mockClear()
})

describe('DeductionQuestion (P1 — commit only, verdict withheld)', () => {
  it('commits the read with a select cue — never success or error', () => {
    vi.useFakeTimers()
    const onAnswer = vi.fn()
    render(<DeductionQuestion question={QUESTION} onAnswer={onAnswer} onAdvance={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /her mother/ }))
    expect(onAnswer).toHaveBeenCalledWith(1)
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
    expect(sfx.playSfx).not.toHaveBeenCalledWith('success')
    expect(sfx.playSfx).not.toHaveBeenCalledWith('error')
  })

  it('advances only after the commit beat — not on the click itself', () => {
    vi.useFakeTimers()
    const onAdvance = vi.fn()
    render(<DeductionQuestion question={QUESTION} onAnswer={() => {}} onAdvance={onAdvance} />)
    fireEvent.click(screen.getByRole('button', { name: /money/ }))
    expect(onAdvance).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(COMMIT_BEAT_MS))
    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('plays one cue per commit — re-activation never stacks', () => {
    vi.useFakeTimers()
    const onAnswer = vi.fn()
    render(<DeductionQuestion question={QUESTION} onAnswer={onAnswer} onAdvance={() => {}} />)
    const option = screen.getByRole('button', { name: /money/ })
    fireEvent.click(option)
    fireEvent.click(option)
    expect(onAnswer).toHaveBeenCalledTimes(1)
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'select')).toHaveLength(1)
  })
})
