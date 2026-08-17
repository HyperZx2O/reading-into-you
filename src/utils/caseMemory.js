// The world remembers (P6). localStorage persistence for:
// - Last 3 Mode 2 scores (jane_mode2_scores)
// - Last completed Mode 1 archetype (jane_last_archetype)
// - Case history with all completed sessions (jane_case_history)
// - Total session count (jane_case_count)
// - Player stats (jane_stats)
// - Unlocked features (jane_unlocks)
// - Unique user ID (jane_user_id)
// - Referral count (jane_referral_count)
//
// Every read/write is guarded — storage failure is a nice-to-have lost,
// never a crash.

const SCORE_KEY = 'jane_mode2_scores'
const ARCHETYPE_KEY = 'jane_last_archetype'
const CASE_HISTORY_KEY = 'jane_case_history'
const CASE_COUNT_KEY = 'jane_case_count'
const STATS_KEY = 'jane_stats'
const UNLOCKS_KEY = 'jane_unlocks'
const USER_ID_KEY = 'jane_user_id'
const REFERRAL_KEY = 'jane_referral_count'
const INTRO_KEY = 'jane_intro_seen'
const SOUND_KEY = 'jane_sound_enabled'

const MAX_SCORE_ENTRIES = 3
const MAX_HISTORY_ENTRIES = 50
const MAX_SESSIONS_PER_DAY = 20

// ── Score History ────────────────────────────────────────────────────────

/** Last up-to-3 recorded scores, newest first. Never throws. */
export function getScoreHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SCORE_KEY) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed.filter((n) => typeof n === 'number').slice(0, MAX_SCORE_ENTRIES)
  } catch {
    return []
  }
}

/** Prepend a score, keep the newest 3. Returns the new history. */
export function recordScore(score) {
  try {
    const next = [score, ...getScoreHistory()].slice(0, MAX_SCORE_ENTRIES)
    localStorage.setItem(SCORE_KEY, JSON.stringify(next))
    return next
  } catch {
    return [score]
  }
}

// ── Last Archetype ───────────────────────────────────────────────────────

/**
 * Remember the Mode 1 archetype a completed session resolved to.
 * Completion-only: an abandoned run leaves no trace.
 */
export function rememberArchetype(archetypeId) {
  try {
    localStorage.setItem(ARCHETYPE_KEY, String(archetypeId))
  } catch {
    // storage unavailable — the memory is a nice-to-have
  }
}

/** The last completed Mode 1 archetype id, or null. Never throws. */
export function getLastArchetype() {
  try {
    return localStorage.getItem(ARCHETYPE_KEY)
  } catch {
    return null
  }
}

// ── Case History ─────────────────────────────────────────────────────────

/**
 * Record a completed session in case history.
 * @param {Object} session - { archetype, mode, duration, answers, scores }
 */
export function recordSession(session) {
  try {
    const history = getCaseHistory()
    const entry = {
      id: `session_${Date.now()}`,
      archetype: session.archetype,
      mode: session.mode,
      date: new Date().toISOString(),
      duration: session.duration || 0,
      answers: session.answers || [],
      scores: session.scores || {},
    }
    const updated = [entry, ...history].slice(0, MAX_HISTORY_ENTRIES)
    localStorage.setItem(CASE_HISTORY_KEY, JSON.stringify(updated))
    incrementCaseCount()
    return updated
  } catch {
    return []
  }
}

/** Get all recorded case history, newest first. Never throws. */
export function getCaseHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CASE_HISTORY_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ── Case Count ───────────────────────────────────────────────────────────

/** Increment the total case count. Returns new count. */
export function incrementCaseCount() {
  try {
    const current = getCaseCount()
    const next = current + 1
    localStorage.setItem(CASE_COUNT_KEY, String(next))
    return next
  } catch {
    return 0
  }
}

/** Get total completed sessions. Never throws. */
export function getCaseCount() {
  try {
    return parseInt(localStorage.getItem(CASE_COUNT_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}

// ── Stats ────────────────────────────────────────────────────────────────

/** Get aggregated stats. Never throws. */
export function getStats() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STATS_KEY) || '{}')
    return {
      totalTimePlayed: parsed.totalTimePlayed || 0,
      sessionsToday: parsed.sessionsToday || 0,
      lastSessionDate: parsed.lastSessionDate || null,
      averageDuration: parsed.averageDuration || 0,
      archetypeFrequency: parsed.archetypeFrequency || {},
      ...parsed,
    }
  } catch {
    return {
      totalTimePlayed: 0,
      sessionsToday: 0,
      lastSessionDate: null,
      averageDuration: 0,
      archetypeFrequency: {},
    }
  }
}

/** Update stats after a session completes. */
export function updateStats(sessionData) {
  try {
    const stats = getStats()
    const today = new Date().toDateString()

    // Reset daily counter if it's a new day
    if (stats.lastSessionDate !== today) {
      stats.sessionsToday = 0
    }

    stats.sessionsToday += 1
    stats.totalTimePlayed += sessionData.duration || 0
    stats.lastSessionDate = today

    // Update average duration
    const totalSessions = getCaseCount()
    if (totalSessions > 0) {
      stats.averageDuration = Math.round(stats.totalTimePlayed / totalSessions)
    }

    // Update archetype frequency
    if (sessionData.archetype) {
      stats.archetypeFrequency[sessionData.archetype] =
        (stats.archetypeFrequency[sessionData.archetype] || 0) + 1
    }

    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
    return stats
  } catch {
    return getStats()
  }
}

