import React from 'react';
import { Composition } from 'remotion';
import sample from '../../ads/sample-ad.json';
import { AdFromJson, AdProps } from './ad/AdFromJson';
import { AdSpec, FORMATS } from './ad/spec';
import { PresetDemo, DemoProps } from './comps/PresetDemo';
import { Showreel, ShowreelProps, SHOWREEL_FRAMES } from './comps/Showreel';

export const RemotionRoot: React.FC = () => (<>
  <Composition id="PresetDemo" component={PresetDemo} durationInFrames={130} fps={30} width={1920} height={1080} defaultProps={{ kind: 'text', id: 'wordRise' } as DemoProps} />
  <Composition id="Ad" component={AdFromJson} durationInFrames={300} fps={30} width={1920} height={1080}
    defaultProps={{ spec: sample as AdSpec } as AdProps}
    calculateMetadata={({ props }) => { const [width, height] = FORMATS[props.spec.format] ?? FORMATS['16:9']; return { width, height, durationInFrames: props.spec.duration, fps: props.spec.fps }; }} />
  <Composition id="Showreel-16x9" component={Showreel} durationInFrames={SHOWREEL_FRAMES} fps={30} width={1920} height={1080} defaultProps={{} as ShowreelProps} />
  <Composition id="Showreel-4x5" component={Showreel} durationInFrames={SHOWREEL_FRAMES} fps={30} width={1080} height={1350} defaultProps={{} as ShowreelProps} />
</>);
