// The scene list: each scene starts on a script line (chapter, line index) and runs to the next.
import React from 'react';
import {HookLaptop, HookMods, HookPlan, Plan} from './s01';
import {ModAnatomy, ModDescribe, ModPowers} from './s02';
import {BuildMod, Ideas, OneSentence, Samples} from './s03';
import {LimitBefore, LimitIntro, LimitNow, LimitPlans, ModelPicker, OpusReplies, OpusStats, RuleOfThumb, SonnetCard, SwitchModel} from './s04';
import {AuditCmd, AuditReport, AuditScan, AuditToday, AuditWhy, BonusCredit, ClaimCredit, CloudIncluded, SecondFreebie} from './s05';
import {EvalBuild, EvalClimb, EvalPipeline, EvalWhat, PublishDir, PublishFlow, PublishReach, YskEnable, YskExplain} from './s06';
import {Outro, TipAndrew, TipDoug, TipLesson, TodoList, UseShape} from './s07';

export type Tr = 'whipL' | 'whipR' | 'up' | 'zoom' | 'fade' | 'cut';
export type SceneDef = {ch: number; from: number; to?: number; C: React.FC; tr?: Tr; pre?: number};

export const SCENES: SceneDef[] = [
  // 0 hook
  {ch: 0, from: 0, to: 1, C: HookLaptop},
  {ch: 0, from: 1, to: 3, C: HookMods, tr: 'zoom', pre: 0.3},
  {ch: 0, from: 3, to: 4, C: HookPlan},
  // 1 the plan
  {ch: 1, from: 0, C: Plan},
  // 2 mods
  {ch: 2, from: 0, to: 2, C: ModAnatomy},
  {ch: 2, from: 2, to: 3, C: ModPowers},
  {ch: 2, from: 3, C: ModDescribe},
  // 3 build your first mod
  {ch: 3, from: 0, to: 8, C: BuildMod},
  {ch: 3, from: 8, to: 9, C: OneSentence},
  {ch: 3, from: 9, to: 10, C: Ideas},
  {ch: 3, from: 10, C: Samples},
  // 4 wrap-up allowance
  {ch: 4, from: 0, to: 2, C: LimitIntro},
  {ch: 4, from: 2, to: 3, C: LimitBefore},
  {ch: 4, from: 3, to: 4, C: LimitNow},
  {ch: 4, from: 4, C: LimitPlans},
  // 5 models
  {ch: 5, from: 0, to: 2, C: ModelPicker},
  {ch: 5, from: 2, to: 4, C: OpusStats},
  {ch: 5, from: 4, to: 5, C: OpusReplies},
  {ch: 5, from: 5, to: 7, C: SonnetCard},
  {ch: 5, from: 7, to: 8, C: SwitchModel},
  {ch: 5, from: 8, C: RuleOfThumb},
  // 6 free credit
  {ch: 6, from: 0, to: 2, C: CloudIncluded},
  {ch: 6, from: 2, to: 4, C: BonusCredit},
  {ch: 6, from: 4, to: 5, C: ClaimCredit},
  {ch: 6, from: 5, C: SecondFreebie},
  // 7 prompt-audit
  {ch: 7, from: 0, to: 1, C: AuditWhy},
  {ch: 7, from: 1, to: 2, C: AuditCmd},
  {ch: 7, from: 2, to: 4, C: AuditScan},
  {ch: 7, from: 4, to: 6, C: AuditReport},
  {ch: 7, from: 6, C: AuditToday},
  // 8 you should know
  {ch: 8, from: 0, to: 3, C: YskExplain},
  {ch: 8, from: 3, C: YskEnable},
  // 9 evals
  {ch: 9, from: 0, to: 2, C: EvalWhat},
  {ch: 9, from: 2, to: 3, C: EvalBuild},
  {ch: 9, from: 3, to: 4, C: EvalPipeline},
  {ch: 9, from: 4, C: EvalClimb},
  // 10 publish
  {ch: 10, from: 0, to: 1, C: PublishDir},
  {ch: 10, from: 1, to: 2, C: PublishFlow},
  {ch: 10, from: 2, C: PublishReach},
  // 11 pro tips
  {ch: 11, from: 0, to: 3, C: TipDoug},
  {ch: 11, from: 3, to: 5, C: TipAndrew},
  {ch: 11, from: 5, C: TipLesson},
  // 12 to-do list
  {ch: 12, from: 0, to: 1, C: TodoList},
  {ch: 12, from: 1, C: UseShape},
  // 13 outro
  {ch: 13, from: 0, C: Outro},
];
