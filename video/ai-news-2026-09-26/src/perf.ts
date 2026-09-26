import {getInputProps} from 'remotion';

// Benchmark switches (inputProps), used only to measure what each effect costs per frame.
const p = getInputProps() as Record<string, unknown>;
export const PERF = {
  noGrain: Boolean(p.noGrain),
  staticField: Boolean(p.staticField),
  noBackdrop: Boolean(p.noBackdrop),
  noTextShadow: Boolean(p.noTextShadow),
};
