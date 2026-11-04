// A fictional finance-ops dashboard ("Tallyroom") used as the mockup subject. MIT, our own design.
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { lerp, prog } from '../curves';
import { FONTS } from '../fonts';
import { Palette } from '../palettes';

export type AppMockProps = {
  p: Palette; w?: number; h?: number;
  /** frame at which the UI starts building itself; -999 = already built */
  buildAt?: number; rowsAt?: number; chartAt?: number; toggleAt?: number; notifyAt?: number; counterAt?: number;
  spotlight?: { x: number; y: number; w: number; h: number; at: number } | null;
};

const rows = [
  ['Stripe payouts', 'Matched', '$48,210.00', 1], ['AWS — Oct', 'Review', '$12,904.31', 0], ['Payroll run 22', 'Matched', '$186,400.00', 1],
  ['Figma seats', 'Matched', '$2,160.00', 1], ['Wire — Halden GmbH', 'Missing receipt', '$9,850.00', 2], ['Gusto benefits', 'Matched', '$21,377.18', 1],
] as const;
const bars = [0.42, 0.58, 0.36, 0.71, 0.64, 0.88, 0.77, 0.94];

export const AppMock: React.FC<AppMockProps> = ({ p, w = 1280, h = 800, buildAt = -999, rowsAt, chartAt, toggleAt = 99999, notifyAt = 99999, counterAt, spotlight }) => {
  const f = useCurrentFrame();
  const pop = (i: number, base = buildAt) => { const q = prog(f, base + i * 3, 14, 'easeOutExpo'); return { opacity: q, transform: `translateY(${(1 - q) * 18}px)` }; };
  const rA = rowsAt ?? buildAt + 18, cA = chartAt ?? buildAt + 14;
  const tg = prog(f, toggleAt, 8, 'overshoot');
  const nt = prog(f, notifyAt, 18, 'overshoot');
  const cnt = prog(f, counterAt ?? buildAt + 10, 36, 'easeOutExpo');
  const dark = p.mode === 'dark';
  const card: React.CSSProperties = { background: p.panel, border: `1px solid ${p.line}`, borderRadius: 14 };
  const chip = (c: number) => [p.muted, p.accent, p.hot][c];
  return (
    <div style={{ width: w, height: h, background: dark ? p.bg : p.bg2, borderRadius: 22, overflow: 'hidden', position: 'relative', fontFamily: FONTS.sans, color: p.text, border: `1px solid ${p.line}`, display: 'flex' }}>
      {/* sidebar */}
      <div style={{ width: 220, padding: '26px 18px', borderRight: `1px solid ${p.line}`, background: dark ? p.panel : p.bg, ...pop(0) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 650, fontSize: 19, marginBottom: 30 }}>
          <div style={{ width: 26, height: 26, borderRadius: 8, background: p.accent, display: 'grid', placeItems: 'center' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: p.bg }} /></div>Tallyroom
        </div>
        {['Overview', 'Reconcile', 'Close checklist', 'Vendors', 'Reports'].map((t, i) => (
          <div key={t} style={{ padding: '10px 12px', borderRadius: 9, fontSize: 15, marginBottom: 4, color: i === 1 ? p.text : p.muted, background: i === 1 ? (dark ? p.line : p.panel) : 'transparent', fontWeight: i === 1 ? 600 : 450, ...pop(i + 1) }}>{t}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ...pop(2) }}>
          <div><div style={{ fontSize: 13, color: p.muted, letterSpacing: '0.04em', textTransform: 'uppercase' }}>October close</div><div style={{ fontSize: 28, fontWeight: 650, letterSpacing: '-0.02em' }}>Reconciliation</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: p.muted }}>
            Auto-match
            <div style={{ width: 46, height: 26, borderRadius: 99, background: tg > 0.5 ? p.accent : p.line, position: 'relative', transition: 'none' }}>
              <div style={{ position: 'absolute', top: 3, left: lerp(3, 23, tg), width: 20, height: 20, borderRadius: 99, background: dark ? p.text : '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14 }}>
          {[['Matched', `${Math.round(cnt * 94)}%`, p.accent], ['Open items', `${Math.round(lerp(212, 9, cnt))}`, p.text], ['Days to close', lerp(9, 1.5, cnt).toFixed(1), p.hot]].map(([k, v, c], i) => (
            <div key={k} style={{ ...card, flex: 1, padding: '16px 18px', ...pop(i + 3) }}>
              <div style={{ fontSize: 13, color: p.muted }}>{k}</div>
              <div style={{ fontSize: 34, fontWeight: 650, fontFamily: FONTS.mono, letterSpacing: '-0.03em', color: c as string, marginTop: 4 }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 0 }}>
          <div style={{ ...card, flex: 1.5, padding: 6, overflow: 'hidden', ...pop(6) }}>
            {rows.map(([n, s, a, c], i) => {
              const q = prog(f, rA + i * 2, 12, 'easeOutExpo');
              return (
                <div key={n} style={{ display: 'flex', alignItems: 'center', padding: '11px 14px', borderBottom: i < rows.length - 1 ? `1px solid ${p.line}` : 'none', fontSize: 15, opacity: q, transform: `translateX(${(1 - q) * -14}px)` }}>
                  <div style={{ flex: 1.4 }}>{n}</div>
                  <div style={{ flex: 1 }}><span style={{ fontSize: 12.5, padding: '3px 9px', borderRadius: 99, color: c === 0 ? p.text : chip(c), border: `1px solid ${c === 0 ? p.line : chip(c)}`, background: c === 1 ? `${p.accent}1f` : 'transparent' }}>{s}</span></div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 14, color: p.muted }}>{a}</div>
                </div>
              );
            })}
          </div>
          <div style={{ ...card, flex: 1, padding: 18, display: 'flex', flexDirection: 'column', ...pop(7) }}>
            <div style={{ fontSize: 13, color: p.muted }}>Auto-matched / week</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: 10, marginTop: 12 }}>
              {bars.map((b, i) => <div key={i} style={{ flex: 1, height: `${b * 100 * prog(f, cA + i * 3, 26, 'easeOutExpo')}%`, borderRadius: 6, background: i === bars.length - 1 ? p.accent : p.line }} />)}
            </div>
          </div>
        </div>
      </div>
      {/* toast */}
      <div style={{ position: 'absolute', right: 26, top: 22, width: 330, padding: '14px 16px', borderRadius: 14, background: dark ? p.text : p.text, color: dark ? p.bg : p.bg, display: 'flex', gap: 12, alignItems: 'center', fontSize: 14.5, boxShadow: '0 18px 40px rgba(0,0,0,.28)', opacity: Math.min(1, nt * 2), transform: `translateY(${(1 - nt) * -90}px)` }}>
        <div style={{ width: 28, height: 28, borderRadius: 99, background: p.accent, flexShrink: 0 }} /><div><b>412 transactions matched</b><div style={{ opacity: 0.7, fontSize: 13 }}>in 38 seconds</div></div>
      </div>
      {spotlight && (() => { const q = prog(f, spotlight.at, 14, 'easeOut'); return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: `0 0 0 9999px rgba(0,0,0,${0.55 * q})`, left: spotlight.x, top: spotlight.y, width: spotlight.w, height: spotlight.h, borderRadius: 14, outline: `2px solid ${p.accent}`, outlineOffset: 4, opacity: q > 0 ? 1 : 0 }} />); })()}
    </div>
  );
};