/** Check if daily session limit reached. */
export function hasReachedDailyLimit() {
  try {
    const stats = getStats()
    const today = new Date().toDateString()
    if (stats.lastSessionDate !== today) return false
    return stats.sessionsToday >= MAX_SESSIONS_PER_DAY
  } catch {
    return false
  }
}

// ── Unlocks ──────────────────────────────────────────────────────────────

/** Get list of unlocked features. Never throws. */
export function getUnlocks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(UNLOCKS_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Unlock a feature. Returns updated unlocks list. */
export function unlockFeature(featureId) {
  try {
    const current = getUnlocks()
    if (current.includes(featureId)) return current
    const updated = [...current, featureId]
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify(updated))
    return updated
  } catch {
    return [featureId]
  }
}

/** Check if a feature is unlocked. */
export function isUnlocked(featureId) {
  return getUnlocks().includes(featureId)
}

// ── User ID ──────────────────────────────────────────────────────────────

/** Get or create a unique user ID. Never throws. */
export function getUserId() {
  try {
    let id = localStorage.getItem(USER_ID_KEY)
    if (!id) {
      id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
      localStorage.setItem(USER_ID_KEY, id)
    }
    return id
  } catch {
    return 'anonymous'
  }
}

// ── Referrals ────────────────────────────────────────────────────────────

/** Increment referral count (when someone plays via your link). */
export function incrementReferral() {
  try {
    const current = getReferralCount()
    const next = current + 1
    localStorage.setItem(REFERRAL_KEY, String(next))
    // Unlock referral milestone
    if (next >= 3) unlockFeature('referral_3')
    if (next >= 10) unlockFeature('referral_10')
    return next
  } catch {
    return 0
  }
}

/** Get total referrals. Never throws. */
export function getReferralCount() {
  try {
    return parseInt(localStorage.getItem(REFERRAL_KEY) || '0', 10) || 0
  } catch {
    return 0
  }
}

// ── Convenience Checks ───────────────────────────────────────────────────

/** Has the player completed the intro? */
export function hasSeenIntro() {
  try {
    return localStorage.getItem(INTRO_KEY) === 'true'
  } catch {
    return false
  }
}

/** Mark intro as seen. */
export function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_KEY, 'true')
  } catch {
    // silent
  }
}

/** Is sound enabled? */
export function isSoundEnabled() {
  try {
    return localStorage.getItem(SOUND_KEY) !== 'false'
  } catch {
    return true
  }
}

/** Toggle sound preference. */
export function setSoundEnabled(enabled) {
  try {
    localStorage.setItem(SOUND_KEY, String(enabled))
  } catch {
    // silent
  }
}

// ── Adaptive Difficulty Helpers ───────────────────────────────────────────

/** Get performance metrics for adaptive difficulty. */
export function getPerformanceMetrics() {
  try {
    const parsed = JSON.parse(localStorage.getItem('jane_performance') || '{}')
    return {
      averageResponseTime: parsed.averageResponseTime || 0,
      answerConsistency: parsed.answerConsistency || 0,
      sessionCount: parsed.sessionCount || 0,
      responseTimes: parsed.responseTimes || [],
    }
  } catch {
    return {
      averageResponseTime: 0,
      answerConsistency: 0,
      sessionCount: 0,
      responseTimes: [],
    }
  }
}

/** Update performance metrics after a session. */
export function updatePerformanceMetrics(sessionData) {
  try {
    const metrics = getPerformanceMetrics()
    const newSessionCount = metrics.sessionCount + 1

    // Update average response time
    if (sessionData.timings && sessionData.timings.length > 0) {
      const avgTime = sessionData.timings.reduce((a, b) => a + b, 0) / sessionData.timings.length
      metrics.averageResponseTime = Math.round(
        (metrics.averageResponseTime * metrics.sessionCount + avgTime) / newSessionCount
      )
      metrics.responseTimes = [...metrics.responseTimes, ...sessionData.timings].slice(-50)
    }

    // Update consistency (simplified: lower variance = higher consistency)
    if (sessionData.answers) {
      const variance = calculateAnswerVariance(sessionData.answers)
      metrics.answerConsistency = Math.max(0, 1 - variance)
    }

    metrics.sessionCount = newSessionCount
    localStorage.setItem('jane_performance', JSON.stringify(metrics))
    return metrics
  } catch {
    return getPerformanceMetrics()
  }
}

/** Calculate variance in answers (simplified metric). */
function calculateAnswerVariance(answers) {
  const validAnswers = answers.filter((a) => a !== null && a !== undefined)
  if (validAnswers.length === 0) return 0
  const avg = validAnswers.reduce((a, b) => a + b, 0) / validAnswers.length
  const variance = validAnswers.reduce((sum, a) => sum + Math.pow(a - avg, 2), 0) / validAnswers.length
  return Math.min(1, variance / 10) // Normalize to 0-1
}
