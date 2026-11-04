// 12 background presets, each paired with a default palette. MIT, our own code.
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { Palette, palette } from '../palettes';

const alpha = (hex: string, a: number) => hex + Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');

export const Grain: React.FC<{ amount?: number; id?: string }> = ({ amount = 0.07, id = 'g' }) => {
  const f = useCurrentFrame();
  const seed = Math.floor(f / 2) % 24;
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', mixBlendMode: 'overlay', opacity: amount * 4 }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${id}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter={`url(#grain-${id})`} opacity={0.5} />
      </svg>
    </AbsoluteFill>
  );
};

type BgProps = { p: Palette; t: number; w: number; h: number };
const S = (n: number) => Math.sin(n);

const meshDrift: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg }}>
    <AbsoluteFill style={{ filter: 'blur(90px)', opacity: p.mode === 'dark' ? 0.75 : 0.6 }}>
      <div style={{ position: 'absolute', width: '55%', height: '70%', left: `${8 + S(t * 0.4) * 6}%`, top: `${-10 + S(t * 0.3 + 1) * 6}%`, background: p.bg2, borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: '38%', height: '48%', right: `${4 + S(t * 0.35 + 2) * 7}%`, bottom: `${-6 + S(t * 0.5) * 5}%`, background: alpha(p.accent, 0.42), borderRadius: '50%' }} />
      <div style={{ position: 'absolute', width: '22%', height: '30%', left: `${48 + S(t * 0.6 + 4) * 8}%`, top: `${40 + S(t * 0.45) * 6}%`, background: alpha(p.hot, 0.28), borderRadius: '50%' }} />
    </AbsoluteFill>
  </AbsoluteFill>
);
const gridVignette: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg }}>
    <AbsoluteFill style={{ backgroundImage: `linear-gradient(${p.line} 1px, transparent 1px), linear-gradient(90deg, ${p.line} 1px, transparent 1px)`, backgroundSize: '72px 72px', backgroundPosition: `${t * 6}px ${t * 4}px`, maskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 75%)' }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 40% at 50% 0%, ${alpha(p.accent, 0.16)}, transparent 70%)` }} />
  </AbsoluteFill>
);
const aurora: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg, overflow: 'hidden' }}>
    {[0, 1, 2, 3].map((i) => (
      <div key={i} style={{ position: 'absolute', top: '-30%', height: '90%', width: '18%', left: `${12 + i * 21 + S(t * 0.3 + i) * 4}%`, background: `linear-gradient(180deg, transparent, ${alpha(i % 2 ? p.accent : p.hot, i % 2 ? 0.38 : 0.2)} 60%, transparent)`, filter: 'blur(50px)', transform: `skewX(${-18 + S(t * 0.2 + i) * 6}deg)` }} />
    ))}
    <AbsoluteFill style={{ background: `linear-gradient(180deg, transparent 50%, ${p.bg} 95%)` }} />
  </AbsoluteFill>
);
const dotMatrix: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg }}>
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(${alpha(p.text, 0.22)} 1.4px, transparent 1.6px)`, backgroundSize: '28px 28px', maskImage: `radial-gradient(circle at ${50 + S(t * 0.3) * 20}% ${50 + S(t * 0.25) * 15}%, #000, transparent 60%)`, WebkitMaskImage: `radial-gradient(circle at ${50 + S(t * 0.3) * 20}% ${50 + S(t * 0.25) * 15}%, #000, transparent 60%)` }} />
  </AbsoluteFill>
);
const paperGrain: React.FC<BgProps> = ({ p }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 90% 70% at 50% 10%, ${p.panel}, ${p.bg} 60%, ${p.bg2})` }} />
);
const conicSweep: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', left: '50%', top: '120%', width: '260%', aspectRatio: '1', transform: `translate(-50%, -50%) rotate(${t * 8}deg)`, background: `conic-gradient(from 0deg, transparent 0deg, ${alpha(p.accent, 0.22)} 30deg, transparent 70deg, transparent 180deg, ${alpha(p.bg2, 0.9)} 220deg, transparent 260deg)`, filter: 'blur(40px)' }} />
  </AbsoluteFill>
);
const topo: React.FC<BgProps> = ({ p, t, w, h }) => (
  <AbsoluteFill style={{ background: p.bg }}>
    <svg width={w} height={h} style={{ position: 'absolute', opacity: 0.55 }}>
      {Array.from({ length: 16 }, (_, i) => {
        const r = 60 + i * 52; const cx = w * 0.72, cy = h * 0.62; const pts = 64;
        const d = Array.from({ length: pts + 1 }, (_, k) => { const a = (k / pts) * Math.PI * 2; const rr = r * (1 + 0.08 * Math.sin(a * 3 + i * 0.5 + t * 0.4) + 0.05 * Math.sin(a * 5 - t * 0.3)); return `${k ? 'L' : 'M'}${(cx + Math.cos(a) * rr * 1.3).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`; }).join(' ');
        return <path key={i} d={d} fill="none" stroke={i % 4 === 0 ? p.accent : p.line} strokeWidth={i % 4 === 0 ? 1.4 : 1} opacity={i % 4 === 0 ? 0.6 : 1} />;
      })}
    </svg>
  </AbsoluteFill>
);
const spotlight: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 40% 75% at ${50 + S(t * 0.25) * 6}% -10%, ${alpha(p.text, p.mode === 'dark' ? 0.14 : 0.5)}, transparent 70%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 18% at 50% 100%, ${alpha(p.accent, 0.18)}, transparent 70%)` }} />
  </AbsoluteFill>
);
const scanlines: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: `linear-gradient(180deg, ${p.bg}, ${p.bg2})` }}>
    <AbsoluteFill style={{ backgroundImage: `repeating-linear-gradient(0deg, ${alpha(p.text, 0.045)} 0 1px, transparent 1px 4px)` }} />
    <div style={{ position: 'absolute', left: 0, right: 0, height: '22%', top: `${((t * 14) % 140) - 20}%`, background: `linear-gradient(180deg, transparent, ${alpha(p.accent, 0.08)}, transparent)` }} />
  </AbsoluteFill>
);
const blobs: React.FC<BgProps> = ({ p, t }) => (
  <AbsoluteFill style={{ background: p.bg, overflow: 'hidden' }}>
    <div style={{ position: 'absolute', width: 900, height: 900, borderRadius: '42% 58% 63% 37% / 41% 44% 56% 59%', left: `${-12 + S(t * 0.3) * 4}%`, top: '30%', background: `radial-gradient(circle at 30% 30%, ${alpha(p.accent, 0.55)}, ${alpha(p.accent, 0)} 70%)`, filter: 'blur(30px)', transform: `rotate(${t * 10}deg)` }} />
    <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '58% 42% 37% 63% / 51% 54% 46% 49%', right: `${-8 + S(t * 0.4 + 2) * 4}%`, top: '-20%', background: `radial-gradient(circle at 60% 40%, ${alpha(p.hot, 0.45)}, ${alpha(p.hot, 0)} 70%)`, filter: 'blur(30px)', transform: `rotate(${-t * 8}deg)` }} />
  </AbsoluteFill>
);
const halftone: React.FC<BgProps> = ({ p, w, h, t }) => {
  const cols = 48, rows = Math.round((cols * h) / w); const cs = w / cols;
  return (
    <AbsoluteFill style={{ background: p.bg }}>
      <svg width={w} height={h}>
        {Array.from({ length: cols * rows }, (_, k) => {
          const x = k % cols, y = Math.floor(k / cols);
          const dd = Math.hypot(x / cols - 0.85, (y / rows) * (h / w) - 0.9 * (h / w));
          const r = Math.max(0, (0.62 - dd) * cs * 0.9 + Math.sin(dd * 18 - t * 2) * 1.2);
          return r > 0.4 ? <circle key={k} cx={x * cs + cs / 2} cy={y * cs + cs / 2} r={r} fill={p.accent} opacity={0.28} /> : null;
        })}
      </svg>
    </AbsoluteFill>
  );
};
const ribbon: React.FC<BgProps> = ({ p, t, w, h }) => (
  <AbsoluteFill style={{ background: p.bg }}>
    <svg width={w} height={h} style={{ filter: 'blur(1px)' }}>
      <defs><linearGradient id="rb" x1="0" x2="1"><stop offset="0" stopColor={p.accent} stopOpacity={0} /><stop offset="0.5" stopColor={p.accent} stopOpacity={0.7} /><stop offset="1" stopColor={p.hot} stopOpacity={0.1} /></linearGradient></defs>
      {Array.from({ length: 22 }, (_, i) => {
        const o = i * 7; const y0 = h * 0.75 + o, y1 = h * (0.2 + 0.05 * S(t * 0.5)) + o, y2 = h * 0.9 + o * 0.5;
        return <path key={i} d={`M ${-100} ${y0} C ${w * 0.3} ${y1}, ${w * 0.6} ${y2}, ${w + 100} ${h * 0.3 + o * 1.4}`} stroke="url(#rb)" strokeWidth={1.2} fill="none" opacity={1 - i / 26} />;
      })}
    </svg>
  </AbsoluteFill>
);

