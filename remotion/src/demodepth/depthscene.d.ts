import type * as THREE_NS from 'three';
export const FPS: number;
export const DURATION_S: number;
export const W: number;
export const H: number;
export const D: number;
export function distFromDisp(disp: number): number;
export type Method = 'depth' | 'hybrid' | 'holes';
export function createDepthScene(
  THREE: typeof THREE_NS,
  tex: Record<string, THREE_NS.Texture>,
  info: {background: number; mid: number; near: number},
  method: Method,
): {scene: THREE_NS.Scene; camera: THREE_NS.PerspectiveCamera; renderAt: (t: number) => void};
