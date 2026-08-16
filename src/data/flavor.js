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

/** Mode select screen copy. */
export const MODE_SELECT_COPY = {
  title: 'Choose your role.',
  mode1Tagline: 'Be read — twelve questions, one reveal.',
  mode1Name: 'The Subject',
  // Honest commitment (spec: both modes completable in under 5 minutes each).
  mode1Duration: 'Under five minutes',
  mode2Tagline: 'Read others — five dossiers, one rating.',
  mode2Name: 'The Observer',
  mode2Duration: 'Under five minutes',
}