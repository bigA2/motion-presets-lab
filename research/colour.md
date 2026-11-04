# Colour for short-form SaaS ads — proven vs. opinion

## What is proven vs. opinion (read this first)
| Claim | Status |
|---|---|
| 60-30-10 is a good colour split | **Opinion / heuristic.** A search for studies testing it on ad performance found none; sources are design guides that call it a starting point ([UX Collective](https://bootcamp.uxdesign.cc/the-60-30-10-color-rule-for-ui-design-32695d04a7c2), [Cieden](https://cieden.com/book/sub-atomic/color/60-30-10-rule)). [S] |
| Contrast and hierarchy drive attention more than hue | Practitioner claim in a display-ad guide ([BannerSnack](https://www.bannersnack.com/blog/how-to-choose-color-combinations-that-work-in-display-ads)); no experiment cited. [U] |
| Colour should fit the brand personality you want read | Supported by Labrecque & Milne (2012), as cited by that guide. Does not test proportions. [S] |
| "Blue + red + yellow mixed per element perform better" | **No evidence found.** No study, platform report or ad-library analysis surfaced. Treat as unproven. It resembles primary-colour branding (Google, etc.) but that is not evidence of performance. [U] |
| "80% better brand recognition from consistent colour" | Unsourced stat on a commerce blog; **do not use**. [U] |

**Bottom line:** the only defensible rules are (1) keep text contrast ≥ 4.5:1 (WCAG AA; ≥ 7:1 for hot words on
small screens) and (2) one dominant surface, one supporting, one accent that is rare. Ratios below are *our* defaults.
The only way to prove a palette performs is an A/B test on the platform; the editor exports palettes as JSON for that.

## 12 palettes (implemented in `presets/src/palettes.ts`)
Ratios are share of screen area: bg / panels / text+ui / accent / hot word. Contrast = WCAG ratio computed by
`scripts/contrast.mjs` (run it; the table in `presets/PALETTES.md` is generated, not hand-typed).
These are [R] — designed by us, not measured against conversion.

See `presets/PALETTES.md` for the generated table with hex values and contrast numbers.
