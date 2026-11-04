// The JSON format the live editor exports and render.yml renders. Positions are 0..1 of the frame,
// sizes are px at a 1080-px short side (scaled for other formats). Track keyframe frames are relative to element start.
import { Track } from '../curves';

export type TrackProp = 'opacity' | 'x' | 'y' | 'scale' | 'rotate' | 'blur';
export const TRACK_PROPS: { id: TrackProp; label: string; min: number; max: number; def: number }[] = [
  { id: 'opacity', label: 'Opacity', min: 0, max: 1, def: 1 },
  { id: 'x', label: 'Offset X (px)', min: -600, max: 600, def: 0 },
  { id: 'y', label: 'Offset Y (px)', min: -600, max: 600, def: 0 },
  { id: 'scale', label: 'Scale', min: 0, max: 2, def: 1 },
  { id: 'rotate', label: 'Rotate (°)', min: -45, max: 45, def: 0 },
  { id: 'blur', label: 'Blur (px)', min: 0, max: 40, def: 0 },
];

type Base = { id: string; start: number; end: number; x: number; y: number; tracks?: Partial<Record<TrackProp, Track>> };
export type TextEl = Base & { type: 'text'; text: string; preset: string; size: number; align?: 'left' | 'center'; font?: 'display' | 'sans' | 'serif' | 'mono'; width?: number };
export type MockupEl = Base & { type: 'mockup'; move: string; scale: number };
export type GlassEl = Base & { type: 'glass'; variant: string; w: number; h: number; title?: string; body?: string };
export type SfxEl = { id: string; type: 'sfx'; file: string; at: number; volume: number; start?: number; end?: number };
export type AdElement = TextEl | MockupEl | GlassEl | SfxEl;

export type AdSpec = {
  version: 1; name: string; fps: number; duration: number; format: '16:9' | '4:5' | '9:16';
  palette: string; background: string; grain: number; elements: AdElement[];
};

export const FORMATS = { '16:9': [1920, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920] } as const;
