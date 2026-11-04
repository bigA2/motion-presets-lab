// 35 s showreel built only from the lab's presets + SFX. Adapts to 16:9 and 4:5.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, Series, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, BG_PRESETS, BackgroundId } from '../bg/Backgrounds';
import { lerp, prog } from '../curves';
import { FONTS } from '../fonts';
import { GlassPanel } from '../glass/Glass';
import { AppMock } from '../mockups/AppMock';
import { Cursor, MockupMove } from '../mockups/Moves';
import { palette } from '../palettes';
import { TextFx, TextPresetId } from '../text/TextFx';

export type ShowreelProps = Record<string, never>;

const useK = () => { const { width: W, height: H } = useVideoConfig(); return { W, H, k: Math.min(W, H) / 1080, tall: H > W }; };
const Sfx: React.FC<{ f: string; at?: number; v?: number }> = ({ f, at = 0, v = 1 }) => <Sequence from={at} layout="none"><Audio src={staticFile(f)} volume={v} /></Sequence>;
const bgp = (id: string) => BG_PRESETS.find((b) => b.id === id)!;
const Bg: React.FC<{ preset: string; shift?: number }> = ({ preset, shift }) => { const b = bgp(preset); return <Background bg={b.bg as BackgroundId} paletteId={b.palette} grain={0.05} shift={shift} />; };

// ---------- scenes ----------
const S1_FRAMES = 63;
const Hook: React.FC = () => {
  const f = useCurrentFrame(); const { k, tall } = useK(); const p = palette('graphiteSignal');
  const out = prog(f, 52, 11, 'easeIn');
  return (
    <AbsoluteFill>
      <Bg preset="graphiteSpot" />
      <div style={{ position: 'absolute', left: tall ? 70 : 150 * k, right: 70, top: '50%', transform: `translateY(-50%) translateY(${out * 30}px)`, filter: `blur(${out * 14}px)`, opacity: 1 - out * 0.6 }}>
        <TextFx text={'Month-end\ntakes *nine days.*'} preset="lineMaskRise" start={4} size={(tall ? 140 : 200) * k} color={p.text} hotColor={p.accent} accent={p.accent} />
      </div>
      <Sfx f="saas_hook.wav" v={0.9} />
    </AbsoluteFill>
  );
};

