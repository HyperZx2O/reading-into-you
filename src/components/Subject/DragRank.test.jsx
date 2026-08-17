import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => sfx)

import DragRank from './DragRank.jsx'

const QUESTION = {
  prompt: 'Rank what a home must have.',
  options: ['Security', 'Freedom', 'Beauty', 'Order'],
}

describe('DragRank (P4 — the paper lift)', () => {
  it('lifts the grabbed slip and plays the drag-start cue once', () => {
    render(<DragRank question={QUESTION} onAnswer={() => {}} />)
    const item = screen.getAllByRole('listitem')[0]
    fireEvent.dragStart(item)
    expect(item.className).toContain('dragging')
    expect(sfx.playSfx).toHaveBeenCalledWith('drag-start')
    // Re-grabbing the same slip does not stack the cue.
    fireEvent.dragStart(item)
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'drag-start')).toHaveLength(1)
    fireEvent.dragEnd(item)
    expect(item.className).not.toContain('dragging')
  })
})
