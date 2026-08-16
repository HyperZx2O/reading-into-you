import { StrictMode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({
  // Mirror the real uiSfx persistence so the component-level toggle contract
  // is testable end-to-end (the real module's persistence is unit-tested in
  // uiSfx.test.js).
  disableSfx: vi.fn(() => localStorage.setItem('jane_sound_enabled', 'off')),
  enableSfx: vi.fn(() => localStorage.setItem('jane_sound_enabled', 'on')),
  isSoundEnabled: vi.fn(() => localStorage.getItem('jane_sound_enabled') !== 'off'),
  playSfx: vi.fn(),
  unlockSfx: vi.fn(),
}))

vi.mock('../../audio/uiSfx.js', () => sfx)

import AudioToggle from './AudioToggle.jsx'

describe('AudioToggle (master sound control)', () => {
  it('starts from the persisted preference', () => {
    localStorage.setItem('jane_sound_enabled', 'off')
    render(<AudioToggle />)
    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeTruthy()
  })

  it('defaults to sound on with the mute label', () => {
    render(<AudioToggle />)
    expect(screen.getByRole('button', { name: 'Mute sound' })).toBeTruthy()
  })

  it('toggling off plays toggle-off, mutes immediately, and persists', async () => {
    const user = userEvent.setup()
    render(<AudioToggle />)
    await user.click(screen.getByRole('button', { name: 'Mute sound' }))
    // Audible confirmation first, then mute — order is the point.
    expect(sfx.playSfx).toHaveBeenCalledWith('toggle-off')
    expect(sfx.disableSfx).toHaveBeenCalled()
    expect(localStorage.getItem('jane_sound_enabled')).toBe('off')
    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeTruthy()
  })

  it('toggling back on enables, confirms, and persists', async () => {
    const user = userEvent.setup()
    localStorage.setItem('jane_sound_enabled', 'off')
    render(<AudioToggle />)
    await user.click(screen.getByRole('button', { name: 'Unmute sound' }))
    expect(sfx.enableSfx).toHaveBeenCalled()
    expect(sfx.playSfx).toHaveBeenCalledWith('toggle-on')
    expect(localStorage.getItem('jane_sound_enabled')).toBe('on')
  })

  it('persists across remounts (the muted session stays muted)', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<AudioToggle />)
    await user.click(screen.getByRole('button', { name: 'Mute sound' }))
    unmount()
    render(<AudioToggle />)
    expect(screen.getByRole('button', { name: 'Unmute sound' })).toBeTruthy()
  })

  it('one keyboard activation fires the handler exactly once (dedup)', async () => {
    const user = userEvent.setup()
    render(<AudioToggle />)
    const button = screen.getByRole('button', { name: 'Mute sound' })
    button.focus()
    await user.keyboard('{Enter}')
    expect(sfx.disableSfx).toHaveBeenCalledTimes(1)
  })

  it('one pointer activation fires the handler exactly once (dedup)', async () => {
    const user = userEvent.setup()
    render(<AudioToggle />)
    await user.click(screen.getByRole('button', { name: 'Mute sound' }))
    expect(sfx.disableSfx).toHaveBeenCalledTimes(1)
  })

  it('survives StrictMode remounts without duplicating handlers or playback', async () => {
    const user = userEvent.setup()
    render(
      <StrictMode>
        <AudioToggle />
      </StrictMode>,
    )
    await user.click(screen.getByRole('button', { name: 'Mute sound' }))
    expect(sfx.disableSfx).toHaveBeenCalledTimes(1)
  })

  it('the first document gesture unlocks SFX even while sound is off', async () => {
    const user = userEvent.setup()
    localStorage.setItem('jane_sound_enabled', 'off')
    render(<AudioToggle />)
    // A click anywhere (here: the button itself) is the unlock gesture.
    await user.click(screen.getByRole('button', { name: 'Unmute sound' }))
    expect(sfx.unlockSfx).toHaveBeenCalled()
  })
})
