import React from 'react';
import * as A from './scenesA';
import * as B from './scenesB';
import * as D from './scenesC';
import {ChapterCard} from './chapter';

/*
 * Scene list. Each scene starts at line `from` of chapter `ch` and runs until the next scene
 * starts; `card` scenes are chapter title cards (they run from the chapter start to its first
 * line). Every script line belongs to exactly one scene.
 */
export type SceneDef = {ch: number; from: number; C: React.FC; card?: boolean};

const Card = (n: number, title: string): React.FC => {
  const Comp: React.FC = () => <ChapterCard n={n} title={title} />;
  return Comp;
};

const TITLES = ['', 'The cloud has an address', 'The bill', 'The water', 'The neighbours', 'The deal', 'Who decides?', 'Can it be fixed?'];

const BUILT: SceneDef[] = [
  {ch: 0, from: 0, C: A.S0a},
  {ch: 0, from: 2, C: A.S0b},
  {ch: 0, from: 4, C: A.S0c},
  {ch: 0, from: 5, C: A.S0d},
  {ch: 0, from: 8, C: A.S0e},
  {ch: 1, from: 0, C: Card(1, TITLES[1]), card: true},
  {ch: 1, from: 0, C: A.S1a},
  {ch: 1, from: 2, C: A.S1b},
  {ch: 1, from: 4, C: A.S1c},
  {ch: 1, from: 7, C: A.S1d},
  {ch: 1, from: 12, C: A.S1e},
  {ch: 1, from: 13, C: A.S1f},
  {ch: 1, from: 15, C: A.S1g},
  {ch: 1, from: 17, C: A.S1h},
  {ch: 1, from: 18, C: A.S1i},
  {ch: 1, from: 20, C: A.S1j},
  {ch: 2, from: 0, C: Card(2, TITLES[2]), card: true},
  {ch: 2, from: 0, C: B.S2a},
  {ch: 2, from: 1, C: B.S2b},
  {ch: 2, from: 2, C: B.S2c},
  {ch: 2, from: 3, C: B.S2d},
  {ch: 2, from: 7, C: B.S2e},
  {ch: 2, from: 11, C: B.S2f},
  {ch: 2, from: 12, C: B.S2g},
  {ch: 2, from: 14, C: B.S2h},
  {ch: 2, from: 16, C: B.S2i},
  {ch: 2, from: 19, C: B.S2j},
  {ch: 3, from: 0, C: Card(3, TITLES[3]), card: true},
  {ch: 3, from: 0, C: B.S3a},
  {ch: 3, from: 1, C: B.S3b},
  {ch: 3, from: 3, C: B.S3c},
  {ch: 3, from: 5, C: B.S3d},
  {ch: 3, from: 8, C: B.S3e},
  {ch: 3, from: 12, C: B.S3f},
  {ch: 3, from: 14, C: B.S3g},
  {ch: 4, from: 0, C: Card(4, TITLES[4]), card: true},
  {ch: 4, from: 0, C: D.S4a},
  {ch: 4, from: 1, C: D.S4b},
  {ch: 4, from: 4, C: D.S4c},
  {ch: 4, from: 7, C: D.S4d},
  {ch: 4, from: 10, C: D.S4e},
  {ch: 4, from: 15, C: D.S4f},
  {ch: 5, from: 0, C: Card(5, TITLES[5]), card: true},
  {ch: 5, from: 0, C: D.S5a},
  {ch: 5, from: 3, C: D.S5b},
  {ch: 5, from: 4, C: D.S5c},
  {ch: 5, from: 7, C: D.S5d},
  {ch: 5, from: 9, C: D.S5e},
  {ch: 5, from: 13, C: D.S5f},
  {ch: 6, from: 0, C: Card(6, TITLES[6]), card: true},
  {ch: 6, from: 0, C: D.S6a},
  {ch: 6, from: 3, C: D.S6b},
  {ch: 6, from: 4, C: D.S6c},
  {ch: 6, from: 6, C: D.S6d},
  {ch: 6, from: 8, C: D.S6e},
  {ch: 6, from: 10, C: D.S6f},
  {ch: 7, from: 0, C: Card(7, TITLES[7]), card: true},
  {ch: 7, from: 0, C: D.S7a},
  {ch: 7, from: 2, C: D.S7b},
  {ch: 7, from: 5, C: D.S7c},
  {ch: 7, from: 6, C: D.S7d},
  {ch: 7, from: 8, C: D.S7e},
  {ch: 7, from: 9, C: D.S7f},
  {ch: 8, from: 0, C: D.S8a},
  {ch: 8, from: 2, C: D.S8b},
];

export const SCENES: SceneDef[] = BUILT;
