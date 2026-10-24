import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Explorer, ExplorerId, SQUAD} from './Explorer';
import {Expression, Pose, TimeTraveler} from './TimeTraveler';

// The Jurassic squad side by side, cycling through every pose and expression.
export const SQUAD_DEMO_DURATION = 360;

const BEATS: {pose: Pose; expression: Expression; talking?: boolean}[] = [
  {pose: 'idle', expression: 'neutral'},
  {pose: 'wave', expression: 'happy', talking: true},
  {pose: 'point', expression: 'determined'},
  {pose: 'checkWatch', expression: 'worried'},
  {pose: 'panic', expression: 'scared'},
  {pose: 'idle', expression: 'surprised'},
];
const BEAT = SQUAD_DEMO_DURATION / BEATS.length;
const SIZE = 560;
const ORDER: ('traveler' | ExplorerId)[] = ['traveler', 'tank', 'pip', 'ria'];

export const SquadDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const i = Math.min(BEATS.length - 1, Math.floor(frame / BEAT));
  const b = BEATS[i];
  const prev = BEATS[Math.max(0, i - 1)];
  const t = i === 0 ? 1 : interpolate(frame - i * BEAT, [0, 8], [0, 1], {extrapolateRight: 'clamp', easing: Easing.bezier(0.45, 0, 0.2, 1)});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#cfe6d4, #f3ead2)', fontFamily: 'sans-serif'}}>
      <div style={{position: 'absolute', top: 40, width: '100%', textAlign: 'center', fontSize: 40, fontWeight: 800, color: '#2a1b12'}}>
        {b.pose} · {b.expression}{b.talking ? ' · talking' : ''}
      </div>
      {ORDER.map((who, k) => {
        const h = who === 'traveler' ? SIZE : SIZE * SQUAD[who].height;
        const name = who === 'traveler' ? 'The Traveler' : SQUAD[who].name;
        const role = who === 'traveler' ? 'the leader' : SQUAD[who].role;
        const common = {pose: b.pose, fromPose: prev.pose, poseProgress: t, expression: b.expression, talking: b.talking};
        return (
          <div key={who} style={{position: 'absolute', left: 150 + k * 440, bottom: 150, width: 340, height: SIZE * 1.15, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center'}}>
            {who === 'traveler' ? <TimeTraveler costume="jurassic" size={h} seed="trav" {...common} /> : <Explorer who={who} size={SIZE} {...common} />}
            <div style={{position: 'absolute', bottom: -110, textAlign: 'center', width: '100%'}}>
              <div style={{fontSize: 38, fontWeight: 800, color: '#2a1b12'}}>{name}</div>
              <div style={{fontSize: 26, color: '#5b4636'}}>{role}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
