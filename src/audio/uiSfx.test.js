import { beforeEach, describe, expect, it, vi } from 'vitest'

// One fake player shared by every module import in this file.
const mocks = vi.hoisted(() => {
  const handle = { stop: vi.fn(), ended: Promise.resolve() }
  const player = {
    play: vi.fn(() => handle),
    unlock: vi.fn(() => Promise.resolve(true)),
    stopAll: vi.fn(),
    setEnabled: vi.fn(),
    destroy: vi.fn(() => Promise.resolve()),
  }
  return { player, handle }
})

vi.mock('uisfx', () => ({ createUISFX: vi.fn(() => mocks.player) }))

// The module keeps singleton state (player, unlocked flag, loop registry), so
// each test starts from a fresh module instance.
async function freshUiSfx() {
  vi.resetModules()
  return import('./uiSfx.js')
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('uiSfx player', () => {
  it('imports without touching window/localStorage (SSR-safe, lazy player)', async () => {
    const getItem = vi.spyOn(localStorage, 'getItem')
    const ui = await freshUiSfx()
    // Nothing at import time: no player, no storage reads, no window access.
    expect(getItem).not.toHaveBeenCalled()
    expect(ui.SFX_PACK).toBe('zen')
  })

  it('suppresses playback before a user gesture — no player, no queued cues', async () => {
    const { createUISFX } = await import('uisfx')
    const ui = await freshUiSfx()
    expect(ui.playSfx('select')).toBeNull()
    expect(ui.startSfxLoop('recording')).toBeNull()
    expect(createUISFX).not.toHaveBeenCalled()
  })

  it('unlocks once from a gesture, creating a single shared player', async () => {
    const { createUISFX } = await import('uisfx')
    const ui = await freshUiSfx()
    ui.unlockSfx()
    ui.unlockSfx() // idempotent — repeated gestures must not duplicate the player
    expect(createUISFX).toHaveBeenCalledTimes(1)
    expect(createUISFX).toHaveBeenCalledWith(
      expect.objectContaining({ pack: 'zen', volume: 0.7, enabled: true }),
    )
    expect(mocks.player.unlock).toHaveBeenCalledTimes(1)
  })

  it('plays one-shots after unlock, delegating cue + options', async () => {
    const ui = await freshUiSfx()
    ui.unlockSfx()
    const result = ui.playSfx('level-up', { volume: 0.4 })
    expect(result).toBe(mocks.handle)
    expect(mocks.player.play).toHaveBeenCalledWith('level-up', { volume: 0.4 })
  })

  it('returns null when the player fails instead of throwing into the gesture', async () => {
    const ui = await freshUiSfx()
    ui.unlockSfx()
    mocks.player.play.mockReturnValueOnce(null)
    expect(ui.playSfx('success')).toBeNull()
  })

  it('starts loops idempotently per cue', async () => {
    const ui = await freshUiSfx()
    ui.unlockSfx()
    const first = ui.startSfxLoop('recording')
    const second = ui.startSfxLoop('recording')
    expect(first).toBe(second)
    expect(mocks.player.play).toHaveBeenCalledTimes(1)
    expect(mocks.player.play).toHaveBeenCalledWith('recording', { loop: true })
  })

  it('stops a loop and clears its retained handle', async () => {
    const ui = await freshUiSfx()
    ui.unlockSfx()
    const loop = ui.startSfxLoop('recording')
    ui.stopSfxLoop(loop)
    expect(mocks.handle.stop).toHaveBeenCalledTimes(1)
    // A second stop of the same handle is a no-op.
    ui.stopSfxLoop(loop)
    expect(mocks.handle.stop).toHaveBeenCalledTimes(1)
  })

  it('stops every loop on stopAllSfxLoops (mute / disable path)', async () => {
    const ui = await freshUiSfx()
    ui.unlockSfx()
    ui.startSfxLoop('recording')
    ui.startSfxLoop('loading')
    expect(mocks.player.play).toHaveBeenCalledTimes(2)
    ui.stopAllSfxLoops()
    expect(mocks.handle.stop).toHaveBeenCalledTimes(2)
  })

  it('disableSfx mutes immediately: loops, stopAll, setEnabled(false), persisted', async () => {
    const ui = await freshUiSfx()
    ui.unlockSfx()
    ui.startSfxLoop('recording')
    ui.disableSfx()
    expect(mocks.handle.stop).toHaveBeenCalledTimes(1)
    expect(mocks.player.stopAll).toHaveBeenCalledTimes(1)
    expect(mocks.player.setEnabled).toHaveBeenCalledWith(false)
    expect(localStorage.getItem('jane_sound_enabled')).toBe('off')
  })

  it('enableSfx resumes the player and persists the preference', async () => {
    const ui = await freshUiSfx()
    ui.enableSfx()
    expect(mocks.player.setEnabled).toHaveBeenCalledWith(true)
    expect(localStorage.getItem('jane_sound_enabled')).toBe('on')
  })

  it('reads the persisted preference (default on, honors off)', async () => {
    let ui = await freshUiSfx()
    expect(ui.isSoundEnabled()).toBe(true)
    localStorage.setItem('jane_sound_enabled', 'off')
    ui = await freshUiSfx()
    expect(ui.isSoundEnabled()).toBe(false)
  })

  it('creates the player disabled when the saved preference is off', async () => {
    localStorage.setItem('jane_sound_enabled', 'off')
    const { createUISFX } = await import('uisfx')
    const ui = await freshUiSfx()
    ui.unlockSfx()
    expect(createUISFX).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }))
  })
})
