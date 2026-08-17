/**
 * Flavor copy — all authored strings that are neither questions nor subjects.
 * Keeps Global Rule 9 ("all content lives in data files") — components render
 * these, never hardcode them.
 */

/** Mode 2 final-score remarks, one per rating tier (plan Phase 5, exact text). */
export const RATING_REMARKS = {
  Rookie: 'You looked without seeing. There is a difference.',
  Investigator: 'You noticed some of it. The rest was looking you in the face.',
  Consultant: 'Not bad. You caught what most people miss. You missed what I never do.',
  'Senior Agent': 'You have the eye. You just need to trust it faster.',
  'Patrick Jane': "I'm almost impressed. Almost.",
}

/** Jane's mid-session reactions at Mode 2 subjects 3 and 5 (nice-to-have). */
export const REACTIONS_GOOD = [
  'Hmm. You are picking up what I am putting down.',
  'Careful — an eye that sharp starts to look like cheating.',
]

export const REACTIONS_ROUGH = [
  'You are reading the words, not the person. Try the spaces between.',
  'Still staring at the obvious. The obvious is where I hide things.',
]

/** WordInput validation — the only moment Mode 1 breaks its silence. */
export const WORD_INPUT_ERROR = 'Silence is not an answer.'

/** Mode 2 rating remarks that reference the last run (P6) — Jane remembers.
 * Each is a function of the previous run's tier label; the direction is
 * chosen by comparing the current score to the previous one. */
export const LAST_RUN_REMARKS = {
  up: (label) => `Last time: ${label}. You are learning — or cheating.`,
  down: (label) => `Last time: ${label}. Or slipping.`,
  same: (label) => `Last time: ${label}. The same. I wondered.`,
}

/** Mode 2 opener (P6) — Jane names the type you were read as in Mode 1. */
export const KNOWN_TYPE_LINE = (name) =>
  `You came in as ${name} last time. I have not forgotten.`

/** Mode 1 mid-session reactions (P3) — Jane notices patterns. */
export const REACTIONS = {
  // theme id -> the noun Jane names when she catches you repeating it
  themeNouns: {
    security: 'the locked door',
    freedom: 'the open road',
    people: 'the crowded room',
    solitude: 'the quiet corner',
  },
  // Third pick of the same behavioral theme.
  repeat: (noun) => `Third time you picked ${noun}. I made a note.`,
  // A slow answer — longer than the session's pace would allow.
  hesitation: 'You hesitated on that one. I made a note.',
  // The Act 2 clock beat the player — the strongest form of hesitation.
  timedOut: 'You let the clock beat you. I did not.',
  // Opposing theme pairs both read twice — the sharpest read of all.
  inconsistency: {
    'security-freedom': 'The locked door, then the open road. Which is it?',
    'people-solitude': 'A crowded room, then the quiet corner. Which is it?',
  },
}

/** Mode 2 casebook copy (P2) — the player's own read of each subject. */
export const CASEBOOK_COPY = {
  noteLabel: 'My read (optional)',
  notePlaceholder: 'One line on this person…',
  sectionTitle: 'Your reads, beside hers.',
  you: 'You',
  jane: 'Jane',
  // Skipped subjects still get a row — Jane read them whether you did or not.
  skipped: '—',
}

/** Mode 2 batch-reveal copy (P1) — Jane turns the page. */
export const REVEAL_COPY = {
  eyebrow: 'Case notes —',
  heading: 'The page turns.',
  summary: (correct, total) => `${correct} of ${total} read correctly.`,
  // Wrongs stay blank — she does not correct you, she marks you.
  someWrong: 'You guessed. I do not guess.',
  // The one moment Jane lets herself be impressed.
  allCorrect: 'All four, first try. I did not expect that.',
  turnPage: 'Turn the page',
  closeCase: 'Close the case',
  skip: 'Skip',
}

/** Mode 1 rhythm breaks (P7) — the turn-over tap of the face-down question. */
export const SUBJECT_COPY = {
  turnOver: 'Turn over',
}

/** Mode select screen copy. */
export const MODE_SELECT_COPY = {
  title: 'Two files. Two roles.',
  mode1Tagline: 'Be read — twelve questions, one reveal.',
  mode1Name: 'The Subject',
  // Honest commitment (spec: both modes completable in under 5 minutes each).
  mode1Duration: 'Under five minutes',
  mode2Tagline: 'Read others — five dossiers, one rating.',
  mode2Name: 'The Observer',
  mode2Duration: 'Under five minutes',
}