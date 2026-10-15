// Cold open 1:12–1:23. "...a chain of power, water, metal and human hands starts moving, somewhere far away. Today we
// follow that chain, link by link. And at the very end..." A steel chain with your question at one end; each link holds
// one cost, then shows where it is and which chapter follows it. The camera looks along the chain, pulls far back,
// then travels it link by link to the question mark at the end.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, lerp, pop} from './akit';
import {settle} from '../kit';

const Y = 540;
type Link = {x: number; color: string; icon: string; name: string; place?: string; chapter?: string; word?: number};
const LINKS: Link[] = [
  {x: 600, color: P.purple, icon: 'chat', name: 'Your question'},
  {x: 1150, color: P.orange, icon: 'bolt', name: 'Power', place: 'Pennsylvania', chapter: 'Chapter 2', word: 73.55},
  {x: 1700, color: P.water, icon: 'drop', name: 'Water', place: 'Oregon', chapter: 'Chapter 3', word: 74.25},
  {x: 2250, color: '#B4683A', icon: 'rock', name: 'Metal', place: 'Congo', chapter: 'Chapter 5', word: 74.58},
  {x: 2800, color: P.pink, icon: 'hand', name: 'Hands', place: 'Kenya', chapter: 'Chapter 4', word: 75.25},
  {x: 3450, color: P.yellow, icon: 'q', name: 'The answer', chapter: 'Chapter 8'},
];
const Icon: React.FC<{k: string}> = ({k}) => {
  const fill = P.white;
  if (k === 'chat') return <path d="M-60 -45 H60 A20 20 0 0 1 80 -25 V25 A20 20 0 0 1 60 45 H-10 L-45 75 V45 H-60 A20 20 0 0 1 -80 25 V-25 A20 20 0 0 1 -60 -45 Z" fill={fill} />;
  if (k === 'bolt') return <path d="M15 -80 L-50 10 H-5 L-20 80 L50 -15 H5 Z" fill={fill} />;
  if (k === 'drop') return <path d="M0 -80 C0 -80 -55 -5 -55 25 A55 55 0 0 0 55 25 C55 -5 0 -80 0 -80 Z" fill={fill} />;
  if (k === 'rock') return <path d="M-70 30 L-50 -35 L-5 -60 L50 -40 L75 15 L40 60 L-30 62 Z" fill={fill} />;
  if (k === 'hand')
    return (
      <g fill={fill}>
        <rect x={-45} y={-10} width={90} height={80} rx={30} />
        {[-38, -14, 10, 34].map((x, i) => (
          <rect key={x} x={x} y={-75 + (i === 0 || i === 3 ? 18 : 0)} width={20} height={80} rx={10} />
        ))}
        <rect x={-85} y={0} width={60} height={22} rx={11} transform="rotate(-35 -55 10)" />
      </g>
    );
  return (
    <text x={0} y={52} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={150} fill={P.ink}>
      ?
    </text>
  );
};

// camera keys: [film time, centre x, scale, turn (deg), tilt (deg)]
const KEYS: [number, number, number, number, number][] = [
  [72.44, 620, 1.2, 32, 6],
  [73.0, 620, 1.2, 32, 6],
  [73.7, 1900, 0.5, 14, 8],
  [76.6, 1950, 0.46, 10, 6],
  [77.6, 2000, 0.36, 0, 0],
  [79.1, 2000, 0.36, 0, 0],
  [79.8, 1150, 0.92, -24, 4],
  [80.45, 1700, 0.92, -24, 4],
  [80.95, 2250, 0.92, -24, 4],
  [81.45, 2800, 0.92, -24, 4],
  [82.4, 3450, 1.15, -6, 2],
  [84.0, 3450, 1.25, 0, 0],
];
const cam = (t: number) => {
  let i = 0;
  while (i < KEYS.length - 2 && t >= KEYS[i + 1][0]) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = settle(Math.max(0, Math.min(1, (t - a[0]) / (b[0] - a[0]))));
  return {cx: lerp(a[1], b[1], k), s: lerp(a[2], b[2], k), ry: lerp(a[3], b[3], k), rx: lerp(a[4], b[4], k)};
};

