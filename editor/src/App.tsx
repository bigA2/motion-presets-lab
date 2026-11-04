import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import sample from '../../ads/sample-ad.json';
import registry from '../../presets/registry.json';
import { AdFromJson } from '../../presets/src/ad/AdFromJson';
import { AdElement, AdSpec, FORMATS, TRACK_PROPS, TrackProp } from '../../presets/src/ad/spec';
import { BACKGROUND_IDS, BG_PRESETS } from '../../presets/src/bg/Backgrounds';
import { Track } from '../../presets/src/curves';
import { PALETTES } from '../../presets/src/palettes';
import { GraphEditor } from './GraphEditor';

const SFX = ['click.wav', 'mech_click.wav', 'stutter.wav', 'data_loop.wav', 'charge.wav', 'whoosh.wav', 'riser.wav', 'glitch.wav', 'pop.wav', 'hit.wav', 'saas_hook.wav', 'saas_dataflow.wav', 'saas_mech.wav'];
const KEY = 'mpl-editor-spec-v1';
const load = (): AdSpec => { try { const s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch { /* storage unavailable */ } return sample as AdSpec; };
const uid = (t: string) => `${t}${Math.random().toString(36).slice(2, 6)}`;

export const App: React.FC = () => {
  const [spec, setSpec] = useState<AdSpec>(load);
  const [selId, setSelId] = useState<string>(spec.elements[0]?.id ?? '');
  const [prop, setProp] = useState<TrackProp>('opacity');
  const [frame, setFrame] = useState(0);
  const player = useRef<PlayerRef>(null);
  const fileIn = useRef<HTMLInputElement>(null);

  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(spec)); } catch { /* ignore */ } }, [spec]);
  useEffect(() => {
    const p = player.current; if (!p) return;
    const h = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    p.addEventListener('frameupdate', h);
    return () => p.removeEventListener('frameupdate', h);
  }, []);

  const [w, h] = FORMATS[spec.format] ?? FORMATS['16:9'];
  const sel = spec.elements.find((e) => e.id === selId);
  const set = (patch: Partial<AdSpec>) => setSpec((s) => ({ ...s, ...patch }));
  const setEl = (patch: Partial<AdElement>) => setSpec((s) => ({ ...s, elements: s.elements.map((e) => (e.id === selId ? ({ ...e, ...patch } as AdElement) : e)) }));
  const add = (type: AdElement['type']) => {
    const start = Math.max(0, Math.min(spec.duration - 30, frame));
    const base = { id: uid(type), start, end: Math.min(spec.duration, start + 90), x: 0.5, y: 0.5, tracks: {} };
    const el: AdElement = type === 'text' ? { ...base, type, text: 'New *headline*', preset: 'wordRise', size: 110, align: 'center' }
      : type === 'mockup' ? { ...base, type, move: 'landView', scale: 0.8 }
        : type === 'glass' ? { ...base, type, variant: 'clear', w: 0.3, h: 0.3, title: '412 matched', body: 'in 38 seconds' }
          : { id: uid('sfx'), type: 'sfx', file: 'pop.wav', at: start, volume: 0.8 };
    setSpec((s) => ({ ...s, elements: [...s.elements, el] })); setSelId(el.id);
  };
  const remove = () => { setSpec((s) => ({ ...s, elements: s.elements.filter((e) => e.id !== selId) })); setSelId(''); };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(spec, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${spec.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'ad'}.json`; a.click();
  };
  const [copied, setCopied] = useState(false);
  const copyJson = async () => { try { await navigator.clipboard.writeText(JSON.stringify(spec, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  const importJson = (f: File) => f.text().then((t) => { try { const s = JSON.parse(t) as AdSpec; if (s.version === 1 && Array.isArray(s.elements)) { setSpec(s); setSelId(s.elements[0]?.id ?? ''); } } catch { alert('Not a valid ad JSON'); } });

  const inputProps = useMemo(() => ({ spec, sfxBase: import.meta.env.BASE_URL }), [spec]);
  const tp = TRACK_PROPS.find((t) => t.id === prop)!;
  const elLen = sel && sel.type !== 'sfx' ? sel.end - sel.start : 0;
  const tracks = sel && 'tracks' in sel ? sel.tracks ?? {} : {};
  const setTrack = (t: Track) => setEl({ tracks: { ...tracks, [prop]: t } } as Partial<AdElement>);
  const num = (v: string) => (Number.isFinite(+v) ? +v : 0);

  return (
    <div className="app">
      <header>
        <div className="brand">Motion Presets Lab <span>live editor</span></div>
        <input className="name" value={spec.name} onChange={(e) => set({ name: e.target.value })} aria-label="Ad name" />
        <label>Format<select value={spec.format} onChange={(e) => set({ format: e.target.value as AdSpec['format'] })}>{Object.keys(FORMATS).map((f) => <option key={f}>{f}</option>)}</select></label>
        <label>Length<input type="number" min={30} max={1800} value={spec.duration} onChange={(e) => set({ duration: Math.max(30, num(e.target.value)) })} />f</label>
        <div className="spacer" />
        <button onClick={() => fileIn.current?.click()}>Import</button>
        <input ref={fileIn} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
        <button onClick={copyJson}>{copied ? 'Copied' : 'Copy JSON'}</button>
        <button className="primary" onClick={exportJson}>Export JSON</button>
      </header>

      <aside className="left">
        <h3>Look</h3>
        <label>Palette<select value={spec.palette} onChange={(e) => set({ palette: e.target.value })}>{PALETTES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <div className="swatches">{(() => { const p = PALETTES.find((x) => x.id === spec.palette) ?? PALETTES[0]; return [p.bg, p.panel, p.text, p.accent, p.hot].map((c, i) => <span key={i} style={{ background: c }} title={c} />); })()}</div>
        <label>Background<select value={spec.background} onChange={(e) => { const b = BG_PRESETS.find((x) => x.id === e.target.value); set(b ? { background: b.id, palette: b.palette } : { background: e.target.value }); }}>
          <optgroup label="Presets (bg + palette)">{BG_PRESETS.map((b) => <option key={b.id} value={b.id}>{b.id}</option>)}</optgroup>
          <optgroup label="Background only">{BACKGROUND_IDS.map((b) => <option key={b} value={b}>{b}</option>)}</optgroup>
        </select></label>
        <label>Grain<input type="range" min={0} max={0.15} step={0.01} value={spec.grain} onChange={(e) => set({ grain: +e.target.value })} /></label>
        <h3>Elements</h3>
        <ul className="els">
          {spec.elements.map((e) => (
            <li key={e.id} className={e.id === selId ? 'on' : ''} onClick={() => setSelId(e.id)}>
              <b>{e.type}</b> <span>{e.type === 'text' ? e.text.replace(/\*/g, '').slice(0, 22) : e.type === 'mockup' ? e.move : e.type === 'glass' ? e.variant : e.file}</span>
              <em>{e.type === 'sfx' ? `@${e.at}` : `${e.start}–${e.end}`}</em>
            </li>
          ))}
        </ul>
        <div className="adds">{(['text', 'mockup', 'glass', 'sfx'] as const).map((t) => <button key={t} onClick={() => add(t)}>+ {t}</button>)}</div>
        <button className="ghost" onClick={() => { setSpec(sample as AdSpec); setSelId((sample as AdSpec).elements[0].id); }}>Reset to sample</button>
      </aside>

      <main>
        <div className="stage" style={{ aspectRatio: `${w} / ${h}`, width: `min(100%, calc(58vh * ${w} / ${h}))` }}>
          <Player ref={player} component={AdFromJson} inputProps={inputProps} durationInFrames={spec.duration} fps={spec.fps} compositionWidth={w} compositionHeight={h}
            style={{ width: '100%', height: '100%' }} controls loop acknowledgeRemotionLicense />
        </div>
        <div className="frame">frame {frame} / {spec.duration} · {(frame / spec.fps).toFixed(2)} s</div>
        {sel && sel.type !== 'sfx' && (
          <section className="graph-wrap">
            <div className="tabs">
              {TRACK_PROPS.map((t) => <button key={t.id} className={t.id === prop ? 'on' : ''} onClick={() => setProp(t.id)}>{t.label}{(tracks[t.id]?.length ?? 0) > 0 ? ' •' : ''}</button>)}
            </div>
            <GraphEditor track={tracks[prop] ?? []} length={elLen} def={tp.def} min={tp.min} max={tp.max} playhead={frame - sel.start}
              onChange={setTrack} onSeek={(f) => player.current?.seekTo(sel.start + f)} />
          </section>
        )}
      </main>

      <aside className="right">
        <h3>Inspector</h3>
        {!sel && <p className="small">Select an element.</p>}
        {sel && (
          <div className="fields">
            {sel.type !== 'sfx' && <div className="row"><label>Start<input type="number" value={sel.start} onChange={(e) => setEl({ start: num(e.target.value) })} /></label><label>End<input type="number" value={sel.end} onChange={(e) => setEl({ end: num(e.target.value) })} /></label></div>}
            {sel.type !== 'sfx' && <div className="row"><label>X<input type="number" step={0.01} value={sel.x} onChange={(e) => setEl({ x: num(e.target.value) })} /></label><label>Y<input type="number" step={0.01} value={sel.y} onChange={(e) => setEl({ y: num(e.target.value) })} /></label></div>}
            {sel.type === 'text' && <>
              <label>Text <small>(*hot words*, new line = Enter)</small><textarea rows={3} value={sel.text} onChange={(e) => setEl({ text: e.target.value })} /></label>
              <label>Text preset<select value={sel.preset} onChange={(e) => setEl({ preset: e.target.value })}>{registry.TEXT_IDS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <div className="row"><label>Size<input type="number" value={sel.size} onChange={(e) => setEl({ size: num(e.target.value) })} /></label>
                <label>Align<select value={sel.align ?? 'left'} onChange={(e) => setEl({ align: e.target.value as 'left' | 'center' })}><option>left</option><option>center</option></select></label></div>
              <label>Font<select value={sel.font ?? 'display'} onChange={(e) => setEl({ font: e.target.value as 'display' })}>{['display', 'sans', 'serif', 'mono'].map((f) => <option key={f}>{f}</option>)}</select></label>
            </>}
            {sel.type === 'mockup' && <>
              <label>Mockup move<select value={sel.move} onChange={(e) => setEl({ move: e.target.value })}>{registry.MOCK_IDS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <label>Scale<input type="number" step={0.05} value={sel.scale} onChange={(e) => setEl({ scale: num(e.target.value) })} /></label>
            </>}
            {sel.type === 'glass' && <>
              <label>Glass variant<select value={sel.variant} onChange={(e) => setEl({ variant: e.target.value })}>{registry.GLASS_IDS.map((t) => <option key={t}>{t}</option>)}</select></label>
              <div className="row"><label>W<input type="number" step={0.01} value={sel.w} onChange={(e) => setEl({ w: num(e.target.value) })} /></label><label>H<input type="number" step={0.01} value={sel.h} onChange={(e) => setEl({ h: num(e.target.value) })} /></label></div>
              <label>Title<input value={sel.title ?? ''} onChange={(e) => setEl({ title: e.target.value })} /></label>
              <label>Body<input value={sel.body ?? ''} onChange={(e) => setEl({ body: e.target.value })} /></label>
              <p className="small">Glass refraction is exact in Chrome/Edge. Other browsers may differ slightly; the GitHub render uses Chromium.</p>
            </>}
            {sel.type === 'sfx' && <>
              <label>Sound<select value={sel.file} onChange={(e) => setEl({ file: e.target.value })}>{SFX.map((s) => <option key={s}>{s}</option>)}</select></label>
              <div className="row"><label>At frame<input type="number" value={sel.at} onChange={(e) => setEl({ at: num(e.target.value) })} /></label><label>Volume<input type="number" step={0.05} min={0} max={1} value={sel.volume} onChange={(e) => setEl({ volume: num(e.target.value) })} /></label></div>
              <button onClick={() => { const a = new Audio(`${import.meta.env.BASE_URL}${sel.file}`); a.volume = sel.volume; a.play(); }}>▶ Preview sound</button>
            </>}
            <button className="danger" onClick={remove}>Delete element</button>
          </div>
        )}
        <h3>Render it</h3>
        <ol className="small steps">
          <li>Export JSON.</li>
          <li>On GitHub: <b>ads/</b> → Add file → Upload → commit to <b>main</b>.</li>
          <li>The <b>render</b> workflow renders an MP4 → download it from the run's <b>Artifacts</b>.</li>
        </ol>
      </aside>
    </div>
  );
};
