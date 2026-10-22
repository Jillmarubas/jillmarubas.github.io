import type * as THREE_NS from 'three';
export const FPS: number;
export const DURATION_S: number;
export const W: number;
export const H: number;
export const RENDER: {exposure: number; shadowMapSize: number};
export function easeInOutCubic(t: number): number;
export function createWorld(THREE: typeof THREE_NS): {
  scene: THREE_NS.Scene;
  camera: THREE_NS.PerspectiveCamera;
  renderAt: (t: number) => void;
};
