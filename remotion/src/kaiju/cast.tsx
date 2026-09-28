import React from 'react';
import {random} from 'remotion';

/*
 * The human cast: one rig for kids and adults with a face that acts (eyes that blink and look,
 * brows, a mouth that smiles, drops or screams, tears, blush), arm poses and walk/run cycles.
 * Origin is between the feet; +y is down. Emotions are presets blended over a few frames.
 */
export type Emo = 'neutral' | 'happy' | 'laugh' | 'worried' | 'scared' | 'scream' | 'cry' | 'hopeful' | 'cheer' | 'shock';
type Face = {brow: number; browY: number; smile: number; open: number; eye: number; tears: number; blush: number};
const FACES: Record<Emo, Face> = {
  neutral: {brow: 0, browY: 0, smile: 0.2, open: 0, eye: 1, tears: 0, blush: 0},
  happy: {brow: -0.1, browY: -0.05, smile: 1, open: 0.15, eye: 0.9, tears: 0, blush: 0.6},
  laugh: {brow: -0.2, browY: -0.12, smile: 1, open: 0.8, eye: 0.35, tears: 0, blush: 0.9},
  worried: {brow: 0.8, browY: -0.05, smile: -0.5, open: 0.05, eye: 1.1, tears: 0, blush: 0},
  scared: {brow: 1, browY: -0.25, smile: -0.8, open: 0.45, eye: 1.35, tears: 0, blush: 0},
  scream: {brow: 1, browY: -0.35, smile: -0.3, open: 1, eye: 1.4, tears: 0, blush: 0},
  cry: {brow: 1, browY: 0.05, smile: -1, open: 0.7, eye: 0.25, tears: 1, blush: 0.8},
  hopeful: {brow: 0.4, browY: -0.2, smile: 0.5, open: 0.15, eye: 1.2, tears: 0, blush: 0.3},
  cheer: {brow: -0.3, browY: -0.25, smile: 1, open: 0.95, eye: 1.1, tears: 0, blush: 0.9},
  shock: {brow: 0.2, browY: -0.4, smile: 0, open: 0.8, eye: 1.5, tears: 0, blush: 0},
};
const mixFace = (a: Emo, b: Emo, k: number): Face => {
  const A = FACES[a];
  const B = FACES[b];
  const o = {} as Face;
  (Object.keys(A) as (keyof Face)[]).forEach((key) => (o[key] = A[key] + (B[key] - A[key]) * k));
  return o;
};

const SKIN = ['#F7D2B6', '#E8B48E', '#C98D62', '#9C6A45', '#704A2E'];
const HAIR = ['#2B1D14', '#5A3A22', '#1E1E1E', '#B7742F', '#E0B35A'];
const TOPS = ['#FF6B5B', '#4C9BF0', '#FFC53D', '#8E6CF0', '#2FC2A0', '#FF8FB8', '#FF9A3C'];
const BOTTOMS = ['#2C3E66', '#3A5BA8', '#6B4F3A', '#1F2A44', '#5B6B80'];

export type Pose = {
  armL?: number; // degrees, 0 = hanging down, 90 = straight forward, 180 = straight up
  armR?: number;
  elbowL?: number;
  elbowR?: number;
  legs?: 'stand' | 'walk' | 'run' | 'sit' | 'jump';
};
export type HumanProps = {
  kid?: boolean;
  seed: number;
  t: number;
  emo?: Emo;
  emoTo?: Emo;
  emoK?: number;
  pose?: Pose;
  dir?: 1 | -1;
  s?: number;
  look?: number; // -1..1 horizontal eye direction (in facing space)
  lookY?: number;
  girl?: boolean;
  hold?: 'teddy' | 'icecream' | 'kid' | 'none';
  speed?: number; // walk/run cycle speed
  talk?: boolean;
};

