# Motion Presets Lab — brief (4 Nov 2026)

Public repo. **Nothing private here, ever:** no API keys, tokens, `.env`, personal data, voice recordings, private
repo names, or assets whose licence forbids redistribution. Free-but-non-redistributable packs (many "free AE
presets", Sonniss GDC bundles, Mixkit, Envato freebies) go in as **links + notes only**, never the files. Files we
commit must be CC0 / MIT / Apache-2.0 / OFL (fonts) or made by us — record the licence of every file in
`LICENSES.md`.

## Why
Our SaaS ad videos (Remotion) look "AI slop" in four places: **typography, mockup animations, sound effects, liquid
glass**. Backgrounds are the one thing that works, but colour needs work. We also lack animation **curves** (graph
editor / bezier easing per property, like Alight Motion / After Effects), and the founder wants to **edit live**
without a heavy local setup.

## Deliverables (in order; commit + push after each one — the session may expire, so never hold work back)

### 1. Research notes `research/` (sources with links for every claim)
- `typography.md` — how real SaaS ads (Apple, Linear, Notion, Framer, Arc, Raycast, Stripe, top SaaS motion accounts
  on Instagram / X / Behance / Dribbble / Motion Array / YouTube tutorials) animate text: kinetic type, per-letter /
  per-word reveals, mask wipes, tracking animation, weight morphs (variable fonts), blur-in, line-by-line, scale
  punch on hot words, timing in frames, easing curves. List 30+ concrete text animations with exact parameters.
- `mockups.md` — how pro SaaS ads move UI mockups: 3D tilt / land-view, camera push, cursor choreography, UI
  building itself, card fans, depth layers, motion blur, parallax. 20+ recipes with parameters.
- `sfx.md` — modern SaaS ad sound design: UI clicks, whooshes, risers, glitches, data/typing loops, and the trending
  "viral SFX" reel style (data loop, stutter clicks, charge + data clicks, **mechanical clicks**) — how to design and
  layer those (synthesis recipes, layering, -dB levels, timing to cuts). Where to get CC0 sounds (Freesound CC0
  filter, Kenney, OpenGameArt CC0, BBC RES where allowed, etc.).
- `presets.md` — catalogue of FREE After Effects / Alight Motion / Premiere / Rive / Lottie preset and template packs
  for SaaS ads (text, transitions, UI elements, glass, backgrounds) found on social media / marketplaces / GitHub,
  each with link, licence, redistributable yes/no, and what to copy as a recipe.
- `liquid_glass.md` — liquid glass (Apple 2025 style) done well: refraction, edge highlight, chromatic fringe, blur
  levels, tint, shadow; which backgrounds it suits; when NOT to use it; open-source implementations (CSS / SVG
  filters / WebGL shaders) with licences.
- `colour.md` — colour ratios that perform in short-form SaaS ads: 60-30-10, accent ratios, contrast, and the
  claim that blue + red + yellow mixes per element perform better. **Check it against evidence** (studies, ad
  library examples, platform reports); say clearly what is proven vs. opinion. Give 12 tested palettes with ratios
  per element (background / panels / text / accent / hot word) and contrast numbers.
- `live_editing.md` — can the founder edit live in a browser, hosted free on GitHub Pages, with no local load?
  Evaluate: Theatre.js studio (graph editor, bezier curves per property), Remotion Player, Motion Canvas editor,
  Revideo, Lottie editors, Rive. Pick one; explain the flow: edit in browser → export keyframes JSON → commit →
  GitHub Actions renders the video.

### 2. Preset library `presets/` (Remotion + TypeScript, MIT, our own code)
- 30+ text animations, 15+ mockup moves, 8 liquid-glass panel variants, 12 background + palette presets, each as a
  small component with props, a short README line, and a still. All easing via named bezier curves in one
  `curves.ts` (ease presets like AE "easy ease", overshoot, anticipation, snap), applicable to ANY element property.
- `sfx/` — our own synthesized SFX (e.g. Python numpy / sox scripts committed with the outputs): clicks, mechanical
  clicks, stutter, data loop, charge, whoosh, riser, glitch, pop — plus 3 mixed "SaaS ad" layers. Loudness-normalised.

### 3. Live editor on GitHub Pages
- A static page (GitHub Pages, deployed by Actions) with the chosen editor: preview a sample SaaS ad, tweak
  keyframes + curves per element, switch palette / glass / text preset, export JSON. A `render.yml` workflow renders
  a video from a committed JSON. Runs fully in the browser, nothing needs installing locally.

### 4. Showreel
- `render.yml` renders a 30-45 s showreel (16:9 + 4:5) using the presets + SFX; upload as a workflow artifact.
- Look at frames yourself (4 fps) before calling anything done; reject anything that looks generic.

### 5. `RESULT.md`
Plain English, short: what exists, links (Pages URL, artifact), what is proven vs. opinion in the colour research,
what still looks weak.
