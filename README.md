# The Mentalist

A two-mode psychological browser game — get profiled, or learn to read people
like a mentalist. React + Vite, no backend, no accounts.

## Setup

1. Clone the repo
2. `npm install`
3. `npm run dev`
4. Open http://localhost:5173

## Branches

- `main` — scaffold
- `feature/mode1` — The Subject (Mode 1)
- `feature/mode2` — The Observer (Mode 2)

## How to Play — Mode 2 (The Observer)

A deduction training game. Five fictional subjects are presented one at a time
as a dossier card with text-annotation clues. Study the scene, then answer four
deduction questions per subject. Jane answers instantly — correctly or not.
Finish all five subjects to earn a Perception Rating out of 100:

| Score | Rating |
|---|---|
| 0–19 | Rookie |
| 20–39 | Investigator |
| 40–59 | Consultant |
| 60–79 | Senior Agent |
| 80–100 | Patrick Jane |

Ambient audio starts on your first click (browsers block autoplay) — mute it
with the ♪ button in the corner.

## Deploy

Deployed to Vercel: *(live URL goes here)*

## Audio

`public/audio/ambient.mp3` is an original synthesized loop (detuned sine drones
with a slow tremolo), generated with ffmpeg for this project — no external
license required.
