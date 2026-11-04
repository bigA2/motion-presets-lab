// TextFx — 32 text animation presets in one engine. MIT, our own code.
// Markup: wrap hot words in *asterisks*, new lines with \n. e.g. "Close the books\n*in hours*, not days"
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CurveRef, ease, lerp, prog } from '../curves';
import { FONTS } from '../fonts';

type Unit = 'letter' | 'word' | 'line' | 'all';
type Ctx = { size: number; hot: boolean; i: number; n: number; f: number; accent: string; hotColor: string };
type Def = {
  unit: Unit; d: number; s: number; curve: CurveRef; mask?: boolean; perspective?: boolean;
  style?: (p: number, c: Ctx) => React.CSSProperties;
  /** effect applied to hot words after the reveal completes; q = 0..1 progress of hot effect */
  hotFx?: { d: number; delay: number; curve: CurveRef; style: (q: number, c: Ctx) => React.CSSProperties };
  custom?: 'scramble' | 'typewriter' | 'typeSnap' | 'slot' | 'glitch' | 'strike' | 'counter';
  note: string;
};

const fadeUp = (dist: number) => (p: number, c: Ctx): React.CSSProperties => ({ opacity: p, transform: `translateY(${(1 - p) * dist * c.size}px)` });
const bump = (amt: number) => (q: number) => 1 + amt * Math.sin(Math.PI * Math.min(1, q));

