# Agent Log

Append-only record of automated and agent-assisted changes to this repository.
Newest entry first. No participant data, committee or faculty names, credentials,
or tokens.

---

## 2026-09-01 - Adopt the paper ground, and fix a pre-existing badge contrast failure

**Token adoption.** Paper surface and rules now come from the shared tokens with
pre-adoption fallbacks, and `<html>` carries `data-mjm-ground="light"`. The trail palette
(forest, moss, gold, ember, slate) stays local. Note the page's ground is painted by a
hardcoded gradient rather than a token, so the visible ground is unchanged.

**Two contrast repairs.**

- `--gold` (`#c6922c`) measured **2.49** on paper as text, a real barrier. It stays correct
  as a border, background, fill, and stroke; the two text usages now take `--gold-text`,
  pointing at the shared paper-ground gold ink at 5.17.
- `.h-dot` sets white text, which works on the dark hiker badges but measured **2.78** on
  the light gold one. `.dot-ell` now takes dark forest text at **5.29**. The slate, ember,
  and forest-dim badges keep white text and already passed.

**Verified.** Zero failures, down from one; tightest pair now 4.55 against 4.5.

**Measurement limitation, stated plainly.** This is an interactive piece: most of its
content appears only after play begins, so the contrast probe covered the landing screen
(22 text-bearing elements) and not deeper game states. Those are unmeasured, not verified
clean.