const S2_FRAMES = 150;
const Product: React.FC = () => {
  const f = useCurrentFrame(); const { W, H, k, tall } = useK(); const p = palette('graphiteSignal');
  const ms = tall ? W / 1400 : Math.min(W / 1720, H / 1180);
  const land = prog(f, 0, 40, 'easeOutExpo');
  const push = prog(f, 60, 90, 'easeInOut');
  const mx = W / 2 - 640 * ms, my = (tall ? H * 0.56 : H * 0.57) - 400 * ms;
  const mock = (
    <div style={{ position: 'absolute', left: mx, top: my, width: 1280, height: 800, transformOrigin: '0 0', transform: `scale(${ms * lerp(1, 1.06, push)}) ${`perspective(1400px) rotateX(${lerp(26, 0, land)}deg) rotateY(${lerp(-16, 0, land)}deg)`}`, boxShadow: '0 50px 100px rgba(0,0,0,.55)', borderRadius: 22, opacity: Math.min(1, land * 3) }}>
      <AppMock p={p} buildAt={4} toggleAt={66} notifyAt={72} counterAt={74} rowsAt={20} chartAt={30} />
      <Cursor color={p.text} ring={p.accent} path={[{ f: 30, x: 640, y: 700 }, { f: 60, x: 1162, y: 66 }, { f: 62, x: 1162, y: 66, click: true }, { f: 100, x: 900, y: 420 }]} />
    </div>
  );
  const behind = <AbsoluteFill><Bg preset="graphiteSpot" shift={S1_FRAMES} />{mock}</AbsoluteFill>;
  const gq = prog(f, 86, 26, 'easeOutExpo');
  const gw = (tall ? 620 : 560) * k, gh = 250 * k;
  const gx = tall ? W / 2 - gw / 2 : W - gw - 110 * k, gy = (tall ? H - gh - 70 * k : H - gh - 80 * k) + (1 - gq) * 120 * k;
  return (
    <AbsoluteFill>
      {behind}
      <div style={{ position: 'absolute', left: tall ? 70 : 110 * k, top: (tall ? 90 : 70) * k }}>
        <TextFx text={'Tallyroom closes it in *hours.*'} preset="blurInWord" start={6} size={(tall ? 66 : 76) * k} color={p.text} hotColor={p.accent} accent={p.accent} />
      </div>
      {gq > 0 && <GlassPanel id="s2" variant="clear" x={gx} y={gy} w={gw} h={gh} radius={34 * k} behind={behind} opacity={Math.min(1, gq * 2)}>
        <div style={{ padding: 30 * k, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff', fontFamily: FONTS.display }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 22 * k, opacity: 0.75 }}>auto-match</div>
          <div style={{ fontSize: 70 * k, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1 }}>{Math.round(412 * prog(f, 90, 30, 'easeOutExpo'))} matched</div>
          <div style={{ fontSize: 28 * k, opacity: 0.8, fontFamily: FONTS.sans, marginTop: 6 * k }}>in 38 seconds</div>
        </div>
      </GlassPanel>}
      <Sfx f="data_loop.wav" at={8} v={0.25} /><Sfx f="mech_click.wav" at={61} v={0.9} /><Sfx f="pop.wav" at={72} v={0.6} /><Sfx f="charge.wav" at={60} v={0.35} /><Sfx f="pop.wav" at={86} v={0.8} />
    </AbsoluteFill>
  );
};

const TYPE_CUTS: { text: string; preset: TextPresetId; bg: string; size: number }[] = [
  { text: 'Reconcile\n*everything.*', preset: 'blurInWord', bg: 'inkGrid', size: 150 },
  { text: 'SYNCING 412 TXNS', preset: 'scramble', bg: 'steelScan', size: 120 },
  { text: '*1,284* invoices\nbefore lunch', preset: 'counterUp', bg: 'paperEditorial', size: 130 },
  { text: 'Close in 9 days|Close in 1 day', preset: 'strikeReplace', bg: 'tealTopo', size: 120 },
  { text: 'No more\n*spreadsheet hell*', preset: 'highlightMarker', bg: 'tomatoBlobs', size: 130 },
  { text: '> close --month oct', preset: 'typewriter', bg: 'voidRibbon', size: 96 },
  { text: 'Automatic.', preset: 'weightMorph', bg: 'plumMesh', size: 200 },
  { text: 'AUDIT-READY', preset: 'trackingIn', bg: 'forestHalftone', size: 150 },
];
const CUT = 36;
const S3_FRAMES = TYPE_CUTS.length * CUT;
const TypeMontage: React.FC = () => {
  const { k, tall } = useK();
  return (
    <AbsoluteFill>
      <Series>
        {TYPE_CUTS.map((c, i) => {
          const b = bgp(c.bg); const p = palette(b.palette);
          return (
            <Series.Sequence key={i} durationInFrames={CUT}>
              <Bg preset={c.bg} />
              <div style={{ position: 'absolute', left: tall ? 70 : 150 * k, right: tall ? 50 : 100 * k, top: '50%', transform: 'translateY(-50%)' }}>
                <TextFx text={c.text} preset={c.preset} start={2} size={c.size * k * (tall ? 0.85 : 1.38)} color={p.text} hotColor={c.preset === 'highlightMarker' ? p.bg : p.accent} accent={p.accent} speed={c.preset === 'typewriter' ? 1.6 : 1} />
              </div>
              <div style={{ position: 'absolute', left: tall ? 70 : 150 * k, bottom: 60 * k, fontFamily: FONTS.mono, fontSize: 20 * k, color: p.muted }}>text / {c.preset}</div>
              <Sfx f={i % 2 ? 'mech_click.wav' : 'click.wav'} v={0.9} />
              {c.preset === 'scramble' && <Sfx f="glitch.wav" v={0.5} />}
              {c.preset === 'typewriter' && <Sfx f="stutter.wav" at={4} v={0.5} />}
            </Series.Sequence>
          );
        })}
      </Series>
      <Sfx f="data_loop.wav" v={0.18} /><Sfx f="data_loop.wav" at={60} v={0.18} /><Sfx f="data_loop.wav" at={120} v={0.18} /><Sfx f="data_loop.wav" at={180} v={0.18} /><Sfx f="data_loop.wav" at={240} v={0.18} />
    </AbsoluteFill>
  );
};

const MOCK_CUTS = [
  { move: 'cardFan', bg: 'roseAurora', label: 'cardFan' },
  { move: 'zoomHighlight', bg: 'inkGrid', label: 'zoomHighlight' },
  { move: 'deviceSwap', bg: 'navyConic', label: 'deviceSwap' },
  { move: 'floatingLabels', bg: 'mintDots', label: 'floatingLabels' },
];
const MCUT = 50;
const S4_FRAMES = MOCK_CUTS.length * MCUT;
const MockMontage: React.FC = () => {
  const { W, H, k, tall } = useK();
  const ms = tall ? W / 1500 : Math.min(W / 1600, H / 1050);
  return (
    <Series>
      {MOCK_CUTS.map((c, i) => {
        const b = bgp(c.bg); const p = palette(b.palette);
        return (
          <Series.Sequence key={i} durationInFrames={MCUT}>
            <Bg preset={c.bg} />
            <AbsoluteFill style={{ transform: `scale(${ms})` }}><MockupMove move={c.move} p={p} start={0} /></AbsoluteFill>
            <div style={{ position: 'absolute', left: tall ? 60 : 80 * k, bottom: 50 * k, fontFamily: FONTS.mono, fontSize: 20 * k, color: p.muted }}>mockup / {c.label}</div>
            <Sfx f="whoosh.wav" v={0.7} />
            {i === 1 && <Sfx f="pop.wav" at={6} v={0.6} />}
          </Series.Sequence>
        );
      })}
    </Series>
  );
};

const S5_FRAMES = 135;
const GlassScene: React.FC = () => {
  const f = useCurrentFrame(); const { W, H, k, tall } = useK(); const p = palette('duskRose');
  const ms = tall ? W / 1100 : Math.min(W / 1500, H / 950);
  const behind = (
    <AbsoluteFill>
      <Bg preset="roseAurora" />
      <div style={{ position: 'absolute', left: W / 2 - 640 * ms, top: H / 2 - 400 * ms + Math.sin(f / 40) * 10, width: 1280, height: 800, transform: `scale(${ms}) rotate(-4deg)`, transformOrigin: '0 0', opacity: 0.9 }}><AppMock p={p} /></div>
      <div style={{ position: 'absolute', right: -40 * k, top: (tall ? 120 : 40) * k, fontFamily: FONTS.display, fontWeight: 800, fontSize: 330 * k, letterSpacing: '-0.06em', color: p.accent, lineHeight: 0.8, transform: `translateX(${-f * 1.2}px)` }}>glass</div>
    </AbsoluteFill>
  );
  const a = prog(f, 4, 30, 'easeOutExpo'), b = prog(f, 16, 30, 'easeOutExpo'), c = prog(f, 28, 30, 'easeOutExpo');
  const cw = (tall ? 760 : 820) * k, ch = (tall ? 380 : 420) * k;
  return (
    <AbsoluteFill>
      {behind}
      <GlassPanel id="g1" variant="thickLens" x={(tall ? W / 2 - cw / 2 : 140 * k) + (1 - a) * -200 + lerp(0, tall ? 0 : W - cw - 280 * k, prog(f, 30, 100, 'easeInOut'))} y={tall ? 220 * k + lerp(0, 120 * k, prog(f, 30, 100, 'easeInOut')) : H / 2 - ch / 2 - 60 * k - lerp(0, 220 * k, prog(f, 30, 100, 'easeInOut'))} w={cw} h={ch} radius={48 * k} behind={behind} opacity={a} lightAngle={135 + f * 0.4}>
        <div style={{ padding: 40 * k, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: '#fff' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: (tall ? 82 : 96) * k, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 0.95 }}>Liquid glass,<br /><span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400 }}>done right.</span></div>
        </div>
      </GlassPanel>
      <GlassPanel id="g2" variant="smoke" x={tall ? W / 2 - 280 * k : 140 * k} y={(tall ? 690 * k : H - 470 * k) + (1 - b) * 160} w={520 * k} h={250 * k} radius={36 * k} behind={behind} opacity={b}>
        <div style={{ padding: 30 * k, color: '#fff', fontFamily: FONTS.sans, fontSize: 26 * k, lineHeight: 1.35 }}><div style={{ fontFamily: FONTS.mono, fontSize: 20 * k, opacity: 0.7, marginBottom: 10 * k }}>refraction 18 · blur 7 · rim 1.3px</div>Edge-weighted lensing + chromatic fringe, low blur.</div>
      </GlassPanel>
      <GlassPanel id="g3" variant="pill" x={W / 2 - 380 * k} y={H - 190 * k + (1 - c) * 160} w={760 * k} h={112 * k} behind={behind} opacity={c}>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around', color: '#fff', fontFamily: FONTS.sans, fontSize: 30 * k }}>{['Overview', 'Reconcile', 'Close', 'Reports'].map((t, i) => <span key={t} style={{ fontWeight: i === 1 ? 700 : 450, opacity: i === 1 ? 1 : 0.7 }}>{t}</span>)}</div>
      </GlassPanel>
      <Sfx f="whoosh.wav" v={0.7} /><Sfx f="pop.wav" at={16} v={0.6} /><Sfx f="pop.wav" at={28} v={0.6} />
    </AbsoluteFill>
  );
};

