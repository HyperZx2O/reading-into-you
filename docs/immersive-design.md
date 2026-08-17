# Immersion & Interactivity Design Doc — Reading Into You

| | |
|---|---|
| **Status** | Proposal (pre-implementation) |
| **Date** | 2026-08-16 |
| **Scope** | Mode 1 (The Subject), Mode 2 (The Observer), reveal, and cross-session continuity |
| **Constraints** | No backend, no accounts, no new dependencies, no engine. Everything below is client-side data + CSS + copy. The world's visual rules (flat surfaces, gold rare, red only under pressure, slow deliberate motion, Special Elite = Jane's voice) are non-negotiables. |

---

## 1. Problem statement

The game is mechanically complete and visually coherent, but it **reads as point-and-click**: the player clicks options, watches the state advance, and is never handed anything back that came from *them*. Immersion — Murray's "active creation of belief" — depends on the player taking meaningful action **and seeing the results of that action**. Today, the results are a verdict at the end; the actions in between never echo back.

This doc proposes seven changes, each grounded in published game-design research, that convert *clicking through a form* into *being read by Jane*.

## 2. Diagnosis — why it feels flat today

1. **Every interaction is click → advance, with no echo.** Mode 1 answers are scored and discarded; the reveal quotes generic archetype copy, never the player's own words. Mode 2 judges every click instantly with a border color, so "thinking" never has room to happen.
2. **The case-file world is a backdrop, not a set of handleable props.** The player looks at paper but never does paper things (open, stamp, file, turn over).
3. **Zero uncertainty and uniform pacing.** Every question resolves on the same beat with the same feedback, which reads mechanical.

## 3. Goals

- The player should feel **observed and judged** — not graded, but read.
- The player's own inputs (words, choices, timing) should **come back at them**.
- The player should be given **the minimum information** and trusted to deduce, so correct deductions feel earned.
- The experience should feel like **one living case file** across sessions, not a series of resets.

## 4. Non-goals & guardrails

- **No particles, confetti, or celebration bursts** — the flat, gold-rare world forbids them.
- **No cursor-following light pools or new lighting models** — breaks the single-lamp language.
- **No backend, accounts, or new dependencies** — all proposals are localStorage + CSS + copy.
- **Accessibility is preserved** — every state change stays visible, textual, and announced; sound remains reinforcement only; `prefers-reduced-motion` keeps working.
- **`prefers-reduced-motion` is not a mute or a "skip the drama" flag** — content and outcomes are identical, only motion differs.

## 5. Research foundations

