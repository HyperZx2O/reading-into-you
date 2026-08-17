import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)

import FaceDown, { FLIP_MS } from './FaceDown.jsx'
import { SUBJECT_COPY } from '../../data/flavor.js'

const QUESTION = {
  prompt: 'Pick a door.',
  options: [
    'A heavy iron door',
    'A glass door — see-through and open',
    'A door ajar, light spilling out',
    'A door with no label — who knows',
  ],
}

const PICK_BEAT_MS = 300

afterEach(() => {
  vi.useRealTimers()
  sfx.playSfx.mockClear()
})

describe('FaceDown (P7 — the turn-over tap)', () => {
  it('shows the prompt and face-down cards, with no options reachable', () => {
    render(<FaceDown question={QUESTION} onAnswer={() => {}} />)
    expect(screen.getByText('Pick a door.')).toBeTruthy()
    expect(screen.getByRole('button', { name: SUBJECT_COPY.turnOver })).toBeTruthy()
    // No option text is interactable while face-down.
    expect(screen.queryByRole('button', { name: /heavy iron door/ })).toBeNull()
  })

  it('turns the cards over on the tap, then answers as a normal PickOne', () => {
    vi.useFakeTimers()
    const onAnswer = vi.fn()
    render(<FaceDown question={QUESTION} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByRole('button', { name: SUBJECT_COPY.turnOver }))
    expect(sfx.playSfx).toHaveBeenCalledWith('open')
    // The reveal is a moment, not an instant — options are still down.
    expect(screen.queryByRole('button', { name: /heavy iron door/ })).toBeNull()
    act(() => vi.advanceTimersByTime(FLIP_MS))
    // Now the real options are up, and answering works exactly like PickOne.
    fireEvent.click(screen.getByRole('button', { name: /heavy iron door/ }))
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
    act(() => vi.advanceTimersByTime(PICK_BEAT_MS))
    expect(onAnswer).toHaveBeenCalledWith(0)
  })

  it('plays the turn-over cue exactly once', () => {
    vi.useFakeTimers()
    render(<FaceDown question={QUESTION} onAnswer={() => {}} />)
    const button = screen.getByRole('button', { name: SUBJECT_COPY.turnOver })
    fireEvent.click(button)
    // A second fire is impossible — the button unmounts on the first tap.
    fireEvent.click(button)
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'open')).toHaveLength(1)
  })
})
