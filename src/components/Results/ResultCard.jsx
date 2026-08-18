import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { generateChallengeUrl, generateResultUrl } from '../../utils/urlParams.js'
import { getUserId } from '../../utils/caseMemory.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/ResultCard.module.css'

/**
 * ResultCard — shareable archetype result card with challenge functionality.
 * Displays after Mode 1 completion, showing archetype info and sharing options.
 * @param {{ archetype: object, duration: number, playerName: string|null, onChallenge: () => void }} props
 */
export default function ResultCard({ archetype, duration = 0, playerName = null, onChallenge }) {
  const [copied, setCopied] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const cardRef = useRef(null)
  const userId = getUserId()

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  const handleCopyLink = async () => {
    try {
      const url = generateResultUrl(archetype.id, userId, playerName)
      await navigator.clipboard.writeText(url)
      setCopied('link')
      playSfx('click')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = generateResultUrl(archetype.id, userId, playerName)
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

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      await document.fonts.ready
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0f0f0f',
        scale: 2,
        useCORS: true,
      })
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reading-into-you-${archetype.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        playSfx('click')
        setDownloading(false)
      }, 'image/png')
    } catch {
      setDownloading(false)
    }
  }

  return (
    <div className={styles.card} ref={cardRef}>
      <div className={styles.header}>
        <span className={styles.stamp} aria-hidden="true">
          Case Closed
        </span>
        {playerName && (
          <p className={styles.subjectLine}>Subject: {playerName}</p>
        )}
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
          className={styles.downloadButton}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Saving...' : 'Download Card'}
        </button>

        <button
          type="button"
          className={styles.copyButton}
          onClick={handleCopyLink}
        >
          {copied === 'link' ? '\u2713 Copied' : 'Copy Result Link'}
        </button>

        <button
          type="button"
          className={styles.challengeButton}
          onClick={handleChallenge}
        >
          {copied === 'challenge' ? '\u2713 Copied' : 'Challenge a Friend \u2192'}
        </button>
      </div>

      <p className={styles.hint}>
        Share your result or challenge someone to read you back.
      </p>
    </div>
  )
}