const FLIP = 8;
const S6_FRAMES = BG_PRESETS.length * FLIP + 24;
const PaletteFlip: React.FC = () => {
  const f = useCurrentFrame(); const { k, tall } = useK();
  const i = Math.min(BG_PRESETS.length - 1, Math.floor(f / FLIP));
  const b = BG_PRESETS[i]; const p = palette(b.palette);
  return (
    <AbsoluteFill>
      <Background bg={b.bg as BackgroundId} paletteId={b.palette} grain={0.05} />
      <div style={{ position: 'absolute', left: tall ? 70 : 150 * k, top: '50%', transform: 'translateY(-50%)' }}>
        <div style={{ fontFamily: FONTS.display, fontSize: (tall ? 120 : 190) * k, fontWeight: 720, letterSpacing: '-0.05em', lineHeight: 0.92, color: p.text }}>12 palettes.<br /><span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, color: p.accent }}>Contrast-checked.</span></div>
        <div style={{ display: 'flex', gap: 12 * k, marginTop: 40 * k }}>{[p.bg, p.panel, p.text, p.accent, p.hot].map((c, j) => <div key={j} style={{ width: 64 * k, height: 64 * k, borderRadius: 14 * k, background: c, border: `1px solid ${p.line}` }} />)}</div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 22 * k, color: p.muted, marginTop: 22 * k }}>{b.id} — {b.bg} + {b.palette}</div>
      </div>
      <Sfx f="saas_mech.wav" v={0.8} />
    </AbsoluteFill>
  );
};

