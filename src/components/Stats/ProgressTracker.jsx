import { getCaseCount, getStats, getCaseHistory } from '../../utils/caseMemory.js'
import styles from '../../styles/ProgressTracker.module.css'

/**
 * ProgressTracker — shows progression metrics across sessions.
 * Displays case number, archetype distribution, and session stats.
 */
export default function ProgressTracker() {
  const caseCount = getCaseCount()
  const stats = getStats()
  const history = getCaseHistory()

  // Calculate archetype distribution
  const archetypeFrequency = stats.archetypeFrequency || {}
  const totalSessions = Object.values(archetypeFrequency).reduce((a, b) => a + b, 0)

  // Get most frequent archetype
  const mostFrequent = Object.entries(archetypeFrequency).sort((a, b) => b[1] - a[1])[0]

  // Format time played
  const formatTime = (seconds) => {
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

  if (caseCount === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>No case files yet. Start your first session to begin tracking progress.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Case File #{String(caseCount).padStart(3, '0')}</h2>
        <p className={styles.subtitle}>Your progress so far</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{caseCount}</span>
          <span className={styles.statLabel}>Sessions</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatTime(stats.totalTimePlayed)}</span>
          <span className={styles.statLabel}>Time Played</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatTime(stats.averageDuration)}</span>
          <span className={styles.statLabel}>Avg Duration</span>
        </div>

        {mostFrequent && (
          <div className={styles.statCard}>
            <span className={styles.statValue}>{mostFrequent[0]}</span>
            <span className={styles.statLabel}>Most Frequent</span>
          </div>
        )}
      </div>

      {totalSessions > 0 && (
        <div className={styles.archetypeSection}>
          <h3 className={styles.sectionTitle}>Archetype Distribution</h3>
          <div className={styles.archetypeGrid}>
            {Object.entries(archetypeFrequency)
              .sort((a, b) => b[1] - a[1])
              .map(([archetype, count]) => (
                <div key={archetype} className={styles.archetypeItem}>
                  <div className={styles.archetypeHeader}>
                    <span className={styles.archetypeName}>{archetype}</span>
                    <span className={styles.archetypeCount}>{count}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${(count / totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>Recent Sessions</h3>
          <div className={styles.historyList}>
            {history.slice(0, 5).map((session) => (
              <div key={session.id} className={styles.historyItem}>
                <div className={styles.historyMeta}>
                  <span className={styles.historyArchetype}>{session.archetype}</span>
                  <span className={styles.historyMode}>{session.mode}</span>
                </div>
                <div className={styles.historyDetails}>
                  <span className={styles.historyDate}>{formatDate(session.date)}</span>
                  <span className={styles.historyDuration}>{formatTime(session.duration)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
