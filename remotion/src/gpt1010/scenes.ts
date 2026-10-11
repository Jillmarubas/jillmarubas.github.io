// Scene name → component. The list itself (order, windows, transitions) lives in plan.ts.
import React from 'react';
import {SPEC} from './plan';
import {HookApp, HookDate, HookPlan, Plan} from './s1';
import {IuiBlocks, IuiFormats, IuiIntro, IuiModels, IuiRollout, IuiWhy} from './s2';
import {TipFormat, TipReasoning, TryBike, TryBill, TryMap, TryOpen} from './s3';
import {Speed44, StreamDemo, WaitNew, WaitOld} from './s4';
import {AudioDrop, AudioOutputs, AudioPlans, AudioSpecs, NotesCheck, NotesDemo} from './s5';
import {CodexFree, CodexIntro, CodexOff, CodexUse, CodexWho} from './s6';
import {Morph, Outro, Todo} from './s7';

const ALL: Record<string, React.FC> = {HookApp, HookDate, HookPlan, Plan, IuiIntro, IuiBlocks, IuiFormats, IuiRollout, IuiModels, IuiWhy, TryOpen, TryBill, TryBike, TryMap, TipFormat, TipReasoning, WaitOld, WaitNew, Speed44, StreamDemo, AudioDrop, AudioOutputs, AudioPlans, AudioSpecs, NotesDemo, NotesCheck, CodexIntro, CodexWho, CodexFree, CodexUse, CodexOff, Todo, Morph, Outro};
export const SCENE_C: Record<string, React.FC> = Object.fromEntries(
  SPEC.map((s) => {
    if (!ALL[s.name]) throw new Error(`scene ${s.name} has no component`);
    return [s.name, ALL[s.name]];
  }),
);
