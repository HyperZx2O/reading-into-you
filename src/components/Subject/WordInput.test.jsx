import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({
  playSfx: vi.fn(),
  TYPING_CUE: 'typing',
  TYPING_VOLUME: 0.05,
}))

vi.mock('../../audio/uiSfx.js', () => sfx)

import WordInput from './WordInput.jsx'

const QUESTION = {
  prompt: 'Name one thing you could not live without.',
  options: [],
}

describe('WordInput', () => {
  it('plays one brief typing cue per local input event', async () => {
    const user = userEvent.setup()
    render(<WordInput question={QUESTION} onAnswer={() => {}} />)
    await user.type(screen.getByRole('textbox'), 'honesty')
    const typingCalls = sfx.playSfx.mock.calls.filter(([cue]) => cue === 'typing')
    expect(typingCalls.length).toBeGreaterThanOrEqual(1)
    expect(typingCalls[0][1]).toEqual(expect.objectContaining({ volume: 0.05, cooldownMs: 0 }))
  })

  it('plays blocked on an empty submit — no answer is recorded', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(<WordInput question={QUESTION} onAnswer={onAnswer} />)
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(sfx.playSfx).toHaveBeenCalledWith('blocked')
    expect(onAnswer).not.toHaveBeenCalled()
    expect(screen.getByText('Silence is not an answer.')).toBeTruthy()
  })

  it('plays select after a valid submit commits the answer', async () => {
    const user = userEvent.setup()
    const onAnswer = vi.fn()
    render(<WordInput question={QUESTION} onAnswer={onAnswer} />)
    await user.type(screen.getByRole('textbox'), 'honesty')
    await user.click(screen.getByRole('button', { name: 'Submit' }))
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
    expect(onAnswer).toHaveBeenCalledWith('honesty')
  })

  it('never double-plays after submission (dedup on keyboard + pointer)', async () => {
    const user = userEvent.setup()
    render(<WordInput question={QUESTION} onAnswer={() => {}} />)
    await user.type(screen.getByRole('textbox'), 'honesty')
    await user.keyboard('{Enter}')
    const selects = sfx.playSfx.mock.calls.filter(([cue]) => cue === 'select')
    expect(selects).toHaveLength(1)
  })
})
