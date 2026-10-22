// Depth-map parallax test: one archive photo, three ways to move a camera through it.
// Plain ES module with no imports (the host passes THREE), like demo3d/city3d.js.
//
//  'depth'  A. Depth-map displacement: the whole photo is a mesh pushed back by the AI depth map.
//  'hybrid' B. Cut-outs (shack, family, posts) as flat cards in front of the filled-in background,
//              which is itself bent by the object-free depth map.
//  'holes'  C. Same as B but the background was NOT filled: the cut-out holes show.

export const FPS = 30;
export const DURATION_S = 6;
export const W = 1920;
export const H = 1080;
export const D = 1200; // distance at which the photo plate is 1:1 (CSS perspective 1200px)
export const PLATE_W = 2400; // plate = 1.25x the frame, so the camera can move
export const PLATE_H = 1350;
const NEAR = 0.6 * D; // depth 1 (white) sits here
const FAR = 3.5 * D; // depth 0 (black) sits here
const INV_FAR = 1 / FAR;
const INV_DELTA = 1 / NEAR - 1 / FAR;

// Depth maps are relative inverse depth, so interpolate 1/distance.
export const distFromDisp = (disp) => 1 / (INV_FAR + disp * INV_DELTA);
export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;

// A plate whose vertices are pushed along their camera ray to the depth-map distance.
// At frame 0 it looks exactly like the flat photo; moving the camera reveals the 3D.
function displacedPlate(THREE, map, depthMap, transparent) {
  const geo = new THREE.PlaneGeometry(PLATE_W, PLATE_H, 600, 338);
  const mat = new THREE.ShaderMaterial({
    transparent,
    uniforms: {
      map: {value: map},
      depthMap: {value: depthMap},
      uD: {value: D},
      uInvFar: {value: INV_FAR},
      uInvDelta: {value: INV_DELTA},
    },
    vertexShader: `
      uniform sampler2D depthMap; uniform float uD, uInvFar, uInvDelta;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        float disp = texture2D(depthMap, uv).r;
        float d = 1.0 / (uInvFar + disp * uInvDelta);
        vec3 p = vec3(position.xy * d / uD, -d);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D map; varying vec2 vUv;
      void main() {
        gl_FragColor = texture2D(map, vUv);
        #include <colorspace_fragment>
      }`,
  });
  return new THREE.Mesh(geo, mat);
}

// A flat cut-out card at the distance of its depth, scaled so it lines up at frame 0.
function card(THREE, map, disp, order) {
  const d = distFromDisp(disp);
  const k = d / D;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(PLATE_W * k, PLATE_H * k),
    new THREE.MeshBasicMaterial({map, transparent: true, depthTest: false, depthWrite: false, toneMapped: false}),
  );
  m.position.z = -d;
  m.renderOrder = order;
  return m;
}

/** tex: {photo, depth, clean, holes, depth_bg, obj_mid, obj_near}; info: layers.json */
export function createDepthScene(THREE, tex, info, method) {
  for (const k of ['photo', 'clean', 'holes', 'obj_mid', 'obj_near']) {
    tex[k].colorSpace = THREE.SRGBColorSpace;
    tex[k].anisotropy = 8;
  }
  for (const k of ['depth', 'depth_bg']) tex[k].colorSpace = THREE.NoColorSpace;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  if (method === 'depth') {
    scene.add(displacedPlate(THREE, tex.photo, tex.depth, false));
  } else {
    const bg = displacedPlate(THREE, method === 'hybrid' ? tex.clean : tex.holes, tex.depth_bg, method === 'holes');
    bg.renderOrder = 0;
    scene.add(bg);
    scene.add(card(THREE, tex.obj_mid, info.mid, 1));
    scene.add(card(THREE, tex.obj_near, info.near, 2));
  }

  const camera = new THREE.PerspectiveCamera((2 * Math.atan(H / 2 / D) * 180) / Math.PI, W / H, 1, 20000);

  // Same move for all three: track right, rise a little, push in, and widen the lens slightly
  // while pushing (the research's "keyframed FOV" lens warp).
  function renderAt(t) {
    const p = easeInOutCubic(clamp01(t / (DURATION_S - 0.2)));
    camera.position.set(lerp(-70, 70, p), lerp(-10, 18, p), lerp(0, -280, p));
    camera.fov = lerp(48.46, 52, p);
    camera.updateProjectionMatrix();
    camera.lookAt(camera.position.x, camera.position.y, camera.position.z - 1);
    camera.updateMatrixWorld();
  }
  return {scene, camera, renderAt};
}
