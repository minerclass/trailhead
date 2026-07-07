# Trailhead — build log / continuation guide

> Audit trail for agents. **STATUS: NOT STARTED.** Full spec:
> `..\VISUAL_GAMES_HANDOFF.md` § "PRIORITY 2 — Trailhead". Read the handoff's
> "House rules" and "Pitfalls checklist" before writing code.

## What to build (one paragraph)

Side-view mountain trail (Trailhead → Summit = "a defensible historical argument" about the
causes of the Civil War), 8 labeled segments. Player drags supports (rope rail = sentence
frames, waymarks = bilingual glossary, bridge = speech-to-text, rest platform = chunked
deadlines, belay partner = structured peer talk) onto segments, and may leave or remove the
**gondola** (AI full generation — carries a rider to the summit, learning nothing) and the
**turnstile** (device ban — blocks the gondola AND the assistive bridge/waymarks). Then "Open
the Trail": four hikers (Maya/ELL, Jordan/dysgraphia, Sam/bypass-default, Riley/anxious
speaker) traverse simultaneously per a deterministic rules table. The feedback IS the picture:
four colored path-lines — walking summit flags (learning), gray gondola flags (arrived,
learned nothing), red X where a hiker was gated. Three attempts to get all four walking to the
summit. Debrief maps outcomes to the framework.

## Implementation guidance

- Sibling reference build: `..\load-bearing\` — copy its file structure (index.html +
  style.css + game.js), screen skeleton, announcer/aria patterns, keyboard handling,
  reduced-motion pattern, and its constants `PRODUCTIVE_CHALLENGE=[55,80]`,
  `BARRIER_ACCESSIBLE_MAX=20`.
- SVG (not canvas) is fine here — the mountain is static; hikers are `<circle>`s animated
  along precomputed paths (or stepped per segment with CSS transitions).
- The rules table (segment × hiker × supports → walk / struggle / halt / detour) must be ONE
  inspectable JS object, deterministic, no randomness.
- The gondola must be genuinely tempting: leaving it open makes attempt 1 "succeed" fast —
  the gray-flag reveal then reframes it. Don't soften this.
- Palette: warm topographic (paper contours, forest ink, ember flags) — distinct from
  Load-Bearing's blueprint look; both stay in the family (Georgia/Segoe/Consolas, dark ground).
- Verification: same drill as Load-Bearing's BUILD_LOG (node --check, scripted browser
  playthroughs of a calibrated run, a gondola run, and a lockdown/turnstile run, replay reset,
  zero console errors). Log results here, one commit per milestone.

## Not yet done (everything)

- [ ] index.html / style.css / game.js
- [ ] Rules table + three scripted verification runs
- [ ] GitHub repo `minerclass/trailhead` (ask Micah), Pages, hub card (copy in handoff spec)
