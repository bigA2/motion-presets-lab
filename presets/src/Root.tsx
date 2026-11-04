import React from 'react';
import { Composition } from 'remotion';
import { PresetDemo, DemoProps } from './comps/PresetDemo';
export const RemotionRoot: React.FC = () => (<>
  <Composition id="PresetDemo" component={PresetDemo} durationInFrames={130} fps={30} width={1920} height={1080} defaultProps={{ kind: 'text', id: 'wordRise' } as DemoProps} />
</>);
