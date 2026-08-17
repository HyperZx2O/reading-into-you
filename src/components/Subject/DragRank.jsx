import { useState } from 'react'

import { playSfx } from '../../audio/uiSfx.js'
import styles from '../../styles/Subject.module.css'

/**
 * DragRank interaction — rank 4 items by dragging (mouse) or up/down buttons
 * (touch: HTML5 drag does not fire on touch, so buttons are the mobile path).
 * onAnswer receives rankedIndices: original option indices, top to bottom.
 * Sound mapping: an item lifting plays `drag-start`; a committed move (drag
 * drop into a new slot, or a stepper tap) plays `reorder`; locking the
 * ranking plays `select` (the answer enters the active set).
 * @param {{ question: object, onAnswer: (rankedIndices: number[]) => void }} props
 */
export default function DragRank({ question, onAnswer }) {
  const [order, setOrder] = useState(() => question.options.map((_, index) => index))
  const [dragged, setDragged] = useState(null)
  const [over, setOver] = useState(null)
  const [locked, setLocked] = useState(false)
  const [announcement, setAnnouncement] = useState('')

  const move = (from, to) => {
    setOrder((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const handleDrop = (to) => {
    if (dragged !== null && dragged !== to) {
      move(dragged, to)
      playSfx('reorder')
    }
    setDragged(null)
    setOver(null)
  }

  const lock = () => {
    if (locked) return
    setLocked(true)
    playSfx('select')
    onAnswer(order)
  }

  return (
    <div className={styles.interaction}>
      <h2 className={styles.prompt}>{question.prompt}</h2>
      {/* Screen readers announce each move; visually hidden via the global sr-only class. */}
      <span className="sr-only" role="status">
        {announcement}
      </span>
      <ul className={styles.rankList}>
        {order.map((itemIndex, position) => (
          <li
            key={itemIndex}
            className={`${styles.rankItem}${dragged === position ? ` ${styles.dragging}` : ''}${
              over === position && dragged !== null ? ` ${styles.dragOver}` : ''
            }`}
            draggable={!locked}
            onDragStart={() => {
              // One drag at a time — a re-fired dragstart cannot stack the cue.
              if (dragged !== null) return
              setDragged(position)
              playSfx('drag-start')
            }}
            onDragOver={(event) => {
              event.preventDefault()
              if (position !== dragged) setOver(position)
            }}
            onDrop={() => handleDrop(position)}
            onDragEnd={() => {
              setDragged(null)
              setOver(null)
            }}
          >
            <span className={styles.rankPos}>{position + 1}</span>
            <span className={styles.rankText}>{question.options[itemIndex]}</span>
            <span className={styles.rankControls}>
              <button
                type="button"
                className={styles.rankButton}
                disabled={locked || position === 0}
                aria-label="Move up"
                onClick={() => {
                  if (locked || position === 0) return
                  move(position, position - 1)
                  playSfx('reorder')
                  setAnnouncement(`Moved "${question.options[order[position]]}" to rank ${position}`)
                }}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.rankButton}
                disabled={locked || position === order.length - 1}
                aria-label="Move down"
                onClick={() => {
                  if (locked || position === order.length - 1) return
                  move(position, position + 1)
                  playSfx('reorder')
                  setAnnouncement(
                    `Moved "${question.options[order[position]]}" to rank ${position + 2}`,
                  )
                }}
              >
                ↓
              </button>
            </span>
          </li>
        ))}
      </ul>
      <button type="button" className={styles.primaryBtn} disabled={locked} onClick={lock}>
        Lock in ranking
      </button>
    </div>
  )
}
