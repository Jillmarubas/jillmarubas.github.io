// A laptop shot: the dark MacBook with an app on screen, on a camera that swings in and then
// glides between framings (keys [t, zoom, x, y] in screen points), plus frame-space overlays.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {E, kf} from './ae';
import {LaptopRig, Rig} from './laptop';
import {camAt} from './app';

export const AppShot: React.FC<{
  t: number;
  cam: [number, number, number, number][];
  app?: string;
  swing?: number; // degrees of the entrance swing (0 = none)
  wake?: number;
  screen: (rig: Rig) => React.ReactNode;
  over?: (rig: Rig) => React.ReactNode;
}> = ({t, cam, app = 'Safari', swing = 0, wake = 1, screen, over}) => {
  const ry = swing ? kf(t, [[0, swing], [1.0, 0, E.out]]) : 0;
  const rx = swing ? kf(t, [[0, 8], [1.0, 0, E.out]]) : 0;
  const rig = camAt(t, cam, {ry, rx});
  return (
    <AbsoluteFill>
      <LaptopRig rig={rig} app={app} wake={wake}>
        {screen(rig)}
      </LaptopRig>
      {over?.(rig)}
    </AbsoluteFill>
  );
};