export const BACKGROUNDS = { meshDrift, gridVignette, aurora, dotMatrix, paperGrain, conicSweep, topo, spotlight, scanlines, blobs, halftone, ribbon } as const;
export type BackgroundId = keyof typeof BACKGROUNDS;
export const BACKGROUND_IDS = Object.keys(BACKGROUNDS) as BackgroundId[];
/** 12 background+palette presets */
export const BG_PRESETS: { id: string; bg: BackgroundId; palette: string }[] = [
  { id: 'inkGrid', bg: 'gridVignette', palette: 'inkCitrus' },
  { id: 'paperEditorial', bg: 'paperGrain', palette: 'paperCobalt' },
  { id: 'tealTopo', bg: 'topo', palette: 'nightTeal' },
  { id: 'plumMesh', bg: 'meshDrift', palette: 'bonePlum' },
  { id: 'graphiteSpot', bg: 'spotlight', palette: 'graphiteSignal' },
  { id: 'navyConic', bg: 'conicSweep', palette: 'primaryBRY' },
  { id: 'mintDots', bg: 'dotMatrix', palette: 'mintSlate' },
  { id: 'roseAurora', bg: 'aurora', palette: 'duskRose' },
  { id: 'forestHalftone', bg: 'halftone', palette: 'sandForest' },
  { id: 'voidRibbon', bg: 'ribbon', palette: 'electricVoid' },
  { id: 'tomatoBlobs', bg: 'blobs', palette: 'creamTomato' },
  { id: 'steelScan', bg: 'scanlines', palette: 'iceSteel' },
];

export const Background: React.FC<{ bg: BackgroundId; paletteId: string; grain?: number }> = ({ bg, paletteId, grain = 0.06 }) => {
  const f = useCurrentFrame(); const { width, height, fps } = useVideoConfig();
  const C = BACKGROUNDS[bg] ?? meshDrift;
  return (<AbsoluteFill><C p={palette(paletteId)} t={f / fps} w={width} h={height} />{grain > 0 && <Grain amount={grain} id={bg} />}</AbsoluteFill>);
};
