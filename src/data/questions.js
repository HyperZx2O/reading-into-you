/**
 * Mode 1 Question Pool — 25 questions across 3 acts
 *
 * Schema:
 * {
 *   id: string,
 *   act: 1 | 2 | 3,           // 1=Calibration, 2=Pressure, 3=Misdirection
 *   prompt: string,
 *   interactionType: 'multipleChoice' | 'imagePick' | 'wordInput' | 'dragRank',
 *   options: string[],         // for multipleChoice / imagePick / dragRank
 *   scoringMap: {              // archetypeId → points awarded for each option index
 *     [archetypeId]: number[]
 *   }
 * }
 *
 * Archetype IDs: sentinel, architect, mask, dreamer, outlaw, ghost, spark, pillar
 *
 * NOTE: Fill in prompt, options, and scoringMap for each stub below.
 * Keep at least 8 questions in act 1, 8 in act 2, and 9 in act 3.
 */

export const QUESTIONS = [
  // ── ACT 1: Calibration (8 questions) ────────────────────────

  {
    id: 'q01',
    act: 1,
    prompt: '', // TODO
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q02',
    act: 1,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q03',
    act: 1,
    prompt: '',
    interactionType: 'imagePick',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q04',
    act: 1,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q05',
    act: 1,
    prompt: '',
    interactionType: 'wordInput',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q06',
    act: 1,
    prompt: '',
    interactionType: 'dragRank',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q07',
    act: 1,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q08',
    act: 1,
    prompt: '',
    interactionType: 'imagePick',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },

  // ── ACT 2: Pressure (8 questions) ───────────────────────────

  {
    id: 'q09',
    act: 2,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q10',
    act: 2,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q11',
    act: 2,
    prompt: '',
    interactionType: 'wordInput',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q12',
    act: 2,
    prompt: '',
    interactionType: 'dragRank',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q13',
    act: 2,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q14',
    act: 2,
    prompt: '',
    interactionType: 'imagePick',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q15',
    act: 2,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q16',
    act: 2,
    prompt: '',
    interactionType: 'dragRank',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },

  // ── ACT 3: Misdirection (9 questions) ───────────────────────

  {
    id: 'q17',
    act: 3,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q18',
    act: 3,
    prompt: '',
    interactionType: 'imagePick',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q19',
    act: 3,
    prompt: '',
    interactionType: 'wordInput',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q20',
    act: 3,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q21',
    act: 3,
    prompt: '',
    interactionType: 'dragRank',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q22',
    act: 3,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q23',
    act: 3,
    prompt: '',
    interactionType: 'imagePick',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q24',
    act: 3,
    prompt: '',
    interactionType: 'multipleChoice',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
  {
    id: 'q25',
    act: 3,
    prompt: '',
    interactionType: 'wordInput',
    options: [],
    scoringMap: {
      sentinel: [], architect: [], mask: [], dreamer: [],
      outlaw: [], ghost: [], spark: [], pillar: [],
    },
  },
]
