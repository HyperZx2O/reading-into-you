import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({ playSfx: vi.fn() }))
const memory = vi.hoisted(() => ({
  // Default: a single-run history — no previous run to reference.
  recordScore: vi.fn((score) => [score]),
}))

vi.mock('../../audio/uiSfx.js', () => sfx)
vi.mock('../../utils/caseMemory.js', () => memory)
vi.mock('../../hooks/useTypewriter.js', () => ({
  default: () => ({ displayedText: 'typed', isDone: true, skip: vi.fn() }),
}))

import PerceptionRating from './PerceptionRating.jsx'
import { CASEBOOK_COPY } from '../../data/flavor.js'

const SUBJECTS = [
  {
    id: 's01',
    name: 'Cameron Reed',
    behavioralNote: 'A tidy man with one photograph he cannot leave alone.',
  },
  { id: 's02', name: 'Elena Vasquez', behavioralNote: 'Polished, precise, performing.' },
]

describe('PerceptionRating (P2 — the casebook)', () => {
  it('holds the player\u2019s reads beside Jane\u2019s notes', () => {
    render(
      <PerceptionRating
        score={60}
        subjects={SUBJECTS}
        reads={[{ subjectId: 's01', note: 'Hiding something' }]}
        onPlayAgain={() => {}}
      />
    )
    expect(screen.getByText(CASEBOOK_COPY.sectionTitle)).toBeTruthy()
    // The filed read appears beside the subject's name.
    expect(screen.getByText('Cameron Reed')).toBeTruthy()
    expect(screen.getByText('Hiding something')).toBeTruthy()
    // Jane's note for the same subject sits beside it.
    expect(
      screen.getByText('A tidy man with one photograph he cannot leave alone.')
    ).toBeTruthy()
    // The skipped subject still gets a row — Jane read them anyway.
    expect(screen.getByText('Elena Vasquez')).toBeTruthy()
    expect(screen.getByText(CASEBOOK_COPY.skipped)).toBeTruthy()
  })

  it('hides the casebook when no read was filed', () => {
    render(
      <PerceptionRating
        score={60}
        subjects={SUBJECTS}
        reads={[]}
        onPlayAgain={() => {}}
      />
    )
    expect(screen.queryByText(CASEBOOK_COPY.sectionTitle)).toBeNull()
  })
})

describe('PerceptionRating (P6 — Jane remembers the last run)', () => {
  it('names the previous tier when the score improved', () => {
    // 60 (Senior Agent) after a 40 (Consultant) — up.
    memory.recordScore.mockReturnValue([60, 40])
    render(
      <PerceptionRating score={60} subjects={[]} reads={[]} onPlayAgain={() => {}} />
    )
    expect(
      screen.getByText('Last time: Consultant. You are learning — or cheating.')
    ).toBeTruthy()
  })

  it('names the previous tier when the score slipped', () => {
    // 30 (Investigator) after a 70 (Senior Agent) — down.
    memory.recordScore.mockReturnValue([30, 70])
    render(
      <PerceptionRating score={30} subjects={[]} reads={[]} onPlayAgain={() => {}} />
    )
    expect(screen.getByText('Last time: Senior Agent. Or slipping.')).toBeTruthy()
  })

  it('names the previous tier when the score held', () => {
    // 60 twice — the same tier both times.
    memory.recordScore.mockReturnValue([60, 60])
    render(
      <PerceptionRating score={60} subjects={[]} reads={[]} onPlayAgain={() => {}} />
    )
    expect(
      screen.getByText('Last time: Senior Agent. The same. I wondered.')
    ).toBeTruthy()
  })

  it('says nothing about a last run when there is none', () => {
    memory.recordScore.mockReturnValue([60])
    render(
      <PerceptionRating score={60} subjects={[]} reads={[]} onPlayAgain={() => {}} />
    )
    expect(screen.queryByText(/Last time:/)).toBeNull()
  })
})
