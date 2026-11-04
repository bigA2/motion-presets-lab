# Liquid glass — doing it well

## What Apple's material is (sourced)
Introduced at WWDC 2025 as a translucent material that reflects and refracts what is behind it, with specular
highlights that respond to movement [S] ([TechRadar](https://www.techradar.com/tech/apple-reveals-major-visual-redesign-for-ios-26-macos-26-and-more-at-wwdc-2025), [MacTech](https://www.mactech.com/2025/06/09/apple-debuts-its-broadest-software-design-ever-with-liquid-glass), [Design Milk](https://design-milk.com/apple-returns-to-a-layered-software-design-with-liquid-glass-interface/)).
Light source near top-left is one writer's description, not an Apple spec [U] ([STRV](https://strv.com/blog/liquid-glass-and-the-future-of-design)).

## The ingredients [R — our parameters, see presets/src/glass/]
1. **Refraction/lensing**: background is displaced near the edges more than in the centre (edge-weighted
   displacement, 8–24 px at the rim, ~0 in the middle). This, not blur, is what reads as "liquid".
2. **Blur**: low — 4–12 px. Heavy blur (>20 px) turns it back into 2020 "glassmorphism".
3. **Edge highlight**: 1–1.5 px inner rim, brighter top-left (alpha 0.7) fading to 0.15 bottom-right, plus a
   faint second rim on the opposite edge (the light passing through).
4. **Chromatic fringe**: R/B channel offset 1–2 px at the rim only. More looks broken.
5. **Tint**: 4–12% white (light bg) or 6–16% of the bg hue (dark bg). Never a grey fill.
6. **Shadow**: soft, low (y 18 px, blur 40 px, 18–28% black) + 1 px contact darkening.
7. **Motion**: highlight angle follows panel movement (±15°).

## Where it works / when NOT to use it
Works over **busy, colourful, moving** backgrounds (gradients, blurred UI, imagery) — refraction needs something
to bend. Fails on flat solid backgrounds (looks like a grey card), on small text containers (readability), and when
stacked 3+ deep. Never put body text on glass without a ≥ 4.5:1 contrast check against the *worst* background patch.

## Open-source implementations
| Project | Technique | Licence |
|---|---|---|
| [deepika-builds/liquid-glass](https://github.com/deepika-builds/liquid-glass/wiki) | SVG feDisplacementMap + chromatic aberration; Chromium-only refraction | MIT [S] |
| [rizroze/liquid-glass](https://github.com/rizroze/liquid-glass) | backdrop-filter + SVG, 3 per-channel passes | MIT [S] |
| [Z1Code/glass-refraction](https://github.com/Z1Code/glass-refraction) | CSS + React + SVG filters | MIT [S] |
| [ybouane/liquidglass](https://github.com/ybouane/liquidglass) | WebGL shader | not confirmed [U] |
| [liquidGL (AnimatedCoding/Pages)](https://github.com/AnimatedCoding/Pages) | WebGL | not confirmed [U] |
| [archisvaze/liquid-glass](https://docsearch.algolia.com/mcp/docs/repo/archisvaze/liquid-glass) | SVG + Three.js | not confirmed [U] |

We copy **no code** from these; `presets/src/glass/` is our own SVG-filter implementation. Note: `backdrop-filter`
with SVG filters is Chromium-only — fine for Remotion (renders in Chromium) but the live editor shows a fallback
in Safari/Firefox.
