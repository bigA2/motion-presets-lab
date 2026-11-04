// curves.ts — every easing in the lab lives here. MIT, our own code.
// A curve is a cubic-bezier (x1,y1,x2,y2) like After Effects' graph editor / CSS cubic-bezier().
// y values outside 0..1 give overshoot / anticipation. `steps` and `spring` are special.

export type Bezier = readonly [number, number, number, number];
export type CurveName = keyof typeof CURVES;
export type CurveRef = CurveName | Bezier;

export const CURVES = {
  linear: [0, 0, 1, 1],
  // After Effects "Easy Ease" = 33.33% influence both sides
  easyEase: [0.333, 0, 0.667, 1],
  easyEaseIn: [0.333, 0, 1, 1],
  easyEaseOut: [0, 0, 0.667, 1],
  easeIn: [0.42, 0, 1, 1],
  easeOut: [0, 0, 0.58, 1],
  easeInOut: [0.42, 0, 0.58, 1],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInExpo: [0.7, 0, 0.84, 0],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeInOutQuint: [0.83, 0, 0.17, 1],
  // "Apple-ish" soft deceleration used for UI moves
  smooth: [0.25, 0.1, 0.25, 1],
  glide: [0.22, 1, 0.36, 1],
  // overshoot / anticipation
  overshoot: [0.34, 1.56, 0.64, 1],
  easeOutBack: [0.175, 0.885, 0.32, 1.275],
  anticipate: [0.36, -0.4, 0.6, 1],
  anticipateOvershoot: [0.68, -0.55, 0.265, 1.55],
  // snap: almost instant start, long settle (punchy hits)
  snap: [0.05, 0.9, 0.1, 1],
  whip: [0.9, 0, 0.1, 1],
  steps: [0, 0, 1, 1], // evaluated as 4-step staircase, see ease()
} as const satisfies Record<string, Bezier>;

export const CURVE_NAMES = Object.keys(CURVES) as CurveName[];

// --- cubic bezier solver (same maths as WebKit UnitBezier) ---
const cache = new Map<string, (t: number) => number>();
export function bezier([x1, y1, x2, y2]: Bezier): (t: number) => number {
  const key = `${x1},${y1},${x2},${y2}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const solve = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) return t;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    let lo = 0, hi = 1; t = x;
    while (lo < hi) {
      const v = sx(t);
      if (Math.abs(v - x) < 1e-6) return t;
      if (x > v) lo = t; else hi = t;
      t = (lo + hi) / 2;
      if (hi - lo < 1e-7) break;
    }
    return t;
  };
  const fn = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : sy(solve(x)));
  cache.set(key, fn);
  return fn;
}

export function resolve(c: CurveRef): Bezier {
  return typeof c === 'string' ? CURVES[c] : c;
}

/** Ease a 0..1 progress through a named curve or custom bezier. */
export function ease(t: number, c: CurveRef = 'easeOut'): number {
  if (c === 'steps') return t >= 1 ? 1 : Math.floor(Math.max(0, t) * 4) / 4;
  return bezier(resolve(c))(t);
}

/** progress of `frame` within [start, start+dur], eased. */
export function prog(frame: number, start: number, dur: number, c: CurveRef = 'easeOut'): number {
  const t = dur <= 0 ? 1 : (frame - start) / dur;
  return ease(Math.min(1, Math.max(0, t)), c);
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// --- keyframe tracks: apply to ANY numeric property of ANY element ---
export type Keyframe = { f: number; v: number; curve?: CurveRef }; // curve = easing of segment LEAVING this key
export type Track = Keyframe[];

export function sample(track: Track | undefined, frame: number, fallback = 0): number {
  if (!track || track.length === 0) return fallback;
  const k = [...track].sort((a, b) => a.f - b.f);
  if (frame <= k[0].f) return k[0].v;
  for (let i = 0; i < k.length - 1; i++) {
    const a = k[i], b = k[i + 1];
    if (frame <= b.f) return lerp(a.v, b.v, ease((frame - a.f) / (b.f - a.f), a.curve ?? 'easyEase'));
  }
  return k[k.length - 1].v;
}

/** Build a 2-key track quickly: tween(from, to, start, dur, curve) */
export const tween = (from: number, to: number, start: number, dur: number, curve: CurveRef = 'easeOut'): Track => [
  { f: start, v: from, curve },
  { f: start + dur, v: to },
];

export const cssBezier = (c: CurveRef) => `cubic-bezier(${resolve(c).join(',')})`;
