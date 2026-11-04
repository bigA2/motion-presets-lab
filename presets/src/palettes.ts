// 12 palettes. Ratios = share of screen area per role. Our recipes, not performance-proven (see research/colour.md).
export type Palette = {
  id: string; name: string; mode: 'dark' | 'light';
  bg: string; bg2: string; panel: string; line: string; text: string; muted: string; accent: string; hot: string;
  ratio: { bg: number; panel: number; text: number; accent: number; hot: number };
  note: string;
};
const darkR = { bg: 58, panel: 28, text: 8, accent: 4, hot: 2 };
const lightR = { bg: 50, panel: 36, text: 9, accent: 3.5, hot: 1.5 };

export const PALETTES: Palette[] = [
  { id: 'inkCitrus', name: 'Ink / Citrus', mode: 'dark', bg: '#0E0F0C', bg2: '#1E2216', panel: '#1A1C17', line: '#2E3128', text: '#F3F1E8', muted: '#9A9A8C', accent: '#D7F25B', hot: '#FF6A3D', ratio: darkR, note: 'warm black, acid accent; dev-tool energy' },
  { id: 'paperCobalt', name: 'Paper / Cobalt', mode: 'light', bg: '#F2EFE7', bg2: '#E4DED0', panel: '#FFFFFF', line: '#DCD6C8', text: '#16181D', muted: '#6B6A66', accent: '#2440E6', hot: '#E8442E', ratio: lightR, note: 'editorial; works for finance / docs' },
  { id: 'nightTeal', name: 'Night / Teal', mode: 'dark', bg: '#071A1C', bg2: '#0D3236', panel: '#0E2A2D', line: '#1D4245', text: '#E7F4F2', muted: '#86A6A3', accent: '#3EE6C1', hot: '#FFD166', ratio: darkR, note: 'calm data / health' },
  { id: 'bonePlum', name: 'Bone / Plum', mode: 'light', bg: '#EDE6DD', bg2: '#DDD0C2', panel: '#F8F4EE', line: '#D8CDBF', text: '#2A1B2E', muted: '#776A73', accent: '#7B2D8E', hot: '#C2541A', ratio: lightR, note: 'premium, creator tools' },
  { id: 'graphiteSignal', name: 'Graphite / Signal', mode: 'dark', bg: '#121316', bg2: '#24262B', panel: '#1C1E22', line: '#2D3036', text: '#EDEEF0', muted: '#8B8F98', accent: '#FF4F1F', hot: '#FFFFFF', ratio: { ...darkR, accent: 5, hot: 1 }, note: 'single hot accent, Linear-ish restraint' },
  { id: 'primaryBRY', name: 'Navy / Yellow / Red (hypothesis)', mode: 'dark', bg: '#0F1B3D', bg2: '#1F3473', panel: '#172A5C', line: '#2A3F78', text: '#F5F6FA', muted: '#A3ADCC', accent: '#FFC93C', hot: '#FF5A5A', ratio: { bg: 55, panel: 28, text: 9, accent: 5, hot: 3 }, note: 'the blue+red+yellow claim — UNPROVEN, A/B test it' },
  { id: 'mintSlate', name: 'Mint / Slate', mode: 'light', bg: '#E3F0E9', bg2: '#C9E2D5', panel: '#FFFFFF', line: '#CFE0D6', text: '#0F2A22', muted: '#557268', accent: '#0B7F58', hot: '#111111', ratio: lightR, note: 'fintech trust' },
  { id: 'duskRose', name: 'Dusk / Rose', mode: 'dark', bg: '#1B1220', bg2: '#3A2141', panel: '#2A1C31', line: '#3D2B45', text: '#F7EDF2', muted: '#B39AAA', accent: '#FF7AA8', hot: '#FFE08A', ratio: darkR, note: 'consumer / social' },
  { id: 'sandForest', name: 'Sand / Forest', mode: 'light', bg: '#EFE9DC', bg2: '#DDD3BD', panel: '#FBF8F1', line: '#DCD3C0', text: '#1E2B1F', muted: '#66705F', accent: '#2F6B3A', hot: '#C24A1F', ratio: lightR, note: 'climate / ops' },
  { id: 'electricVoid', name: 'Void / Electric', mode: 'dark', bg: '#05060A', bg2: '#151A33', panel: '#10131C', line: '#1E2333', text: '#F2F4FF', muted: '#8A90A8', accent: '#7C8BFF', hot: '#00E0FF', ratio: darkR, note: 'AI tools — careful, closest to slop' },
  { id: 'creamTomato', name: 'Cream / Tomato', mode: 'light', bg: '#FFF6E9', bg2: '#F7E2C6', panel: '#FFFFFF', line: '#EEDCC4', text: '#2B1A12', muted: '#7A6556', accent: '#D93D20', hot: '#1D4ED8', ratio: lightR, note: 'friendly SMB' },
  { id: 'iceSteel', name: 'Ice / Steel', mode: 'light', bg: '#DCE3EA', bg2: '#C3CFDB', panel: '#F4F7FA', line: '#C9D3DD', text: '#0B1520', muted: '#56657A', accent: '#0A5AE0', hot: '#E2491A', ratio: lightR, note: 'infra / security' },
];
export const palette = (id: string) => PALETTES.find((p) => p.id === id) ?? PALETTES[0];