export const TEXT_PRESETS = {
  fadeUp: { unit: 'all', d: 18, s: 0, curve: 'easeOut', style: fadeUp(0.25), note: 'opacity + 0.25em rise' },
  wordRise: { unit: 'word', d: 16, s: 3, curve: 'easeOutExpo', style: fadeUp(0.45), note: 'per-word rise, 3f stagger' },
  letterRise: { unit: 'letter', d: 14, s: 1, curve: 'easeOutExpo', style: fadeUp(0.5), note: 'per-letter rise, 1f stagger' },
  blurInWord: { unit: 'word', d: 18, s: 3, curve: 'easeOut', style: (p, c) => ({ opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 0.12 * c.size}px)` }), note: 'per-word 14px blur → sharp' },
  blurInLine: { unit: 'line', d: 22, s: 6, curve: 'easeOut', style: (p) => ({ opacity: p, filter: `blur(${(1 - p) * 20}px)`, transform: `scale(${lerp(1.06, 1, p)})` }), note: 'per-line 20px blur + 6% scale settle' },
  maskWipeLR: { unit: 'all', d: 18, s: 0, curve: 'easeInOutExpo', style: (p) => ({ clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)` }), note: 'clip wipe left→right' },
  maskWipeUp: { unit: 'word', d: 20, s: 2, curve: 'easeOutExpo', mask: true, style: (p) => ({ transform: `translateY(${(1 - p) * 110}%)` }), note: 'words slide up inside mask' },
  lineMaskRise: { unit: 'line', d: 22, s: 5, curve: 'easeOutExpo', mask: true, style: (p) => ({ transform: `translateY(${(1 - p) * 115}%) rotate(${(1 - p) * 4}deg)`, transformOrigin: '0% 100%' }), note: 'editorial masked line rise with 4° tilt' },
  trackingIn: { unit: 'all', d: 30, s: 0, curve: 'easeOutExpo', style: (p) => ({ opacity: Math.min(1, p * 1.6), letterSpacing: `${lerp(0.42, -0.02, p)}em` }), note: 'letter-spacing 0.42em → -0.02em' },
  trackingOut: { unit: 'all', d: 24, s: 0, curve: 'easeOutExpo', style: (p) => ({ opacity: p, letterSpacing: `${lerp(-0.16, -0.02, p)}em`, filter: `blur(${(1 - p) * 6}px)` }), note: 'crushed → open tracking with blur' },
  weightMorph: { unit: 'letter', d: 26, s: 1, curve: 'easeInOut', style: (p) => ({ fontVariationSettings: `'wght' ${lerp(200, 800, p)}`, opacity: Math.min(1, 0.25 + p) }), note: 'variable wght 200 → 800, per letter' },
  weightPunchHot: { unit: 'word', d: 14, s: 3, curve: 'easeOutExpo', style: fadeUp(0.3), hotFx: { d: 14, delay: 4, curve: 'overshoot', style: (q) => ({ fontVariationSettings: `'wght' ${lerp(500, 820, Math.min(1, q))}`, transform: `scale(${bump(0.08)(q)})` }) }, note: 'hot word wght 500 → 820 + 8% bump' },
  scalePunchHot: { unit: 'word', d: 14, s: 3, curve: 'easeOutExpo', style: fadeUp(0.3), hotFx: { d: 10, delay: 3, curve: 'snap', style: (q) => ({ transform: `scale(${bump(0.18)(q)})` }) }, note: 'hot word scale 1 → 1.18 → 1 in 10f' },
  scaleIn: { unit: 'all', d: 16, s: 0, curve: 'overshoot', style: (p) => ({ opacity: Math.min(1, p * 2), transform: `scale(${lerp(0.82, 1, p)})` }), note: 'scale 0.82 → 1 overshoot' },
  dropIn: { unit: 'word', d: 18, s: 2, curve: 'overshoot', style: (p, c) => ({ opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * -0.9 * c.size}px)` }), note: 'words drop from above, overshoot' },
  slotRoll: { unit: 'letter', d: 24, s: 2, curve: 'easeOutExpo', custom: 'slot', note: 'odometer roll per letter' },
  scramble: { unit: 'letter', d: 10, s: 1, curve: 'linear', custom: 'scramble', note: 'random glyphs resolve left → right' },
  typewriter: { unit: 'letter', d: 1, s: 1.4, curve: 'linear', custom: 'typewriter', note: '1 char / 1.4f with blinking caret' },
  typeCaretSnap: { unit: 'word', d: 2, s: 6, curve: 'linear', custom: 'typeSnap', note: 'word-at-a-time typing, block caret' },
  splitCenter: { unit: 'all', d: 20, s: 0, curve: 'easeInOutExpo', style: (p) => ({ clipPath: `inset(-20% ${(1 - p) * 50}% -20% ${(1 - p) * 50}%)` }), note: 'clip opens from centre' },
  rotateXFlip: { unit: 'word', d: 20, s: 3, curve: 'easeOutBack', perspective: true, style: (p) => ({ opacity: Math.min(1, p * 1.5), transform: `rotateX(${(1 - p) * 92}deg)`, transformOrigin: '50% 100%' }), note: 'per-word rotateX 92° → 0' },
  skewSlide: { unit: 'word', d: 16, s: 2, curve: 'easeOutExpo', style: (p, c) => ({ opacity: p, transform: `translateX(${(1 - p) * 0.6 * c.size}px) skewX(${(1 - p) * -14}deg)` }), note: 'skewX -14° + slide' },
  glitchIn: { unit: 'all', d: 9, s: 0, curve: 'steps', custom: 'glitch', note: '9f RGB split + slice jitter, then clean' },
  gradientSweep: { unit: 'all', d: 40, s: 0, curve: 'easeInOut', style: (p) => ({ backgroundSize: '300% 100%', backgroundPosition: `${lerp(100, 0, p)}% 0`, opacity: Math.min(1, p * 3) }), note: 'gradient fill travels once across' },
  shineSweep: { unit: 'all', d: 26, s: 0, curve: 'easeInOut', style: (p) => ({ backgroundSize: '250% 100%', backgroundPosition: `${lerp(130, -30, p)}% 0` }), note: 'specular band crosses the text' },
  strikeReplace: { unit: 'all', d: 28, s: 0, curve: 'easeOutExpo', custom: 'strike', note: 'markup "old|new": strike, swap' },
  highlightMarker: { unit: 'word', d: 14, s: 2, curve: 'easeOutExpo', style: fadeUp(0.3), hotFx: { d: 14, delay: 2, curve: 'easeOutExpo', style: () => ({}) }, note: 'accent block wipes behind hot word' },
  underlineDraw: { unit: 'word', d: 14, s: 2, curve: 'easeOutExpo', style: fadeUp(0.3), hotFx: { d: 14, delay: 2, curve: 'easeOutExpo', style: () => ({}) }, note: 'underline draws under hot word' },
  counterUp: { unit: 'all', d: 36, s: 0, curve: 'easeOutExpo', custom: 'counter', note: 'first number counts up from 0' },
  stackPush: { unit: 'line', d: 18, s: 10, curve: 'easeOutExpo', style: fadeUp(0.4), note: 'lines stack, older lines dim to 35%' },
  focusPull: { unit: 'word', d: 10, s: 1, curve: 'easeOut', style: (p) => ({ opacity: p }), hotFx: { d: 16, delay: 6, curve: 'easeInOut', style: () => ({}) }, note: 'others blur 5px + dim, hot word stays sharp' },
  exitBlurDown: { unit: 'all', d: 12, s: 0, curve: 'easeIn', style: (p, c) => ({ opacity: 1 - p, filter: `blur(${p * 12}px)`, transform: `translateY(${p * 0.15 * c.size}px)` }), note: 'exit: blur 12px, drop, fade (12f)' },
} satisfies Record<string, Def>;

export type TextPresetId = keyof typeof TEXT_PRESETS;
export const TEXT_PRESET_IDS = Object.keys(TEXT_PRESETS) as TextPresetId[];

export type TextFxProps = {
  text: string; preset: TextPresetId; start?: number; size?: number; color?: string; hotColor?: string; accent?: string;
  font?: 'display' | 'sans' | 'serif' | 'mono'; weight?: number; align?: 'left' | 'center'; speed?: number;
  curve?: CurveRef; hotSerif?: boolean; lineHeight?: number; tracking?: number; maxWidth?: number;
};

type Word = { text: string; hot: boolean };
const parse = (text: string): Word[][] =>
  text.split('\n').map((line) => {
    const out: Word[] = []; let hot = false;
    for (const raw of line.split(' ').filter(Boolean)) {
      const opens = raw.startsWith('*'); const closes = raw.slice(1).includes('*');
      if (opens) hot = true;
      out.push({ text: raw.replace(/\*/g, ''), hot });
      if (closes) hot = false;
    }
    return out;
  });

const rnd = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+=<>/';

export const TextFx: React.FC<TextFxProps> = (props) => {
  const { text, preset, start = 0, size = 96, color = '#fff', hotColor, accent = '#D7F25B', font = 'display', weight = 620,
    align = 'left', speed = 1, curve, hotSerif = true, lineHeight = 1.02, tracking = -0.03, maxWidth } = props;
  const def = TEXT_PRESETS[preset] as Def;
  const f = (useCurrentFrame() - start) * speed;
  const lines = parse(text);
  const hc = hotColor ?? color;
  const d = def.d, s = def.s, cv = curve ?? def.curve;

  // unit indexing
  let letterCount = 0, wordCount = 0;
  const allLetters = lines.reduce((a, l) => a + l.reduce((b, w) => b + w.text.length, 0), 0);
  const allWords = lines.reduce((a, l) => a + l.length, 0);
  const n = def.unit === 'letter' ? allLetters : def.unit === 'word' ? allWords : def.unit === 'line' ? lines.length : 1;
  const revealEnd = (n - 1) * s + d;

  const base: React.CSSProperties = {
    fontFamily: FONTS[font], fontSize: size, lineHeight, letterSpacing: `${tracking}em`, color, textAlign: align,
    fontVariationSettings: `'wght' ${weight}`, fontWeight: weight, maxWidth, margin: 0,
  };
  const ctxFor = (i: number, hot: boolean): Ctx => ({ size, hot, i, n, f, accent, hotColor: hc });
  const pAt = (i: number) => prog(f, i * s, d, cv);

  const gradientFill = (p: React.CSSProperties) => preset === 'gradientSweep'
    ? { ...p, backgroundImage: `linear-gradient(90deg, ${color} 0%, ${color} 33%, ${accent} 50%, ${hc} 60%, ${color} 70%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
    : preset === 'shineSweep'
      ? { ...p, backgroundImage: `linear-gradient(100deg, ${color} 40%, #ffffff 50%, ${color} 60%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }
      : p;

  // ---- custom presets ----
  if (def.custom === 'typewriter' || def.custom === 'typeSnap') {
    const flat = lines.map((l) => l.map((w) => w.text).join(' ')).join('\n');
    let shown: number;
    if (def.custom === 'typewriter') shown = Math.floor(Math.max(0, f) / s);
    else { const words = flat.split(/(?<=[ \n])/); const k = Math.floor(Math.max(0, f) / s); shown = words.slice(0, k).join('').length; }
    const caretOn = Math.floor(f / 8) % 2 === 0 || shown < flat.length;
    const hotSet = new Set(lines.flat().filter((w) => w.hot).map((w) => w.text));
    const typed = flat.slice(0, shown);
    return (
      <div style={{ ...base, whiteSpace: 'pre-wrap' }}>
        {typed.split(/(\s+)/).map((w, k) => <span key={k} style={hotSet.has(w) ? { color: hc, fontFamily: hotSerif ? FONTS.serif : undefined, fontStyle: hotSerif ? 'italic' : undefined } : undefined}>{w}</span>)}
        <span style={{ display: 'inline-block', width: def.custom === 'typeSnap' ? '0.5em' : '0.06em', height: '0.9em', marginLeft: '0.04em', background: accent, opacity: caretOn ? 1 : 0, verticalAlign: '-0.08em' }} />
      </div>
    );
  }
  if (def.custom === 'counter') {
    const flat = lines.map((l) => l.map((w) => (w.hot ? `*${w.text}*` : w.text)).join(' ')).join('\n');
    const m = flat.match(/[\d.,]+/);
    const target = m ? parseFloat(m[0].replace(/,/g, '')) : 0;
    const dec = m && m[0].includes('.') ? m[0].split('.')[1].length : 0;
    const val = (target * prog(f, 0, d, cv)).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    const out = m ? flat.replace(m[0], val) : flat;
    return <TextFx {...props} text={out} preset="fadeUp" speed={4} start={start} />;
  }
  if (def.custom === 'strike') {
    const raw = lines.map((l) => l.map((w) => w.text).join(' ')).join(' ');
    const [oldT, newT = ''] = raw.split('|');
    const strike = prog(f, 0, 12, 'easeInOutExpo');
    const out = prog(f, 12, 10, 'easeIn');
    const inn = prog(f, 16, 16, 'easeOutExpo');
    return (
      <div style={{ ...base, position: 'relative' }}>
        <span style={{ position: 'relative', display: 'inline-block', opacity: 1 - out * 0.85, transform: `translateY(${out * 0.35 * size}px)`, filter: `blur(${out * 4}px)`, color: oldT ? props.color : color }}>
          {oldT.trim()}
          <span style={{ position: 'absolute', left: 0, top: '54%', height: Math.max(3, size * 0.06), width: '100%', background: hc, transform: `scaleX(${strike})`, transformOrigin: 'left' }} />
        </span>
        <div style={{ overflow: 'hidden', paddingBottom: '0.1em' }}>
          <span style={{ display: 'inline-block', transform: `translateY(${(1 - inn) * 110}%)`, color: hc, fontFamily: hotSerif ? FONTS.serif : undefined, fontStyle: hotSerif ? 'italic' : undefined }}>{newT.trim()}</span>
        </div>
      </div>
    );
  }
  if (def.custom === 'glitch') {
    const live = f >= 0 && f < d;
    const k = Math.floor(f);
    const dx = live ? (rnd(k) - 0.5) * size * 0.18 : 0;
    const slice = live ? `inset(${rnd(k + 3) * 60}% 0 ${rnd(k + 7) * 30}% 0)` : undefined;
    const flat = lines.map((l) => l.map((w) => w.text).join(' ')).join('\n');
    return (
      <div style={{ ...base, position: 'relative', whiteSpace: 'pre-wrap', opacity: f < 0 ? 0 : 1 }}>
        <div style={{ transform: `translateX(${dx}px)`, textShadow: live ? `${size * 0.05}px 0 #ff2d55, ${-size * 0.05}px 0 #00e5ff` : 'none' }}>{flat}</div>
        {live && <div style={{ position: 'absolute', inset: 0, clipPath: slice, transform: `translateX(${-dx * 1.8}px)`, color: accent }}>{flat}</div>}
      </div>
    );
  }

  // ---- unit renderer ----
  const hotWordIdx: number[] = [];
  const renderLine = (line: Word[], li: number) => {
    const lp = def.unit === 'line' ? pAt(li) : 1;
    const lineStyle = def.unit === 'line' && def.style ? def.style(lp, ctxFor(li, false)) : {};
    let dim = 1;
    if (preset === 'stackPush' && li < lines.length - 1) dim = lerp(1, 0.35, prog(f, (li + 1) * s, d, 'easeOut'));
    const rendered = line.map((w, wi) => {
      const wIdx = wordCount++;
      if (w.hot) hotWordIdx.push(wIdx);
      const wp = def.unit === 'word' ? pAt(wIdx) : 1;
      let st: React.CSSProperties = def.unit === 'word' && def.style ? def.style(wp, ctxFor(wIdx, w.hot)) : {};
      if (def.hotFx && !w.hot && preset === 'focusPull') {
        const qe = ease(Math.min(1, Math.max(0, (f - (revealEnd + def.hotFx.delay)) / def.hotFx.d)), def.hotFx.curve);
        st = { ...st, filter: `blur(${qe * 5}px)`, opacity: (st.opacity as number ?? 1) * lerp(1, 0.38, qe) };
      }
      const hotStyle: React.CSSProperties = w.hot ? { color: preset === 'highlightMarker' ? undefined : hc, fontFamily: hotSerif ? FONTS.serif : undefined, fontStyle: hotSerif ? 'italic' : undefined, fontWeight: hotSerif ? 400 : undefined, letterSpacing: hotSerif ? '-0.01em' : undefined } : {};
      const letters = def.unit === 'letter'
        ? [...w.text].map((ch, ci) => {
          const idx = letterCount++;
          const p = pAt(idx);
          if (def.custom === 'scramble') {
            const done = p >= 1; const started = f >= idx * s;
            const g = done ? ch : started ? GLYPHS[Math.floor(rnd(idx * 31 + Math.floor(f / 2)) * GLYPHS.length)] : '';
            return <span key={ci} style={{ display: 'inline-block', minWidth: done ? undefined : '0.55em', color: done ? undefined : (Math.floor(f / 2 + idx) % 3 === 0 ? accent : undefined), opacity: started ? 1 : 0 }}>{g || ch}</span>;
          }
          if (def.custom === 'slot') {
            const reel = [GLYPHS[Math.floor(rnd(idx) * GLYPHS.length)], GLYPHS[Math.floor(rnd(idx + 9) * GLYPHS.length)], GLYPHS[Math.floor(rnd(idx + 17) * GLYPHS.length)], ch];
            return <span key={ci} style={{ display: 'inline-block', overflow: 'hidden', height: `${lineHeight}em`, verticalAlign: 'top' }}><span style={{ display: 'flex', flexDirection: 'column', transform: `translateY(${-(1 - p) * 3 * lineHeight}em)`, opacity: f < idx * s ? 0 : 1 }}>{[...reel].reverse().map((r, k) => <span key={k} style={{ height: `${lineHeight}em` }}>{r}</span>)}</span></span>;
          }
          return <span key={ci} style={{ display: 'inline-block', whiteSpace: 'pre', ...(def.style ? def.style(p, ctxFor(idx, w.hot)) : {}) }}>{ch}</span>;
        })
        : w.text;
      const inner = <span style={{ display: 'inline-block', position: 'relative', whiteSpace: 'nowrap', ...hotStyle, ...st }}>{letters}</span>;
      return { hot: w.hot, el: def.mask && def.unit === 'word' ? <span key={wi} style={{ display: 'inline-block', overflow: 'hidden', verticalAlign: 'top', paddingBottom: '0.12em', marginBottom: '-0.12em' }}>{inner}</span> : <React.Fragment key={wi}>{inner}</React.Fragment> };
    });
    // group consecutive hot words so the hot effect (punch, marker, underline) applies to the whole phrase
    const groups: { hot: boolean; els: React.ReactNode[] }[] = [];
    for (const it of rendered) { const g = groups[groups.length - 1]; if (g && g.hot === it.hot) g.els.push(it.el); else groups.push({ hot: it.hot, els: [it.el] }); }
    const words = groups.map((g, gi) => {
      const kids = g.els.flatMap((e, k) => (k ? [' ', e] : [e]));
      const sep = gi < groups.length - 1 ? ' ' : null;
      if (!g.hot || !def.hotFx) return <React.Fragment key={gi}>{kids}{sep}</React.Fragment>;
      const q = Math.max(0, (f - (revealEnd + def.hotFx.delay)) / def.hotFx.d);
      const qe = ease(Math.min(1, q), def.hotFx.curve);
      const hs = def.hotFx.style(q >= 1 ? 1 : qe, ctxFor(gi, true));
      let deco: React.ReactNode = null;
      if (preset === 'highlightMarker') deco = <span style={{ position: 'absolute', left: '-0.1em', right: '-0.1em', top: '0.1em', bottom: '0.02em', background: accent, transform: `scaleX(${qe})`, transformOrigin: 'left', zIndex: -1, borderRadius: size * 0.05 }} />;
      if (preset === 'underlineDraw') deco = <span style={{ position: 'absolute', left: 0, right: 0, bottom: '0.02em', height: Math.max(3, size * 0.065), background: accent, transform: `scaleX(${qe})`, transformOrigin: 'left', borderRadius: 99 }} />;
      return <React.Fragment key={gi}><span style={{ display: 'inline-block', position: 'relative', zIndex: 0, transformOrigin: '50% 60%', color: preset === 'highlightMarker' ? (qe > 0.45 ? hc : color) : undefined, ...hs }}>{deco}{kids}</span>{sep}</React.Fragment>;
    });
    const lineEl = <div style={{ ...lineStyle, opacity: (lineStyle.opacity as number ?? 1) * dim, perspective: def.perspective ? 800 : undefined }}>{words}</div>;
    return def.mask && def.unit === 'line'
      ? <div key={li} style={{ overflow: 'hidden', paddingBottom: '0.14em', marginBottom: '-0.14em' }}>{lineEl}</div>
      : <React.Fragment key={li}>{lineEl}</React.Fragment>;
  };

  const allStyle = def.unit === 'all' && def.style ? def.style(pAt(0), ctxFor(0, false)) : {};
  return <div style={gradientFill({ ...base, ...allStyle, isolation: 'isolate' })}>{lines.map(renderLine)}</div>;
};
