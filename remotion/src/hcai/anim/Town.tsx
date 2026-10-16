// Cold open 0:24–0:28. "...asked this small town a simple question. How much of your water is Google using?"
// An isometric small town on the river, its water tower, and the Google data centre at the edge of town; the camera
// drifts from the houses to the data centre while water runs down the pipe and the question goes up.
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {AF, AnimProps, Note, P, Tag, at, ease, lerp, pop} from './akit';

const C30 = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * C30, (x + y) * 0.5 - z];
const pts = (a: [number, number][]) => a.map((p) => p.join(',')).join(' ');
const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
};
type Box = {x: number; y: number; w: number; d: number; h: number; top: string; side: string; roof?: boolean};
const BoxShape: React.FC<{b: Box}> = ({b}) => {
  const {x, y, w, d, h} = b;
  const top = [iso(x, y, h), iso(x + w, y, h), iso(x + w, y + d, h), iso(x, y + d, h)];
  const right = [iso(x + w, y, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x + w, y, h)];
  const left = [iso(x, y + d, 0), iso(x + w, y + d, 0), iso(x + w, y + d, h), iso(x, y + d, h)];
  return (
    <g>
      <polygon points={pts(left)} fill={shade(b.side, 0.82)} />
      <polygon points={pts(right)} fill={shade(b.side, 0.64)} />
      <polygon points={pts(top)} fill={b.top} />
    </g>
  );
};

const ROOFS = [P.red, P.yellow, P.orange, P.teal, P.pink, P.purple, '#FF9F43'];
const HOUSES: Box[] = [];
for (let i = 0; i < 6; i++)
  for (let j = 0; j < 5; j++) {
    if (random(`h${i}-${j}`) < 0.18) continue;
    HOUSES.push({x: 300 + i * 105 + random(`hx${i}${j}`) * 20, y: 380 + j * 110 + random(`hy${i}${j}`) * 20, w: 62, d: 58, h: 34 + random(`hh${i}${j}`) * 26, top: ROOFS[Math.floor(random(`r${i}${j}`) * ROOFS.length)], side: '#FFF1DC'});
  }
const DC: Box = {x: 1040, y: 520, w: 330, d: 300, h: 74, top: '#DDE6F5', side: '#F4F7FC'};
const TOWER = {x: 900, y: 300};
const PIPE: [number, number][] = [[TOWER.x, TOWER.y], [1205, TOWER.y], [1205, 520]];
const TREES = Array.from({length: 26}, (_, i) => ({x: 180 + random(`tx${i}`) * 1250, y: 260 + random(`ty${i}`) * 1000, r: 16 + random(`tr${i}`) * 12})).filter(
  (t) => !(t.x > 1010 && t.x < 1400 && t.y > 490 && t.y < 850) && !(t.x > 280 && t.x < 960 && t.y > 360 && t.y < 960),
);

