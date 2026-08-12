/**
 * Observer Subjects — 8 fictional profiles for Mode 2
 *
 * Schema:
 * {
 *   id: string,
 *   name: string,
 *   behavioralNote: string,       // one-line summary Jane might say about them
 *   clues: string[],              // 5–7 text-annotation clues shown on dossier card
 *   questions: [                  // exactly 4 deduction questions per subject
 *     {
 *       id: string,
 *       prompt: string,
 *       options: string[4],       // always 4 options
 *       correctIndex: number,     // 0-based index of the correct option
 *       correctFeedback: string,  // Jane-style praise on correct answer
 *       wrongFeedback: string,    // Jane-style redirect on wrong answer
 *     }
 *   ]
 * }
 *
 * NOTE: Fill in all string fields and correctIndex values.
 */

export const SUBJECTS = [
  {
    id: 's01',
    name: '', // TODO
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      {
        id: 's01q1',
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        correctFeedback: '',
        wrongFeedback: '',
      },
      {
        id: 's01q2',
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        correctFeedback: '',
        wrongFeedback: '',
      },
      {
        id: 's01q3',
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        correctFeedback: '',
        wrongFeedback: '',
      },
      {
        id: 's01q4',
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        correctFeedback: '',
        wrongFeedback: '',
      },
    ],
  },
  {
    id: 's02',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's02q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's02q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's02q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's02q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
  {
    id: 's03',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's03q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's03q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's03q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's03q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
  {
    id: 's04',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's04q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's04q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's04q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's04q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
  {
    id: 's05',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's05q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's05q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's05q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's05q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
  {
    id: 's06',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's06q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's06q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's06q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's06q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
  {
    id: 's07',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's07q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's07q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's07q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's07q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
  {
    id: 's08',
    name: '',
    behavioralNote: '',
    clues: ['', '', '', '', ''],
    questions: [
      { id: 's08q1', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's08q2', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's08q3', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
      { id: 's08q4', prompt: '', options: ['', '', '', ''], correctIndex: 0, correctFeedback: '', wrongFeedback: '' },
    ],
  },
]

/** Lookup helper */
export const getSubjectById = (id) => SUBJECTS.find((s) => s.id === id)
