import { Config } from '@remotion/cli/config';
Config.setVideoImageFormat('jpeg');
Config.setChromiumOpenGlRenderer('swangle');
// Use a preinstalled browser if one is given (CI and cloud sandboxes); otherwise Remotion downloads its own.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
