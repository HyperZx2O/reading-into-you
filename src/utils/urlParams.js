/**
 * URL Parameter System — encodes/decodes game state to URL parameters.
 * Enables sharing, referral, and multiplayer handoff without a server.
 *
 * URL structure:
 *   ?role=subject|observer
 *   &archetype=protector
 *   &ref=player123
 *   &session=xyz789
 */

/**
 * Read URL parameters and return parsed game state.
 * @returns {{ role: string|null, archetype: string|null, ref: string|null, session: string|null }}
 */
export function readUrlParams() {
  try {
    const params = new URLSearchParams(window.location.search)
    return {
      role: params.get('role'),
      archetype: params.get('archetype'),
      ref: params.get('ref'),
      session: params.get('session'),
      name: params.get('name'),
    }
  } catch {
    return { role: null, archetype: null, ref: null, session: null, name: null }
  }
}

/**
 * Set URL parameters without reloading the page.
 * @param {Object} params - Key-value pairs to set
 */
export function setUrlParams(params) {
  try {
    const url = new URL(window.location.href)
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        url.searchParams.delete(key)
      } else {
        url.searchParams.set(key, value)
      }
    })
    window.history.replaceState({}, '', url.toString())
  } catch {
    // URL manipulation failed — silent
  }
}

/**
 * Generate a challenge URL for Mode 2.
 * @param {string} userId - The referrer's user ID
 * @returns {string} The challenge URL
 */
export function generateChallengeUrl(userId) {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('role', 'observer')
    url.searchParams.set('ref', userId)
    return url.toString()
  } catch {
    return window.location.href
  }
}

/**
 * Generate a result sharing URL.
 * @param {string} archetypeId - The resolved archetype
 * @param {string} userId - The player's user ID
 * @param {string} [playerName] - Optional player name
 * @returns {string} The shareable result URL
 */
export function generateResultUrl(archetypeId, userId, playerName) {
  try {
    const url = new URL(window.location.href)
    url.searchParams.set('archetype', archetypeId)
    url.searchParams.set('session', userId)
    if (playerName) url.searchParams.set('name', playerName)
    return url.toString()
  } catch {
    return window.location.href
  }
}

/**
 * Clear all game-related URL parameters.
 */
export function clearUrlParams() {
  setUrlParams({ role: null, archetype: null, ref: null, session: null, name: null })
}
