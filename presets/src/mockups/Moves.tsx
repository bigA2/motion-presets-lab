// 21 mockup moves. Each move = a function of local frame returning wrapper styles + AppMock props + overlays.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { CurveRef, ease, lerp, prog } from '../curves';
import { FONTS } from '../fonts';
import { Palette } from '../palettes';
import { AppMock, AppMockProps } from './AppMock';

// ---- cursor ----
export type CursorKey = { f: number; x: number; y: number; click?: boolean };
export const Cursor: React.FC<{ path: CursorKey[]; color?: string; ring?: string; arc?: number; curve?: CurveRef; hesitate?: boolean }> = ({ path, color = '#fff', ring = '#fff', arc = 0.12, curve = 'easeInOut', hesitate }) => {
  const f = useCurrentFrame();
  let x = path[0].x, y = path[0].y;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    if (f >= a.f && f <= b.f) {
      let t = ease((f - a.f) / (b.f - a.f), hesitate ? [0.3, 0, 0.1, 1] : curve);
      if (hesitate) t = t + Math.sin(t * Math.PI) * 0.0 + (t > 0.85 ? Math.sin((t - 0.85) / 0.15 * Math.PI) * 0.03 : 0);
      // curved path: offset perpendicular to the segment by a sine bump (hands never move in straight lines)
      const dx = b.x - a.x, dy = b.y - a.y; const bump = Math.sin(t * Math.PI) * arc;
      x = a.x + dx * t - dy * bump; y = a.y + dy * t + dx * bump;
    } else if (f > b.f) { x = b.x; y = b.y; }
  }
  const lastClick = [...path].filter((k) => k.click && f >= k.f).pop();
  const since = lastClick ? f - lastClick.f : 99;
  const press = since < 8 ? 1 - Math.sin((since / 8) * Math.PI) * 0.15 : 1;
  const rp = prog(since, 0, 16, 'easeOut');
  return (
    <div style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none', zIndex: 50 }}>
      {since < 16 && <div style={{ position: 'absolute', left: -28, top: -28, width: 56, height: 56, borderRadius: 99, border: `2px solid ${ring}`, transform: `scale(${lerp(0.3, 1.3, rp)})`, opacity: 1 - rp }} />}
      <svg width={30} height={30} viewBox="0 0 24 24" style={{ transform: `scale(${press})`, transformOrigin: '3px 3px', filter: 'drop-shadow(0 3px 6px rgba(0,0,0,.35))' }}>
        <path d="M3 2 L3 19 L7.6 14.8 L10.6 21.4 L13.4 20.2 L10.5 13.8 L16.8 13.6 Z" fill={color} stroke="#000" strokeOpacity={0.55} strokeWidth={1.1} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

type MoveOut = { wrap?: React.CSSProperties; mock?: Partial<AppMockProps>; over?: (p: Palette) => React.ReactNode; under?: (p: Palette) => React.ReactNode; layers?: boolean };
type MoveDef = { note: string; dur: number; fn: (f: number) => MoveOut };

const persp = (rx: number, ry: number, s = 1, tx = 0, ty = 0, tz = 0) => `perspective(1400px) translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s})`;

const chips = (f: number, p: Palette, labels = ['-38s close', '94% matched', 'SOC 2']) => labels.map((t, i) => {
  const q = prog(f, 6 + i * 5, 18, 'overshoot');
  const pos = [[-90, 140], [1180, 90], [1120, 660]][i];
  return <div key={t} style={{ position: 'absolute', left: pos[0], top: pos[1] + Math.sin(f / 15 + i * 2) * 6, padding: '12px 18px', borderRadius: 99, background: p.panel, border: `1px solid ${p.line}`, color: p.text, fontFamily: FONTS.sans, fontSize: 22, fontWeight: 600, boxShadow: '0 16px 30px rgba(0,0,0,.25)', transform: `scale(${q})`, opacity: Math.min(1, q * 2) }}><span style={{ color: i === 1 ? p.accent : p.text }}>{t}</span></div>;
});

export const MOCKUP_MOVES: Record<string, MoveDef> = {
  landView: { note: 'rotateX 28→0, rotateY -18→0, scale .9→1, 40f easeOutExpo', dur: 60, fn: (f) => { const q = prog(f, 0, 40, 'easeOutExpo'); return { wrap: { transform: persp(lerp(28, 0, q), lerp(-18, 0, q), lerp(0.9, 1, q), 0, lerp(120, 0, q)), opacity: Math.min(1, q * 3) } }; } },
  tiltIdle: { note: 'idle drift rotateY ±3°, rotateX 6±1°, 120f sine', dur: 120, fn: (f) => ({ wrap: { transform: persp(6 + Math.sin(f / 30) * 1, Math.sin((f / 120) * Math.PI * 2) * 3, 0.96) } }) },
  cameraPush: { note: 'dolly scale 1→1.35 toward the KPI cards, 90f easeInOut', dur: 90, fn: (f) => ({ wrap: { transform: `scale(${lerp(1, 1.35, prog(f, 0, 90, 'easeInOut'))})`, transformOrigin: '55% 22%' } }) },
  cameraPan: { note: 'pan table → chart, 50f easeInOutExpo, at 1.3x', dur: 70, fn: (f) => ({ wrap: { transform: `scale(1.3) translateX(${lerp(120, -160, prog(f, 10, 50, 'easeInOutExpo'))}px)` } }) },
  pushAndSettle: { note: 'scale 1→1.12 then settle 1.08, 24f overshoot', dur: 40, fn: (f) => ({ wrap: { transform: `scale(${lerp(1, 1.08, prog(f, 0, 24, [0.3, 2.2, 0.5, 1]))})` } }) },
  cardFan: { note: '3 cards fan rot -14/0/+14°, x ±70, 24f stagger 4 overshoot', dur: 50, fn: () => ({}) },
  cardStack3D: { note: 'cards stacked z 0/-80/-160 spread to -0/-260/-520', dur: 60, fn: () => ({}) },
  depthLayers: { note: 'parallax: bg 0.4x, ui 1x, chips 1.6x of camera move', dur: 90, fn: (f) => { const m = lerp(-60, 60, prog(f, 0, 90, 'easeInOut')); return { wrap: { transform: `translateX(${m}px) scale(.92)` }, over: (p) => <div style={{ position: 'absolute', inset: 0, transform: `translateX(${m * 0.6}px)` }}>{chips(30, p)}</div>, layers: true }; } },
  parallaxDrift: { note: 'ui and chips drift in opposite directions ±16px/s', dur: 90, fn: (f) => ({ wrap: { transform: `translateY(${-f * 0.5}px) scale(.92)` }, over: (p) => <div style={{ position: 'absolute', inset: 0, transform: `translateY(${f * 0.5}px)` }}>{chips(40, p)}</div> }) },
  cursorMove: { note: 'cursor on an arced bezier path, 30f easeInOut, 12% arc', dur: 60, fn: () => ({ over: (p) => <Cursor color={p.text} ring={p.accent} path={[{ f: 0, x: 300, y: 700 }, { f: 30, x: 1100, y: 70 }]} /> }) },
  cursorClick: { note: 'press scale .85 over 8f + ring ripple 16f; UI reacts 4f later', dur: 60, fn: () => ({ mock: { toggleAt: 28 }, over: (p) => <Cursor color={p.text} ring={p.accent} path={[{ f: 0, x: 700, y: 600 }, { f: 22, x: 1162, y: 66 }, { f: 24, x: 1162, y: 66, click: true }]} /> }) },
  cursorHesitate: { note: 'decelerates hard near target, 3% overshoot then settles', dur: 60, fn: () => ({ over: (p) => <Cursor hesitate color={p.text} ring={p.accent} path={[{ f: 0, x: 400, y: 720 }, { f: 40, x: 980, y: 210, click: true }]} /> }) },
  uiBuild: { note: 'UI builds itself: elements pop stagger 3f, y 18→0', dur: 60, fn: () => ({ mock: { buildAt: 0 } }) },
  rowCascade: { note: 'table rows reveal top→bottom stagger 2f', dur: 40, fn: () => ({ mock: { rowsAt: 0 } }) },
  chartGrow: { note: 'bars grow 26f easeOutExpo stagger 3f', dur: 60, fn: () => ({ mock: { chartAt: 0, counterAt: 0 } }) },
  toggleFlip: { note: 'switch flips 8f overshoot', dur: 30, fn: () => ({ mock: { toggleAt: 8 } }) },
  notificationDrop: { note: 'toast drops from top 18f overshoot', dur: 40, fn: () => ({ mock: { notifyAt: 4 } }) },
  floatingLabels: { note: 'callout chips pop (overshoot) then bob ±6px', dur: 90, fn: (f) => ({ wrap: { transform: 'scale(.92)' }, over: (p) => <>{chips(f, p)}</> }) },
  zoomHighlight: { note: 'spotlight dims 55% except one region, 14f', dur: 50, fn: () => ({ mock: { spotlight: { x: 248, y: 108, w: 1006, h: 112, at: 6 } } }) },
  motionBlurTrail: { note: 'whip-in from right, blur = 0.04 · px/frame', dur: 30, fn: (f) => { const x = lerp(1600, 0, prog(f, 0, 18, 'whip')); const v = Math.abs(lerp(1600, 0, prog(f + 1, 0, 18, 'whip')) - x); return { wrap: { transform: `translateX(${x}px)`, filter: `blur(${Math.min(24, v * 0.04)}px)` } }; } },
  deviceSwap: { note: 'rotateY 0→180 reveals second screen, 30f easeInOutExpo', dur: 50, fn: () => ({}) },
};
export const MOCKUP_MOVE_IDS = Object.keys(MOCKUP_MOVES);

/** Renders a mockup move on the AppMock, centred in a 1920x1080 (or any) frame. */
export const MockupMove: React.FC<{ move: string; p: Palette; start?: number; scale?: number; built?: boolean }> = ({ move, p, start = 0, scale = 1, built = true }) => {
  const f = useCurrentFrame() - start;
  const def = MOCKUP_MOVES[move] ?? MOCKUP_MOVES.landView;
  const o = def.fn(f);
  const base: AppMockProps = { p, buildAt: built ? -999 : 0, ...o.mock };
  const W = 1280, H = 800;
  const shadow: React.CSSProperties = { boxShadow: `0 40px 90px rgba(0,0,0,${p.mode === 'dark' ? 0.55 : 0.22}), 0 2px 6px rgba(0,0,0,.2)`, borderRadius: 22 };

  let body: React.ReactNode;
  if (move === 'cardFan' || move === 'cardStack3D') {
    const cards = [0, 1, 2].map((i) => {
      let t: string;
      if (move === 'cardFan') { const q = prog(f, i * 4, 24, 'overshoot'); t = `translateX(${(i - 1) * 300 * q}px) rotate(${(i - 1) * 14 * q}deg) translateY(${Math.abs(i - 1) * 40 * q}px)`; }
      else { const q = prog(f, 0, 40, 'easeOutExpo'); t = `perspective(2000px) rotateX(${lerp(20, 42, q)}deg) rotateZ(${lerp(-12, -24, q)}deg) translate3d(${(i - 1) * lerp(20, 120, q)}px, ${(1 - i) * lerp(30, 150, q)}px, ${-i * 60}px)`; }
      const cs = move === 'cardFan' ? 0.48 : 0.55;
      return <div key={i} style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -W * cs / 2, marginTop: -H * cs / 2, zIndex: 3 - i, transform: t, transformOrigin: move === 'cardFan' ? '50% 100%' : '50% 50%', opacity: move === 'cardStack3D' ? 1 - i * 0.18 : 1 }}><div style={{ transform: `scale(${cs})`, transformOrigin: '0 0', width: W, height: H, ...shadow }}><AppMock {...base} /></div></div>;
    });
    body = <>{cards}</>;
  } else if (move === 'deviceSwap') {
    const q = prog(f, 8, 30, 'easeInOutExpo');
    const alt = { ...p, accent: p.hot, hot: p.accent };
    body = <div style={{ transform: `perspective(1800px) rotateY(${q * 180}deg) scale(${1 - Math.sin(q * Math.PI) * 0.1})`, transformStyle: 'preserve-3d', width: W, height: H, position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', ...shadow }}><AppMock {...base} /></div>
      <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', ...shadow }}><AppMock {...base} p={alt} counterAt={-999} /></div>
    </div>;
  } else {
    body = <div style={{ ...o.wrap, ...shadow, width: W, height: H, position: 'relative' }}><AppMock {...base} />{o.over && o.over !== undefined && !o.layers && move.startsWith('cursor') ? o.over(p) : null}</div>;
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: -W / 2, marginTop: -H / 2, transform: `scale(${scale})`, width: W, height: H }}>
        {move === 'cardFan' || move === 'cardStack3D' || move === 'deviceSwap' ? <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>{body}</div> : body}
        {o.over && !move.startsWith('cursor') ? o.over(p) : null}
      </div>
    </div>
  );
};
