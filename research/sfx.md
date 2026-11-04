# SFX for SaaS ads

Evidence status (see README.md): sourced material on the "viral SFX reel" style is thin and vendor-written.
Synthesis recipes and dB levels below are **[R]** — ours, implemented in `presets/sfx/synth.py`.

## What sources say
- Layering pattern: base track + emphasis layer + contextual effects; sharp hit in the first second, then a
  rhythmic loop that encourages rewatching [S, vendor blog — unverified] ([ReelMind](https://reelmind.ai/blog/the-viral-secret-analyzing-the-sound-design-of-top-trending-reels)).
- Stutter / glitch / "mech stutter" and mechanical click loops are standard stock items marketed for reels and UI
  explainers [S] ([Uppbeat UI mechanical clicks](https://uppbeat.io/sfx/ui-mechanical-clicks/187116/89698), [Artlist mech stutter](https://artlist.io/sfx/track/robotones---glitch-futuristic-looped-mech-stutter/48839)). These are **licensed, not redistributable** — link only.
- No source found for platform loudness targets for Reels/TikTok [U]. We normalise to **-14 LUFS integrated**
  for the mixed layers (common streaming-platform convention, unverified for short-form) and -1 dBTP peak.

## Synthesis recipes [R] (all 48 kHz mono, see synth.py)
| Sound | Recipe | Peak level in mix |
|---|---|---|
| click | 2 ms noise burst, HP 2 kHz, + 4 kHz sine 6 ms exp decay | -12 dBFS |
| mechClick | two transients 9 ms apart (press/release): band-passed noise 1.8 kHz & 3.2 kHz + 180 Hz body thump 15 ms | -10 dBFS |
| stutter | mechClick retriggered at 1/32 notes (~62 ms) ×8 with gain ramp | -12 dBFS |
| dataLoop | random-pitched square blips 1.2–3.4 kHz, 30 ms grid, 1-bar loop, LP 6 kHz | -22 dBFS (bed) |
| charge | sine sweep 120→1800 Hz exponential 1.2 s + rising noise + tremolo 8→24 Hz | -14 dBFS |
| whoosh | pink noise, band-pass sweeping 300→3000→600 Hz, amplitude bell 0.5 s | -14 dBFS |
| riser | 3 detuned saws, pitch +12 st over 2 s, HP sweep, ends with hard cut | -16 dBFS |
| glitch | 8–20 ms slices of noise/tones, bit-crush 4 bit, random pans → mono | -14 dBFS |
| pop | sine 900→300 Hz pitch drop in 40 ms + click | -12 dBFS |

Mixed layers: `saas_hook` (riser → hit + click on cut), `saas_dataflow` (dataLoop bed + charge + data clicks),
`saas_mech` (mechanical click rhythm + stutter + pop on CTA).

## Timing to cuts [R]
SFX transient lands **on** the cut frame or 1 frame before (perceived sync). Whoosh peaks at the cut. Riser
ends exactly at the hit; leave 2–4 frames of silence before a big hit. Duck the music bed -6 dB under hits.

## CC0 / free sources
| Source | Licence | Redistributable here? |
|---|---|---|
| [Kenney UI audio / Interface sounds](https://opengameart.org/content/interface-sounds) | CC0 [S] | Yes (we still synthesize our own) |
| [51 UI sound effects](https://opengameart.org/content/51-ui-sound-effects-buttons-switches-and-clicks) | CC0 [S] | Yes |
| [7 mechanical clicks and buzzes](https://opengameart.org/content/7-mechanical-clicks-and-buzzes) | check page [U] | Only if CC0 |
| Freesound (use licence filter = CC0) | per-file; mix of CC0 / CC-BY / CC-BY-NC [S] ([guide](https://gtstu.com/?p=5011)) | CC0 files only |
| BBC Sound Effects (RemArc) | personal/educational/research licence [U] | **No** — link only |
| Sonniss GDC bundles | royalty-free use, redistribution of raw files not allowed [U] | **No** — link only |
| Uppbeat, Artlist, Motion Array, Mixkit | proprietary [S/U] | **No** — link only |
