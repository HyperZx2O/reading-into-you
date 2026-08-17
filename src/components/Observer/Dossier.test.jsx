import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))

vi.mock('../../audio/uiSfx.js', () => ({
  ...sfx,
  TYPING_CUE: 'typing',
  TYPING_VOLUME: 0.05,
}))

import Dossier from './Dossier.jsx'

const SUBJECT = {
  id: 's01',
  name: 'Cameron Reed',
  behavioralNote: 'A tidy man with one photograph he cannot leave alone.',
  clues: ['A framed photograph sits face-down.'],
}

describe('Dossier (P2 — the casebook note)', () => {
  it('files a read on submit: typing cues, then a select on the commit', async () => {
    const user = userEvent.setup()
    const onFileRead = vi.fn()
    render(
      <Dossier
        subject={SUBJECT}
        index={0}
        total={5}
        reaction={null}
        note=""
        onFileRead={onFileRead}
        onBegin={() => {}}
      />
    )
    const input = screen.getByRole('textbox', { name: /my read/i })
    await user.type(input, 'Hiding something{enter}')
    expect(onFileRead).toHaveBeenCalledWith('Hiding something')
    expect(sfx.playSfx).toHaveBeenCalledWith('select')
    expect(
      sfx.playSfx.mock.calls.some(
        ([cue, options]) =>
          cue === 'typing' && options?.volume === 0.05
      )
    ).toBe(true)
    expect(input.disabled).toBe(true)
  })

  it('does not file an empty read', async () => {
    const user = userEvent.setup()
    const onFileRead = vi.fn()
    render(
      <Dossier
        subject={SUBJECT}
        index={0}
        total={5}
        reaction={null}
        note=""
        onFileRead={onFileRead}
        onBegin={() => {}}
      />
    )
    const input = screen.getByRole('textbox', { name: /my read/i })
    await user.type(input, '{enter}')
    expect(onFileRead).not.toHaveBeenCalled()
    expect(sfx.playSfx).not.toHaveBeenCalledWith('select')
  })

  it('lets the deduction begin without filing a read', async () => {
    const user = userEvent.setup()
    const onBegin = vi.fn()
    render(
      <Dossier
        subject={SUBJECT}
        index={0}
        total={5}
        reaction={null}
        note=""
        onFileRead={() => {}}
        onBegin={onBegin}
      />
    )
    await user.click(screen.getByRole('button', { name: 'Begin Deduction' }))
    expect(onBegin).toHaveBeenCalledTimes(1)
    expect(sfx.playSfx).toHaveBeenCalledWith('start')
  })
})
