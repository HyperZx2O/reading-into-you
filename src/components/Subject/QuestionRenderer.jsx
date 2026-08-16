import MultipleChoice from './MultipleChoice.jsx'
import ImagePick from './ImagePick.jsx'
import WordInput from './WordInput.jsx'
import DragRank from './DragRank.jsx'
import styles from '../../styles/Subject.module.css'

/**
 * QuestionRenderer — routes to the interaction component matching
 * question.interactionType.
 * @param {{ question: object, questionNumber: number, onAnswer: Function }} props
 */
const INTERACTION_COMPONENTS = {
  multipleChoice: MultipleChoice,
  imagePick: ImagePick,
  wordInput: WordInput,
  dragRank: DragRank,
}

export default function QuestionRenderer({ question, questionNumber, onAnswer }) {
  const Interaction = INTERACTION_COMPONENTS[question.interactionType]

  if (!Interaction) {
    // Edge case: unknown interactionType. Phase 9 hardens this path.
    console.warn(`QuestionRenderer: unknown interactionType "${question.interactionType}"`)
    return null
  }

  return (
    <div className={styles.question}>
      {/* ponytail: ProgressBar is Person B's component — inline fallback for now */}
      <p className={styles.progress}>{questionNumber} / 12</p>
      <Interaction question={question} onAnswer={onAnswer} />
    </div>
  )
}
