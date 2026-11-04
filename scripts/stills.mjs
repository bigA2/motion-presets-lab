// Renders one still per preset into presets/stills/<kind>/<id>.jpg (960x540).
// Usage: node scripts/stills.mjs [kind] [id]. Text + mockup stills are 4-frame strips (left→right = time).
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [onlyKind, onlyId] = process.argv.slice(2);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const serveUrl = await bundle({ entryPoint: path.resolve('presets/src/index.ts'), publicDir: path.resolve('presets/sfx/out') });
const { TEXT_IDS, MOCK_IDS, MOCK_DUR, GLASS_IDS, BG_IDS } = JSON.parse(fs.readFileSync('presets/registry.json', 'utf8'));
const jobs = [
  ...TEXT_IDS.map((id) => ['text', id, id === 'exitBlurDown' ? 25 : id === 'typewriter' ? 30 : ['counterUp', 'gradientSweep'].includes(id) ? 30 : 22]),
  ...MOCK_IDS.map((id) => ['mockup', id, ['cardFan', 'cardStack3D', 'floatingLabels', 'depthLayers', 'notificationDrop', 'zoomHighlight'].includes(id) ? 50 : ['cursorClick'].includes(id) ? 30 : id === 'motionBlurTrail' ? 12 : id === 'deviceSwap' ? 25 : 24]),
  ...GLASS_IDS.map((id) => ['glass', id, 40]),
  ...BG_IDS.map((id) => ['bg', id, 45]),
].filter(([k, id]) => (!onlyKind || k === onlyKind) && (!onlyId || id === onlyId));

for (const [kind, id, frame] of jobs) {
  const inputProps = { kind, id };
  const composition = await selectComposition({ serveUrl, id: 'PresetDemo', inputProps, browserExecutable });
  if (kind === 'text' || kind === 'mockup') {
    fs.mkdirSync('out/strips', { recursive: true });
    const fr = kind === 'text' ? (id === 'exitBlurDown' ? [10, 22, 26, 34] : [12, 17, 24, 60]) : [0.1, 0.3, 0.55, 0.95].map((q) => Math.round(4 + q * MOCK_DUR[id]));
    const files = [];
    for (const fN of fr) { const o = `out/strips/${kind}-${id}-${fN}.jpg`; await renderStill({ composition, serveUrl, output: o, frame: Math.min(fN, composition.durationInFrames - 1), inputProps, scale: 0.25, imageFormat: 'jpeg', browserExecutable }); files.push(o); }
    const out = `presets/stills/${kind}/${id}.jpg`;
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap((x) => ['-i', x]), '-filter_complex', `hstack=inputs=${files.length}`, '-q:v', '4', out]);
    files.forEach((x) => fs.unlinkSync(x));
  } else {
    const out = `presets/stills/${kind}/${id}.jpg`;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await renderStill({ composition, serveUrl, output: out, frame, inputProps, scale: 0.5, imageFormat: 'jpeg', jpegQuality: 82, browserExecutable });
  }
  console.log('ok', kind, id);
}
