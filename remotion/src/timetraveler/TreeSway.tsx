import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';

// Tree-sway test, the Remotion way: the VectorCraft monkey-puzzle tree in three parts.
// Each part turns at its joint (ground, lower crown, upper crown) and is nested in the part
// below, so the bends add up. Each joint lags a little behind the one below, so the wind
// travels up the tree, and the top bends most. No keyframes: one wind formula drives it.

export const TREE_SWAY_DURATION = 180;
const BOX_W = 600;
const BOX_H = 1000;

// gentle wind: a slow sway plus a quicker gust on top
const wind = (sec: number) => Math.sin((sec / 3.2) * Math.PI * 2) + 0.35 * Math.sin((sec / 1.3) * Math.PI * 2 + 0.7);

const Joint: React.FC<{pivot: [number, number]; deg: number; children: React.ReactNode}> = ({pivot, deg, children}) => (
  <div style={{position: 'absolute', inset: 0, transformOrigin: `${pivot[0]}px ${pivot[1]}px`, transform: `rotate(${deg}deg)`}}>{children}</div>
);

const part = (id: string) => <Img src={staticFile(`timetraveler/trees/${id}.svg`)} style={{position: 'absolute', left: 0, top: 0, width: BOX_W, height: BOX_H}} />;

export const SwayingTree: React.FC<{seed?: number; amp?: number}> = ({seed = 0, amp = 1}) => {
  const f = useCurrentFrame();
  const sec = f / 30 + seed;
  const lag = 0.18; // seconds each joint trails the one below
  return (
    <div style={{position: 'relative', width: BOX_W, height: BOX_H}}>
      <Joint pivot={[300, 1000]} deg={wind(sec) * 0.6 * amp}>
        {part('treeTrunk')}
        <Joint pivot={[300, 580]} deg={wind(sec - lag) * 1.4 * amp}>
          {part('treeMid')}
          <Joint pivot={[300, 350]} deg={wind(sec - lag * 2) * 2.2 * amp}>
            {part('treeTop')}
          </Joint>
        </Joint>
      </Joint>
    </div>
  );
};

// the shared backdrop (also rendered on its own for the EffectCraft version)
export const TreeBackdrop: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#9fd0e6 0%, #cfe6d8 55%, #e8dcb0 100%)'}}>
    <svg width={720} height={1080} style={{position: 'absolute', inset: 0}}>
      <path d="M0 760 Q180 690 360 730 Q540 770 720 700 L720 1080 L0 1080 Z" fill="#9fb98a" stroke="#2a1b12" strokeWidth={5} />
      <path d="M0 900 Q200 860 400 890 Q560 910 720 870 L720 1080 L0 1080 Z" fill="#7d9a66" stroke="#2a1b12" strokeWidth={5} />
      {[60, 170, 520, 640].map((x, i) => (
        <g key={i} transform={`translate(${x} ${930 + (i % 2) * 30})`}>
          {[-50, -25, 0, 25, 50].map((a) => (
            <path key={a} d="M0 0 Q-8 -40 0 -80" transform={`rotate(${a})`} fill="none" stroke="#3f7a52" strokeWidth={10} strokeLinecap="round" />
          ))}
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);

export const TreeSway: React.FC = () => (
  <AbsoluteFill>
    <TreeBackdrop />
    <div style={{position: 'absolute', left: 360 - (BOX_W * 0.9) / 2, top: 1040 - BOX_H * 0.9, transformOrigin: '0 0', transform: 'scale(0.9)'}}>
      <SwayingTree amp={1.5} />
    </div>
  </AbsoluteFill>
);
