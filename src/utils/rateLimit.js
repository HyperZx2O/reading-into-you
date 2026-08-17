/**
 * Rate Limiting (Client-Side) — prevents abuse without a server.
 * Uses localStorage to track session starts and validate data integrity.
 */

const COOLDOWN_KEY = 'jane_session_cooldown'
const COOLDOWN_MS = 30000 // 30 seconds between sessions
const MAX_SESSIONS_PER_DAY = 20
const SESSION_TOKEN_KEY = 'jane_session_token'

/**
 * Check if a session can be started (cooldown expired).
 * @returns {{ allowed: boolean, remainingMs: number }}
 */
export function canStartSession() {
  try {
    const lastStart = localStorage.getItem(COOLDOWN_KEY)
    if (!lastStart) return { allowed: true, remainingMs: 0 }

    const elapsed = Date.now() - parseInt(lastStart, 10)
    if (elapsed >= COOLDOWN_MS) {
      return { allowed: true, remainingMs: 0 }
    }

    return {
      allowed: false,
      remainingMs: COOLDOWN_MS - elapsed,
    }
  } catch {
    return { allowed: true, remainingMs: 0 }
  }
}

/**
 * Mark a session as started (set cooldown).
 */
export function markSessionStarted() {
  try {
    localStorage.setItem(COOLDOWN_KEY, String(Date.now()))
  } catch {
    // silent
  }
}

/**
 * Get remaining cooldown time in seconds.
 * @returns {number} Seconds until next session can start
 */
export function getCooldownRemaining() {
  const { remainingMs } = canStartSession()
  return Math.ceil(remainingMs / 1000)
}

/**
 * Generate a simple session token for validation.
 * @returns {string} Session token
 */
export function generateSessionToken() {
  const token = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token)
  } catch {
    // silent
  }
  return token
}

/**
 * Validate that a session token matches the stored one.
 * @param {string} token - Token to validate
 * @returns {boolean} Whether token is valid
 */
export function validateSessionToken(token) {
  try {
    const stored = localStorage.getItem(SESSION_TOKEN_KEY)
    return stored === token
  } catch {
    return false
  }
}

/**
 * Validate session data integrity (basic tamper detection).
 * @param {Object} sessionData - Session data to validate
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateSessionData(sessionData) {
  if (!sessionData) {
    return { valid: false, reason: 'No session data' }
  }

  // Check required fields
  const requiredFields = ['archetype', 'mode', 'duration']
  for (const field of requiredFields) {
    if (sessionData[field] === undefined || sessionData[field] === null) {
      return { valid: false, reason: `Missing field: ${field}` }
    }
  }

  // Validate archetype is one of the known types
  const validArchetypes = [
    'sentinel', 'architect', 'mask', 'dreamer',
    'outlaw', 'ghost', 'spark', 'pillar'
  ]
  if (!validArchetypes.includes(sessionData.archetype)) {
    return { valid: false, reason: 'Invalid archetype' }
  }

  // Validate mode
  if (!['subject', 'observer'].includes(sessionData.mode)) {
    return { valid: false, reason: 'Invalid mode' }
  }

  // Validate duration (reasonable range: 10s to 1 hour)
  if (typeof sessionData.duration !== 'number' ||
      sessionData.duration < 10 ||
      sessionData.duration > 3600) {
    return { valid: false, reason: 'Invalid duration' }
  }

  return { valid: true }
}

/**
 * Check if daily session limit reached.
 * @returns {boolean}
 */
export function hasReachedDailyLimit() {
  try {
    const count = parseInt(localStorage.getItem('jane_daily_sessions') || '0', 10)
    const lastDate = localStorage.getItem('jane_daily_date')
    const today = new Date().toDateString()

    if (lastDate !== today) {
      // New day, reset counter
      localStorage.setItem('jane_daily_date', today)
      localStorage.setItem('jane_daily_sessions', '0')
      return false
    }

    return count >= MAX_SESSIONS_PER_DAY
  } catch {
    return false
  }
}

/**
 * Increment daily session count.
 */
export function incrementDailyCount() {
  try {
    const today = new Date().toDateString()
    const lastDate = localStorage.getItem('jane_daily_date')

    if (lastDate !== today) {
      localStorage.setItem('jane_daily_date', today)
      localStorage.setItem('jane_daily_sessions', '1')
    } else {
      const count = parseInt(localStorage.getItem('jane_daily_sessions') || '0', 10)
      localStorage.setItem('jane_daily_sessions', String(count + 1))
    }
  } catch {
    // silent
  }
}
