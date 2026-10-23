// Motion blur for three.js scenes driven by pure functions of time (used by both the Remotion and the
// HyperFrames host). Fast frames are rendered several times across a 180° shutter and averaged in a
// half-float target, the way a real camera blurs motion. Still frames render once, so holds cost nothing.
// Without it, fast moves (explode, reassemble, pull-back) were razor sharp and stuttered: flicker_check
// flagged them.
import * as THREE from 'three';

export function createMotionBlur(renderer: THREE.WebGLRenderer, w: number, h: number) {
  const opts = {type: THREE.HalfFloatType, colorSpace: THREE.LinearSRGBColorSpace, samples: 4};
  const sub = new THREE.WebGLRenderTarget(w, h, opts);
  const acc = new THREE.WebGLRenderTarget(w, h, {type: THREE.HalfFloatType, colorSpace: THREE.LinearSRGBColorSpace});
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const addMat = new THREE.ShaderMaterial({
    uniforms: {tex: {value: sub.texture}, weight: {value: 1}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D tex; uniform float weight; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv) * weight; }',
    // Plain ONE + ONE add: the target already holds premultiplied colour.
    blending: THREE.AdditiveBlending,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  // Output pass. Sub-frames land in the target as linear, premultiplied HDR (three applies tone
  // mapping and sRGB only when drawing to the screen), so the output pass applies both, once.
  const outMat = new THREE.ShaderMaterial({
    uniforms: {tex: {value: acc.texture}},
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader:
      'uniform sampler2D tex; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tex, vUv);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), addMat);
  const quadScene = new THREE.Scene();
  quadScene.add(quad);

  /**
   * Renders the frame at time t. `pose(ts)` must set the scene and camera for time ts.
   * Every frame goes through the same path (even samples = 1), so frames with and without blur
   * match exactly and switching blur on doesn't pop.
   */
  const render = (scene: THREE.Scene, cam: THREE.Camera, t: number, fps: number, samples: number, pose: (ts: number) => void) => {
    samples = Math.max(1, Math.round(samples));
    const shutter = 0.5 / fps; // 180°
    const autoClear = renderer.autoClear;
    renderer.autoClear = false; // we clear by hand; auto-clear would wipe the accumulator on every add
    renderer.setRenderTarget(acc);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    for (let i = 0; i < samples; i++) {
      pose(samples === 1 ? t : t - shutter + (shutter * (i + 0.5)) / samples);
      renderer.setRenderTarget(sub);
      renderer.setClearColor(0x000000, 0);
      renderer.clear();
      renderer.render(scene, cam);
      quad.material = addMat;
      addMat.uniforms.weight.value = 1 / samples;
      renderer.setRenderTarget(acc);
      renderer.render(quadScene, quadCam);
    }
    pose(t); // leave the scene at t (labels read it)
    quad.material = outMat;
    renderer.setRenderTarget(null);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(quadScene, quadCam);
    renderer.autoClear = autoClear;
  };
  return {render};
}
