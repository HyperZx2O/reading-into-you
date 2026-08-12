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
 * NOTE: Fill in all string fields. IDs must stay as-is — used in scoringMap.
 */

export const ARCHETYPES = [
  {
    id: 'sentinel',
    name: 'The Sentinel',
    oceanProfile: '', // TODO e.g. 'High Conscientiousness, Low Openness'
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '', // TODO: one of the other 7 ids
  },
  {
    id: 'architect',
    name: 'The Architect',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
  {
    id: 'mask',
    name: 'The Mask',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
  {
    id: 'dreamer',
    name: 'The Dreamer',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
  {
    id: 'outlaw',
    name: 'The Outlaw',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
  {
    id: 'ghost',
    name: 'The Ghost',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
  {
    id: 'spark',
    name: 'The Spark',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
  {
    id: 'pillar',
    name: 'The Pillar',
    oceanProfile: '',
    jungianType: '',
    monologue: ['', '', '', '', ''],
    howJaneKnew: ['', '', ''],
    shadowArchetypeId: '',
  },
]

/** Lookup helper */
export const getArchetypeById = (id) => ARCHETYPES.find((a) => a.id === id)
