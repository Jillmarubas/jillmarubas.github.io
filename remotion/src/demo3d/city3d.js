// Shared real-3D scene for the Remotion vs HyperFrames test.
// Plain ES module with no imports: the host passes in THREE, so both tools run
// exactly the same scene code. Everything is seeded; renderAt(t) depends on t only.

export const FPS = 30;
export const DURATION_S = 8;
export const W = 1920;
export const H = 1080;

// Renderer settings both hosts must use.
export const RENDER = {exposure: 1.0, shadowMapSize: 2048};

const mulberry32 = (a) => () => {
  a |= 0;
  a = (a + 0x6d2b79f5) | 0;
  let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;

// Facade texture: dark wall with a seeded pattern of warm lit windows.
function windowTexture(THREE, seed, litRatio) {
  const rnd = mulberry32(seed);
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#000';
  g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (rnd() < litRatio) {
        const warm = 180 + Math.floor(rnd() * 75);
        g.fillStyle = `rgb(255,${warm},${Math.floor(warm * 0.55)})`;
      } else {
        g.fillStyle = '#0b0c12';
      }
      g.fillRect(x * 32 + 8, y * 32 + 6, 16, 20);
    }
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

// Box whose UVs repeat the window texture once per 32 world units.
function building(THREE, w, h, d, mat) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv;
  const normal = geo.attributes.normal;
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const sx = ny > 0.5 ? 0 : (nx > 0.5 ? d : w) / 32;
    const sy = ny > 0.5 ? 0 : h / 32;
    uv.setXY(i, uv.getX(i) * sx, uv.getY(i) * sy);
  }
  const m = new THREE.Mesh(geo, mat);
  m.position.y = h / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function createWorld(THREE) {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x2a2440, 0.00085);

  // Sky dome: navy overhead, amber at the horizon, glow around the setting sun.
  const sunDir = new THREE.Vector3(-0.55, 0.16, -1).normalize();
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(5000, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {sunDir: {value: sunDir}},
      vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
      fragmentShader: `uniform vec3 sunDir; varying vec3 vDir;
        void main(){
          float y = clamp(vDir.y, -0.2, 1.0);
          vec3 top = vec3(0.035,0.06,0.13);
          vec3 mid = vec3(0.22,0.17,0.32);
          vec3 low = vec3(0.95,0.55,0.26);
          vec3 col = mix(low, mid, smoothstep(0.0, 0.18, y));
          col = mix(col, top, smoothstep(0.18, 0.7, y));
          float s = max(dot(normalize(vDir), sunDir), 0.0);
          col += vec3(1.0,0.6,0.3) * pow(s, 18.0) * 0.8 + vec3(1.0,0.85,0.6) * pow(s, 400.0) * 2.0;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }),
  );
  sky.renderOrder = -1;
  scene.add(sky);

  // Light: low warm sun behind the tower (long shadows toward camera) + cool sky fill.
  const hemi = new THREE.HemisphereLight(0x6a78b0, 0x1a1420, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffb070, 3.0);
  sun.position.copy(sunDir).multiplyScalar(1500);
  sun.castShadow = true;
  sun.shadow.mapSize.set(RENDER.shadowMapSize, RENDER.shadowMapSize);
  const sc = sun.shadow.camera;
  sc.left = -1100; sc.right = 1100; sc.top = 1100; sc.bottom = -1100; sc.near = 10; sc.far = 4000;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 1.5;
  scene.add(sun);
  scene.add(sun.target);

  // Ground.
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(8000, 8000),
    new THREE.MeshStandardMaterial({color: 0x15161d, roughness: 0.95, metalness: 0}),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // City grid. Taller toward the centre; the centre block holds the hero tower.
  const rnd = mulberry32(1987);
  const facades = [0.18, 0.28, 0.4].map((r, i) =>
    new THREE.MeshStandardMaterial({
      color: 0x2a2f40,
      roughness: 0.75,
      metalness: 0.1,
      emissive: 0xffffff,
      emissiveIntensity: 1.6,
      emissiveMap: windowTexture(THREE, 11 + i, r),
    }),
  );
  const STEP = 95;
  for (let i = -9; i <= 9; i++) {
    for (let j = -9; j <= 9; j++) {
      if (Math.abs(i) <= 1 && Math.abs(j) <= 1) continue; // plaza around the tower
      const dist = Math.sqrt(i * i + j * j);
      const w = 48 + rnd() * 26;
      const d = 48 + rnd() * 26;
      const h = 40 + rnd() * 50 + 240 * Math.pow(Math.max(0, 1 - dist / 11), 1.6) * (0.5 + rnd() * 0.7);
      const b = building(THREE, w, h, d, facades[Math.floor(rnd() * 3)]);
      b.position.x = i * STEP + (rnd() - 0.5) * 10;
      b.position.z = j * STEP + (rnd() - 0.5) * 10;
      scene.add(b);
    }
  }

  // Hero tower: three setbacks, a gold crown that lights up at the payoff, a spire.
  const towerMat = new THREE.MeshStandardMaterial({
    color: 0x2c2a33, roughness: 0.6, metalness: 0.2,
    emissive: 0xffffff, emissiveIntensity: 1.6, emissiveMap: windowTexture(THREE, 42, 0.35),
  });
  const tower = new THREE.Group();
  const tiers = [[110, 300], [86, 140], [64, 90]];
  let y = 0;
  for (const [s, h] of tiers) {
    const b = building(THREE, s, h, s, towerMat);
    b.position.y = y + h / 2;
    tower.add(b);
    y += h;
  }
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xc0903a, roughness: 0.45, metalness: 0.6, emissive: 0xffb347, emissiveIntensity: 0,
  });
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(22, 34, 46, 8), crownMat);
  crown.position.y = y + 23;
  crown.castShadow = true;
  tower.add(crown);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(7, 120, 8), crownMat);
  spire.position.y = y + 46 + 60;
  spire.castShadow = true;
  tower.add(spire);
  scene.add(tower);
  const crownLight = new THREE.PointLight(0xffb347, 0, 700, 1.6);
  crownLight.position.set(0, y + 60, 0);
  scene.add(crownLight);

  // Traffic: car lights moving along the avenues (positions are a function of t).
  const carGeo = new THREE.BoxGeometry(5, 3, 9);
  const red = new THREE.MeshBasicMaterial({color: 0xff3a2a});
  const white = new THREE.MeshBasicMaterial({color: 0xfff2d0});
  const cars = [];
  const crng = mulberry32(7);
  for (let k = 0; k < 140; k++) {
    const alongX = crng() < 0.5;
    const lane = (Math.floor(crng() * 19) - 9) * STEP + STEP / 2;
    const dir = crng() < 0.5 ? 1 : -1;
    const m = new THREE.Mesh(carGeo, dir > 0 ? white : red);
    if (alongX) m.rotation.y = Math.PI / 2;
    m.position.y = 2;
    scene.add(m);
    cars.push({m, alongX, lane: lane + dir * 8, dir, start: crng() * 1800, speed: 40 + crng() * 60});
  }

  // Camera: crane up from street level and push in toward the crown.
  const camera = new THREE.PerspectiveCamera(40, W / H, 1, 12000);
  const look = new THREE.Vector3();

  function renderAt(t) {
    const p = easeInOutCubic(clamp01(t / 7.6));
    camera.position.set(lerp(140, -80, p), lerp(22, 440, p), lerp(1050, 720, p));
    look.set(0, lerp(120, 470, p), 0);
    camera.lookAt(look);
    camera.updateMatrixWorld();

    for (const c of cars) {
      const s = ((c.start + c.speed * t) % 1800) - 900;
      const v = s * c.dir;
      if (c.alongX) c.m.position.set(v, 2, c.lane);
      else c.m.position.set(c.lane, 2, v);
    }

    const glow = easeOutCubic(clamp01((t - 5.2) / 1.2));
    crownMat.emissiveIntensity = 1.1 * glow;
    crownLight.intensity = 150000 * glow;
  }

  return {scene, camera, renderAt};
}
