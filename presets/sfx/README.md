# SFX — synthesised from scratch (MIT)

`python3 presets/sfx/synth.py` regenerates every file in `out/` deterministically (seeded). No samples, no
third-party audio. 48 kHz / 16-bit mono WAV. Measured loudness is in `out/loudness.json` (BS.1770, checked against ffmpeg `ebur128`).

| File | What | Use |
|---|---|---|
| `click.wav` | 2 ms HP noise + 4.2 kHz ping | UI tap, toggle |
| `mech_click.wav` | press + release transients 9 ms apart + 180 Hz body | keyboard / "mechanical click" trend |
| `stutter.wav` | mech click ×8 at 1/32 (62.5 ms), rising gain | before a reveal |
| `data_loop.wav` | random square blips on a 30 ms grid, 1 bar @120 bpm, loopable | bed under data/AI moments |
| `charge.wav` | 120→1800 Hz exp sweep + tremolo 8→24 Hz + rising hiss | build into a stat |
| `whoosh.wav` | pink noise, band-pass 300→3000→600 Hz, peak at 55% | transitions (peak on the cut) |
| `riser.wav` | 3 detuned saws +12 st over 2 s, HP sweep, hard cut | pre-hook tension |
| `glitch.wav` | 8–20 ms crushed slices | glitch text, error state |
| `pop.wav` | 900→300 Hz pitch drop + click | element pop-in, chips |
| `hit.wav` | 55 Hz sub drop + noise crack | logo / hook impact |
| `saas_hook.wav` | riser → 3f silence → hit + click on cut @2.1 s → whoosh | ad opener |
| `saas_dataflow.wav` | data bed + charge + data clicks + pop | feature/AI section |
| `saas_mech.wav` | 1/8-note mech clicks @128 bpm + stutter + glitch + pop | "viral SFX" reel style |

Loudness: one-shots target -18 LUFS with a -1 dBFS peak cap (short clicks therefore read -24 to -28 LUFS, which
is expected for 60 ms sounds); layers are limited to -16 LUFS, ceiling -1 dBFS. Recipes are ours — see
`research/sfx.md` for what is sourced vs. opinion.
