import { readUrlParams } from '../../utils/urlParams.js'
import { getArchetypeById } from '../../data/archetypes.js'
import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Reveal.module.css'
import viewStyles from '../../styles/ViewResult.module.css'

export default function ViewResult({ onPlay }) {
  const { archetype: archetypeId, name } = readUrlParams()
  const archetype = archetypeId ? getArchetypeById(archetypeId) : null

  if (!archetype) {
    return (
      <main className={styles.screen}>
        <div className={styles.card}>
          <h1 className={styles.cardTitle}>Unknown Case File</h1>
          <p className={styles.callout}>
            This result link is invalid or expired.
          </p>
          <button
            type="button"
            className={styles.playAgain}
            onClick={() => {
              playSfx('click')
              onPlay()
            }}
          >
            Play yourself
          </button>
        </div>
      </main>
    )
  }

  const shadow = getArchetypeById(archetype.shadowArchetypeId)

  return (
    <main className={styles.screen}>
      <section className={styles.card}>
        <span className={styles.stamp} aria-hidden="true">
          Case Closed
        </span>
        {name && (
          <p className={viewStyles.subjectLine}>Subject: {name}</p>
        )}
        <h1 className={styles.cardTitle}>{archetype.name}</h1>
        <p className={viewStyles.profile}>{archetype.oceanProfile}</p>
        <p className={viewStyles.type}>{archetype.jungianType}</p>

        <div className={viewStyles.monologueSection}>
          <h2 className={viewStyles.sectionLabel}>Jane&apos;s Verdict</h2>
          {archetype.monologue.map((line, i) => (
            <p key={i} className={styles.monologue}>
              {line}
            </p>
          ))}
        </div>

        <div>
          <h2 className={viewStyles.sectionLabel}>How Jane Knew</h2>
          <ul className={styles.callouts}>
            {archetype.howJaneKnew.map((callout) => (
              <li key={callout} className={styles.callout}>
                {callout}
              </li>
            ))}
          </ul>
        </div>

        {shadow && (
          <p className={styles.shadowLine}>
            Shadow archetype: {shadow.name}
          </p>
        )}

        <div className={viewStyles.actions}>
          <button
            type="button"
            className={styles.playAgain}
            onClick={() => {
              playSfx('click')
              onPlay()
            }}
          >
            Play yourself
          </button>
        </div>
      </section>
    </main>
  )
}
