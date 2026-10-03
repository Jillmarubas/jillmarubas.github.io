import React from 'react';
import {AbsoluteFill} from 'remotion';
import './fonts';
import {Desk, Lens} from './Desk';
import {Place3D} from './Places';
import {Logo3D} from './Logo3D';

/** Look-development frame: places and logos on the desk. */
export const N1Test: React.FC<{logos: string[]; place: 'whitehouse' | 'ftc' | 'none'}> = ({logos, place}) => (
  <AbsoluteFill>
    <Desk />
    {place !== 'none' && (
      <div style={{position: 'absolute', left: 0, top: 0}}>
        <Place3D which={place} w={1920} h={1080} at={0} dur={100} />
      </div>
    )}
    {logos.length === 1 && (
      <div style={{position: 'absolute', left: 560, top: 140}}>
        <Logo3D name={logos[0]} w={800} h={800} at={-40} tilt={0} spin={0} />
      </div>
    )}
    <div style={{position: 'absolute', left: 40, bottom: 20, display: 'flex', gap: 10, flexWrap: 'wrap', width: 1840}}>
      {logos.length > 1 && logos.map((n) => (
        <div key={n} style={{width: 220, height: 220, position: 'relative'}}>
          <Logo3D name={n} w={220} h={220} at={-40} />
          <div style={{position: 'absolute', bottom: 0, left: 0, fontFamily: 'IBM Plex Mono', fontSize: 14}}>{n}</div>
        </div>
      ))}
    </div>
    <Lens />
  </AbsoluteFill>
);
