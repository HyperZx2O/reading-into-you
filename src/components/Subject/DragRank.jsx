import { useState } from 'react'

import styles from '../../styles/Subject.module.css'

/**
 * DragRank interaction — rank 4 items by dragging (mouse) or up/down buttons
 * (touch: HTML5 drag does not fire on touch, so buttons are the mobile path).
 * onAnswer receives rankedIndices: original option indices, top to bottom.
 * @param {{ question: object, onAnswer: (rankedIndices: number[]) => void }} props
 */
export default function DragRank({ question, onAnswer }) {
  const [order, setOrder] = useState(() => question.options.map((_, index) => index))
  const [dragged, setDragged] = useState(null)
  const [over, setOver] = useState(null)
  const [locked, setLocked] = useState(false)

  const move = (from, to) => {
    setOrder((prev) => {
      const next = [...prev]
      const [item] = next.splice(from, 1)
      next.splice(to, 0, item)
      return next
    })
  }

  const handleDrop = (to) => {
    if (dragged !== null && dragged !== to) move(dragged, to)
    setDragged(null)
    setOver(null)
  }

  const lock = () => {
    if (locked) return
    setLocked(true)
    onAnswer(order)
  }

  return (
    <div>
      <p className={styles.prompt}>{question.prompt}</p>
      <ul className={styles.rankList}>
        {order.map((itemIndex, position) => (
          <li
            key={itemIndex}
            className={`${styles.rankItem}${dragged === position ? ` ${styles.dragging}` : ''}${
              over === position && dragged !== null ? ` ${styles.dragOver}` : ''
            }`}
            draggable={!locked}
            onDragStart={() => setDragged(position)}
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
                onClick={() => move(position, position - 1)}
              >
                ↑
              </button>
              <button
                type="button"
                className={styles.rankButton}
                disabled={locked || position === order.length - 1}
                aria-label="Move down"
                onClick={() => move(position, position + 1)}
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
