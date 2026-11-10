# Trailhead

A visual simulation about calibrated challenge, access, and over-scaffolding. You design a support trail up a mountain that stands for a defensible historical argument on the causes of the Civil War. Four hikers then attempt it. The same trail is a workout for one student and a wall for another.

Allow about fifteen minutes. Written for teacher professional learning.

Play it at <https://minerclass.github.io/trailhead/>.

## How it works

- **Eight trail segments**, from Source Scramble to Summit Defense. You choose a support for each one.
- **Supports.** Waymarks (glossary), Rope Rail (sentence frames), STT Bridge (dictation), Belay Partner (peer talk), a Route Checkpoint, or no scaffolding. An AI Gondola and a device-ban Turnstile change what is available.
- **Four hikers.**
  - Maya, a multilingual learner, halts at text-heavy segments without Waymarks.
  - Jordan, who has dysgraphia, halts at writing-heavy segments without the STT Bridge.
  - Riley halts at the oral-heavy summit without a Belay Partner.
  - Sam takes the gondola whenever it is open and no checkpoint stands in the way.
- **A forecast.** Before the trail opens, you predict how many hikers will summit on foot.
- **Visual feedback.** Coloured lines show walking progress. A grey flag marks a gondola arrival, which does not count as a summit. A red X marks where a barrier stopped a hiker.
- **A reflection.** The debrief asks for a short written reflection before it shows how the run maps to the framework.

The rules are deterministic, so the same trail always produces the same result. A device ban blocks the gondola and also switches off the digital Waymarks and STT Bridge, which turns a policy choice into a barrier for Maya and Jordan.

## Run it locally

Open `index.html` in a current browser. There is no build step, framework, package manager, or account. The page links one shared stylesheet, `https://minerclass.github.io/tokens.css`, and falls back to its own colours when that file is unavailable.

## Conceptual grounding

Pedagogical friction, productive and exclusionary friction, and unproductive success as used here come from the framework Micah Miner is developing in his dissertation research. They are presented as proposals in progress, not as established terms or completed findings.

In this game, the device ban and the missing supports stand for infrastructural conditions. The goal is to remove barriers while keeping the work that learning needs.

## What this does not claim

- All scores, stats, and achievements are illustrative models of the pedagogical friction framework, not validated learning assessment instruments.
- The students in the game are fictional design profiles. They are not participants and do not represent real learners.
- Nothing here calls an AI service. The "AI" choices are scripted teaching examples.
- The game does not measure learning, does not evidence any dissertation claim, and reports no findings.
- No participant, student, or staff data is used, collected, stored, or transmitted.

## Accessibility

Trail nodes can be selected from the keyboard with Enter or Space. An aria-live region announces changes. Reduced-motion CSS turns off animation and transitions. The game was checked at 390px width with no horizontal overflow.

## Implementation

Three files: `index.html`, `style.css`, and `game.js`. The mountain is a static SVG with segment-by-segment hiker movement. The calibration constants `PRODUCTIVE_CHALLENGE = [55, 80]` and `BARRIER_ACCESSIBLE_MAX = 20` sit near the top of `game.js`. Run `node --check game.js` after any code edit. GitHub Pages publishes from `main` through `.github/workflows/pages.yml`.

## Logs

`BUILD_LOG.md` records how the game was built and what was verified. `AGENT_LOG.md` is an append-only record of agent-assisted changes. Neither file holds participant data, credentials, or tokens.

## Related

- Games hub: <https://minerclass.github.io/games-hub/>
- Dissertation overview: <https://minerclass.github.io/dissertation-overview/>
