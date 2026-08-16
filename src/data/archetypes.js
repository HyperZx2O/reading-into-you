/**
 * Archetypes — 8 psychological profiles
 *
 * Schema:
 * {
 *   id: string,
 *   name: string,
 *   oceanProfile: string,        // brief OCEAN trait description
 *   jungianType: string,         // e.g. 'The Hero', 'The Shadow'
 *   monologue: string[5],        // 5 lines, revealed one at a time on click
 *   howJaneKnew: string[3],      // 3 callouts referencing specific answer patterns
 *   shadowArchetypeId: string,   // id of the paired shadow archetype
 * }
 *
 * Shadow pairings (bidirectional):
 *   sentinel <-> outlaw   (security/order vs freedom/risk)
 *   architect <-> dreamer (control/precision vs imagination/escape)
 *   mask <-> pillar       (social performance vs steadfast integrity)
 *   ghost <-> spark       (invisible/observer vs radiant/visible)
 */

export const ARCHETYPES = [
  // The Sentinel: vigilance and duty — the defensive, order-preserving profile.
  {
    id: 'sentinel',
    name: 'The Sentinel',
    oceanProfile: 'High Conscientiousness, Low Openness — vigilant, duty-bound, protective',
    jungianType: 'The Guardian',
    monologue: [
      'You checked the exits before you checked the faces. Most people tell me what they want to be; you told me what you protect.',
      'You keep things in their place — keys, plans, people. Not because you are rigid. Because you have seen what happens when the door is left open.',
      'You would rather be called cold than be caught unprepared. I would call it something else: the watchman\'s discipline.',
      'Loyalty is not a word you throw around. You ranked security before beauty, stability before excitement — twice, without hesitating.',
      'Here is what nobody tells the sentinel: the night is quiet precisely because of you. Rest. I have got the door.',
    ],
    howJaneKnew: [
      'You noticed the exits first in my very first question — the guarded thing always wins with you.',
      'You ranked security and stability at the top of both ranking games, above freedom and excitement.',
      'When I offered you the open, unmarked door, you chose the one with the lock.',
    ],
    shadowArchetypeId: 'outlaw',
  },
  // The Architect: control through analysis — makes chaos legible, plans ahead.
  {
    id: 'architect',
    name: 'The Architect',
    oceanProfile: 'High Conscientiousness, High Intellect — analytical, precise, plan-driven',
    jungianType: 'The Mastermind',
    monologue: [
      'You did not answer my question about the room — you answered my question about the architecture of it. Who stands where. Who moves. Who watches whom.',
      'You plan the exit before you plan the joke. Every move you make already has a second move attached to it.',
      'In a crisis you reach for the notebook, not comfort. You do not want to be saved; you want to make the chaos legible.',
      'You are not cold. You are precise. There is a difference, and you know exactly where the line sits — I watched you draw it.',
      'The world is a machine to you and you are the one who keeps it oiled. Just remember: some things are not meant to be solved. Some things are meant to be felt.',
    ],
    howJaneKnew: [
      'You asked how people were arranged before you asked who they were.',
      'You reached for the notebook, the puzzles, the plan — you choose the legible thing every single time.',
      'When the betrayal came, you did not react. You scheduled the response.',
    ],
    shadowArchetypeId: 'dreamer',
  },
  // The Mask: social performance — curates how they are seen to manage inner unease.
  {
    id: 'mask',
    name: 'The Mask',
    oceanProfile: 'High Extraversion, High Neuroticism — performs to manage inner unease',
    jungianType: 'The Shapeshifter',
    monologue: [
      'You gave me the face you wanted me to see. Polite, pleasant, exactly right. It is a beautiful mask — handcrafted, expensive, well-worn.',
      'You said you would tell a friend what they need to hear, not what is true. That is not dishonesty. That is survival.',
      'You curate how you are seen — the glass walls, the complicated order, the right laugh at the right moment.',
      'The question was never whether the mask is fake. It is who you are protecting underneath it.',
      'When you are ready, you can put it down. I am not the audience you have been performing for — I am just a man who noticed.',
    ],
    howJaneKnew: [
      'You gave the friend what they needed to hear, not what you were thinking.',
      'You picked the glass, the penthouse, the complicated order — you curate how you are seen.',
      'Gossip first in the news app. You study how others are perceived so you can calibrate your own performance.',
    ],
    shadowArchetypeId: 'pillar',
  },
  // The Dreamer: imagination as refuge — introspective, unanchored, inner life rich.
  {
    id: 'dreamer',
    name: 'The Dreamer',
    oceanProfile: 'High Openness, Low Conscientiousness — imaginative, introspective, unanchored',
    jungianType: 'The Seeker',
    monologue: [
      'You chose the horizon over the crowd, the door ajar with light spilling out. Every image I gave you, you turned into an exit from this room.',
      'You would save the keepsakes from the fire, not the documents. I asked what mattered and you answered: the memory.',
      'Your mind is not distracted. It is somewhere else, more often than you admit. Somewhere better.',
      'You are not escaping life — you are building it, but you keep the blueprint in your head where no one can revise it.',
      'The world is louder than you like, and you built a quiet room inside yourself. It is a beautiful room. I just wanted you to know someone noticed the door.',
    ],
    howJaneKnew: [
      'You chose the horizon, the still water, the door ajar — every door I showed you led somewhere else.',
      'You saved the keepsakes from the fire, not the documents.',
      'When the music died, everyone panicked. You enjoyed the silence.',
    ],
    shadowArchetypeId: 'architect',
  },
  // The Outlaw: autonomy and risk — allergic to cages, freedom above all.
  {
    id: 'outlaw',
    name: 'The Outlaw',
    oceanProfile: 'Low Conscientiousness, Low Agreeableness — autonomous, risk-tolerant, rule-averse',
    jungianType: 'The Rebel',
    monologue: [
      'I asked you to rank what a home needs, and you put freedom on top. Not because you do not want a home — because you want one without locks.',
      'You chose the flame, the unmarked door, the experimental order. Rules make you want to break them, and you know it.',
      'You said you would cut someone off the moment they betrayed you. No negotiation, no autopsy. Just the door closing.',
      'You are not reckless. You are allergic to cages — there is a difference. You would rather lose everything on your own terms than win on someone else\'s.',
      'The outlaw is the sentinel\'s shadow, and the sentinel is yours. One guards the wall; the other keeps finding the door in it. Neither of you sleeps.',
    ],
    howJaneKnew: [
      'You ranked freedom first in my home game — before security, before everything.',
      'You chose the flame, the unmarked door, the experimental order — you keep picking the open thing.',
      'Betrayed, you said you would cut them off without an autopsy. No second acts with you.',
    ],
    shadowArchetypeId: 'sentinel',
  },
  // The Ghost: the observer — private, perceptive, prefers watching to being seen.
  {
    id: 'ghost',
    name: 'The Ghost',
    oceanProfile: 'Low Extraversion, High Openness — observant, private, deeply perceptive',
    jungianType: 'The Observer',
    monologue: [
      'You chose the back of the photo, the window seat, the lone figure in the doorway. You kept offering me the same answer: do not look at me.',
      'But here is the thing about ghosts — they see everything. When the music stopped, you did not panic. You watched everyone else panic.',
      'You deflected my question about yourself and asked about the stranger instead. Smooth. Practiced. That is the tell.',
      'You would rather be invisible and know the truth than be seen and be lied to. It is not shyness. It is a strategy.',
      'You think no one notices you. I did. That is the whole trick, is it not — the ghost does not want to be seen, but wants, desperately, to be perceived.',
    ],
    howJaneKnew: [
      'You put yourself at the back of the photo, half-hidden — every time you got the choice.',
      'When the music died you did not speak; you watched everyone else react.',
      'On the train, you turned the question back on the stranger. Practised, smooth — the deflector\'s signature.',
    ],
    shadowArchetypeId: 'spark',
  },
  // The Spark: radiant presence — lights the room, collects reactions, fears the dark.
  {
    id: 'spark',
    name: 'The Spark',
    oceanProfile: 'High Extraversion, High Openness — radiant, social, novelty-seeking',
    jungianType: 'The Enthusiast',
    monologue: [
      'You walked toward the crowd like it was magnetized. You chose the front of the photo before I finished the sentence.',
      'When the music stopped, you saved the room. You did not wait for permission — you do not know how to wait for permission.',
      'You would tell the stranger something more interesting, make them laugh, collect the reaction. You collect reactions the way other people collect keepsakes.',
      'Here is what nobody tells the spark: you light up the room because you are afraid of the dark in it — and in you.',
      'You are not shallow. You are radiant. The two look alike from a distance; I got close enough to tell the difference.',
    ],
    howJaneKnew: [
      'You walked toward the crowd, the laughter, the front of the photo — the bright thing wins with you every time.',
      'When the silence hit, you were the one who saved the room.',
      'You would tell the stranger something more interesting. You were not lying; you were performing. You always are.',
    ],
    shadowArchetypeId: 'ghost',
  },
  // The Pillar: steadfast integrity — dependable, principled, everyone's anchor.
  {
    id: 'pillar',
    name: 'The Pillar',
    oceanProfile: 'High Conscientiousness, High Agreeableness — steady, principled, dependable',
    jungianType: 'The Anchor',
    monologue: [
      'You told me you would tell the truth plainly on the train. Not perform, not deflect — just say who you are. Do you know how rare that is?',
      'You would forgive the betrayal. Not because you are weak — because you measure people by their capacity to change, and you have the patience to wait for it.',
      'You ranked honesty first in a partner, stability second. You know exactly what you need, and you have never once apologized for it.',
      'When your friend was late, you waited calmly. You did not punish them with silence. You just held the space.',
      'Everyone leans on you, and you let them. That is not a burden you carry — that is a choice you make, every single day. I wanted you to know it is seen.',
    ],
    howJaneKnew: [
      'You told the stranger the truth on the train. Plainly, no performance.',
      'You would forgive the betrayal — not from weakness, from patience. You ranked honesty above excitement.',
      'You waited for your late friend without a single punishing word. The anchor does not drift.',
    ],
    shadowArchetypeId: 'mask',
  },
]

/** Lookup helper */
export const getArchetypeById = (id) => ARCHETYPES.find((a) => a.id === id)
