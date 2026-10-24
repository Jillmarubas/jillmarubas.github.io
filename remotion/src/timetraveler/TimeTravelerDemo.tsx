import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Costume, Expression, Pose, TimeTraveler} from './TimeTraveler';

// A turntable-style sheet: the four costumes side by side, cycling through every pose
// and expression so the whole rig can be checked in one place.

export const TT_DEMO_DURATION = 360;

const COSTUMES: Costume[] = ['none', 'iceAge', 'rome', 'egypt'];
const BEATS: {pose: Pose; expression: Expression; talking?: boolean; glitch?: boolean}[] = [
  {pose: 'idle', expression: 'neutral'},
  {pose: 'wave', expression: 'happy', talking: true},
  {pose: 'point', expression: 'determined'},
  {pose: 'checkWatch', expression: 'worried', glitch: true},
  {pose: 'panic', expression: 'scared'},
  {pose: 'shiver', expression: 'cold'},
];
const BEAT = TT_DEMO_DURATION / BEATS.length; // 60 frames each
const BLEND = 8;

export const TimeTravelerDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(BEATS.length - 1, Math.floor(frame / BEAT));
  const b = BEATS[i];
  const prev = BEATS[Math.max(0, i - 1)];
  const local = frame - i * BEAT;
  const t = i === 0 ? 1 : interpolate(local, [0, BLEND], [0, 1], {extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.2, 1)});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#dfeaf3, #f6f1e7)', fontFamily: 'sans-serif'}}>
      <div style={{position: 'absolute', top: 54, width: '100%', textAlign: 'center', fontSize: 44, fontWeight: 800, color: '#2a1b12'}}>
        {b.pose} · {b.expression}
        {b.talking ? ' · talking' : ''}
        {b.glitch ? ' · watchGlitch' : ''}
      </div>
      {COSTUMES.map((c, k) => (
        <div key={c} style={{position: 'absolute', left: 120 + k * 440, top: 220, width: 300, textAlign: 'center'}}>
          <TimeTraveler
            costume={c}
            pose={b.pose}
            fromPose={prev.pose}
            poseProgress={t}
            expression={b.expression}
            talking={b.talking}
            watchGlitch={b.glitch}
            flip={k % 2 === 1}
            size={600}
            seed={c}
          />
          <div style={{marginTop: 30, fontSize: 34, fontWeight: 700, color: '#5b4636'}}>{c}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
