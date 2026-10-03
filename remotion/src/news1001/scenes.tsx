import React from 'react';
import * as A from './scenesA';
import * as B from './scenesB';
import * as Z from './scenesC';
import {ChapterCard} from './chapter';

/*
 * Scene list. Each scene starts at line `from` of chapter `ch` (timing.json) and runs until the
 * next scene starts; `card` scenes are story title cards (from the chapter start to its first
 * line). Chapters: 0 hook, 1 preview, 2–8 stories 1–7, 9 outro.
 */
export type SceneDef = {ch: number; from: number; C: React.FC; card?: boolean};
const Card = (n: number, title: string, logo?: string, fit?: number): React.FC => {
  const Comp: React.FC = () => <ChapterCard n={n} title={title} logo={logo} logoFit={fit} />;
  return Comp;
};

export const SCENES: SceneDef[] = [
  {ch: 0, from: 0, C: A.H0},
  {ch: 0, from: 1, C: A.H1},
  {ch: 0, from: 2, C: A.H2},
  {ch: 0, from: 3, C: A.H3},
  {ch: 0, from: 4, C: A.H4},
  {ch: 1, from: 0, C: A.P0},
  {ch: 2, from: 0, C: Card(1, 'Gemini 4 "Argon"', 'gemini'), card: true},
  {ch: 2, from: 0, C: A.G0},
  {ch: 2, from: 1, C: A.G1},
  {ch: 2, from: 3, C: A.G2},
  {ch: 2, from: 5, C: A.G3},
  {ch: 2, from: 6, C: A.G4},
  {ch: 2, from: 7, C: A.G5},
  {ch: 2, from: 9, C: A.G6},
  {ch: 2, from: 10, C: A.G7},
  {ch: 3, from: 0, C: Card(2, 'The FTC opens a probe'), card: true},
  {ch: 3, from: 0, C: B.F0},
  {ch: 3, from: 1, C: B.F1},
  {ch: 3, from: 2, C: B.F2},
  {ch: 3, from: 4, C: B.F3},
  {ch: 3, from: 6, C: B.F4},
  {ch: 4, from: 0, C: Card(3, 'The White House accord'), card: true},
  {ch: 4, from: 0, C: B.A0},
  {ch: 4, from: 1, C: B.A1},
  {ch: 4, from: 2, C: B.A2},
  {ch: 4, from: 4, C: B.A3},
  {ch: 4, from: 6, C: B.A4},
  {ch: 4, from: 7, C: B.A5},
  {ch: 4, from: 8, C: B.A6},
  {ch: 5, from: 0, C: Card(4, 'OpenAI vs Moonshot', 'kimi'), card: true},
  {ch: 5, from: 0, C: B.M0},
  {ch: 5, from: 1, C: B.M1},
  {ch: 5, from: 2, C: B.M2},
  {ch: 5, from: 4, C: B.M3},
  {ch: 5, from: 5, C: B.M4},
  {ch: 5, from: 6, C: B.M5},
  {ch: 5, from: 8, C: B.M6},
  {ch: 5, from: 9, C: B.M7},
  {ch: 6, from: 0, C: Card(5, "Meta's tax move", 'meta', 0.95), card: true},
  {ch: 6, from: 0, C: Z.T0},
  {ch: 6, from: 1, C: Z.T1},
  {ch: 6, from: 2, C: Z.T2},
  {ch: 6, from: 3, C: Z.T3},
  {ch: 6, from: 5, C: Z.T4},
  {ch: 6, from: 6, C: Z.T5},
  {ch: 6, from: 7, C: Z.T6},
  {ch: 7, from: 0, C: Card(6, 'OpenAI: $30B, no IPO yet', 'openai'), card: true},
  {ch: 7, from: 0, C: Z.O0},
  {ch: 7, from: 2, C: Z.O1},
  {ch: 7, from: 3, C: Z.O2},
  {ch: 7, from: 5, C: Z.O3},
  {ch: 8, from: 0, C: Card(7, 'DoorDash in your texts', 'doordash', 0.95), card: true},
  {ch: 8, from: 0, C: Z.D0},
  {ch: 8, from: 1, C: Z.D1},
  {ch: 8, from: 2, C: Z.D2},
  {ch: 8, from: 3, C: Z.D3},
  {ch: 8, from: 4, C: Z.D4},
  {ch: 8, from: 5, C: Z.D5},
  {ch: 8, from: 6, C: Z.D6},
  {ch: 9, from: 0, C: Z.E0},
  {ch: 9, from: 2, C: Z.E1},
  {ch: 9, from: 3, C: Z.E2},
];
