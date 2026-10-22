import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';
import {FPS, H, W, createDepthScene, type Method} from './depthscene.js';

const FILES = ['photo', 'depth', 'clean', 'holes', 'depth_bg', 'obj_mid', 'obj_near'];
type Assets = {tex: Record<string, THREE.Texture>; info: {background: number; mid: number; near: number}};

// Loads the layers once; the render waits until they're ready.
const useAssets = () => {
  const [assets, setAssets] = useState<Assets | null>(null);
  const [handle] = useState(() => delayRender('Loading depth layers'));
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    Promise.all([
      fetch(staticFile('demodepth/layers.json')).then((r) => r.json()),
      ...FILES.map((f) => loader.loadAsync(staticFile(`demodepth/${f}.png`))),
    ]).then(([info, ...texs]) => {
      setAssets({info, tex: Object.fromEntries(FILES.map((f, i) => [f, texs[i] as THREE.Texture]))});
      continueRender(handle);
    });
  }, [handle]);
  return assets;
};

// Hands the shared scene to react-three-fiber and poses the camera for this frame.
const World: React.FC<{assets: Assets; method: Method; sec: number}> = ({assets, method, sec}) => {
  const world = useMemo(() => createDepthScene(THREE, assets.tex, assets.info, method), [assets, method]);
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

export const DemoDepth: React.FC<{method: Method}> = ({method}) => {
  const sec = useCurrentFrame() / FPS;
  const assets = useAssets();
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {/* Mount the canvas only after the images load: ThreeCanvas draws on frame changes and on
          creation, so a scene added later in the same frame would never be drawn (black frame). */}
      {assets && (
        <ThreeCanvas width={W} height={H} flat gl={{antialias: true, preserveDrawingBuffer: true}}>
          <World assets={assets} method={method} sec={sec} />
        </ThreeCanvas>
      )}
    </AbsoluteFill>
  );
};
