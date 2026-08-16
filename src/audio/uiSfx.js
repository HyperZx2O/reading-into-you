import { createUISFX } from 'uisfx'

/**
 * Centralized UI sound layer — one long-lived client-only player.
 *
 * Selected pack: `zen` — pure tones, dry wood, and brief washi detail. It is
 * the only pack whose synthesis carries paper / brush / wood / chime materials
 * and zero noise, so it sits inside the existing sine-drone ambient bed and
 * matches the case-file world (ink, paper, lamp, typewriter). Its own
 * best-for is "reading, writing, calm productivity" — exactly what this
 * product is.
 *
 * Rules honored here (see uisfx agent guide):
 * - No audio on page load. Nothing is created until the first genuine
 *   pointer/keyboard gesture calls unlockSfx().
 * - Until unlocked, playSfx/startSfxLoop return null — background and
 *   asynchronous cues are suppressed, never queued.
 * - The player is a module singleton, so React StrictMode remounts and
 *   re-renders can never create a duplicate AudioContext or player.
 * - The sound preference is persisted under the product's own localStorage
 *   key (jane_sound_enabled), consistent with jane_intro_seen etc.
 * - Loops are registered by cue so starts are idempotent and mute/disable is
 *   immediate (stopAllSfxLoops before ui.setEnabled(false)).
 */

export const SFX_PACK = 'zen'
const SFX_VOLUME = 0.7
const SOUND_STORAGE_KEY = 'jane_sound_enabled'

/** Low-volume key-contact cue for text entry (user input and Jane's typewriter). */
export const TYPING_CUE = 'typing'
export const TYPING_VOLUME = 0.05

let player = null
let unlocked = false
const activeLoops = new Map() // cue -> PlayingSFX handle

function readSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_STORAGE_KEY) !== 'off'
  } catch {
    return true
  }
}

function persistSound(enabled) {
  try {
    localStorage.setItem(SOUND_STORAGE_KEY, enabled ? 'on' : 'off')
  } catch {
    // localStorage unavailable (private mode, tests) — in-memory state still applies.
  }
}

function getPlayer() {
  if (!player) {
    player = createUISFX({
      pack: SFX_PACK,
      volume: SFX_VOLUME,
      enabled: readSoundEnabled(),
    })
  }
  return player
}

/** The saved sound preference (default on). */
export function isSoundEnabled() {
  return readSoundEnabled()
}

/**
 * Resume Web Audio from a genuine user gesture. Idempotent — call from the
 * first pointer/keyboard handler (the first play() in the same handler is the
 * unlock gesture itself). Fire-and-forget; never awaited before playback.
 */
export function unlockSfx() {
  if (unlocked || typeof window === 'undefined') return
  unlocked = true
  try {
    // `.unlock()` resumes the lazily-created AudioContext from trusted intent.
    getPlayer()
      .unlock()
      .catch(() => {})
  } catch {
    // Player creation failed — stay silent rather than throw into the gesture.
  }
}

/**
 * Play a one-shot cue. Returns null before unlock or on failure — the caller
 * must treat null as "no sound" (suppressed), never as queued feedback.
 */
export function playSfx(cue, options = {}) {
  if (!unlocked) return null
  try {
    return getPlayer().play(cue, options)
  } catch {
    return null
  }
}

/**
 * Start a loop cue. Idempotent per cue: a second start for the same cue
 * returns the existing handle. Returns the PlayingSFX handle or null.
 * Callers must stop the handle on success, failure, cancellation, route
 * change, unmount, and mute (see stopSfxLoop / stopAllSfxLoops).
 */
export function startSfxLoop(cue, options = {}) {
  if (!unlocked) return null
  const existing = activeLoops.get(cue)
  if (existing) return existing
  try {
    const handle = getPlayer().play(cue, { ...options, loop: true })
    if (handle) activeLoops.set(cue, handle)
    return handle
  } catch {
    return null
  }
}

/** Stop one loop and drop its retained handle. Safe to call more than once; a
 * second stop of an already-cleared handle is a true no-op. */
export function stopSfxLoop(handle) {
  if (!handle) return
  for (const [cue, active] of activeLoops) {
    if (active === handle) {
      activeLoops.delete(cue)
      try {
        handle.stop()
      } catch {
        // already stopped — nothing to do
      }
      return
    }
  }
}

/** Stop every registered loop immediately (mute, disable, global transitions). */
export function stopAllSfxLoops() {
  for (const handle of activeLoops.values()) {
    try {
      handle.stop()
    } catch {
      // already stopped
    }
  }
  activeLoops.clear()
}

/** Enable sound: persist the preference and resume the player. */
export function enableSfx() {
  persistSound(true)
  try {
    getPlayer().setEnabled(true)
  } catch {
    // player not created yet — creation reads the persisted preference.
  }
}

/**
 * Disable sound immediately: stop retained loops, stop everything, then
 * disable the player. Order matters — mute must be audible-free at once.
 */
export function disableSfx() {
  stopAllSfxLoops()
  try {
    const ui = getPlayer()
    ui.stopAll()
    ui.setEnabled(false)
  } catch {
    // player not created yet — nothing is playing.
  }
  persistSound(false)
}
