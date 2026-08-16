import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)

import PickOne from './PickOne.jsx'

const QUESTION = {
  prompt: 'In a group photo, you are the one who…',
  options: ['is looking at the camera', 'is looking at someone else', 'isn\u2019t in the photo'],
}

describe('PickOne', () => {
  it('plays select when an option enters the active set', async () => {
    const user = userEvent.setup()
    render(<PickOne question={QUESTION} onAnswer={() => {}} />)
    await user.click(screen.getByRole('button', { name: /is looking at the camera/ }))
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
  })

  it('plays select exactly once even with rapid pointer + keyboard re-activation', async () => {
    const user = userEvent.setup()
    render(<PickOne question={QUESTION} onAnswer={() => {}} />)
    const option = screen.getByRole('button', { name: /is looking at the camera/ })
    await user.click(option)
    // The option group is disabled after the first choice — further clicks
    // must not stack a second select.
    await user.click(option)
    await user.keyboard('{Enter}')
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'select')).toHaveLength(1)
  })
})
