// The dark MacBook from the tutorial template, on a camera rig: 3D orbit for entrances and
// screen-recording style zooms onto whatever the voice is talking about.
import React from 'react';
import {MacBook} from '../tutorial/MacBook';
import {MenuBar} from '../tutorial/Desktop';
import {LAPTOP, SCREEN, toStage} from '../tutorial/theme';

export {SCREEN};
export type Rig = {zoom: number; x: number; y: number; rx?: number; ry?: number; lift?: number};

const fit = (r: Rig) => {
  // focus point in stage coords, kept inside the stage at this zoom
  if (r.zoom <= 1.001) return {fx: 960, fy: 540};
  const s = toStage(r.x, r.y);
  const hw = 960 / r.zoom;
  const hh = 540 / r.zoom;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const k = Math.min(1, (r.zoom - 1) / 0.35); // blend from centre as the zoom starts
  return {fx: lerp(960, Math.min(1920 - hw, Math.max(hw, s.x)), k), fy: lerp(540, Math.min(1080 - hh, Math.max(hh, s.y)), k)};
};

/** Where a screen point lands on the 1920×1080 frame for this rig (no 3D rotation). */
export const screenToFrame = (r: Rig, x: number, y: number) => {
  const {fx, fy} = fit(r);
  const s = toStage(x, y);
  return {x: 960 + (s.x - fx) * r.zoom, y: 540 + (s.y - fy + (r.lift ?? 0)) * r.zoom};
};

export const LaptopRig: React.FC<{rig: Rig; children: React.ReactNode; app?: string; wake?: number; opacity?: number}> = ({rig, children, app = 'Terminal', wake = 1, opacity = 1}) => {
  const {fx, fy} = fit(rig);
  return (
    <div style={{position: 'absolute', inset: 0, opacity, transform: `translate(960px,540px) scale(${rig.zoom}) translate(${-fx}px, ${-fy + (rig.lift ?? 0)}px)`, transformOrigin: '0 0'}}>
      <div style={{position: 'absolute', inset: 0, transform: `perspective(2400px) rotateX(${rig.rx ?? 0}deg) rotateY(${rig.ry ?? 0}deg)`, transformOrigin: `960px ${LAPTOP.lidY + LAPTOP.lidH}px`}}>
        <MacBook wake={wake}>
          <CcWallpaper />
          <MenuBar app={app} clock="Sat 10 Oct  9:41" />
          {children}
        </MacBook>
      </div>
    </div>
  );
};


export const WIN = {x: 40, y: 50, w: 1432, h: 870}; // the app window's place on the screen (screen points)

// Dark desktop with a warm glow, in the film's palette.
export const CcWallpaper: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: ['radial-gradient(60% 55% at 80% 85%, rgba(16,163,127,.30) 0%, rgba(16,163,127,0) 70%)', 'radial-gradient(55% 50% at 12% 20%, rgba(70,90,140,.28) 0%, rgba(70,90,140,0) 70%)', 'linear-gradient(160deg, #15161b 0%, #0d0e12 60%, #09090c 100%)'].join(',')}} />
);
