# Reading Into You

*A psychological browser game in two modes: get profiled, or learn to read people like a mentalist.*

> **Our submission for [QuantumHacks](https://quantumhacks.devpost.com/)** — built in a weekend, no backend, no accounts, no tracking. Just you, the questions, and Jane.

---

## What is it?

**Reading Into You** is a two-mode psychological experience that turns the player into the subject of a criminal-profile case file. The framing is the conceit of *The Mentalist*: Patrick Jane never claimed to be psychic. He just paid attention. The game applies that same attention to you.

Every screen is a piece of case-file paper on a midnight desk: reference numbers, "Confidential" stamps, hairline gold rules, and one voice that types everything out in typewriter letters. That voice belongs to **Jane**, and she is watching.

- **Mode 1 — The Subject:** *Be read.* Answer twelve questions and let Jane tell you which of eight archetypes you are, and what mask you hide behind.
- **Mode 2 — The Observer:** *Read others.* Study five subject dossiers, make your deductions, and earn a Perception Rating on the same ladder Jane herself would use.

Both modes are designed to be completed in under five minutes, and both end with a payoff: your verdict, stamped *Case Closed*.

---

## Mode 1 — The Subject (be read)

Twelve questions, drawn at random into three acts:

| Act | Theme | Questions |
|---|---|---|
| **I — Calibration** | Who you think you are | 4 |
| **II — Pressure** | Who you are when the clock runs | 5 |
| **III — Misdirection** | Who you are when you're not looking | 3 |

Each act uses a different interaction type, so no two questions feel the same:

- **Multiple choice** — pick the option that sounds most like you
- **Image pick** — choose between card-style exhibits
- **Word input** — answer in your own words (scored by keyword matching, so any phrasing works)
- **Drag-to-rank** — rank four options by dragging, or with stepper buttons on touch devices

Act II (**Pressure**) is the only act with a timer: 30 seconds per question, a depleting gold bar that turns red, and a quiet surveillance pulse while Jane watches you decide. Let it run out and your silence counts as an answer.

When the twelve questions are done, Jane scores the whole session in one pass and the reveal begins — three beats:

1. **The archetype.** Your name, struck onto the page in gold: *The Sentinel, The Architect, The Mask, The Dreamer, The Outlaw, The Ghost, The Spark, or The Pillar.*
2. **The monologue.** Jane dictates her verdict, line by line, in typewriter.
3. **How Jane Knew.** The evidence card — the specific behaviors that gave you away — plus your **shadow**: the archetype you pretend not to be.

Play again and you get a fresh, randomly drawn question pool, so no two readings are the same.

## Mode 2 — The Observer (read others)

Five subject files, randomly selected from a pool of eight — each with a name, a behavioral note, and scene notes from the field.

1. **Study the dossier.** Read the clues. Jane occasionally drops a dry mid-session comment at subjects 3 and 5, based on how sharp your eye has been so far.
2. **Make your deduction.** Four questions per subject. Every answer is judged on the spot — correct answers get a gold border and Jane's typed confirmation, wrong ones get red and a correction.
3. **Get rated.** At the end, your accuracy becomes a Perception Rating on Jane's own ladder:

| Score | Rating |
|---|---|
| 0–19 | Rookie |
| 20–39 | Investigator |
| 40–59 | Consultant |
| 60–79 | Senior Agent |
| 80–100 | Patrick Jane |

Your last three ratings are kept in the browser, so you can watch yourself get sharper. The lamp in the corner of the rating screen burns brighter with every tier you climb.

---

## Design & audio

The entire interface is a single coherent world — a case file under a single gold lamp:

- **Visual language:** midnight field, one gold accent color (red reserved for pressure and wrong answers), hairline borders, flat surfaces, no gradients, no shadows.
- **Typography:** Playfair Display for the letterhead; **Special Elite** (a typewriter face) for everything Jane says. She types. You read.
- **Motion:** slow, deliberate, compositor-only. Screen changes fade; reveals strike the page; the rating score counts up. Everything collapses to instant under `prefers-reduced-motion`.
- **Audio:** an original synthesized ambient loop (detuned sine drones, generated for this project — no external license) plus UI sound effects from the open-source **uisfx** library (MIT code, CC0 audio) using the *zen* pack: pure tones, dry wood, and typewriter keys. Sound starts on your first click (browsers block autoplay) and the ♪ button in the corner mutes the whole audio layer — your choice is remembered between sessions.

Sound is always a reinforcement, never the only signal: every state change is also visible, textual, and announced to assistive technology.

## Accessibility

Reading Into You was audited against WCAG 2.1 AA and passes cleanly (20/20 on the design-health audit):

- Full keyboard support — every control is a real button, stepper, or input
- Screen-reader friendly: real heading structure, labelled inputs, announced countdowns, verdicts announced once when complete (never per keystroke)
- Touch targets ≥ 44px, 375px-wide layouts with no horizontal overflow
- `prefers-reduced-motion` support across every animation
- Persistent, labeled sound control

## Tech stack

- **React 18 + Vite 6** — single-page app, no backend, no accounts
- **uisfx** — semantic UI sound effects (synthesized in-browser, zero audio files shipped)
- **CSS Modules** — hand-written design system, no UI framework
- **Vitest + Testing Library** — 35 tests covering sound semantics, loop cleanup, and interaction quality
- **localStorage** — the only persistence: intro seen, sound preference, last three ratings

## Getting started

```bash
# install
npm install

# develop
npm run dev            # http://localhost:5173

# quality gates
npm run lint           # ESLint
npm test               # vitest (35 tests)
npm run build          # production build → dist/

# preview the production build
npm run preview
```

## Project structure

```
src/
├── audio/          # centralized UI sound player (uisfx, zen pack)
├── components/
│   ├── Intro/      # first-visit typewriter cinematic
│   ├── ModeSelect/ # choose your role
│   ├── Subject/    # Mode 1: questions, timer, reveal
│   ├── Observer/   # Mode 2: dossiers, deductions, feedback, rating
│   └── UI/         # sound toggle, error boundary
├── data/           # all authored content: questions, subjects, archetypes, copy
├── hooks/          # typewriter, question/subject pool selection
├── styles/         # CSS modules (design tokens in global.css)
├── test/           # vitest setup
└── utils/          # scoring, shuffle, score history
```

## Team

Built for **QuantumHacks** by:

- **MD. Sadman Saif Zarif** — [@HyperZx2O](https://github.com/HyperZx2O) · [sadman.zarifsaif@gmail.com](mailto:sadman.zarifsaif@gmail.com)
- **Noha Saabreen** — [@Nova-Supreme](https://github.com/Nova-Supreme) · [nohasaabreen@gmail.com](mailto:nohasaabreen@gmail.com)

---

## License

MIT (code). The ambient audio loop is an original synthesized composition created for this project. UI sound effects are from [uisfx](https://uisfx.com) (MIT code, CC0 audio).
