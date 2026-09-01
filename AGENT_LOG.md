# Agent Log

Append-only record of automated and agent-assisted changes to this repository.
Newest entry first. No participant data, committee or faculty names, credentials,
or tokens.

---

## 2026-09-01 - Remove invalid SVG height attributes

Noticed while verifying the token adoption on the live page: three console errors on every
load, `<svg> attribute height: Expected length, "auto"`.

**Pre-existing, not from the token work.** The three mountain SVGs (lines 72, 182, 203)
carried `height="auto"`. `auto` is a valid CSS keyword but not a valid SVG *attribute*
length, so the browser rejected it and logged an error each time. Confirmed unrelated: the
token commit's diff touched zero SVG lines.

**Fix.** Removed the attribute from all three and set `height:auto` in CSS instead, on
`.svg-container svg`, where the keyword is legal. With a `viewBox` and `width:100%` the
intrinsic aspect ratio drives the height.

**Verified.** Zero console errors on a fresh page load. The SVGs sit on hidden `.screen`
elements so they measure 0x0 at rest; forced visible, one measures 428x254, an aspect of
**1.682**, exactly matching the 740/440 viewBox. Sizing is unchanged.

**Worth knowing when checking consoles here.** The browser console accumulates across
navigations, so a stale error from a previous load can look like a live one. Confirm in a
fresh tab before concluding a fix did not work.


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
