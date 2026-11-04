# Live editing in the browser (GitHub Pages, no local install)

| Option | Licence | Graph editor / per-property bezier | Same code as render? | Verdict |
|---|---|---|---|---|
| Theatre.js studio | core Apache-2.0, **studio AGPL-3.0** [S] ([npm](https://npmjs.com/package/@theatre/studio), [GitHub](https://github.com/theatre-js/theatre)); npm latest 0.7.2 (checked via `npm view`) | Yes, best-in-class | No — needs an adapter from Theatre state to Remotion frames | Strong 2nd choice; AGPL is OK in a public repo but heavy |
| Remotion Player | Remotion licence: free for individuals / ≤3-person companies, else Company Licence [S] ([licence](https://remotion.dev/license), [FAQ](https://www.remotion.dev/docs/license/faq)) | No (we build one) | **Yes** — identical components | **Chosen** |
| Motion Canvas editor | MIT [S] ([docs](https://motioncanvas.io/docs)) | Timeline, not per-prop bezier | No (different engine) | No |
| Revideo | not verified this run [U] | — | No | No |
| Lottie editors (LottieFiles) | proprietary SaaS [U] | Yes | No | No |
| Rive | runtime MIT, editor proprietary [S] ([Rive](https://rive.app/runtimes)) | Yes | No | No |

## Choice: Remotion Player + our own keyframe/curve editor (MIT)
Reason: the preview *is* the renderer's code, so what the founder sees in the browser is what Actions renders.
We add a small graph editor: each element property is a list of keyframes, each segment has a named curve or a
custom cubic-bezier with draggable handles (After Effects style).

**Licence warning:** if the company has 4+ people it needs a Remotion Company Licence. Check before production use.

## Flow
1. Open `https://biga2.github.io/motion-presets-lab/` → sample ad plays.
2. Pick element → property → drag keyframes / bezier handles; switch palette, glass, text preset.
3. **Export JSON** (downloads `ad.json`) — or copy it.
4. Commit it as `ads/<name>.json` (GitHub web UI "Add file → Upload" — no local tools).
5. `render.yml` runs on push to `ads/**`, renders MP4, uploads as a workflow artifact.