export const Human: React.FC<HumanProps> = ({kid, seed, t, emo = 'neutral', emoTo, emoK = 0, pose = {}, dir = 1, s = 1, look = 0, lookY = 0, girl, hold = 'none', speed = 1, talk}) => {
  const r = (k: string) => random(`h${seed}${k}`);
  const skin = SKIN[Math.floor(r('s') * SKIN.length)];
  const hair = HAIR[Math.floor(r('h') * HAIR.length)];
  const top = TOPS[Math.floor(r('t') * TOPS.length)];
  const bottom = BOTTOMS[Math.floor(r('b') * BOTTOMS.length)];
  const isGirl = girl ?? r('g') > 0.5;
  const F = mixFace(emo, emoTo ?? emo, emoK);
  // proportions
  const P = kid
    ? {headR: 38, headY: -128, bodyTop: -92, bodyH: 46, bodyW: 44, legL: 44, armL: 36, limbW: 11}
    : {headR: 28, headY: -186, bodyTop: -160, bodyH: 78, bodyW: 50, legL: 82, armL: 64, limbW: 12};
  const ph = r('p') * 6;
  const legs = pose.legs ?? 'stand';
  const cyc = legs === 'run' ? t * 0.42 * speed + ph : legs === 'walk' ? t * 0.24 * speed + ph : 0;
  const swing = legs === 'run' ? Math.sin(cyc) * 38 : legs === 'walk' ? Math.sin(cyc) * 22 : 0;
  const bob = legs === 'run' ? Math.abs(Math.sin(cyc)) * 7 : legs === 'walk' ? Math.abs(Math.sin(cyc)) * 3 : legs === 'jump' ? 0 : Math.sin(t / 22 + ph) * 1.2;
  const lean = legs === 'run' ? 8 : 0;
  // arms: in run/walk they swing unless posed
  const aL = pose.armL ?? (legs === 'run' ? 40 + Math.sin(cyc) * 45 : legs === 'walk' ? Math.sin(cyc) * 20 : 8);
  const aR = pose.armR ?? (legs === 'run' ? 40 - Math.sin(cyc) * 45 : legs === 'walk' ? -Math.sin(cyc) * 20 : -8);
  const breathe = 1 + Math.sin(t / 14 + ph) * 0.012;
  // blink every ~3.5 s for 4 frames
  const bt = (t + Math.floor(r('bl') * 90)) % 105;
  const blink = bt < 4 ? Math.abs(bt - 2) / 2 : 1;
  const hipY = -P.legL;
  const R = P.headR;
  const limb = (x: number, y: number, len: number, ang: number, elbow: number, col: string, hand: string, key: string, w = P.limbW) => (
    <g key={key} transform={`translate(${x} ${y}) rotate(${-ang})`}>
      <rect x={-w / 2} y={0} width={w} height={len * 0.55} rx={w / 2} fill={col} />
      <g transform={`translate(0 ${len * 0.5}) rotate(${-elbow})`}>
        <rect x={-w / 2} y={0} width={w} height={len * 0.5} rx={w / 2} fill={col} />
        <circle cx={0} cy={len * 0.5} r={w * 0.62} fill={hand} />
      </g>
    </g>
  );
  const leg = (x: number, ang: number, knee: number, key: string) => (
    <g key={key} transform={`translate(${x} ${hipY}) rotate(${-ang})`}>
      <rect x={-P.limbW * 0.6} y={0} width={P.limbW * 1.2} height={P.legL * 0.55} rx={P.limbW * 0.6} fill={bottom} />
      <g transform={`translate(0 ${P.legL * 0.5}) rotate(${knee})`}>
        <rect x={-P.limbW * 0.55} y={0} width={P.limbW * 1.1} height={P.legL * 0.5} rx={P.limbW * 0.55} fill={kid ? skin : bottom} />
        <rect x={-P.limbW * 0.7} y={P.legL * 0.42} width={P.limbW * 2} height={P.limbW * 0.9} rx={P.limbW * 0.45} fill="#1F2A44" />
      </g>
    </g>
  );
  let legA = [0, 0];
  let knee = [0, 0];
  if (legs === 'run' || legs === 'walk') {
    legA = [swing, -swing];
    knee = [Math.max(0, -Math.sin(cyc)) * (legs === 'run' ? 60 : 25), Math.max(0, Math.sin(cyc)) * (legs === 'run' ? 60 : 25)];
  } else if (legs === 'sit') {
    legA = [80, 80];
    knee = [-80, -80];
  } else if (legs === 'jump') {
    legA = [25, -15];
    knee = [40, 50];
  }
  // face
  const eyeRY = R * 0.2 * F.eye * blink;
  const eyeRX = R * 0.15 * Math.min(1.25, F.eye);
  const ex = R * 0.36;
  const eyeY = -R * 0.02;
  const mw = R * (0.28 + F.open * 0.12);
  const my = R * 0.42;
  const talkO = talk ? Math.max(0, Math.sin(t * 0.9)) * 0.4 : 0;
  const mo = Math.min(1, F.open + talkO);
  const curve = F.smile * R * 0.16;
  const tearDrops = F.tears > 0.05 ? [0, 1, 2].map((k) => ((t * 1.6 + k * 12) % 36) / 36) : [];
  const shirtCol = top;
  return (
    <g transform={`scale(${s * dir} ${s}) translate(0 ${-bob}) rotate(${lean})`}>
      <ellipse cx={0} cy={bob + 2} rx={P.bodyW * 0.7} ry={5} fill="#000" opacity={0.15} />
      {legs !== 'sit' && [leg(-P.bodyW * 0.22, legA[0], knee[0], 'l1'), leg(P.bodyW * 0.22, legA[1], knee[1], 'l2')]}
      {legs === 'sit' && [leg(-P.bodyW * 0.2, legA[0], knee[0], 'l1'), leg(P.bodyW * 0.2, legA[1], knee[1], 'l2')]}
      {/* back arm */}
      {limb(-P.bodyW * 0.42, P.bodyTop + 8, P.armL, aL, pose.elbowL ?? 0, shirtCol, skin, 'aL')}
      {/* body */}
      <g transform={`translate(0 ${P.bodyTop + P.bodyH}) scale(1 ${breathe}) translate(0 ${-(P.bodyTop + P.bodyH)})`}>
        {isGirl && kid ? (
          <path d={`M${-P.bodyW / 2} ${P.bodyTop + 6} Q0 ${P.bodyTop - 4} ${P.bodyW / 2} ${P.bodyTop + 6} L${P.bodyW * 0.72} ${P.bodyTop + P.bodyH + 12} L${-P.bodyW * 0.72} ${P.bodyTop + P.bodyH + 12} Z`} fill={shirtCol} />
        ) : (
          <rect x={-P.bodyW / 2} y={P.bodyTop} width={P.bodyW} height={P.bodyH + 8} rx={P.bodyW * 0.32} fill={shirtCol} />
        )}
        <rect x={P.bodyW * 0.08} y={P.bodyTop} width={P.bodyW * 0.42} height={P.bodyH + 8} rx={P.bodyW * 0.2} fill="#000" opacity={0.08} />
      </g>
      {/* head */}
      <g transform={`translate(0 ${P.headY}) rotate(${Math.sin(t / 30 + ph) * 2})`}>
        <rect x={-R * 0.22} y={R * 0.7} width={R * 0.44} height={R * 0.6} fill={skin} />
        {/* hair back */}
        {isGirl && <path d={`M${-R * 1.02} ${-R * 0.1} Q ${-R * 1.15} ${R * 1.1} ${-R * 0.6} ${R * 1.05} L ${R * 0.6} ${R * 1.05} Q ${R * 1.15} ${R * 1.1} ${R * 1.02} ${-R * 0.1} Z`} fill={hair} />}
        {isGirl && kid && (
          <>
            <circle cx={-R * 1.05} cy={-R * 0.2} r={R * 0.34} fill={hair} />
            <circle cx={R * 1.05} cy={-R * 0.2} r={R * 0.34} fill={hair} />
          </>
        )}
        <circle r={R} fill={skin} />
        <circle cx={-R * 0.98} cy={R * 0.05} r={R * 0.16} fill={skin} />
        {/* hair top */}
        <path d={`M${-R * 1.02} ${-R * 0.05} C ${-R * 1.05} ${-R * 1.35}, ${R * 1.05} ${-R * 1.35}, ${R * 1.02} ${-R * 0.05} C ${R * 0.6} ${-R * 0.55}, ${-R * 0.2} ${-R * 0.35}, ${-R * 1.02} ${-R * 0.05} Z`} fill={hair} />
        {/* blush */}
        {F.blush > 0.02 && (
          <>
            <ellipse cx={-R * 0.55} cy={R * 0.3} rx={R * 0.17} ry={R * 0.1} fill="#FF7C8E" opacity={0.45 * F.blush} />
            <ellipse cx={R * 0.55} cy={R * 0.3} rx={R * 0.17} ry={R * 0.1} fill="#FF7C8E" opacity={0.45 * F.blush} />
          </>
        )}
        {/* eyes */}
        {[-1, 1].map((side) => (
          <g key={side} transform={`translate(${side * ex + R * 0.12} ${eyeY})`}>
            {F.eye < 0.4 ? (
              // squeezed shut (laughing or crying)
              <path d={`M${-eyeRX} 0 Q 0 ${F.smile > 0 ? -eyeRX : eyeRX * 0.8} ${eyeRX} 0`} fill="none" stroke="#1F2A44" strokeWidth={R * 0.07} strokeLinecap="round" />
            ) : (
              <>
                <ellipse rx={eyeRX} ry={Math.max(0.6, eyeRY)} fill="#fff" />
                {blink > 0.4 && <circle cx={look * eyeRX * 0.4} cy={lookY * eyeRY * 0.4} r={Math.min(eyeRX, eyeRY) * (F.eye > 1.25 ? 0.42 : 0.62)} fill="#1F2A44" />}
                {blink > 0.4 && <circle cx={look * eyeRX * 0.4 + eyeRX * 0.22} cy={lookY * eyeRY * 0.4 - eyeRY * 0.25} r={Math.min(eyeRX, eyeRY) * 0.2} fill="#fff" />}
              </>
            )}
            {/* brow */}
            <g transform={`translate(0 ${-R * 0.32 + F.browY * R * 0.3}) rotate(${side * F.brow * 20})`}>
              <rect x={-eyeRX * 1.05} y={-R * 0.035} width={eyeRX * 2.1} height={R * 0.08} rx={R * 0.04} fill={hair} />
            </g>
          </g>
        ))}
        {/* tears */}
        {tearDrops.map((u, k) => (
          <g key={k} opacity={F.tears * (1 - u)}>
            <ellipse cx={-ex + R * 0.12 + (k % 2 ? 2 : -2)} cy={eyeY + eyeRX + u * R * 0.9} rx={R * 0.06} ry={R * 0.1} fill="#7FD0FF" />
            <ellipse cx={ex + R * 0.12 + (k % 2 ? -2 : 2)} cy={eyeY + eyeRX + ((u + 0.5) % 1) * R * 0.9} rx={R * 0.06} ry={R * 0.1} fill="#7FD0FF" />
          </g>
        ))}
        {F.tears > 0.05 && (
          <>
            <path d={`M${-ex + R * 0.12} ${eyeY + eyeRX} l 0 ${R * 0.55}`} stroke="#7FD0FF" strokeWidth={R * 0.07} strokeLinecap="round" opacity={0.7 * F.tears} />
            <path d={`M${ex + R * 0.12} ${eyeY + eyeRX} l 0 ${R * 0.55}`} stroke="#7FD0FF" strokeWidth={R * 0.07} strokeLinecap="round" opacity={0.7 * F.tears} />
          </>
        )}
        {/* mouth */}
        <g transform={`translate(${R * 0.12} ${my})`}>
          {mo > 0.08 ? (
            <g>
              <path d={`M${-mw} ${-curve * 0.3} Q 0 ${curve * 0.4 - mo * R * 0.05} ${mw} ${-curve * 0.3} Q ${mw * 0.9} ${mo * R * 0.5 + Math.max(0, curve) * 0.8} 0 ${mo * R * 0.55 + Math.max(0, curve)} Q ${-mw * 0.9} ${mo * R * 0.5 + Math.max(0, curve) * 0.8} ${-mw} ${-curve * 0.3} Z`} fill="#6B1F2A" />
              <ellipse cx={0} cy={mo * R * 0.38 + Math.max(0, curve) * 0.6} rx={mw * 0.45} ry={mo * R * 0.14} fill="#FF6F7F" />
              {curve > 0 && <rect x={-mw * 0.7} y={-curve * 0.25} width={mw * 1.4} height={R * 0.07} rx={R * 0.03} fill="#fff" />}
            </g>
          ) : (
            <path d={`M${-mw * 0.8} 0 Q 0 ${curve * 1.4} ${mw * 0.8} 0`} fill="none" stroke="#6B1F2A" strokeWidth={R * 0.075} strokeLinecap="round" />
          )}
        </g>
      </g>
      {/* front arm and anything held */}
      <g>
        {limb(P.bodyW * 0.42, P.bodyTop + 8, P.armL, aR, pose.elbowR ?? 0, shirtCol, skin, 'aR')}
        {hold === 'teddy' && (
          <g transform={`translate(${P.bodyW * 0.1} ${P.bodyTop + P.bodyH * 0.55})`}>
            <circle cx={0} cy={-10} r={16} fill="#C98B4F" />
            <circle cx={-11} cy={-24} r={6} fill="#C98B4F" />
            <circle cx={11} cy={-24} r={6} fill="#C98B4F" />
            <ellipse cx={0} cy={14} rx={17} ry={19} fill="#B77A40" />
            <circle cx={-5} cy={-12} r={2.2} fill="#1F2A44" />
            <circle cx={5} cy={-12} r={2.2} fill="#1F2A44" />
            <ellipse cx={0} cy={-5} rx={5} ry={3.5} fill="#F1D3AE" />
          </g>
        )}
      </g>
    </g>
  );
};

/** An ice cream cone for close-ups (drawn separately so it can wobble and fall). */
export const IceCream: React.FC<{wobble?: number}> = ({wobble = 0}) => (
  <g transform={`rotate(${wobble})`}>
    <path d="M-16 0 L0 52 L16 0 Z" fill="#E7A55A" />
    <path d="M-12 8 L10 8 M-8 22 L6 22 M-4 36 L3 36" stroke="#C98840" strokeWidth={3} />
    <circle cx={0} cy={-8} r={20} fill="#FF9EC4" />
    <circle cx={-8} cy={-24} r={14} fill="#FFF3D6" />
    <circle cx={9} cy={-22} r={13} fill="#9BE0C9" />
    <circle cx={2} cy={-38} r={5} fill="#E8403A" />
  </g>
);
