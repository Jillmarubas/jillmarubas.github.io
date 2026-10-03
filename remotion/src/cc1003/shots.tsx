// Reusable laptop shot: a fresh Claude Code session, one command typed in sync with the voice,
// optional output, a readable command card and callouts. Camera swings in, then zooms to the prompt.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {E, Key, kf} from './ae';
import {useS} from './timing';
import {LaptopRig, Rig, TERM, screenToFrame} from './laptop';
import {TCmd, TEntry, Terminal, typedAt} from './terminal';
import {CmdCard} from './ui';

const fxL = (z: number) => 122 + 820 / (0.8677 * z);
const fyAt = (z: number, sy: number, frac: number) => sy - (frac * 1080 - 540) / (0.8677 * z);

export const TermShot: React.FC<{
  cmd: string;
  at: number;
  enter: number;
  entries?: TEntry[];
  label?: string;
  model?: string;
  outY?: number; // screen row (px) to frame after Enter
  zoom?: number;
  slide?: number; // shift the laptop left to make room for overlays (px)
  slideAt?: number;
  children?: (rig: Rig, t: number) => React.ReactNode;
}> = ({cmd, at, enter, entries = [], label = 'TYPE THIS', model, outY, zoom = 1.8, slide = 0, slideAt = 0, children}) => {
  const {t, dur} = useS();
  const long = cmd.length > 60;
  const inY = 285;
  const z2 = long ? zoom * 0.88 : zoom;
  const CAM: [number, number, number, number][] = [
    [0, 0.86, 756, 472],
    [0.9, 1, 756, 472],
    [Math.max(1.0, at - 0.5), 1, 756, 472],
    [Math.max(1.4, at + 0.1), z2, fxL(z2), fyAt(z2, inY, 0.42)],
    [enter + 0.15, z2, fxL(z2), fyAt(z2, inY, 0.42)],
    ...(outY !== undefined ? ([[enter + 0.7, z2 * 0.92, fxL(z2 * 0.92), fyAt(z2 * 0.92, outY, 0.45)]] as [number, number, number, number][]) : []),
  ];
  const ck = (i: number) => kf(t, CAM.map((c, k) => (k === 0 ? [c[0], c[i]] : [c[0], c[i], E.inOut]) as Key));
  const ry = kf(t, [[0, -18], [0.9, 0, E.out]]);
  const rig: Rig = {zoom: ck(1), x: ck(2), y: ck(3), ry};
  const c: TCmd = {text: cmd, at, enter};
  const sl = kf(t, [[slideAt, 0], [slideAt + 0.6, slide, E.inOut]]);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${sl}px)`}}>
        <LaptopRig rig={rig} app="Terminal — claude">
          <div style={{position: 'absolute', left: TERM.x, top: TERM.y, width: TERM.w, height: TERM.h}}>
            <Terminal t={t} w={TERM.w} h={TERM.h} cmds={[c]} entries={entries} model={model} />
          </div>
        </LaptopRig>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: long ? 830 : 860, display: 'flex', justifyContent: 'center'}}>
        <CmdCard t={t} at={at - 0.25} text={cmd} typed={typedAt(c, t)} label={label} done={t > enter} out={dur - 0.6} />
      </div>
      {children?.(rig, t)}
    </AbsoluteFill>
  );
};

export {screenToFrame};
