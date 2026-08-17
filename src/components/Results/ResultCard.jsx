import { useState } from 'react'
import { generateChallengeUrl, generateResultUrl } from '../../utils/urlParams.js'
import { getUserId } from '../../utils/caseMemory.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/ResultCard.module.css'

/**
 * ResultCard — shareable archetype result card with challenge functionality.
 * Displays after Mode 1 completion, showing archetype info and sharing options.
 * @param {{ archetype: object, duration: number, onChallenge: () => void }} props
 */
export default function ResultCard({ archetype, duration = 0, onChallenge }) {
  const [copied, setCopied] = useState(null)
  const userId = getUserId()

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const handleCopyLink = async () => {
    try {
      const url = generateResultUrl(archetype.id, userId)
      await navigator.clipboard.writeText(url)
      setCopied('link')
      playSfx('click')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback: select text
      const textArea = document.createElement('textarea')
      textArea.value = generateResultUrl(archetype.id, userId)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied('link')
      setTimeout(() => setCopied(null), 2000)
    }
  }

  const handleChallenge = async () => {
    try {
      const url = generateChallengeUrl(userId)
      await navigator.clipboard.writeText(url)
      setCopied('challenge')
      playSfx('click')
      if (onChallenge) onChallenge()
      setTimeout(() => setCopied(null), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = generateChallengeUrl(userId)
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied('challenge')
      if (onChallenge) onChallenge()
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.stamp} aria-hidden="true">
          Case Closed
        </span>
        <h2 className={styles.title}>{archetype.name}</h2>
        <p className={styles.profile}>{archetype.oceanProfile}</p>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Time</span>
          <span className={styles.statValue}>{formatDuration(duration)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Type</span>
          <span className={styles.statValue}>{archetype.jungianType}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopyLink}
        >
          {copied === 'link' ? '✓ Copied' : 'Copy Result Link'}
        </button>

        <button
          type="button"
          className={styles.challengeButton}
          onClick={handleChallenge}
        >
          {copied === 'challenge' ? '✓ Copied' : 'Challenge a Friend →'}
        </button>
      </div>

      <p className={styles.hint}>
        Share your result or challenge someone to read you back.
      </p>
    </div>
  )
}