export const Chain: React.FC<AnimProps> = ({f, t0}) => {
  const w = (abs: number) => at(t0, abs);
  const t = t0 + f / 24;
  const {cx, s, ry, rx} = cam(t);
  const move = Math.max(0, Math.min(1, (t - 76.2) / 1.4));
  const tug = Math.sin(move * Math.PI) * 60; // "starts moving": the chain is pulled, then settles
  const far = Math.max(0, Math.min(1, (t - 76.8) / 0.8)) * (1 - Math.max(0, Math.min(1, (t - 79.1) / 0.5)));
  const follow = t >= 79.2;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #3A2580, ${P.plum} 60%, #150D33)`, overflow: 'hidden'}}>
      {/* a faint globe behind the far shot */}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: far * 0.5}}>
        <circle cx={960} cy={560} r={430} fill="none" stroke="#8D7BFF" strokeWidth={3} />
        {[-60, -30, 0, 30, 60].map((d) => (
          <ellipse key={d} cx={960} cy={560 + d * 6.5} rx={430 * Math.cos((d * Math.PI) / 180)} ry={60 * Math.cos((d * Math.PI) / 180)} fill="none" stroke="#8D7BFF" strokeWidth={2} />
        ))}
        {[0, 35, 70, 105, 140].map((d) => (
          <ellipse key={d} cx={960} cy={560} rx={430 * Math.abs(Math.cos((d * Math.PI) / 180))} ry={430} fill="none" stroke="#8D7BFF" strokeWidth={2} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: `translate(960px,540px) perspective(2200px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${s}) translate(${-cx + tug}px,${-Y}px)`}}>
        <svg width={4000} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {/* small links between the big rings */}
          {LINKS.slice(0, -1).map((l, i) => {
            const n = LINKS[i + 1];
            const gap = n.x - l.x - 300;
            return Array.from({length: Math.max(1, Math.round(gap / 120))}, (_, j) => {
              const x = l.x + 150 + (j + 0.5) * (gap / Math.max(1, Math.round(gap / 120))) - 70;
              return j % 2 === 0 ? (
                <rect key={`${i}-${j}`} x={x} y={Y - 34} width={140} height={68} rx={34} fill="none" stroke="#C9D2E6" strokeWidth={18} />
              ) : (
                <rect key={`${i}-${j}`} x={x + 30} y={Y - 10} width={80} height={20} rx={10} fill="#8F9AB4" />
              );
            });
          })}
          {LINKS.map((l, i) => {
            const o = l.word ? pop(f, w(l.word), 12) : 1;
            const hot = follow && Math.abs(cx - l.x) < 120;
            return (
              <g key={i} transform={`translate(${l.x},${Y})`}>
                <circle r={160} fill="none" stroke="#DCE3F2" strokeWidth={30} />
                <circle r={160} fill="none" stroke="#8F9AB4" strokeWidth={6} />
                <g transform={`scale(${o})`}>
                  <circle r={118} fill={l.color} stroke={hot ? P.white : 'none'} strokeWidth={10} />
                  <Icon k={l.icon} />
                </g>
              </g>
            );
          })}
        </svg>
        {LINKS.map((l, i) => {
          const o = l.word ? Math.min(1, pop(f, w(l.word) + 4, 10)) : 1;
          return (
            <div key={i} style={{position: 'absolute', left: l.x - 300, width: 600, top: Y + 190, textAlign: 'center', opacity: o}}>
              <div style={{fontFamily: AF.head, fontWeight: 800, fontSize: 52, color: P.white}}>{l.name}</div>
              {l.place && far > 0 && <Note style={{opacity: far, marginTop: 6}} size={30}>{l.place}</Note>}
              {l.chapter && follow && (
                <div style={{marginTop: 14}}>
                  <Tag bg={P.white} color={P.ink} size={34}>{l.chapter}</Tag>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {far > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', opacity: far}}>
          <Tag bg={P.white} color={P.ink} size={40}>Thousands of kilometres from your screen</Tag>
        </div>
      )}
    </AbsoluteFill>
  );
};
