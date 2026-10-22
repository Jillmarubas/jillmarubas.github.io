import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {createDepthScene, type Method, type Move} from './depthscene.js';

/**
 * Archive-photo parallax: a real 3D camera move through one photo.
 *
 * method 'hybrid' (default, "method B"): cut-outs as cards in front of the filled background,
 *   which is bent by the object-free depth map. Clean edges and real ground depth.
 * method 'depth' ("method A"): the whole photo displaced by the depth map. No cutting needed,
 *   but edges stretch where near meets far; fine for gentle moves.
 * method 'holes': B without the fill (only to show why the fill matters).
 *
 * `dir` is a folder in public/ written by `prep_depth.py`. The move runs over the whole clip
 * (the Sequence or composition length), cubic ease in-out.
 */
export type ArchiveParallaxProps = {dir: string; method?: Method; move?: Move};

const FILES = ['photo', 'depth', 'clean', 'holes', 'depth_bg', 'obj_mid', 'obj_near'];
type Assets = {tex: Record<string, THREE.Texture>; info: {background: number; mid: number; near: number}};

// Loads the layers once; the render waits until they're ready.
const useAssets = (dir: string) => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender(`Loading parallax layers from ${dir}`));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all([
      fetch(staticFile(`${dir}/layers.json`)).then((r) => r.json()),
      ...FILES.map((f) => loader.loadAsync(staticFile(`${dir}/${f}.png`))),
    ]).then(([info, ...texs]) => {
      setAssets({info, tex: Object.fromEntries(FILES.map((f, i) => [f, texs[i] as THREE.Texture]))});
      continueRender(handle);
    });
  }, [dir, handle]);
  return assets;
};

// Hands the shared scene to react-three-fiber and poses the camera for this frame.
const World: React.FC<{assets: Assets; method: Method; move?: Move; sec: number; duration: number}> = ({
  assets,
  method,
  move,
  sec,
  duration,
}) => {
  const world = useMemo(
    () => createDepthScene(THREE, assets.tex, assets.info, method, move, duration),
    // move is usually an inline object literal; compare by value
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assets, method, JSON.stringify(move), duration],
  );
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  world.renderAt(sec);
  const wc = world.camera;
  cam.fov = wc.fov;
  cam.near = wc.near;
  cam.far = wc.far;
  cam.position.copy(wc.position);
  cam.quaternion.copy(wc.quaternion);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
  return <primitive object={world.scene} />;
};

export const ArchiveParallax: React.FC<ArchiveParallaxProps> = ({dir, method = 'hybrid', move}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames, width, height} = useVideoConfig();
  const assets = useAssets(dir);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* Mount the canvas only after the images load: ThreeCanvas draws on frame changes and on
          creation, so a scene added later in the same frame would never be drawn (black frame). */}
      {assets && (
        <ThreeCanvas width={width} height={height} flat gl={{antialias: true, preserveDrawingBuffer: true}}>
          <World assets={assets} method={method} move={move} sec={frame / fps} duration={durationInFrames / fps} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
