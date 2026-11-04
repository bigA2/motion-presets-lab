// Writes presets/registry.json (preset id lists) by reading the source — used by scripts and the editor.
import fs from 'node:fs';
const read = (f) => fs.readFileSync(`presets/src/${f}`, 'utf8');
const keysOf = (src, start) => { const s = src.slice(src.indexOf(start)); const body = s.slice(s.indexOf('{') + 1); const out = []; let depth = 0; for (const line of body.split('\n')) { const m = line.match(/^\s{2}(\w+): \{/); if (depth === 0 && m) out.push(m[1]); depth += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length; if (depth < 0) break; } return out; };
const reg = {
  TEXT_IDS: keysOf(read('text/TextFx.tsx'), 'export const TEXT_PRESETS'),
  MOCK_IDS: keysOf(read('mockups/Moves.tsx'), 'export const MOCKUP_MOVES'),
  GLASS_IDS: keysOf(read('glass/Glass.tsx'), 'export const GLASS'),
  MOCK_DUR: Object.fromEntries([...read('mockups/Moves.tsx').matchAll(/^  (\w+): \{ note: .*?dur: (\d+)/gm)].map((m) => [m[1], +m[2]])),
  BG_IDS: [...read('bg/Backgrounds.tsx').matchAll(/\{ id: '(\w+)', bg:/g)].map((m) => m[1]),
};
fs.writeFileSync('presets/registry.json', JSON.stringify(reg, null, 1));
console.log(Object.fromEntries(Object.entries(reg).map(([k, v]) => [k, Array.isArray(v) ? v.length : Object.keys(v).length])));
