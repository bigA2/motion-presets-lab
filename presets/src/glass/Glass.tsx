// Liquid glass panels — 8 variants. MIT, our own code (no code copied from other implementations).
// Technique: the panel re-renders whatever is "behind" it (passed as `behind`) inside its own clip, and runs an
// SVG filter on that copy: edge-weighted displacement (lensing) per RGB channel (chromatic fringe) + light blur.
// Using `filter` on a copy (not backdrop-filter) keeps it deterministic in Remotion renders.
import React, { useMemo } from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';

export type GlassVariant = { id: string; refraction: number; rim: number; blur: number; chroma: number; tint: string; tintAlpha: number; highlight: number; radius?: number; shadow: number; note: string };

export const GLASS: Record<string, GlassVariant> = {
  clear: { id: 'clear', refraction: 38, rim: 0.22, blur: 1.5, chroma: 1, tint: '#ffffff', tintAlpha: 0.05, highlight: 0.8, shadow: 0.22, note: 'Apple-like clear lens; busy bg only' },
  frosted: { id: 'frosted', refraction: 12, rim: 0.2, blur: 12, chroma: 0.5, tint: '#ffffff', tintAlpha: 0.12, highlight: 0.6, shadow: 0.2, note: 'readable cards over imagery' },
  tinted: { id: 'tinted', refraction: 20, rim: 0.22, blur: 5, chroma: 1, tint: 'accent', tintAlpha: 0.16, highlight: 0.7, shadow: 0.24, note: 'brand-tinted CTA panel' },
  smoke: { id: 'smoke', refraction: 18, rim: 0.2, blur: 7, chroma: 0.7, tint: '#000000', tintAlpha: 0.32, highlight: 0.45, shadow: 0.3, note: 'dark glass for white text' },
  thickLens: { id: 'thickLens', refraction: 72, rim: 0.36, blur: 0.8, chroma: 1.8, tint: '#ffffff', tintAlpha: 0.04, highlight: 0.95, shadow: 0.26, note: 'heavy lensing, hero moments only' },
  pill: { id: 'pill', refraction: 22, rim: 0.4, blur: 3, chroma: 1, tint: '#ffffff', tintAlpha: 0.08, highlight: 0.85, radius: 999, shadow: 0.2, note: 'capsule (tab bar / button)' },
  prism: { id: 'prism', refraction: 24, rim: 0.25, blur: 2, chroma: 3.2, tint: '#ffffff', tintAlpha: 0.04, highlight: 0.8, shadow: 0.22, note: 'strong chromatic fringe; sparingly' },
  milk: { id: 'milk', refraction: 6, rim: 0.18, blur: 18, chroma: 0, tint: '#ffffff', tintAlpha: 0.36, highlight: 0.5, shadow: 0.16, note: 'legibility first, body text OK' },
};
export const GLASS_IDS = Object.keys(GLASS);

/** Edge-weighted displacement map: R encodes x offset, G encodes y offset, neutral (128) in the middle. */
const dispMap = (w: number, h: number, r: number, rimFrac: number) => {
  const rim = Math.max(8, Math.min(w, h) * rimFrac);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
<defs><linearGradient id="x" x1="0" x2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#f00"/></linearGradient>
<linearGradient id="y" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#0f0"/></linearGradient>
<filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${rim * 0.45}"/></filter></defs>
<rect width="${w}" height="${h}" fill="url(#x)"/><rect width="${w}" height="${h}" fill="url(#y)" style="mix-blend-mode:screen"/>
<rect x="${rim}" y="${rim}" width="${w - rim * 2}" height="${h - rim * 2}" rx="${Math.max(0, r - rim)}" fill="rgb(128,128,0)" filter="url(#b)"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export type GlassProps = {
  x: number; y: number; w: number; h: number; variant?: string; radius?: number; accent?: string;
  behind: React.ReactNode; children?: React.ReactNode; lightAngle?: number; opacity?: number; style?: React.CSSProperties; id?: string;
};

export const GlassPanel: React.FC<GlassProps> = ({ x, y, w, h, variant = 'clear', radius = 36, accent = '#ffffff', behind, children, lightAngle = 135, opacity = 1, style, id = 'gl' }) => {
  const v = GLASS[variant] ?? GLASS.clear;
  const { width, height } = useVideoConfig();
  const r = Math.min(v.radius ?? radius, h / 2, w / 2);
  const W = Math.max(2, Math.round(w)), H = Math.max(2, Math.round(h));
  const map = useMemo(() => dispMap(W, H, r, v.rim), [W, H, r, v.rim]);
  const fid = `lg-${id}-${v.id}`;
  const s = -v.refraction; // negative = magnify toward edges like a convex lens
  const c = v.chroma;
  const tint = v.tint === 'accent' ? accent : v.tint;
  const ta = Math.round(v.tintAlpha * 255).toString(16).padStart(2, '0');
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: w, height: h, borderRadius: r, opacity, boxShadow: `0 ${h * 0.06 + 10}px ${h * 0.14 + 24}px rgba(0,0,0,${v.shadow}), 0 1px 2px rgba(0,0,0,${v.shadow * 0.8})`, ...style }}>
      <svg width={0} height={0} style={{ position: 'absolute' }}>
        <filter id={fid} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" x={x - 60} y={y - 60} width={w + 120} height={h + 120} colorInterpolationFilters="sRGB">
          <feImage href={map} x={x} y={y} width={W} height={H} preserveAspectRatio="none" result="m" />
          <feDisplacementMap in="SourceGraphic" in2="m" scale={s} xChannelSelector="R" yChannelSelector="G" result="dr" />
          <feDisplacementMap in="SourceGraphic" in2="m" scale={s - c * 3} xChannelSelector="R" yChannelSelector="G" result="dg" />
          <feDisplacementMap in="SourceGraphic" in2="m" scale={s - c * 6} xChannelSelector="R" yChannelSelector="G" result="db" />
          <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feComposite in="r" in2="g" operator="arithmetic" k2={1} k3={1} result="rg" />
          <feComposite in="rg" in2="b" operator="arithmetic" k2={1} k3={1} result="rgb" />
          <feGaussianBlur in="rgb" stdDeviation={v.blur} />
        </filter>
      </svg>
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, overflow: 'hidden', isolation: 'isolate' }}>
        <div style={{ position: 'absolute', left: -x, top: -y, width, height, filter: `url(#${fid})` }}>
          <AbsoluteFill>{behind}</AbsoluteFill>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: `${tint}${ta}` }} />
        {/* soft interior light: brighter toward the light, plus a caustic glow on the far edge */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(${lightAngle + 180}deg, rgba(255,255,255,${0.12 * v.highlight}), transparent 35%, transparent 70%, rgba(255,255,255,${0.07 * v.highlight}))` }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: r, boxShadow: `inset 0 1px 1px rgba(255,255,255,${0.5 * v.highlight}), inset 0 -${h * 0.04}px ${h * 0.12}px rgba(255,255,255,${0.05 * v.highlight})` }} />
      </div>
      {/* edge highlight rim (1.3px), brightest toward the light source */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: r, padding: 1.3, background: `linear-gradient(${lightAngle + 180}deg, rgba(255,255,255,${0.85 * v.highlight}), rgba(255,255,255,${0.12 * v.highlight}) 38%, rgba(255,255,255,0.04) 62%, rgba(255,255,255,${0.4 * v.highlight}))`, WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
    </div>
  );
};
