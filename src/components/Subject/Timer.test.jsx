import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const sfx = vi.hoisted(() => ({
  playSfx: vi.fn(),
  startSfxLoop: vi.fn(() => ({ stop: vi.fn() })),
  stopSfxLoop: vi.fn(),
}))

vi.mock('../../audio/uiSfx.js', () => sfx)

import Timer from './Timer.jsx'

describe('Timer (Act 2 pressure countdown)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts the recording loop once on mount (idempotent visible process)', () => {
    render(<Timer seconds={30} onExpire={() => {}} />)
    expect(sfx.startSfxLoop).toHaveBeenCalledTimes(1)
    expect(sfx.startSfxLoop).toHaveBeenCalledWith('recording', expect.anything())
  })

  it('stops the loop on unmount (answer given, route change, remount)', () => {
    const { unmount } = render(<Timer seconds={30} onExpire={() => {}} />)
    const handle = sfx.startSfxLoop.mock.results[0].value
    unmount()
    expect(sfx.stopSfxLoop).toHaveBeenCalledWith(handle)
  })

  it('stops the loop before expiring and fires onExpire once', () => {
    const onExpire = vi.fn()
    render(<Timer seconds={30} onExpire={onExpire} />)
    const handle = sfx.startSfxLoop.mock.results[0].value
    act(() => {
      vi.advanceTimersByTime(30000)
    })
    expect(sfx.stopSfxLoop).toHaveBeenCalledWith(handle)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('plays exactly one warning when the final 5 seconds begin', () => {
    render(<Timer seconds={30} onExpire={() => {}} />)
    act(() => {
      vi.advanceTimersByTime(25000) // remaining = 5
    })
    expect(sfx.playSfx).toHaveBeenCalledWith('warning')
    const warnings = sfx.playSfx.mock.calls.filter(([cue]) => cue === 'warning')
    expect(warnings).toHaveLength(1)
    // Further ticks never re-warn.
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(sfx.playSfx.mock.calls.filter(([cue]) => cue === 'warning')).toHaveLength(1)
  })

  it('is silent about the early countdown (no warning before 5s)', () => {
    render(<Timer seconds={30} onExpire={() => {}} />)
    act(() => {
      vi.advanceTimersByTime(20000) // remaining = 10
    })
    expect(sfx.playSfx).not.toHaveBeenCalledWith('warning')
  })
})
