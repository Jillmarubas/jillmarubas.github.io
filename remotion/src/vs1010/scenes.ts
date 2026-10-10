// Scene name → component. The list itself (order, windows, transitions) lives in plan.ts.
import React from 'react';
import {SPEC} from './plan';
import {HPrice, HCan, HWhich, HPromise, Plan, MGpt, MIui, MClaude, MSizes, MGemini, MGoogle, MSources, PTable, PCheap, PMain, PMainFeat, PPower, PAdvice, VPrice, FIntro, FGpt, FClaude, FGemini, VFree} from './sA';
import {R1Iui, R1Stream, R1Gemini, R1Claude, R1Try, V1, R2Claude, R2Artifacts, R2Gpt, R2Gemini, R2Try, R2Trick, V2, R3Flow, R3Who, R3Context, R3Check, R3Try, V3, R4Nano, R4Synth, R4Video, R4Rest, R4Try, V4, R5Cc, R5Codex, R5Jules, R5Try, V5} from './sB';
import {R6Gemini, R6Claude, R6Gpt, R6Try, V6, R7Gemini, R7Audio, R7Claude, R7Try, V7, R8Gpt, R8Gemini, R8Claude, R8Try, V8, R9Intro, R9Gpt, R9Claude, R9Gemini, R9Advice, V9, Prompts, Mistakes, TipsGpt, TipsClaude, TipsGemini, Score, Persona, OneTip, Final, Outro} from './sC';

const ALL: Record<string, React.FC> = {HPrice, HCan, HWhich, HPromise, Plan, MGpt, MIui, MClaude, MSizes, MGemini, MGoogle, MSources, PTable, PCheap, PMain, PMainFeat, PPower, PAdvice, VPrice, FIntro, FGpt, FClaude, FGemini, VFree, R1Iui, R1Stream, R1Gemini, R1Claude, R1Try, V1, R2Claude, R2Artifacts, R2Gpt, R2Gemini, R2Try, R2Trick, V2, R3Flow, R3Who, R3Context, R3Check, R3Try, V3, R4Nano, R4Synth, R4Video, R4Rest, R4Try, V4, R5Cc, R5Codex, R5Jules, R5Try, V5, R6Gemini, R6Claude, R6Gpt, R6Try, V6, R7Gemini, R7Audio, R7Claude, R7Try, V7, R8Gpt, R8Gemini, R8Claude, R8Try, V8, R9Intro, R9Gpt, R9Claude, R9Gemini, R9Advice, V9, Prompts, Mistakes, TipsGpt, TipsClaude, TipsGemini, Score, Persona, OneTip, Final, Outro};
export const SCENE_C: Record<string, React.FC> = Object.fromEntries(
  SPEC.map((s) => {
    if (!ALL[s.name]) throw new Error(`scene ${s.name} has no component`);
    return [s.name, ALL[s.name]];
  }),
);
