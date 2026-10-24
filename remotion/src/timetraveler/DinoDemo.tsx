import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Dino, DinoAction, DinoId, RIGS} from './Dino';

// All six Jurassic creatures moving, each with what's fossil evidence and what's a guess.
export const DINO_DEMO_DURATION = 240;

const CELLS: {who: DinoId; action: DinoAction; width: number}[] = [
  {who: 'diplodocus', action: 'walk', width: 600},
  {who: 'allosaurus', action: 'roar', width: 560},
  {who: 'stegosaurus', action: 'walk', width: 540},
  {who: 'archaeopteryx', action: 'fly', width: 360},
  {who: 'rhamphorhynchus', action: 'fly', width: 440},
  {who: 'juramaia', action: 'walk', width: 300},
];

export const DinoDemo: React.FC = () => (
  <AbsoluteFill style={{background: 'linear-gradient(#bfe0d6, #efe3c2)', fontFamily: 'sans-serif'}}>
    {CELLS.map((c, i) => {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const rig = RIGS[c.who];
      return (
        <div key={c.who} style={{position: 'absolute', left: col * 640, top: row * 540, width: 640, height: 540, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 120}}>
          <Dino who={c.who} action={c.action} width={c.width} />
          <div style={{position: 'absolute', bottom: 28, width: '100%', textAlign: 'center'}}>
            <div style={{fontSize: 34, fontWeight: 800, color: '#2a1b12'}}>{rig.label}</div>
            <div style={{fontSize: 19, color: '#5b4636', padding: '0 20px'}}>{rig.evidence}</div>
          </div>
        </div>
      );
    })}
  </AbsoluteFill>
);
