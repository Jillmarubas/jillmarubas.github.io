import React from 'react';
import * as A from './scenesA';
import * as B from './scenesB';
import * as Z from './scenesC';
import {ChapterCard} from './chapter';

/*
 * Scene list. Each scene starts at line `from` of chapter `ch` (timing.json) and runs until the
 * next scene starts; `card` scenes are story title cards (from the chapter start to its first
 * line). Chapters: 0 hook, 1 preview, 2–6 stories 1–5, 7 outro. One scene per script line.
 */
export type SceneDef = {ch: number; from: number; C: React.FC; card?: boolean};
const Card = (n: number, title: string, logo?: string, fit?: number): React.FC => {
  const Comp: React.FC = () => <ChapterCard n={n} title={title} logo={logo} logoFit={fit} />;
  return Comp;
};
const run = (ch: number, comps: React.FC[]): SceneDef[] => comps.map((C, i) => ({ch, from: i, C}));

export const SCENES: SceneDef[] = [
  ...run(0, [A.H0, A.H1, A.H2, A.H3, A.H4]),
  ...run(1, [A.P0, A.P1, A.P2, A.P3, A.P4]),
  {ch: 2, from: 0, C: Card(1, "Nvidia's cheaper DGX Spark", 'nvidia'), card: true},
  ...run(2, [A.N0, A.N1, A.N2, A.N3, A.N4, A.N5, A.N6, A.N7, A.N8, A.N9, A.N10, A.N11]),
  {ch: 3, from: 0, C: Card(2, "Amazon's peace offering", 'amazon', 0.85), card: true},
  ...run(3, [B.A0, B.A1, B.A2, B.A3, B.A4, B.A5, B.A6, B.A7, B.A8, B.A9, B.A10, B.A11]),
  {ch: 4, from: 0, C: Card(3, "Anthropic's $100M academy", 'anthropic', 0.85), card: true},
  ...run(4, [B.C0, B.C1, B.C2, B.C3, B.C4, B.C5, B.C6, B.C7, B.C8, B.C9]),
  {ch: 5, from: 0, C: Card(4, 'The AI on your video call', 'tavus', 0.85), card: true},
  ...run(5, [Z.T0, Z.T1, Z.T2, Z.T3, Z.T4, Z.T5, Z.T6, Z.T7]),
  {ch: 6, from: 0, C: Card(5, "OpenAI's brutal 48 hours", 'openai'), card: true},
  ...run(6, [Z.O0, Z.O1, Z.O2, Z.O3, Z.O4, Z.O5, Z.O6, Z.O7, Z.O8, Z.O9, Z.O10, Z.O11, Z.O12, Z.O13, Z.O14]),
  ...run(7, [Z.E0, Z.E1]),
];
