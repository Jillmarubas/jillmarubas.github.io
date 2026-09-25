import {Config} from '@remotion/cli/config';

// The container has no GPU: SwANGLE is the software GL path that still runs
// backdrop-filter, which every glass surface in this video depends on.
Config.setChromiumOpenGlRenderer('swangle');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