const S7_FRAMES = 105;
const EndCard: React.FC = () => {
  const f = useCurrentFrame(); const { k, tall } = useK(); const p = palette('inkCitrus');
  const sub = prog(f, 24, 20, 'easeOutExpo');
  return (
    <AbsoluteFill>
      <Bg preset="inkGrid" />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 60 }}>
        <TextFx text={tall ? 'Motion\nPresets *Lab*' : 'Motion Presets *Lab*'} preset="scalePunchHot" start={0} size={(tall ? 160 : 210) * k} color={p.text} hotColor={p.accent} accent={p.accent} align="center" />
        <div style={{ marginTop: 34 * k, opacity: sub, transform: `translateY(${(1 - sub) * 20}px)`, fontFamily: FONTS.mono, fontSize: (tall ? 26 : 32) * k, color: p.muted, lineHeight: 1.6 }}>
          32 type · 21 mockup · 8 glass · 12 palettes · 13 SFX<br /><span style={{ color: p.text }}>MIT · github.com/bigA2/motion-presets-lab</span>
        </div>
      </AbsoluteFill>
      <Sfx f="hit.wav" v={0.9} /><Sfx f="pop.wav" at={24} v={0.6} />
    </AbsoluteFill>
  );
};

export const SHOWREEL_FRAMES = S1_FRAMES + S2_FRAMES + S3_FRAMES + S4_FRAMES + S5_FRAMES + S6_FRAMES + S7_FRAMES;

export const Showreel: React.FC<ShowreelProps> = () => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Series>
      <Series.Sequence durationInFrames={S1_FRAMES}><Hook /></Series.Sequence>
      <Series.Sequence durationInFrames={S2_FRAMES}><Product /></Series.Sequence>
      <Series.Sequence durationInFrames={S3_FRAMES}><TypeMontage /></Series.Sequence>
      <Series.Sequence durationInFrames={S4_FRAMES}><MockMontage /></Series.Sequence>
      <Series.Sequence durationInFrames={S5_FRAMES}><GlassScene /></Series.Sequence>
      <Series.Sequence durationInFrames={S6_FRAMES}><PaletteFlip /></Series.Sequence>
      <Series.Sequence durationInFrames={S7_FRAMES}><EndCard /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