export const Town: React.FC<AnimProps> = ({f, t0}) => {
  const w = (abs: number) => at(t0, abs);
  const k = ease(f, 0, w(28.6));
  const sc = lerp(0.74, 0.98, k);
  const F = iso(lerp(720, 1080, k), lerp(640, 600, k));
  const tx = 960 - F[0] * sc;
  const ty = 600 - F[1] * sc;
  const toScreen = (p: [number, number]): [number, number] => [tx + p[0] * sc, ty + p[1] * sc];
  const flow = ease(f, w(26.4), 10);
  const ask = pop(f, w(25.85), 12);
  const meter = pop(f, w(27.15), 12);
  const dcLabel = toScreen(iso(DC.x + DC.w / 2, DC.y + DC.d / 2, DC.h + 40));
  const towerTop = toScreen(iso(TOWER.x, TOWER.y, 190));
  const pipeMid = toScreen(iso(1205, 410, 0));
  const ground = [iso(0, 0), iso(1600, 0), iso(1600, 1500), iso(0, 1500)];
  const river = [iso(0, 70), iso(1600, 40), iso(1600, 200), iso(0, 230)];
  const drawn = [...HOUSES.map((b) => ({b, o: b.x + b.y})), {b: DC, o: DC.x + DC.y}].sort((a, b) => a.o - b.o);
  return (
    <AbsoluteFill style={{background: `linear-gradient(${P.sky}, #9BD9FF)`, overflow: 'hidden'}}>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <g transform={`translate(${tx},${ty}) scale(${sc})`}>
          {/* hills on the far bank */}
          <polygon points={pts([iso(-200, -100), iso(1800, -160), iso(1800, 40, 0), iso(-200, 70, 0)])} fill="#C9A86A" />
          <polygon points={pts(ground)} fill={P.grass} />
          <polygon points={pts(river)} fill={P.water} />
          {Array.from({length: 7}, (_, i) => {
            const x0 = (i * 260 + f * 4) % 1700 - 100;
            return <polyline key={i} points={pts([iso(x0, 120), iso(x0 + 90, 118)])} stroke="#BFE8FF" strokeWidth={6} strokeLinecap="round" />;
          })}
          {/* streets */}
          {[0, 1, 2, 3, 4, 5].map((j) => (
            <polygon key={j} points={pts([iso(270, 360 + j * 110), iso(960, 360 + j * 110), iso(960, 372 + j * 110), iso(270, 372 + j * 110)])} fill="#E9F7D9" opacity={0.9} />
          ))}
          {/* the pipe from the town's water to the data centre */}
          <polyline points={pts(PIPE.map(([x, y]) => iso(x, y, 6)))} stroke="#5B6B8C" strokeWidth={16} fill="none" strokeLinejoin="round" />
          <polyline points={pts(PIPE.map(([x, y]) => iso(x, y, 6)))} stroke={P.water} strokeWidth={8} strokeDasharray="18 16" strokeDashoffset={-f * 4} fill="none" strokeLinejoin="round" opacity={flow} />
          {TREES.map((t, i) => {
            const [sx, sy] = iso(t.x, t.y);
            return (
              <g key={i}>
                <rect x={sx - 3} y={sy - 14} width={6} height={16} fill="#7A4E2D" />
                <circle cx={sx} cy={sy - 22} r={t.r} fill={i % 3 ? P.green : '#1A9A50'} />
              </g>
            );
          })}
          {/* water tower */}
          {(() => {
            const [sx, sy] = iso(TOWER.x, TOWER.y);
            return (
              <g>
                {[-30, 30].map((dx) => (
                  <line key={dx} x1={sx + dx} y1={sy} x2={sx + dx * 0.5} y2={sy - 120} stroke="#7C8AA8" strokeWidth={8} />
                ))}
                <rect x={sx - 52} y={sy - 190} width={104} height={74} rx={10} fill="#DDE6F5" />
                <ellipse cx={sx} cy={sy - 190} rx={52} ry={18} fill="#F4F7FC" />
                <ellipse cx={sx} cy={sy - 116} rx={52} ry={16} fill="#B7C4DD" />
                <rect x={sx - 52} y={sy - 172} width={104} height={20} fill={P.water} />
              </g>
            );
          })()}
          {drawn.map(({b}, i) => (
            <BoxShape key={i} b={b} />
          ))}
          {/* the data centre's roof: cooling units */}
          {Array.from({length: 12}, (_, i) => {
            const x = DC.x + 30 + (i % 4) * 75;
            const y = DC.y + 30 + Math.floor(i / 4) * 85;
            const [sx, sy] = iso(x + 20, y + 20, DC.h);
            const spin = (f * 12 + i * 30) % 360;
            return (
              <g key={i} transform={`translate(${sx},${sy}) scale(1,0.5)`}>
                <circle r={26} fill="#9FB0D3" />
                <g transform={`rotate(${spin})`}>
                  <rect x={-22} y={-4} width={44} height={8} rx={4} fill="#5B6B8C" />
                  <rect x={-4} y={-22} width={8} height={44} rx={4} fill="#5B6B8C" />
                </g>
              </g>
            );
          })}
        </g>
      </svg>
      {/* place */}
      <div style={{position: 'absolute', left: 80, top: 70, opacity: ease(f, 0, 10)}}>
        <Tag bg={P.white} color={P.ink} size={44}>The Dalles, Oregon</Tag>
        <Note style={{marginTop: 14, marginLeft: 8}} color={P.ink}>Population ~16,000 · on the Columbia River</Note>
      </div>
      {/* labels on the map */}
      <div style={{position: 'absolute', left: dcLabel[0], top: dcLabel[1], transform: 'translate(-50%,-100%)', opacity: ease(f, w(24.6), 10)}}>
        <Tag bg={P.ink} color={P.white} size={30}>Google data centre</Tag>
      </div>
      <div style={{position: 'absolute', left: towerTop[0], top: towerTop[1], transform: 'translate(-50%,-110%)', opacity: ease(f, w(24.9), 10)}}>
        <Tag bg={P.water} color={P.white} size={26}>Town water</Tag>
      </div>
      <div style={{position: 'absolute', left: pipeMid[0] + 20, top: pipeMid[1] - 10, opacity: Math.min(1, meter), transform: `scale(${meter})`, transformOrigin: '0 50%'}}>
        <Tag bg={P.white} color={P.water} size={34}>? gallons a day</Tag>
      </div>
      {/* the newspaper's question */}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: Math.min(1, ask), transform: `scale(${ask})`}}>
        <Tag bg={P.white} color={P.ink} size={52}>
          How much of your water is <span style={{color: P.red}}>Google</span> using?
        </Tag>
      </div>
    </AbsoluteFill>
  );
};
