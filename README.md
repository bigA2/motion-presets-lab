# Motion Presets Lab

Open-source motion, typography, SFX and liquid-glass presets for SaaS ad videos (Remotion + TypeScript, MIT).
Brief: [BRIEF.md](BRIEF.md) · Outcome: [RESULT.md](RESULT.md) · Licences: [LICENSES.md](LICENSES.md)

| What | Where |
|---|---|
| Research notes (sourced vs. opinion marked) | [`research/`](research/) |
| 32 text animations, 21 mockup moves, 8 glass panels, 12 background + palette presets, all with stills | [`presets/`](presets/README.md) |
| One curve library for every property (AE easy ease, overshoot, anticipation, snap, custom bezier) | [`presets/src/curves.ts`](presets/src/curves.ts) |
| 10 synthesised SFX + 3 mixed SaaS layers | [`presets/sfx/`](presets/sfx/README.md) |
| Live editor (browser, GitHub Pages) | `https://biga2.github.io/motion-presets-lab/` — source in [`editor/`](editor/) |
| Cloud renders (showreel 16:9 + 4:5, every `ads/*.json`) | [`.github/workflows/render.yml`](.github/workflows/render.yml) → run artifacts |

## Edit an ad with nothing installed
1. Open the live editor, then tweak elements, keyframes and bezier curves per property, palette, background, glass and text presets.
2. **Export JSON** → on GitHub open `ads/` → *Add file → Upload files* → commit to `main`.
3. The **render** workflow starts by itself. Download the MP4 from the run's *Artifacts*.

## Local (optional)
```bash
npm ci
npm run studio                      # Remotion Studio
npm run editor:dev                  # the live editor
python3 presets/sfx/synth.py        # regenerate SFX (numpy, scipy)
node scripts/stills.mjs             # regenerate preset stills
node scripts/render.mjs showreel    # render the showreel into out/
```
Remotion is free for individuals and companies of up to 3 people. Larger companies need a Remotion Company Licence.
