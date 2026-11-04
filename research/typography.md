# Typography in SaaS ads — text animation recipes

Evidence status: see README.md. Sourced facts [S] are few; the 32 recipes below are **[R] our starting points**,
not measurements of any brand's ad. Brand names (Apple, Linear, Stripe, Framer, Arc, Raycast, Notion) are style
references only; we did not frame-measure their videos in this run.

## Sourced facts
- Per-word reveal: 400–600 ms per word, 80–150 ms stagger, ease-out on opacity + small vertical shift [S] ([preset write-up](https://tap-app-api.adeq.arkansas.gov/post/typography-presets-ink-spread-kinetic)).
- Blur-in per word (blurred+transparent → sharp) with adjustable stagger/blur [S] ([Framer TextGenerate](https://www.framer.com/marketplace/components/textgenerate/)).
- Blur per letter is costly (one layer per letter); prefer word/line units [S] ([kinetic_text](https://pub.dev/documentation/kinetic_text/0.2.0/)).
- Mask wipe: animate mask edge across, hold, animate out [S] ([cursa.app](https://cursa.app/en/page/text-animation-for-readability-kinetic-type-without-overcomplication)).
- Per-word sequencing tires on long sentences [S] (same source). Keep easing consistent across properties [S] ([recapio](https://recapio.com/digest/typography-motion-graphics-animation-in-after-effects-after-effects-tutorial-kinetic-typography-by-m)).
- Not found: SaaS-specific durations. [U]

## 32 recipes (ids match `presets/src/text/`)
Params: d = duration frames @30fps, s = stagger frames, curve names from `curves.ts`.

| # | id | What it does | d | s | curve |
|---|---|---|---|---|---|
| 1 | fadeUp | opacity 0→1, y +24px→0 | 18 | 0 | easeOut |
| 2 | wordRise | per-word fadeUp | 16 | 3 | easeOutExpo |
| 3 | letterRise | per-letter fadeUp | 14 | 1 | easeOutExpo |
| 4 | blurInWord | per-word blur 14px→0 + opacity | 18 | 3 | easeOut |
| 5 | blurInLine | whole-line blur 20px→0 | 22 | 0 | easeOut |
| 6 | maskWipeLR | clip-path inset right 100%→0 | 18 | 0 | easeInOutExpo |
| 7 | maskWipeUp | clip inset bottom, text slides y 100%→0 inside | 20 | 0 | easeOutExpo |
| 8 | lineMaskRise | per-line masked slide-up (editorial) | 22 | 5 | easeOutExpo |
| 9 | trackingIn | letter-spacing 0.4em→0.0em + opacity | 30 | 0 | easeOut |
| 10 | trackingOut | letter-spacing -0.08em→0 (tighten) | 24 | 0 | easeOutExpo |
| 11 | weightMorph | variable font wght 200→800 | 26 | 0 | easeInOut |
| 12 | weightPunchHot | hot word wght 500→900 + scale 1.0→1.08→1.0 | 14 | 0 | overshoot |
| 13 | scalePunchHot | hot word scale 1→1.18→1 | 10 | 0 | snap |
| 14 | scaleIn | scale 0.8→1 + opacity | 16 | 0 | overshoot |
| 15 | dropIn | y -60→0 with overshoot | 18 | 2 | overshoot |
| 16 | slotRoll | per-letter vertical odometer roll | 24 | 2 | easeOutExpo |
| 17 | scramble | random glyphs resolve left→right | 24 | 1 | linear |
| 18 | typewriter | letters appear 1/frame with caret | var | 1 | linear |
| 19 | typeCaretSnap | typewriter with hard-blinking caret 8f | var | 1 | steps |
| 20 | splitCenter | line splits from centre outward (clip) | 20 | 0 | easeInOutExpo |
| 21 | rotateXFlip | per-word rotateX 90→0, perspective 800 | 20 | 3 | easeOutBack |
| 22 | skewSlide | skewX -12→0 + x 40→0 | 16 | 2 | easeOut |
| 23 | glitchIn | 3 frames RGB split + x jitter then settle | 8 | 0 | steps |
| 24 | gradientSweep | text gradient position sweeps once | 40 | 0 | easeInOut |
| 25 | shineSweep | white highlight band crosses the text | 24 | 0 | easeInOut |
| 26 | strikeReplace | strike-through old word, new word rises | 28 | 0 | easeOutExpo |
| 27 | highlightMarker | accent rectangle wipes behind hot word | 14 | 0 | easeOutExpo |
| 28 | underlineDraw | underline grows from left | 14 | 0 | easeOutExpo |
| 29 | counterUp | number counts to target | 36 | 0 | easeOutExpo |
| 30 | stackPush | lines stack; earlier lines dim to 35% | 18 | 8 | easeOut |
| 31 | focusPull | non-hot words blur 6px + dim while hot word sharp | 16 | 0 | easeInOut |
| 32 | exitBlurDown | blur 0→12px, y +12, opacity→0 | 12 | 0 | easeIn |

## Rules we apply [R]
Hold each line ≥ 12 frames after it resolves; animate one property family dominantly per line; at most one
"hot word" effect per 2 s; tight tracking (-0.02 to -0.04em) on large display sizes.
