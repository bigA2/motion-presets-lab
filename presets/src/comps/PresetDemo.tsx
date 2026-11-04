// One composition that demos any single preset. Used for README stills and the editor's preset browser.
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Background, BG_PRESETS, BackgroundId } from '../bg/Backgrounds';
import { prog } from '../curves';
import { FONTS } from '../fonts';
import { GlassPanel, GLASS } from '../glass/Glass';
import { AppMock } from '../mockups/AppMock';
import { MockupMove, MOCKUP_MOVES } from '../mockups/Moves';
import { palette } from '../palettes';
import { TextFx, TEXT_PRESETS, TextPresetId } from '../text/TextFx';

export type DemoProps = { kind: 'text' | 'mockup' | 'glass' | 'bg'; id: string; paletteId?: string; label?: boolean };

const SAMPLE: Partial<Record<TextPresetId, string>> = {
  counterUp: 'Closed *1,284* invoices\nbefore lunch',
  strikeReplace: 'Month-end in 9 days|Month-end in 1 day',
  typewriter: 'reconcile --all *--auto*',
  typeCaretSnap: 'Ask Tallyroom anything',
  scramble: 'SYNCING 412 TXNS',
  slotRoll: 'Q4 CLOSED',
};

export const PresetDemo: React.FC<DemoProps> = ({ kind, id, paletteId, label = true }) => {
  const f = useCurrentFrame();
  const bgp = BG_PRESETS.find((b) => b.id === id);
  const pid = paletteId ?? (kind === 'bg' && bgp ? bgp.palette : 'graphiteSignal');
  const p = palette(pid);
  const bgId: BackgroundId = kind === 'bg' && bgp ? bgp.bg : kind === 'glass' ? 'meshDrift' : 'gridVignette';
  const bg = <Background bg={bgId} paletteId={pid} grain={0.05} />;
  let body: React.ReactNode = null;
  let note = '';
  if (kind === 'text') {
    const isExit = id === 'exitBlurDown';
    note = (TEXT_PRESETS as Record<string, { note: string }>)[id]?.note ?? '';
    body = <div style={{ position: 'absolute', left: 150, right: 150, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}>
      <TextFx text={SAMPLE[id as TextPresetId] ?? 'Close the books\n*in hours*, not days'} preset={id as TextPresetId} start={isExit ? 20 : 8} size={128} color={p.text} hotColor={p.accent} accent={p.accent} />
    </div>;
    if (id === 'highlightMarker') body = <div style={{ position: 'absolute', left: 150, top: 0, bottom: 0, display: 'flex', alignItems: 'center' }}><TextFx text={'Close the books\n*in hours*, not days'} preset="highlightMarker" start={8} size={128} color={p.text} hotColor={p.bg} accent={p.accent} /></div>;
  } else if (kind === 'mockup') {
    note = MOCKUP_MOVES[id]?.note ?? '';
    body = <MockupMove move={id} p={p} start={4} scale={0.92} />;
  } else if (kind === 'glass') {
    const g = GLASS[id]; note = g?.note ?? '';
    const behind = <AbsoluteFill>{bg}<div style={{ position: 'absolute', left: 120, top: 110, transform: 'scale(.95)', transformOrigin: '0 0' }}><AppMock p={p} /></div><div style={{ position: 'absolute', left: 1290, top: 200, width: 560, fontFamily: FONTS.display, fontSize: 150, lineHeight: 0.9, fontWeight: 760, color: p.accent, letterSpacing: '-0.05em' }}>94% auto</div></AbsoluteFill>;
    const q = prog(f, 0, 30, 'easeOutExpo');
    const pill = id === 'pill';
    body = <>{behind}<GlassPanel id={id} variant={id} x={pill ? 560 : 820} y={pill ? 820 - q * 40 : 360 - q * 40} w={pill ? 800 : 860} h={pill ? 130 : 520} radius={44} accent={p.accent} behind={behind} lightAngle={135 + f * 0.3}>
      <div style={{ padding: pill ? '0 48px' : 48, height: '100%', display: 'flex', flexDirection: pill ? 'row' : 'column', justifyContent: pill ? 'space-between' : 'flex-end', alignItems: pill ? 'center' : 'flex-start', color: id === 'milk' || id === 'frosted' ? p.text : '#fff', fontFamily: FONTS.display }}>
        {pill ? ['Overview', 'Reconcile', 'Close', 'Reports'].map((t, i) => <span key={t} style={{ fontSize: 34, fontWeight: i === 1 ? 700 : 500, opacity: i === 1 ? 1 : 0.75 }}>{t}</span>) : <><div style={{ fontSize: 26, opacity: 0.8, fontFamily: FONTS.mono }}>glass / {id}</div><div style={{ fontSize: 76, fontWeight: 680, letterSpacing: '-0.04em', lineHeight: 1 }}>412 matched<br />in 38 s</div></>}
      </div>
    </GlassPanel></>;
  } else {
    note = `${bgId} + ${pid}`;
    body = <div style={{ position: 'absolute', left: 150, bottom: 160 }}><div style={{ fontFamily: FONTS.display, fontSize: 120, fontWeight: 700, letterSpacing: '-0.045em', color: p.text, lineHeight: 0.95 }}>Close faster.<br /><span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, color: p.accent }}>Sleep better.</span></div>
      <div style={{ display: 'flex', gap: 14, marginTop: 36 }}>{[p.bg, p.panel, p.text, p.accent, p.hot].map((c, i) => <div key={i} style={{ width: 72, height: 72, borderRadius: 16, background: c, border: `1px solid ${p.line}` }} />)}</div></div>;
  }
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {kind !== 'glass' && bg}
      {body}
      {label && <div style={{ position: 'absolute', left: 40, top: 32, fontFamily: FONTS.mono, fontSize: 22, color: p.muted, letterSpacing: '0.02em' }}>{kind} / <span style={{ color: p.text }}>{id}</span>{note ? <span style={{ opacity: 0.7 }}>  —  {note}</span> : null}</div>}
    </AbsoluteFill>
  );
};
