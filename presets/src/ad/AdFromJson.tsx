// Renders an AdSpec (the editor's JSON). Same component in the browser Player and in GitHub Actions renders.
import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Background, BackgroundId, BG_PRESETS } from '../bg/Backgrounds';
import { sample } from '../curves';
import { FONTS } from '../fonts';
import { GlassPanel } from '../glass/Glass';
import { MockupMove } from '../mockups/Moves';
import { palette } from '../palettes';
import { TextFx, TextPresetId } from '../text/TextFx';
import { AdElement, AdSpec, GlassEl, TrackProp } from './spec';

export type AdProps = { spec: AdSpec; sfxBase?: string };

const useTracks = (el: AdElement) => {
  const f = useCurrentFrame();
  const tr = 'tracks' in el ? el.tracks ?? {} : {};
  const v = (k: TrackProp, d: number) => sample(tr[k], f, d);
  return { opacity: v('opacity', 1), x: v('x', 0), y: v('y', 0), scale: v('scale', 1), rotate: v('rotate', 0), blur: v('blur', 0) };
};

const resolveBg = (spec: AdSpec): { bg: BackgroundId; pal: string } => {
  const preset = BG_PRESETS.find((b) => b.id === spec.background);
  return preset ? { bg: preset.bg, pal: spec.palette || preset.palette } : { bg: spec.background as BackgroundId, pal: spec.palette };
};

const Elem: React.FC<{ el: AdElement; spec: AdSpec; bgAt: (shift: number) => React.ReactNode }> = ({ el, spec, bgAt }) => {
  const { width: W, height: H } = useVideoConfig();
  const k = Math.min(W, H) / 1080;
  const t = useTracks(el);
  const p = palette(resolveBg(spec).pal);
  if (el.type === 'sfx') return null;
  const tf = (extra = '') => `${extra} translate(${t.x * k}px, ${t.y * k}px) scale(${t.scale}) rotate(${t.rotate}deg)`;
  const fx: React.CSSProperties = { opacity: t.opacity, filter: t.blur > 0.05 ? `blur(${t.blur}px)` : undefined };
  if (el.type === 'text') {
    const center = el.align === 'center';
    return (
      <div style={{ position: 'absolute', left: el.x * W, top: el.y * H, width: center ? undefined : (el.width ?? 0.84) * W, transform: tf(center ? 'translate(-50%, -50%)' : 'translateY(-50%)'), transformOrigin: center ? '50% 50%' : '0% 50%', ...fx }}>
        <TextFx text={el.text} preset={el.preset as TextPresetId} size={el.size * k} color={p.text} hotColor={el.preset === 'highlightMarker' ? p.bg : p.accent} accent={p.accent} align={el.align} font={el.font} />
      </div>
    );
  }
  if (el.type === 'mockup') {
    return (
      <div style={{ position: 'absolute', left: el.x * W - 960, top: el.y * H - 540, width: 1920, height: 1080, transform: tf(), ...fx }}>
        <MockupMove move={el.move} p={p} scale={el.scale * k} />
      </div>
    );
  }
  const g = el as GlassEl;
  const gw = g.w * W, gh = g.h * H;
  return (
    <div style={{ position: 'absolute', inset: 0, ...fx }}>
      <GlassPanel id={g.id} variant={g.variant} accent={p.accent} x={g.x * W - gw / 2 + t.x * k} y={g.y * H - gh / 2 + t.y * k} w={gw * t.scale} h={gh * t.scale} radius={36 * k} behind={bgAt(g.start)}>
        <div style={{ padding: 36 * k, height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', color: g.variant === 'milk' || g.variant === 'frosted' ? p.text : '#fff', fontFamily: FONTS.display }}>
          {g.title && <div style={{ fontSize: 64 * k, fontWeight: 680, letterSpacing: '-0.04em', lineHeight: 1 }}>{g.title}</div>}
          {g.body && <div style={{ fontSize: 28 * k, opacity: 0.8, marginTop: 10 * k, fontFamily: FONTS.sans }}>{g.body}</div>}
        </div>
      </GlassPanel>
    </div>
  );
};

export const AdFromJson: React.FC<AdProps> = ({ spec, sfxBase }) => {
  const { bg, pal } = resolveBg(spec);
  const bgAt = (shift: number) => <Background bg={bg} paletteId={pal} grain={spec.grain} shift={shift} />;
  const src = (file: string) => (sfxBase !== undefined ? `${sfxBase}${file}` : staticFile(file));
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      {bgAt(0)}
      {spec.elements.map((el) => el.type === 'sfx'
        ? <Sequence key={el.id} from={el.at} layout="none"><Audio src={src(el.file)} volume={el.volume} /></Sequence>
        : <Sequence key={el.id} from={el.start} durationInFrames={Math.max(1, el.end - el.start)} layout="none"><Elem el={el} spec={spec} bgAt={bgAt} /></Sequence>)}
    </AbsoluteFill>
  );
};
