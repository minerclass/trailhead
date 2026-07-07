# Trailhead — build log / continuation guide

> Audit trail for agents. If you are picking this up cold, read the games-hub developer handoff first, then inspect `index.html`, `style.css`, and `game.js`. This file tracks what is done, what is verified, and what remains.

## Status

- **Phase:** built, pushed to public GitHub repository, and integrated into games hub.
- **Repository:** `minerclass/trailhead`
- **Default branch:** `main`
- **Public URL target:** `https://minerclass.github.io/trailhead/`
- **Hub card:** added to `minerclass/games-hub` and points to the public URL target.
- **Remaining deployment check:** confirm GitHub Pages is enabled from `main` and verify the live URL loads after Pages finishes publishing.

## What the game is

Trailhead is a visual simulation about calibrated challenge, accessibility, and over-scaffolding. The side-view mountain trail moves from Trailhead to Summit, representing a defensible historical argument about the causes of the Civil War. Players configure supports across eight trail segments and then observe four hikers: Maya, Jordan, Sam, and Riley.

The feedback is visual. Colored path lines show walking progress, gray summit flags mark AI gondola bypass, and red X markers show where a hiker was gated by an exclusionary barrier. The goal is not to remove all struggle. The goal is to remove barriers while preserving the work needed for learning.

## Key implementation decisions

- **Files:** `index.html`, `style.css`, and `game.js`. No framework, build step, package manager, CDN, or external dependency.
- **Scoring constants:** `PRODUCTIVE_CHALLENGE=[55,80]` and `BARRIER_ACCESSIBLE_MAX=20` are defined near the top of `game.js`.
- **Rendering model:** static SVG mountain map with deterministic segment-by-segment hiker movement.
- **Rules engine:** deterministic, no randomness.
- **Maya rule:** Maya halts on text-heavy segments without digital Waymarks unless the support remains available.
- **Jordan rule:** Jordan halts on writing-heavy segments without the digital STT Bridge unless the support remains available.
- **Riley rule:** Riley halts at the oral-heavy summit segment without Belay Partner support.
- **Sam rule:** Sam uses the AI Gondola when it is available and no checkpoint exists.
- **Device Ban / Turnstile:** blocks the gondola and disables digital Waymarks and STT Bridge, creating an infrastructural barrier for Maya and Jordan.
- **Reflection block:** requires a short reflection before revealing framework mapping.
- **Disclaimer:** visible in the framework-mapping section below score-like outputs.

## Verification checklist

- [x] Repository exists: `minerclass/trailhead`
- [x] Files are pushed to `main`
- [x] Hub card exists in `minerclass/games-hub`
- [x] Hub card points to `https://minerclass.github.io/trailhead/`
- [x] No CDN or external stylesheet/script dependency in `index.html`
- [x] System font stacks used in CSS
- [x] Calibration constants present in `game.js`
- [x] Debrief/framework disclaimer present below score-like outputs
- [x] Replay handler resets supports, hiker positions, hiker states, paths, halt markers, and flags for each attempt
- [x] Keyboard support exists for SVG trail-node selection
- [x] Aria-live announcer exists
- [x] Reduced-motion CSS disables animation and transition effects
- [x] Confirm GitHub Pages is enabled from `main` (status "built"; live URL returns 200)
- [x] Verify live Pages URL in browser — found + fixed a P0: debrief metrics read `h.id` on
      string ids, so `walkedSteps` stayed empty → "Productive Challenge NaN%" and Summit
      Success permanently 0/4. Also excluded gray-flag (gondola) arrivals from the Summit
      Success count to match the game's own thesis. Fix verified against live state: 86%
      challenge, real summit counting. `node --check` passes.
- [x] Device-test at 390px width (2026-07-07, emulated viewport): zero horizontal overflow
      on title, play, run, and debrief screens; SVG scales to 361px; all controls fit;
      full run + debrief verified at mobile width (86% challenge renders correctly)
- [x] FOLLOW-UP RESOLVED (2026-07-07): the divergent halt counts were caused by the
      continue button staying visible from the previous run, allowing the debrief to open
      mid-simulation and compute metrics from partial state. Fixes shipped: (1) continueBtn
      re-hidden at the start of every run; (2) interval id promoted to module-level
      `runTimer`, cleared at the top of runAttempt and in the replay handler so a stale
      timer can never mutate a new run; (3) "Start Over" now calls resetGame() instead of
      re-running init(), which was stacking duplicate event listeners (two runAttempt
      intervals) on every full 3-attempt cycle; (4) script tag now `game.js?v=3` — BUMP THE
      VERSION QUERY on every game.js change to bust browser/Pages caches.
      Verified: two consecutive default runs produce identical results (1/4 summits, 86%
      challenge, 75% barriers, halts ell@0/dys@3/rly@7); gondola run correctly shows 0/4
      with Sam's gray flag excluded; continue button hidden during both runs; zero console
      errors.
- [ ] Run `node --check game.js` after any future code edit (and bump the `?v=` query)

## Next steps

1. Enable or confirm GitHub Pages for `minerclass/trailhead` from the `main` branch.
2. Open `https://minerclass.github.io/trailhead/` and complete at least three scenarios: calibrated support, gondola bypass, and turnstile lockdown.
3. Test at approximately 390px mobile width.
4. After any change, rerun syntax and browser checks, then update this file.

## Commit log convention

Use one commit per milestone. Suggested message pattern:

`Trailhead: <specific milestone>`
