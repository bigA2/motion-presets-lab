# RESULT — 4 Nov 2026

## What exists
- **Research** in `research/`: typography (32 recipes), mockups (21), SFX, free preset packs, liquid glass, colour,
  live editing. Every claim is tagged [S] sourced (with link), [R] our recipe, or [U] unverified.
- **Presets** in `presets/`: 32 text animations, 21 mockup moves, 8 liquid-glass variants, 12 background + palette
  presets. Each has a one-line note and a still, and text and mockup stills are 4-frame strips showing the motion.
  All easing goes through one file, `curves.ts`: named beziers (AE easy ease, overshoot, anticipation, snap, …) plus
  keyframe tracks that can drive any property.
- **SFX** in `presets/sfx/`: 10 one-shots synthesised from scratch (click, mechanical click, stutter, data loop,
  charge, whoosh, riser, glitch, pop, hit) and 3 mixed layers (hook, dataflow, mech). Loudness is measured with
  BS.1770 (my numbers match ffmpeg's). The script and the WAVs are both committed.
- **Live editor** in `editor/`: Remotion Player plus an After-Effects-style graph editor (drag keyframes, bezier
  handles per segment, per property). It switches palette, background, glass and text preset, and exports or imports
  JSON. It is built and deployed by `pages.yml`.
- **Cloud render**: `render.yml` renders the showreel (16:9 and 4:5, 35.9 s) plus every `ads/*.json`, masters
  audio to -14 LUFS, and uploads the MP4s and 4 fps review sheets as artifacts.

## Links
- Live editor: https://biga2.github.io/motion-presets-lab/ (**needs one click from the owner first:** Settings →
  Pages → Source: "GitHub Actions", then re-run the *pages* workflow. The workflow token can't create the Pages
  site itself.)
- Videos: Actions → *render* → latest run → Artifacts `videos-N` (showreel 16:9, showreel 4:5, sample ad) and
  `review-frames-N`. First green run: https://github.com/bigA2/motion-presets-lab/actions/runs/41850500122
  (it renders all three in about 5 min). Each later push to `ads/` or `presets/` re-renders.
- How frames were checked: I reviewed 4 fps sheets of my own local render of the same code (both formats) and
  fixed what looked off: type too small, a static glass scene, mockups clipped in 4:5, a centred CTA wrapping.
  This sandbox can't download Actions artifacts, so I haven't looked at the CI-rendered MP4 itself. The job
  log shows all three finished, with audio mastered.

## Colour research: proven vs. opinion
- **Proven (or at least sourced):** colour shapes perceived brand personality (Labrecque & Milne 2012). Text contrast
  thresholds are a standard (WCAG). All 12 palettes pass text ≥ 7:1 and accent/hot ≥ 3:1, as computed in
  `presets/PALETTES.md`.
- **Opinion:** 60-30-10, and every area ratio in our palettes. I found no ad-performance study for either.
- **Unproven:** "blue + red + yellow mixed per element performs better". I found no study, platform report or
  ad-library analysis. It is included as palette `primaryBRY` so it can be A/B tested, not because it works.

## What still looks weak (honest)
1. **Research depth.** This session could search but not open most pages, so nothing is frame-measured from real
   Apple, Linear or Stripe ads, and social-only preset packs (Instagram, TikTok, Alight Motion links) are missing.
   The 32 text and 21 mockup parameter sets are my tuned starting points, not copies of measured ads.
2. **SFX were never listened to.** I checked them only by loudness numbers and spectrograms. The riser is
   noise-heavy and the clicks may sound thin. Someone needs to listen before they ship.
3. **One mockup.** Every move uses the same fictional dashboard ("Tallyroom"). Its small UI text is unreadable at
   phone size, so real ads need real product screenshots plugged in.
4. **Glass only bends what it is given.** The panel refracts a copy of the layer passed as `behind`, not arbitrary
   elements on top of it. In the editor it is exact only in Chrome and Edge.
5. **Showreel hook is plain:** text on a dark background for 2 s. It works, but it isn't scroll-stopping. Type
   cuts are fast (1.2 s each), which is fine for a reel but too fast for a real ad.
6. **The sample ad (`ads/sample-ad.json`) is deliberately simple.** It is an editor starting point, not a finished
   ad, and its grid background is very subtle at small sizes.
7. **Remotion licence:** free only for teams of up to 3 people. Check before commercial use.