| Source | Idea used |
|---|---|
| Janet Murray, *Hamlet on the Holodeck* (via First Person Scholar's [Disco Elysium agency analysis](https://www.firstpersonscholar.com/reconceiving-player-agency-with-disco-elysium/)) | Agency = "the satisfying power to take meaningful action and see the results of our decisions." Immersion deepens when the world **validates** player actions — even micro-actions that never change the ending. |
| [Vicious Undertow — Return of the Obra Dinn and hands-off design](https://viciousundertow.wordpress.com/2018/11/08/return-of-the-obra-dinn-a-lesson-on-detective-games-and-hands-off-design/) (citing Mark Brown's detective-game design work) | A detective game stays out of the player's way, hands them the minimum information, and **confirms deductions in batches** — never per click. That is what makes the player feel smart and respected. |
| [NN/g — Microinteractions](https://www.nngroup.com/articles/microinteractions/) and the game-feel/"juice" canon ([GDC — Secrets of Game Feel and Juice](https://www.youtube.com/watch?v=216_5nu4aVQ)) | Trigger → instant, physical-feeling feedback is what makes an interface feel tangible rather than clickable. |
| [PAX East — The Aesthetics of User Interfaces](https://withaterriblefate.com/2015/03/24/from-the-floor-of-pax-east-part-ii-the-aesthetics-of-user-interfaces/) | **Diegetic UI** — elements that exist inside the fiction — is the most immersive kind. |
| Aarseth's "keyholes" distinction (via the First Person Scholar piece) | Choices need not advance progress to be narratively meaningful; they only need to be **acknowledged**. |

## 6. Proposals

Ranked by impact. Each is independent; they compose cleanly.

---

### P1 — Batch confirmation in Mode 2 (the biggest single change)

**Current:** clicking an option flips gold/red instantly. Feedback is immediate but cheap — the player never holds a deduction.

**Proposed:** the player answers all four deductions for a subject, then Jane **turns the page** and reveals the truth — confirming only the deductions that were correct. Wrong ones stay blank: *"You guessed. I do not guess."* Correct ones are stamped gold.

**Why it works (research):** Obra Dinn confirms fates only in batches of three, and never reveals correctness per action. Delayed, batched confirmation is precisely what creates the "I figured it out" feeling instead of "I clicked a quiz."

**Details to preserve:**
- The typed feedback lines (Jane's dictation) remain — they move to the batch-reveal moment, one line per deduction.
- Accessibility: the batch reveal is a normal page state (announced once via the existing live-region patterns), not a per-keystroke stream.
- The ProgressBar, dossier flow, and rating screen are unchanged.

**Effort:** Medium — flow rework + copy. **Impact:** Very high.

---

### P2 — The casebook: quote the player back to themselves

**Current:** Mode 1 word answers are scored by keyword and forgotten. The reveal quotes archetype copy written months ago.

**Proposed:**
- The reveal quotes the player's own words: *"You said you couldn't live without **honesty**. That was the tell."*
- Mode 2: the player files a one-line **"my read"** note per subject; the rating screen shows their notes beside Jane's.

**Why it works (research):** the mentalist trick is precisely this — reflecting observed behavior back. The player's own inputs are the strongest "the game sees me" signal available, and the game already collects them.

**Effort:** Low–medium (data plumbing + copy). **Impact:** High.

---

### P3 — Jane notices patterns (acknowledged micro-decisions)

**Current:** Jane reacts to Mode 2 accuracy at subjects 3 and 5 only. In Mode 1 she is silent until the reveal.

**Proposed:** extend reactions into Mode 1, driven by the player's actual behavior:
- Repeat patterns: *"Third time you picked the window seat."*
- Hesitation: the answer payload gains a `capturedAt` timestamp (one-line addition); answers taking longer than a threshold are flagged — *"You hesitated on that one. I made a note."*
- Inconsistency callouts: where scoring permits, *"Earlier you said X. Now you say Y."*

**Why it works (research):** Disco Elysium validates micro-choices through small NPC reaction deviations even when the plot never branches — acknowledgment, not branching, is what creates felt agency (Murray / Aarseth via First Person Scholar).

**Effort:** Low–medium (copy + timestamp plumbing). **Impact:** High.

---

### P4 — Diegetic handling: open, stamp, turn over

**Current:** buttons advance state; the paper is a backdrop.

**Proposed (cheap, on-theme):**
- The reveal name sits behind an **envelope flap** the player opens — a click that *reveals*, not a click that *advances*.
- The cursor becomes a **pen** in Mode 1 and a **gloved hand** in Mode 2.
- Drag-rank slips already move — add a paper "lift" on grab (2px rise + existing SFX).
- Correct answers leave a gold **ink stamp** on the page rather than only a border (shared with P1's batch reveal).

**Why it works (research):** diegetic UI — elements that live in the fiction — is the most immersive (PAX panel).

**Effort:** Low. **Impact:** Medium–high.

---

### P5 — Juice the feedback

**Current:** feedback is color changes and transitions; press states are minimal.

**Proposed (CSS-only, all patterns already exist in the codebase):**
- Option press indents the paper (`scaleY(0.97)` + existing press SFX).
- Hover lifts exhibit cards 2px (fine pointer only; never touch — the codebase already neutralizes hover under `(hover: none)`).
- A correct-streak subtly raises the SFX pitch of the success cue (zen pack cues are already wired through `uiSfx.js`).

**Why it works (research):** microinteractions make interfaces feel tangible through instant, physical-feeling feedback (NN/g; game-feel canon).

**Effort:** Low. **Impact:** Medium.

---

### P6 — The world remembers (cross-session continuity)

**Current:** score history is stored but never spoken; each session starts cold.

**Proposed:**
- The rating remark references the last run: *"Last time: Investigator. You're learning — or cheating."*
- The Mode 1 archetype shades a Mode 2 opener: *"Jane knows your type now."*

**Why it works (research):** Murray's active creation of belief — the world reinforcing the player's own past actions deepens presence.

**Effort:** Low. **Impact:** Medium — makes it a living case file, not a session.

---

### P7 — Break the rhythm

**Current:** twelve questions share the same click-pacing.

**Proposed (one-off, cheap):**
- Occasionally Jane **waits** — no options render for a beat; she is studying the player.
- One question presents its options **face-down**, requiring a "turn over" tap.

**Effort:** Low. **Impact:** Low–medium — subtle, but removes the mechanical cadence.

---

## 7. Priority & phasing

**Ship first (before the hackathon deadline):** P1 + P2 + P3 — the trio that converts clicking into being read. They share the same plumbing (answer payload + copy layer), so they cost less together than separately.

**If time remains:** P4, then P5 (both are cheap polish passes).

**Defer:** P6 (needs copy review), P7 (optional flavor).

## 8. Risks & trade-offs

| Change | Trade-off | Mitigation |
|---|---|---|
| P1 batch confirmation | Loses instant per-click feedback; a wrong first question no longer corrects the player immediately | The batch reveal still types Jane's verdicts; the rating screen still carries the full score; copy makes the delay intentional ("I watched you work") |
| P2 quoting answers | Answers may be off-theme or odd | Quote only word-inputs with matched keywords; fall back to generic copy |
| P3 pattern callouts | Risk of feeling like a scripted chatbot | Keep callouts sparse (max 2–3 per run) and always *true* (data-driven, never fabricated) |
| All | More copy = more surfaces to keep in data files (Global Rule 9) | All new lines go into `src/data/flavor.js` |

## 9. Open questions

- Should P1's batch reveal also apply to Mode 1's interaction feedback, or stay Mode 2 only? (Recommended: Mode 2 only — Mode 1's reveal is already the payoff.)
- How aggressive should P3's hesitation threshold be? (Recommended: flag answers slower than the per-question median + one standard deviation, tuned after a playtest.)
- Do we want P2's "my read" notes to persist across sessions, or per-session only? (Recommended: per-session — they belong to the case, not the career.)
