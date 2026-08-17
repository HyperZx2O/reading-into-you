import { useState } from 'react'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/EmbedWidget.module.css'

/**
 * EmbedWidget — generates an embeddable iframe snippet for blogs/portfolios.
 * Shows a preview of how the embed will look and provides copy functionality.
 * @param {{ archetype: string, title?: string }} props
 */
export default function EmbedWidget({ archetype, title = 'Reading Into You' }) {
  const [copied, setCopied] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(400)
  const [previewHeight, setPreviewHeight] = useState(600)

  const getEmbedUrl = () => {
    const baseUrl = window.location.origin
    return `${baseUrl}/?embed=true&archetype=${archetype}`
  }

  const getEmbedCode = () => {
    const url = getEmbedUrl()
    return `<iframe src="${url}" width="${previewWidth}" height="${previewHeight}" frameborder="0" title="${title} - Embed" loading="lazy" style="border: 1px solid #333; border-radius: 8px;"></iframe>`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getEmbedCode())
      setCopied(true)
      playSfx('click')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textArea = document.createElement('textarea')
      textArea.value = getEmbedCode()
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Embed Widget</h3>
        <p className={styles.description}>
          Add this game to your blog, portfolio, or website.
        </p>
      </div>

      <div className={styles.previewSection}>
        <div className={styles.previewControls}>
          <label className={styles.control}>
            <span className={styles.controlLabel}>Width</span>
            <input
              type="number"
              className={styles.controlInput}
              value={previewWidth}
              onChange={(e) => setPreviewWidth(parseInt(e.target.value, 10) || 400)}
              min="300"
              max="1200"
            />
          </label>
          <label className={styles.control}>
            <span className={styles.controlLabel}>Height</span>
            <input
              type="number"
              className={styles.controlInput}
              value={previewHeight}
              onChange={(e) => setPreviewHeight(parseInt(e.target.value, 10) || 600)}
              min="400"
              max="900"
            />
          </label>
        </div>

        <div className={styles.preview}>
          <div
            className={styles.previewFrame}
            style={{ width: `${Math.min(previewWidth, 400)}px`, height: `${Math.min(previewHeight, 600)}px` }}
          >
            <div className={styles.previewPlaceholder}>
              <span className={styles.previewIcon}>👁</span>
              <span className={styles.previewText}>Embed Preview</span>
              <span className={styles.previewUrl}>{getEmbedUrl()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.codeSection}>
        <label className={styles.codeLabel}>Embed Code</label>
        <div className={styles.codeBlock}>
          <code className={styles.code}>{getEmbedCode()}</code>
        </div>
      </div>

      <button
        type="button"
        className={styles.copyButton}
        onClick={handleCopy}
      >
        {copied ? '✓ Copied to Clipboard' : 'Copy Embed Code'}
      </button>

      <div className={styles.instructions}>
        <h4 className={styles.instructionsTitle}>How to use</h4>
        <ol className={styles.instructionsList}>
          <li>Copy the embed code above</li>
          <li>Paste it into your HTML where you want the game to appear</li>
          <li>Adjust width and height as needed</li>
        </ol>
      </div>
    </div>
  )
}
