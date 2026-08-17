/**
 * Mode 1 Question Pool — 25 questions across 3 acts
 *
 * Schema:
 * {
 *   id: string,
 *   act: 1 | 2 | 3,           // 1=Calibration, 2=Pressure, 3=Misdirection
 *   prompt: string,
 *   interactionType: 'multipleChoice' | 'imagePick' | 'wordInput' | 'dragRank',
 *   difficulty: 'easy' | 'medium' | 'hard',  // For adaptive difficulty
 *   options: string[],         // for multipleChoice / imagePick / dragRank
 *   scoringMap: {              // archetypeId → points awarded for each option index
 *     [archetypeId]: number[]
 *   },
 *   revealQuote: {             // wordInput only — Jane quotes the answer back (P2)
 *     before: string,          //   sentence up to the player's answer
 *     after: string            //   sentence after it ("…That was the tell.")
 *   },
 *   themes: {                  // option index -> behavioral theme, for Jane's
 *     [theme]: number[]        //   mid-session pattern reads (P3): security,
 *   }                          //   freedom, people, solitude
 *   prelude: string,           // Jane waits (P7) — her typed line plays before
 *                              //   the options render. Never on Act 2, never
 *                              //   stacked with faceDown.
 *   faceDown: true,            // options start face-down behind a turn-over
 *                              //   tap (P7). Option interactions only.
 *   misdirection: true,        // Act 3 misdirection questions
 * }
 *
 * Difficulty levels:
 * - easy: Clear options, straightforward choices, familiar scenarios
 * - medium: Moderate ambiguity, requires some self-reflection
 * - hard: High ambiguity, misdirection, abstract concepts, or complex scenarios
 *
 * Archetype IDs: sentinel, architect, mask, dreamer, outlaw, ghost, spark, pillar
 *
 * Scoring rules:
 * - multipleChoice / imagePick: one value per option (0–3)
 * - dragRank: 4 values, one per option index. Entry [i] = points awarded if
 *   option i is ranked FIRST; scoring scales linearly by actual rank
 *   position (rank 1 = full value, rank 4 = 0). Implement by scanning each
 *   archetype's weighted entry (the max/non-zero value) and scaling by the
 *   rank position of that option — NOT by reading array index 0.
 * - wordInput: exactly 1 value per archetype (score for a keyword-matching
 *   response — keyword matching is handled by scoring in Phase 5)
 */

