// Glow-trail typewriter: letters snap on one by one (no fade/blur/bounce); only the newest few letters glow in the
// accent colour and settle to the base colour as the next ones arrive — a bright "head" sweeping through the line.
// Same idea as a typewriter + duplicated coloured layer with a lagging Subtract range selector + glow in AE.
import React from 'react';
import {useCurrentFrame} from 'remotion';

type Props = {
  text: string;
  start?: number;          // frame the first letter appears
  perChar?: number;        // frames between letters (60 fps: 4.5 ≈ 13 letters/s)
  head?: number;           // how many newest letters glow
  base?: string;           // settled colour
  accent?: string;         // head colour
  glow?: number;           // glow radius in px at the very newest letter
  style?: React.CSSProperties;
};

const mix = (a: string, b: string, t: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

export const GlowTrailTypewriter: React.FC<Props> = ({text, start = 0, perChar = 4.5, head = 3.5, base = '#F4F7FA', accent = '#8BE9FF', glow = 18, style}) => {
  const f = useCurrentFrame();
  const typed = (f - start) / perChar; // letters revealed so far (fractional)
  return (
    <span style={{whiteSpace: 'pre', ...style}}>
      {[...text].map((ch, i) => {
        if (i > typed) return <span key={i} style={{opacity: 0}}>{ch}</span>; // keeps layout stable
        const age = Math.min(1, Math.max(0, (typed - i) / head)); // 0 = newest, 1 = settled
        const k = (1 - age) ** 1.5;
        return (
          <span key={i} style={{color: mix(accent, base, age), textShadow: k > 0.02 ? `0 0 ${glow * k}px ${accent}` : 'none'}}>{ch}</span>
        );
      })}
    </span>
  );
};
