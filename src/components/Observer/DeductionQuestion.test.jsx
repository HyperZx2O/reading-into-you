import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)

import DeductionQuestion from './DeductionQuestion.jsx'

const QUESTION = {
  prompt: 'Elena crossed her arms when you mentioned…',
  options: ['money', 'her mother', 'the trip'],
  correctIndex: 1,
}

describe('DeductionQuestion', () => {
  it('plays success only when the answer resolves correct', async () => {
    const user = userEvent.setup()
    render(<DeductionQuestion question={QUESTION} onAnswer={() => {}} />)
    await user.click(screen.getByRole('button', { name: /her mother/ }))
    expect(sfx.playSfx).toHaveBeenCalledWith('success')
    expect(sfx.playSfx).not.toHaveBeenCalledWith('error')
  })

  it('plays error only when the answer resolves wrong', async () => {
    const user = userEvent.setup()
    render(<DeductionQuestion question={QUESTION} onAnswer={() => {}} />)
    await user.click(screen.getByRole('button', { name: /money/ }))
    expect(sfx.playSfx).toHaveBeenCalledWith('error')
    expect(sfx.playSfx).not.toHaveBeenCalledWith('success')
  })

  it('plays the outcome exactly once — no stacking on re-activation', async () => {
    const user = userEvent.setup()
    render(<DeductionQuestion question={QUESTION} onAnswer={() => {}} />)
    const option = screen.getByRole('button', { name: /money/ })
    await user.click(option)
    await user.click(option)
    await user.keyboard('{Enter}')
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'error')).toHaveLength(1)
  })
})
