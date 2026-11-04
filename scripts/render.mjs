// Renders the showreel (16:9 + 4:5) and every ads/*.json, masters audio to -14 LUFS, and writes 4 fps review sheets.
// Usage: node scripts/render.mjs [all|showreel|ads] [--scale=0.5]
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const what = process.argv[2] ?? 'all';
const scale = +(process.argv.find((a) => a.startsWith('--scale='))?.split('=')[1] ?? 1);
const browserExecutable = process.env.REMOTION_BROWSER || null;
const concurrency = +(process.env.CONCURRENCY ?? 4);
fs.mkdirSync('out/review', { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve('presets/src/index.ts'), publicDir: path.resolve('presets/sfx/out') });
// Prefer the system ffmpeg (full build: fps/tile/loudnorm); Remotion's bundled ffmpeg lacks some filters.
let sysFfmpeg = true; try { execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' }); } catch { sysFfmpeg = false; }
const ff = (args) => sysFfmpeg
  ? execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
  : execFileSync('npx', ['remotion', 'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' });

const jobs = [];
if (what === 'all' || what === 'showreel') jobs.push(['Showreel-16x9', {}, 'showreel-16x9'], ['Showreel-4x5', {}, 'showreel-4x5']);
if (what === 'all' || what === 'ads') for (const f of fs.readdirSync('ads').filter((x) => x.endsWith('.json'))) {
  jobs.push(['Ad', { spec: JSON.parse(fs.readFileSync(path.join('ads', f), 'utf8')) }, `ad-${path.basename(f, '.json')}`]);
}

for (const [id, inputProps, name] of jobs) {
  const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable });
  const raw = `out/${name}.raw.mp4`, final = `out/${name}.mp4`;
  console.log(`rendering ${name} ${composition.width}x${composition.height} ${composition.durationInFrames}f`);
  let last = -1;
  await renderMedia({ composition, serveUrl, codec: 'h264', crf: 18, outputLocation: raw, inputProps, scale, concurrency, browserExecutable,
    onProgress: ({ progress }) => { const p = Math.floor(progress * 10); if (p !== last) { last = p; console.log(`  ${p * 10}%`); } } });
  // master: -14 LUFS integrated, -1 dBTP
  ff(['-i', raw, '-c:v', 'copy', '-af', 'loudnorm=I=-14:TP=-1:LRA=11', '-c:a', 'aac', '-b:a', '192k', final]);
  fs.unlinkSync(raw);
  // review: 4 fps contact sheets (8 columns)
  if (sysFfmpeg) ff(['-i', final, '-vf', 'fps=4,scale=320:-2,tile=8x6:padding=4', `out/review/${name}-%02d.jpg`]);
  else console.log('  (no system ffmpeg: skipped review sheets)');
  console.log(`done ${final}`);
}