export const QUESTIONS = [
  // ── ACT 1: Calibration (8 questions) ────────────────────────

  // q01 — Calibration opener. The options split the four poles of the game:
  // exits = vigilance (sentinel), arrangement = systems-reading (architect),
  // 'who is watching whom' = observation (ghost). Sets the room-scanning frame.
  {
    id: 'q01',
    act: 1,
    prompt: 'You walk into a room full of strangers. What do you notice first?',
    interactionType: 'multipleChoice',
    difficulty: 'easy',
    options: [
      'The exits — and who is closest to them',
      'How people are arranged — who stands where',
      'The most interesting person in the room',
      'Who is watching whom',
    ],
    scoringMap: {
      sentinel: [3, 0, 0, 1],
      architect: [0, 3, 0, 1],
      mask: [0, 1, 0, 2],
      dreamer: [0, 0, 1, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [1, 0, 0, 3],
      spark: [0, 0, 3, 0],
      pillar: [0, 0, 0, 0],
    },
    themes: { security: [0], people: [2] },
  },
  {
    id: 'q02',
    act: 1,
    prompt: 'A free afternoon, entirely yours. How do you spend it?',
    prelude: 'A free afternoon is a confession. I am watching.',
    interactionType: 'multipleChoice',
    difficulty: 'easy',
    options: [
      'Plan something — and actually do it',
      'Call everyone I love and make plans',
      'Wander with no destination',
      'Stay home and put the world on mute',
    ],
    scoringMap: {
      sentinel: [0, 0, 0, 0],
      architect: [3, 0, 0, 0],
      mask: [0, 3, 0, 0],
      dreamer: [0, 0, 3, 1],
      outlaw: [0, 0, 2, 0],
      ghost: [0, 0, 1, 3],
      spark: [0, 3, 0, 0],
      pillar: [1, 0, 0, 0],
    },
    themes: { people: [1], freedom: [2], solitude: [3] },
  },
  {
    id: 'q03',
    act: 1,
    prompt: 'Pick a view that draws you in.',
    interactionType: 'imagePick',
    difficulty: 'easy',
    options: [
      'A wide, endless ocean',
      'A city from above — streets like circuits',
      'A crowded room, mid-laugh',
      'A lone figure in a doorway',
    ],
    scoringMap: {
      sentinel: [0, 1, 0, 2],
      architect: [0, 3, 0, 0],
      mask: [0, 0, 3, 0],
      dreamer: [3, 0, 0, 1],
      outlaw: [0, 0, 0, 0],
      ghost: [1, 0, 0, 3],
      spark: [0, 0, 3, 0],
      pillar: [0, 0, 0, 0],
    },
    themes: { freedom: [0], people: [2], solitude: [3] },
  },
  {
    id: 'q04',
    act: 1,
    prompt: 'A friend asks for your advice on something you know nothing about. You…',
    interactionType: 'multipleChoice',
    difficulty: 'medium',
    options: [
      'Say so, and help them think it through',
      'Give them the confidence they need to hear',
      'Tell them a story — they will find their answer in it',
      'Ask enough questions to make them solve it themselves',
    ],
    scoringMap: {
      sentinel: [0, 0, 0, 0],
      architect: [2, 0, 0, 1],
      mask: [0, 3, 0, 1],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 0, 1, 3],
      spark: [0, 1, 0, 0],
      pillar: [3, 0, 0, 0],
    },
  },
  // q05 — wordInput (free text). Scored by keyword matching in utils/scoring.js;
  // an archetype only scores when its keywords appear. Broad support (7/8
  // archetypes have a weight) keeps it a safe, non-punishing opener.
  {
    id: 'q05',
    act: 1,
    prompt: 'Name one thing you could not live without.',
    interactionType: 'wordInput',
    difficulty: 'easy',
    options: [],
    keywords: {
      sentinel: ['keys', 'security', 'safety', 'home', 'routine'],
      architect: ['planner', 'plan', 'schedule', 'laptop', 'notebook', 'to-do'],
      mask: [],
      dreamer: ['music', 'book', 'imagination', 'dream', 'art'],
      outlaw: ['freedom', 'independence', 'liberty', 'spontaneity'],
      ghost: ['silence', 'privacy', 'solitude', 'quiet', 'peace'],
      spark: ['people', 'friends', 'music', 'laughter', 'attention'],
      pillar: ['family', 'faith', 'friends', 'love', 'health'],
    },
    scoringMap: {
      sentinel: [2],
      architect: [2],
      mask: [0],
      dreamer: [2],
      outlaw: [3],
      ghost: [2],
      spark: [2],
      pillar: [2],
    },
    // The reveal quotes this answer back (P2).
    revealQuote: {
      before: 'You said you could not live without ',
      after: '. That was the tell.',
    },
  },
  // q06 — dragRank. Each archetype's single non-zero entry marks its signature
  // item; ranking that item first = full points, scaled linearly down to 0 at
  // rank 4. Security/Freedom/Beauty/Order splits the four poles cleanly.
  {
    id: 'q06',
    act: 1,
    prompt: 'Rank what a home must have, most to least important.',
    interactionType: 'dragRank',
    difficulty: 'medium',
    options: ['Security', 'Freedom', 'Beauty', 'Order'],
    scoringMap: {
      sentinel: [3, 0, 0, 0],
      architect: [0, 0, 0, 3],
      mask: [0, 0, 0, 0],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 3, 0, 0],
      ghost: [0, 0, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [0, 0, 0, 0],
    },
    themes: { security: [0], freedom: [1] },
  },
  {
    id: 'q07',
    act: 1,
    prompt: 'In a group photo, where are you?',
    interactionType: 'multipleChoice',
    difficulty: 'easy',
    options: [
      'Front and center, arm around someone',
      'Off to the side, laughing',
      'Behind everyone, half-hidden',
      'The one making sure everyone is in frame',
    ],
    scoringMap: {
      sentinel: [0, 0, 0, 1],
      architect: [0, 0, 0, 2],
      mask: [2, 3, 0, 0],
      dreamer: [0, 0, 0, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 0, 3, 0],
      spark: [3, 1, 0, 0],
      pillar: [0, 0, 0, 2],
    },
    themes: { people: [0], solitude: [2] },
  },
  {
    id: 'q08',
    act: 1,
    prompt: 'Pick a room you would want to live in.',
    interactionType: 'imagePick',
    difficulty: 'medium',
    options: [
      'A study walled with books and one window',
      'A penthouse with glass walls, all light',
      'A cabin with thick walls and a locked door',
      'An open loft above a busy street',
    ],
    scoringMap: {
      sentinel: [0, 0, 2, 0],
      architect: [1, 0, 0, 0],
      mask: [0, 3, 0, 0],
      dreamer: [2, 0, 0, 1],
      outlaw: [0, 0, 0, 3],
      ghost: [2, 0, 1, 0],
      spark: [0, 2, 0, 1],
      pillar: [0, 0, 0, 0],
    },
    themes: { solitude: [0], security: [2], freedom: [3] },
  },

  // ── ACT 2: Pressure (8 questions) ───────────────────────────

  {
    id: 'q09',
    act: 2,
    prompt: 'You discover a close friend has done something that would ruin them if it came out. You…',
    interactionType: 'multipleChoice',
    difficulty: 'hard',
    options: [
      'Tell them, face to face, no matter how hard',
      'Keep it to myself — it is their story to tell',
      'Quietly steer them toward fixing it',
      'Walk away — that is not my burden',
    ],
    scoringMap: {
      sentinel: [1, 0, 0, 0],
      architect: [0, 0, 3, 0],
      mask: [0, 2, 1, 0],
      dreamer: [0, 0, 0, 1],
      outlaw: [0, 0, 0, 3],
      ghost: [0, 3, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [3, 0, 0, 0],
    },
  },
  {
    id: 'q10',
    act: 2,
    prompt: 'Your friend is an hour late to something you planned. You…',
    interactionType: 'multipleChoice',
    difficulty: 'easy',
    options: [
      'Wait. People are worth it.',
      'Text them a joke and keep the night alive',
      'Leave — my time is not optional',
      'Re-plan everything so nothing is wasted',
    ],
    scoringMap: {
      sentinel: [0, 0, 3, 0],
      architect: [0, 0, 0, 3],
      mask: [0, 3, 0, 0],
      dreamer: [0, 0, 0, 0],
      outlaw: [0, 0, 2, 0],
      ghost: [1, 0, 0, 0],
      spark: [0, 3, 0, 0],
      pillar: [3, 0, 0, 0],
    },
    themes: { people: [0], freedom: [2] },
  },
  {
    id: 'q11',
    act: 2,
    prompt: 'Complete the sentence: "People trust me because I am ___"',
    interactionType: 'wordInput',
    difficulty: 'medium',
    options: [],
    keywords: {
      sentinel: ['reliable', 'loyal', 'steady', 'dependable', 'honest'],
      architect: ['prepared', 'precise', 'logical', 'smart', 'organized'],
      mask: ['charming', 'easygoing', 'fun', 'funny', 'likeable'],
      dreamer: [],
      outlaw: ['honest', 'real', 'direct', 'blunt'],
      ghost: [],
      spark: ['fun', 'funny', 'outgoing', 'lively', 'warm'],
      pillar: ['honest', 'reliable', 'kind', 'consistent', 'true'],
    },
    scoringMap: {
      sentinel: [2],
      architect: [2],
      mask: [3],
      dreamer: [0],
      outlaw: [2],
      ghost: [0],
      spark: [2],
      pillar: [3],
    },
    // The reveal quotes this answer back (P2).
    revealQuote: {
      before: 'People trust you because you are ',
      after: '. You told me yourself.',
    },
  },
  {
    id: 'q12',
    act: 2,
    prompt: 'A fire. Everyone is safe. You have time to grab four things. Rank what you take first.',
    interactionType: 'dragRank',
    difficulty: 'hard',
    options: [
      'Your phone — contacts, photos, plans',
      'A box of keepsakes',
      'Nothing — you help others first',
      'Important documents',
    ],
    scoringMap: {
      sentinel: [0, 0, 0, 3],
      architect: [3, 0, 0, 0],
      mask: [0, 0, 0, 0],
      dreamer: [0, 3, 0, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 0, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [0, 0, 3, 0],
    },
    themes: { people: [0], security: [3] },
  },
  // q13 — Act 2 betrayal pressure. Withdraw = ghost (watch), plan the response
  // = architect (control), cut off = outlaw (autonomy — the sentinel's shadow),
  // rise above = pillar (integrity). The three-act arc peaks here.
  {
    id: 'q13',
    act: 2,
    prompt: 'Someone you trusted betrays you, publicly. Your first instinct…',
    interactionType: 'multipleChoice',
    difficulty: 'hard',
    options: [
      'Withdraw. Say nothing. Watch.',
      'Plan the response — every move, every timing',
      'Cut them off. Done. Forever.',
      'Let them have their moment — I will be fine',
    ],
    scoringMap: {
      sentinel: [0, 0, 2, 0],
      architect: [0, 3, 0, 0],
      mask: [0, 1, 0, 0],
      dreamer: [1, 0, 0, 1],
      outlaw: [0, 0, 3, 0],
      ghost: [3, 0, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [0, 0, 0, 3],
    },
  },
  {
    id: 'q14',
    act: 2,
    prompt: 'A crisis hits. Which object do you reach for?',
    interactionType: 'imagePick',
    difficulty: 'medium',
    options: [
      'A flashlight — I need to see what is coming',
      'A notebook and pen — I need to think',
      'My phone — I need people',
      'A book — a door to somewhere calmer',
    ],
    scoringMap: {
      sentinel: [3, 0, 0, 0],
      architect: [0, 3, 0, 0],
      mask: [0, 0, 2, 0],
      dreamer: [0, 0, 0, 3],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 1, 0, 1],
      spark: [0, 0, 3, 0],
      pillar: [0, 0, 1, 0],
    },
    themes: { security: [0], people: [2], solitude: [3] },
  },
  {
    id: 'q15',
    act: 2,
    prompt: 'A stranger insults you in front of a crowd. You…',
    interactionType: 'multipleChoice',
    difficulty: 'medium',
    options: [
      'Ignore it. Their words are not my weather.',
      'Say something sharp enough that they remember me',
      'Answer with kindness — take the high road',
      'File it away. I will remember them.',
    ],
    scoringMap: {
      sentinel: [0, 0, 0, 2],
      architect: [0, 0, 0, 1],
      mask: [0, 0, 0, 0],
      dreamer: [0, 0, 0, 0],
      outlaw: [0, 2, 0, 0],
      ghost: [3, 0, 0, 0],
      spark: [0, 3, 0, 0],
      pillar: [2, 0, 3, 0],
    },
  },
  {
    id: 'q16',
    act: 2,
    prompt: 'Rank what you need most from a partner.',
    interactionType: 'dragRank',
    difficulty: 'medium',
    options: ['Honesty', 'Excitement', 'Understanding', 'Stability'],
    scoringMap: {
      sentinel: [0, 0, 0, 3],
      architect: [0, 0, 0, 0],
      mask: [0, 0, 0, 0],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 3, 0, 0],
      ghost: [0, 0, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [3, 0, 0, 0],
    },
    themes: { security: [3] },
  },

  // ── ACT 3: Misdirection (9 questions) ───────────────────────

  // q17 — Act 3 misdirection: an innocent coffee habit scores deep traits
  // (same order every time = sentinel, exact spec = mask, novelty = outlaw/
  // dreamer). The question appears trivial; the scoring is not.
  {
    id: 'q17',
    act: 3,
    prompt: 'You always order the same coffee. Which describes it?',
    interactionType: 'multipleChoice',
    difficulty: 'easy',
    options: [
      'The same thing every time — I do not even look at the menu',
      'Whatever is new — I will try anything twice',
      'The complicated one — I know exactly how I want it',
      'I let the barista decide',
    ],
    scoringMap: {
      sentinel: [3, 0, 0, 0],
      architect: [0, 0, 2, 0],
      mask: [0, 0, 3, 0],
      dreamer: [0, 1, 0, 2],
      outlaw: [0, 3, 0, 0],
      ghost: [0, 0, 0, 2],
      spark: [0, 0, 0, 0],
      pillar: [1, 0, 0, 0],
    },
    themes: { freedom: [1] },
  },
  {
    id: 'q18',
    act: 3,
    prompt: 'Pick a texture.',
    interactionType: 'imagePick',
    difficulty: 'medium',
    options: ['Worn stone', 'Cool glass', 'Still water', 'Open flame'],
    scoringMap: {
      sentinel: [2, 0, 0, 0],
      architect: [0, 2, 0, 0],
      mask: [0, 3, 0, 0],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 0, 0, 3],
      ghost: [0, 0, 2, 0],
      spark: [0, 0, 0, 2],
      pillar: [3, 0, 0, 0],
    },
    themes: { solitude: [2], freedom: [3] },
  },
  {
    id: 'q19',
    act: 3,
    prompt: 'One word: what your childhood bedroom made you feel.',
    interactionType: 'wordInput',
    difficulty: 'hard',
    options: [],
    keywords: {
      sentinel: ['safe', 'secure', 'warm', 'protected'],
      architect: [],
      mask: ['hidden', 'private', 'mine'],
      dreamer: ['free', 'imaginative', 'magical', 'endless', 'wonder'],
      outlaw: ['trapped', 'caged', 'bored', 'small'],
      ghost: ['alone', 'quiet', 'still', 'empty'],
      spark: [],
      pillar: ['loved', 'warm', 'safe'],
    },
    scoringMap: {
      sentinel: [2],
      architect: [0],
      mask: [1],
      dreamer: [3],
      outlaw: [2],
      ghost: [2],
      spark: [0],
      pillar: [1],
    },
    // The reveal quotes this answer back (P2).
    revealQuote: {
      before: 'Your childhood bedroom made you feel ',
      after: '. You told me that.',
    },
  },
  {
    id: 'q20',
    act: 3,
    prompt: 'You notice a hairline crack in a wall everyone else walks past. You…',
    prelude: 'You noticed the crack before I pointed at it. Interesting.',
    interactionType: 'multipleChoice',
    difficulty: 'hard',
    misdirection: true,
    options: [
      'Note it. Someone should fix it. Maybe me.',
      'Study it — how long until it fails?',
      'Photograph it. It is beautiful.',
      'Walk past like everyone else — not my wall',
    ],
    scoringMap: {
      sentinel: [3, 0, 0, 0],
      architect: [0, 3, 0, 0],
      mask: [0, 0, 0, 0],
      dreamer: [0, 0, 2, 0],
      outlaw: [0, 0, 0, 2],
      ghost: [0, 0, 2, 1],
      spark: [0, 0, 2, 0],
      pillar: [1, 0, 0, 0],
    },
  },
  {
    id: 'q21',
    act: 3,
    prompt: 'You open the news app. Rank what you read first to last.',
    interactionType: 'dragRank',
    difficulty: 'medium',
    options: [
      'Headlines — what is actually happening',
      'The puzzles',
      'Arts and culture',
      'What people are saying about each other',
    ],
    scoringMap: {
      sentinel: [3, 0, 0, 0],
      architect: [0, 3, 0, 0],
      mask: [0, 0, 0, 3],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 0, 0, 0],
      spark: [0, 0, 0, 0],
      pillar: [0, 0, 0, 0],
    },
    themes: { people: [3] },
  },
  {
    id: 'q22',
    act: 3,
    prompt: 'At a party, the music cuts out. Dead silence. You…',
    interactionType: 'multipleChoice',
    difficulty: 'medium',
    options: [
      'Say something funny — save the room',
      'Watch everyone\'s reactions — fascinating',
      'Enjoy it. Silence is underrated.',
      'Find the cable. Someone, find the cable.',
    ],
    scoringMap: {
      sentinel: [0, 0, 0, 1],
      architect: [0, 2, 0, 2],
      mask: [2, 0, 0, 0],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 0, 0, 0],
      ghost: [0, 3, 1, 0],
      spark: [3, 0, 0, 0],
      pillar: [0, 0, 0, 2],
    },
    themes: { people: [0], solitude: [2] },
  },
  // q23 — Act 3 misdirection via imagePick: the door is pure symbol — iron =
  // protection (sentinel/pillar), glass = curated transparency (mask), ajar =
  // possibility (dreamer), unmarked = risk (outlaw). No literal reading.
  {
    id: 'q23',
    act: 3,
    prompt: 'Pick a door.',
    faceDown: true,
    interactionType: 'imagePick',
    difficulty: 'hard',
    options: [
      'A heavy iron door',
      'A glass door — see-through and open',
      'A door ajar, light spilling out',
      'A door with no label — who knows',
    ],
    scoringMap: {
      sentinel: [2, 0, 0, 0],
      architect: [0, 0, 0, 0],
      mask: [0, 3, 0, 0],
      dreamer: [0, 0, 3, 0],
      outlaw: [0, 0, 0, 3],
      ghost: [0, 0, 1, 2],
      spark: [0, 2, 0, 0],
      pillar: [2, 0, 0, 0],
    },
    themes: { security: [0], freedom: [1, 2] },
  },
  {
    id: 'q24',
    act: 3,
    prompt: 'A stranger on a train asks what you do. You…',
    interactionType: 'multipleChoice',
    difficulty: 'easy',
    options: [
      'Tell them the truth, plainly',
      'Tell them something more interesting',
      'Ask about them instead',
      'Mumble a version and go back to my book',
    ],
    scoringMap: {
      sentinel: [1, 0, 0, 0],
      architect: [0, 0, 1, 0],
      mask: [0, 3, 0, 0],
      dreamer: [0, 0, 0, 2],
      outlaw: [0, 2, 0, 0],
      ghost: [0, 0, 3, 1],
      spark: [0, 3, 0, 0],
      pillar: [3, 0, 0, 0],
    },
    themes: { people: [2], solitude: [3] },
  },
  {
    id: 'q25',
    act: 3,
    prompt: 'One word: the last thing you check before you fall asleep.',
    interactionType: 'wordInput',
    difficulty: 'medium',
    options: [],
    keywords: {
      sentinel: ['door', 'lock', 'alarm', 'windows'],
      architect: ['plan', 'tomorrow', 'schedule', 'list', 'alarm'],
      mask: ['phone', 'message', 'notification', 'social'],
      dreamer: ['nothing', 'music', 'thought'],
      outlaw: ['window', 'nothing', 'escape'],
      ghost: [],
      spark: ['phone', 'message', 'notification'],
      pillar: ['prayer', 'family', 'nothing'],
    },
    scoringMap: {
      sentinel: [3],
      architect: [2],
      mask: [2],
      dreamer: [1],
      outlaw: [2],
      ghost: [0],
      spark: [2],
      pillar: [1],
    },
    // The reveal quotes this answer back (P2).
    revealQuote: {
      before: 'You check ',
      after: ' before you sleep. I noticed.',
    },
  },
]
