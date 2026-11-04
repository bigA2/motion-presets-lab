// After-Effects-style value graph for one property of one element, plus a bezier handle editor per segment.
import React, { useRef, useState } from 'react';
import { CURVE_NAMES, CurveRef, ease, Keyframe, resolve, sample, Track } from '../../presets/src/curves';

type Props = {
  track: Track; length: number; def: number; min: number; max: number; playhead: number;
  onChange: (t: Track) => void; onSeek: (f: number) => void;
};

const W = 760, H = 220, PAD = 28;

export const GraphEditor: React.FC<Props> = ({ track, length, def, min, max, playhead, onChange, onSeek }) => {
  const svg = useRef<SVGSVGElement>(null);
  const [sel, setSel] = useState<number | null>(null); // selected keyframe index (its outgoing segment is editable)
  const keys = [...track].sort((a, b) => a.f - b.f);
  const vals = keys.map((k) => k.v).concat([def]);
  let lo = Math.min(min, ...vals), hi = Math.max(max, ...vals);
  if (hi - lo < 1e-6) hi = lo + 1;
  const fx = (f: number) => PAD + (f / Math.max(1, length)) * (W - PAD * 2);
  const fy = (v: number) => H - PAD - ((v - lo) / (hi - lo)) * (H - PAD * 2);
  const inv = (cx: number, cy: number) => {
    const r = svg.current!.getBoundingClientRect();
    const x = ((cx - r.left) / r.width) * W, y = ((cy - r.top) / r.height) * H;
    return { f: Math.round(Math.max(0, Math.min(length, ((x - PAD) / (W - PAD * 2)) * length))), v: lo + ((H - PAD - y) / (H - PAD * 2)) * (hi - lo) };
  };
  const round = (v: number) => Math.round(v * 1000) / 1000;

  const drag = (i: number) => (e: React.PointerEvent) => {
    e.stopPropagation(); setSel(i);
    (e.target as Element).setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const p = inv(ev.clientX, ev.clientY);
      const next = keys.map((k, j) => (j === i ? { ...k, f: p.f, v: round(Math.max(min - (max - min), Math.min(max + (max - min), p.v))) } : k));
      onChange(next);
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
  };

  const addKey = (e: React.MouseEvent) => {
    const p = inv(e.clientX, e.clientY);
    const nk: Keyframe = { f: p.f, v: round(p.v), curve: 'easyEase' };
    onChange([...keys.filter((k) => k.f !== p.f), nk].sort((a, b) => a.f - b.f));
  };
  const delKey = (i: number) => (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); onChange(keys.filter((_, j) => j !== i)); setSel(null); };

  // curve path, sampled every frame
  let d = '';
  for (let f = 0; f <= length; f += 1) d += `${f ? 'L' : 'M'}${fx(f).toFixed(1)},${fy(sample(keys, f, def)).toFixed(1)}`;

  const selKey = sel !== null && sel < keys.length - 1 ? keys[sel] : null;
  const setCurve = (c: CurveRef) => onChange(keys.map((k, j) => (j === sel ? { ...k, curve: c } : k)));

  return (
    <div className="graph">
      <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="graph-svg" onDoubleClick={addKey} onClick={(e) => { if (e.target === svg.current) onSeek(inv(e.clientX, e.clientY).f); }}>
        {[0, 0.25, 0.5, 0.75, 1].map((q) => <line key={q} x1={PAD} x2={W - PAD} y1={fy(lo + q * (hi - lo))} y2={fy(lo + q * (hi - lo))} className="grid" />)}
        {[lo, hi].map((v, i) => <text key={i} x={4} y={fy(v) + 4} className="axis">{round(v)}</text>)}
        {Array.from({ length: Math.floor(length / 30) + 1 }, (_, i) => <text key={i} x={fx(i * 30) - 4} y={H - 8} className="axis">{i}s</text>)}
        <line x1={fx(playhead)} x2={fx(playhead)} y1={PAD - 10} y2={H - PAD} className="playhead" />
        <path d={d} className="curve" />
        {keys.map((k, i) => (
          <g key={i} transform={`translate(${fx(k.f)},${fy(k.v)})`} onPointerDown={drag(i)} onContextMenu={delKey(i)} style={{ cursor: 'grab' }}>
            <rect x={-7} y={-7} width={14} height={14} transform="rotate(45)" className={i === sel ? 'key sel' : 'key'} />
          </g>
        ))}
        {keys.length === 0 && <text x={W / 2} y={H / 2} textAnchor="middle" className="hint">Double-click to add a keyframe (no keys = constant {def})</text>}
      </svg>
      <div className="seg">
        {selKey ? (
          <>
            <div className="seg-title">Segment {selKey.f}f → {keys[sel! + 1].f}f</div>
            <select value={typeof selKey.curve === 'string' ? selKey.curve : 'custom'} onChange={(e) => e.target.value !== 'custom' && setCurve(e.target.value as CurveRef)}>
              {CURVE_NAMES.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="custom">custom bezier</option>
            </select>
            <BezierBox curve={selKey.curve ?? 'easyEase'} onChange={setCurve} />
            <div className="small">{`cubic-bezier(${resolve(selKey.curve ?? 'easyEase').map((n) => round(n)).join(', ')})`}</div>
          </>
        ) : <div className="small">Click a keyframe to edit the curve of the segment that leaves it. Drag keys to move, right-click to delete, double-click the graph to add.</div>}
      </div>
    </div>
  );
};

const BezierBox: React.FC<{ curve: CurveRef; onChange: (c: CurveRef) => void }> = ({ curve, onChange }) => {
  const S = 150, P = 30, ref = useRef<SVGSVGElement>(null);
  const [x1, y1, x2, y2] = resolve(curve);
  const px = (x: number) => P + x * S, py = (y: number) => P + S - y * S;
  const drag = (which: 1 | 2) => (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId);
    const mv = (ev: PointerEvent) => {
      const r = ref.current!.getBoundingClientRect(); const sx = (S + 2 * P) / r.width;
      const x = Math.max(0, Math.min(1, ((ev.clientX - r.left) * sx - P) / S));
      const y = Math.max(-0.8, Math.min(1.8, (P + S - (ev.clientY - r.top) * sx) / S));
      const r3 = (n: number) => Math.round(n * 100) / 100;
      onChange(which === 1 ? [r3(x), r3(y), x2, y2] : [x1, y1, r3(x), r3(y)]);
    };
    const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
  };
  let d = '';
  for (let i = 0; i <= 40; i++) { const t = i / 40; d += `${i ? 'L' : 'M'}${px(t)},${py(ease(t, curve))}`; }
  return (
    <svg ref={ref} viewBox={`0 0 ${S + 2 * P} ${S + 2 * P}`} className="bez">
      <rect x={P} y={P} width={S} height={S} className="bez-frame" />
      <line x1={px(0)} y1={py(0)} x2={px(x1)} y2={py(y1)} className="bez-arm" />
      <line x1={px(1)} y1={py(1)} x2={px(x2)} y2={py(y2)} className="bez-arm" />
      <path d={d} className="curve" />
      <circle cx={px(x1)} cy={py(y1)} r={7} className="bez-h" onPointerDown={drag(1)} />
      <circle cx={px(x2)} cy={py(y2)} r={7} className="bez-h" onPointerDown={drag(2)} />
    </svg>
  );
};
