import { getCaseCount, getStats, getCaseHistory, getPerformanceMetrics } from '../../utils/caseMemory.js'
import { playSfx } from '../../audio/uiSfx.js'
import ProgressTracker from './ProgressTracker.jsx'
import styles from '../../styles/StatsPage.module.css'

/**
 * StatsPage — real-time dashboard showing global and personal statistics.
 * Displays case count, performance metrics, and session history.
 * @param {{ onBack?: () => void }} props
 */
export default function StatsPage({ onBack }) {
  const caseCount = getCaseCount()
  const stats = getStats()
  const history = getCaseHistory()
  const performance = getPerformanceMetrics()

  // Format time
  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`
    const seconds = Math.floor(ms / 1000)
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Get most common archetype
  const archetypeFrequency = stats.archetypeFrequency || {}
  const mostCommon = Object.entries(archetypeFrequency).sort((a, b) => b[1] - a[1])[0]

  const handleBack = () => {
    playSfx('back')
    if (onBack) onBack()
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {onBack && (
          <button type="button" className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
        )}
        <h1 className={styles.title}>Case Statistics</h1>
        <p className={styles.subtitle}>Real-time analytics and performance</p>
      </header>

      <div className={styles.mainStats}>
        <div className={styles.bigStat}>
          <span className={styles.bigNumber}>{caseCount}</span>
          <span className={styles.bigLabel}>Total Cases</span>
        </div>

        {mostCommon && (
          <div className={styles.bigStat}>
            <span className={styles.bigNumber}>{mostCommon[0]}</span>
            <span className={styles.bigLabel}>Most Common</span>
          </div>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⏱</span>
          <span className={styles.statValue}>{formatTime(stats.totalTimePlayed * 1000)}</span>
          <span className={styles.statLabel}>Total Time</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIcon}>⚡</span>
          <span className={styles.statValue}>{formatTime(performance.averageResponseTime)}</span>
          <span className={styles.statLabel}>Avg Response</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIcon}>🎯</span>
          <span className={styles.statValue}>{Math.round(performance.answerConsistency * 100)}%</span>
          <span className={styles.statLabel}>Consistency</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statIcon}>📅</span>
          <span className={styles.statValue}>{stats.sessionsToday || 0}</span>
          <span className={styles.statLabel}>Today</span>
        </div>
      </div>

      <ProgressTracker />

      {history.length > 0 && (
        <section className={styles.historySection}>
          <h2 className={styles.sectionTitle}>Session Timeline</h2>
          <div className={styles.timeline}>
            {history.slice(0, 10).map((session, index) => (
              <div key={session.id} className={styles.timelineItem}>
                <div className={styles.timelineMarker} />
                <div className={styles.timelineContent}>
                  <div className={styles.timelineHeader}>
                    <span className={styles.timelineArchetype}>{session.archetype}</span>
                    <span className={styles.timelineMode}>{session.mode}</span>
                  </div>
                  <div className={styles.timelineDetails}>
                    <span className={styles.timelineDate}>{formatDate(session.date)}</span>
                    <span className={styles.timelineDuration}>{formatTime(session.duration * 1000)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {history.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No sessions recorded yet. Play a game to see your statistics.</p>
        </div>
      )}
    </div>
  )
}
