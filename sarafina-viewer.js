/* amiré Sarafina Shades 3D viewer (three.js r147). Model units are centimetres.
   The cartridge and distal temple come from the Fusion 360 exports; everything else is modelled to fit them. */
(function(){
"use strict";
// ---------- constants (model units: cm, matching the Fusion exports) ----------
const W = 6.95, YH = 0.6, ZH = -5.9;     // temple placement
const ADV_MAX = 0.7;                       // 7 mm of travel
const WHEEL_R = 0.2;                      // pinion radius -> rotation = travel / r
const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
// On the site only #stage exists; every other control lookup gets a harmless stand-in.
const DUMMY = new Proxy(function () {}, { get: (t, k) => (k === 'children' ? [] : k === Symbol.toPrimitive ? () => '' : DUMMY), set: () => true, apply: () => DUMMY });
const $ = s => document.querySelector(s) || DUMMY;

// ---------- renderer / scene ----------
if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.localClippingEnabled = true;
renderer.setClearColor(0x000000, 0);
stage.insertBefore(renderer.domElement, stage.firstChild);
renderer.domElement.setAttribute('tabindex', '0');

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(30, 1, 0.4, 200);
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 3; controls.maxDistance = 90;

scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7f86, 0.35));
const key = new THREE.DirectionalLight(0xffffff, 1.6);
key.position.set(-10, 22, 12); key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, near: 1, far: 70 });
key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
scene.add(key);
const rim = new THREE.DirectionalLight(0xffe6ef, 0.6); rim.position.set(14, 6, -18); scene.add(rim);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.ShadowMaterial({ opacity: 0.16 }));
ground.rotation.x = -Math.PI / 2; ground.position.y = -3.5; ground.receiveShadow = true; scene.add(ground);

// ---------- materials ----------
const planeP = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const planeD = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0);
const blackPlastic = (c = 0x1d1b20) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.48, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.45, side: THREE.DoubleSide });
const M = {
  frame: blackPlastic(), opp: blackPlastic(), prox: blackPlastic(), case: blackPlastic(), cover: blackPlastic(0x201e23),
  lens: new THREE.MeshPhysicalMaterial({ color: 0x3a2f38, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.8, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
  pad: new THREE.MeshPhysicalMaterial({ color: 0xe9e1e4, roughness: 0.3, transparent: true, opacity: 0.7 }),
  shell: new THREE.MeshPhysicalMaterial({ color: 0xf4eff1, roughness: 0.3, transparent: true, opacity: 0.45, depthWrite: false, side: THREE.DoubleSide }),
  product: new THREE.MeshPhysicalMaterial({ color: 0xb45a64, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
  piston: new THREE.MeshStandardMaterial({ color: 0xd8d2d5, roughness: 0.4 }),
  oring: new THREE.MeshStandardMaterial({ color: 0xd88aa2, roughness: 0.75 }),
  seal: new THREE.MeshStandardMaterial({ color: 0x8b76c9, roughness: 0.75 }),
  insul: new THREE.MeshStandardMaterial({ color: 0x9d8cf0, roughness: 0.95, transparent: true, opacity: 0.92 }),
  icover: new THREE.MeshStandardMaterial({ color: 0xd8579c, roughness: 0.5 }),
  rib: new THREE.MeshStandardMaterial({ color: 0xe5583c, roughness: 0.5 }),
  rod: new THREE.MeshStandardMaterial({ color: 0xb9bec7, metalness: 0.9, roughness: 0.28 }),
  head: new THREE.MeshStandardMaterial({ color: 0x35b4d4, metalness: 0.5, roughness: 0.35 }),
  wheel: new THREE.MeshStandardMaterial({ color: 0xd9dbe0, metalness: 0.7, roughness: 0.32 }),
  mark: new THREE.MeshStandardMaterial({ color: 0xb0245a, roughness: 0.4 }),
  window: new THREE.MeshStandardMaterial({ color: 0x0b0a0c, roughness: 0.9 }),
  hinge: new THREE.MeshStandardMaterial({ color: 0x4a4c52, metalness: 0.8, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xd8ad5e, metalness: 1, roughness: 0.22, side: THREE.DoubleSide }),
  crystal: new THREE.MeshPhysicalMaterial({ color: 0xf2f5ff, metalness: 1, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0, envMapIntensity: 2.2, flatShading: true, iridescence: 0.45, iridescenceIOR: 1.9, iridescenceThicknessRange: [250, 650] }),
};
M.collar = M.case.clone(); M.oppCollar = M.opp.clone();
[M.collar, M.oppCollar].forEach(m => { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -6; });
M.case.clippingPlanes = [planeD]; M.shell.clippingPlanes = [planeD]; M.prox.clippingPlanes = [planeP];
M.insul.clippingPlanes = [planeP]; M.seal.clippingPlanes = [planeP]; M.oring.clippingPlanes = [planeD];

// ---------- helpers ----------
function b64(s, T) { const bin = atob(s), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new T(u.buffer); }
function meshGeom(d) {
  const p = b64(d.p, Int16Array), n = b64(d.n, Int8Array), idx = b64(d.i, Uint16Array);
  const P = new Float32Array(p.length), N = new Float32Array(n.length);
  for (let i = 0; i < p.length; i++) P[i] = p[i] / 1000;
  for (let i = 0; i < n.length; i++) N[i] = n[i] / 127;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(N, 3));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  return g;
}
function rr(x0, x1, z0, z1, r, asPath) {
  const s = asPath ? new THREE.Path() : new THREE.Shape();
  r = Math.min(r, (x1 - x0) / 2 - 1e-4, (z1 - z0) / 2 - 1e-4);
  s.moveTo(x0 + r, z0); s.lineTo(x1 - r, z0); s.quadraticCurveTo(x1, z0, x1, z0 + r);
  s.lineTo(x1, z1 - r); s.quadraticCurveTo(x1, z1, x1 - r, z1); s.lineTo(x0 + r, z1);
  s.quadraticCurveTo(x0, z1, x0, z1 - r); s.lineTo(x0, z0 + r); s.quadraticCurveTo(x0, z0, x0 + r, z0);
  return s;
}
// shape drawn in (x, z) of temple space, extruded along temple y from y0 to y1
function extrudeY(shape, y0, y1) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: y1 - y0, bevelEnabled: false, curveSegments: 8 });
  g.rotateX(Math.PI / 2); g.translate(0, y1, 0); return g;
}
function mesh(geom, mat, parent, cast = true) {
  const m = new THREE.Mesh(geom, mat); m.castShadow = cast; m.receiveShadow = true; if (parent) parent.add(m); return m;
}
const smooth = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---------- root ----------
const root = new THREE.Group(); scene.add(root);

// ---------- shared lofting helpers ----------
const RC = 10; // points per rounded corner
function ringXZ(s) { // rounded-rect ring in temple (x,z) for section s
  const lim = Math.min((s.x1 - s.x0) / 2, (s.z1 - s.z0) / 2) - 1e-3, out = [];
  const rt = Math.min(s.rt != null ? s.rt : s.r, lim), rb = Math.min(s.rb != null ? s.rb : s.r, lim);
  const C = [[s.x1 - rt, s.z1 - rt, 0, rt], [s.x0 + rt, s.z1 - rt, Math.PI / 2, rt], [s.x0 + rb, s.z0 + rb, Math.PI, rb], [s.x1 - rb, s.z0 + rb, Math.PI * 1.5, rb]];
  C.forEach(([cx, cz, a0, r]) => { for (let j = 0; j < RC; j++) { const a = a0 + j / (RC - 1) * Math.PI / 2; out.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } });
  return out;
}
const RN = RC * 4;
// loft a list of sections along temple y; caps: 'start' | 'end' | both
function loft(secs, capStart, capEnd) {
  const pos = [], idx = [];
  secs.forEach(s => ringXZ(s).forEach(([x, z]) => pos.push(x, s.y, z)));
  for (let i = 0; i < secs.length - 1; i++) for (let j = 0; j < RN; j++) { const a = i * RN + j, b = i * RN + (j + 1) % RN, c = a + RN, d = b + RN; idx.push(a, b, c, b, d, c); }
  const cap = (i, flip) => { const base = pos.length / 3; let cx = 0, cy = 0, cz = 0; const pts = ringXZ(secs[i]);
    pts.forEach(([x, z]) => { pos.push(x, secs[i].y, z); cx += x; cz += z; }); pos.push(cx / RN, secs[i].y, cz / RN);
    for (let j = 0; j < RN; j++) flip ? idx.push(base + j, base + (j + 1) % RN, base + RN) : idx.push(base + (j + 1) % RN, base + j, base + RN); };
  if (capStart) cap(0, false); if (capEnd) cap(secs.length - 1, true);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function annulus(sOut, sIn, y) { // flat ring between two sections at one y
  const a = ringXZ(sOut), b = ringXZ(sIn), pos = [], idx = [];
  a.forEach(([x, z]) => pos.push(x, y, z)); b.forEach(([x, z]) => pos.push(x, y, z));
  for (let j = 0; j < RN; j++) { const k = (j + 1) % RN; idx.push(j, k, RN + j, k, RN + k, RN + j); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// One continuous outer form from the hinge to well past the joint: a wide jewelled blade at the
// hinge that eases down, through the parting line, into the exact profile of the distal piece.
const PROX_Y0 = -4.6, MOUTH = 0.6, COLLAR_END = 3.0, FACE_X = -0.773;
const DIST_SEC = y => ({ y, x0: -0.7, x1: 0, z0: 0.05 * Math.max(y, 0), z1: 1.45, rt: 0.1 + 0.028 * clamp(y, 0, 4), rb: 0.2 }); // measured from the Fusion export
function templeSec(y) {
  const g = 1 - smooth((y - MOUTH) / (COLLAR_END - MOUTH));             // wall allowance, fades out behind the joint
  const s = clamp((y - PROX_Y0) / (MOUTH - PROX_Y0), 0, 1), f = Math.pow(1 - s, 1.6); // blade flare, zero slope at the joint
  const d = DIST_SEC(y);
  return { y, x0: d.x0 - 0.07 * g, x1: d.x1 + 0.07 * g, z0: d.z0 - 0.11 * g - 1.0 * f, z1: d.z1 + 0.07 * g + 0.32 * f, rt: d.rt + 0.07 * g + 0.14 * f, rb: d.rb + 0.07 * g + 0.12 * f };
}
const proxSec = templeSec;
const MOUTH_SEC = templeSec(MOUTH);
const proxSecs = []; for (let i = 0; i <= 48; i++) proxSecs.push(templeSec(PROX_Y0 + (MOUTH - PROX_Y0) * i / 48));
const collarSecs = []; for (let i = 0; i <= 24; i++) collarSecs.push(templeSec(MOUTH + (COLLAR_END - MOUTH) * i / 24));
function addCollar(parent, mat) {
  mesh(loft(collarSecs, false, false), mat, parent, false);
  jointCaps.push(mesh(annulus(MOUTH_SEC, DIST_SEC(MOUTH), MOUTH), mat, parent, false));
}
// ---------- temple spine: one continuous sweep from the lens edge to the distal joint ----------
// T-space points (x = lateral, y = along the temple, + is toward the ear). The front grips the lens
// edge along the lens' own wrap tangent, rolls outward, then runs straight back to the joint.
// Built as a straight lead-in along the lens tangent, one constant-radius bend, then a straight run back,
// so the band wraps the lens corner in a single even curve.
const SPINE = (() => {
  const P = [], ds = 0.02, R = 1.05, lead = 0.0;
  let x = 0.15, y = -3.57, th = Math.atan2(0.522, -0.853);
  P.push([x, y]);
  for (let s = 0; s < lead; s += ds) { x += Math.cos(th) * ds; y += Math.sin(th) * ds; P.push([x, y]); }
  while (th > Math.PI / 2 + 1e-6) { th = Math.max(Math.PI / 2, th - ds / R); x += Math.cos(th) * ds; y += Math.sin(th) * ds; P.push([x, y]); }
  const err = -0.35 - x, nb = P.length; P.forEach((p, k) => { p[0] += err * smooth(k / (nb - 1)); });
  for (let yy = y + 0.1; yy < MOUTH; yy += 0.1) P.push([-0.35, yy]);
  P.push([-0.35, MOUTH]);
  return new THREE.CatmullRomCurve3(P.map(([a, b]) => new THREE.Vector3(a, b, 0)), false, 'catmullrom', 0.5);
})();
const SPINE_N = 160;
function spineSec(t) { // section in local (u across, v up) at arc fraction t in [0,1]
  const m = MOUTH_SEC, k3 = Math.pow(1 - t, 3), k2 = Math.pow(1 - t, 2);
  const w = 0.85 - 0.35 * k2;                      // thin flat band at the lens, full depth at the joint
  return { x0: -w / 2, x1: w / 2,
    z0: m.z0 + (-1.55 - m.z0) * Math.pow(1 - t, 2.2), // bottom edge: one long, gentle concave sweep up from the lens side
    z1: m.z1 + (1.67 - m.z1) * (1 - smooth(t)),       // top edge: level with the top of the rim, easing down to the joint
    rt: m.rt + (0.17 - m.rt) * k2, rb: m.rb + (0.2 - m.rb) * k2 };
}
// hinge parting plane: just behind the bend, where the spine already runs straight back
let HINGE_T = 0.3; for (let k = 0; k <= 600; k++) { if (SPINE.getPointAt(k / 600).y >= -2.5) { HINGE_T = k / 600; break; } }
function sweepTemple(t0, t1, capStart, capEnd) {
  const L = SPINE.getLength(), pos = [], idx = [], N = Math.max(10, Math.round(SPINE_N * (t1 - t0) * 1.4));
  for (let i = 0; i <= N; i++) {
    const t = t0 + (t1 - t0) * i / N, p = SPINE.getPointAt(t), tg = SPINE.getTangentAt(t), nx = tg.y, ny = -tg.x;
    ringXZ(spineSec(t)).forEach(([u, v]) => pos.push(p.x + nx * u, p.y + ny * u, v));
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < RN; j++) { const a = i * RN + j, b = i * RN + (j + 1) % RN, c = a + RN, d = b + RN; idx.push(a, b, c, b, d, c); }
  const cap = (i, flip) => { const base = pos.length / 3; let cx = 0, cy = 0, cz = 0;
    for (let j = 0; j < RN; j++) { const k = (i * RN + j) * 3; pos.push(pos[k], pos[k + 1], pos[k + 2]); cx += pos[k]; cy += pos[k + 1]; cz += pos[k + 2]; }
    pos.push(cx / RN, cy / RN, cz / RN);
    for (let j = 0; j < RN; j++) flip ? idx.push(base + j, base + (j + 1) % RN, base + RN) : idx.push(base + (j + 1) % RN, base + j, base + RN); };
  if (capStart === true) cap(0, false); if (capEnd === true) cap(N, true);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function sweepCap(t, flip) { // a single parting face at arc fraction t
  const p = SPINE.getPointAt(t), tg = SPINE.getTangentAt(t), nx = tg.y, ny = -tg.x, pos = [], idx = []; let cx = 0, cy = 0, cz = 0;
  const ring = ringXZ(spineSec(t)); ring.forEach(([u, v]) => { const X = p.x + nx * u, Y = p.y + ny * u; pos.push(X, Y, v); cx += X; cy += Y; cz += v; });
  pos.push(cx / RN, cy / RN, cz / RN);
  for (let j = 0; j < RN; j++) flip ? idx.push(j, (j + 1) % RN, RN) : idx.push((j + 1) % RN, j, RN);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
const foldCaps = [], jointCaps = [];
function hingeLocal() { // inner (head-side) edge of the parting plane, at mid height of the temple
  const p = SPINE.getPointAt(HINGE_T), tg = SPINE.getTangentAt(HINGE_T), sec = spineSec(HINGE_T);
  return new THREE.Vector3(p.x + tg.y * (sec.x1 - 0.03), p.y - tg.x * (sec.x1 - 0.03), (sec.z0 + sec.z1) / 2);
}

// ---------- 1.1 front: one-piece rectangular wrap shield lens (the lens is the whole front) ----------
const frame = new THREE.Group(); root.add(frame);
const LENS_T = 0.2;                                   // 2 mm polycarbonate
const lensZ = (x, y) => -0.045 * x * x - 0.012 * y * y; // cylindrical wrap + slight vertical base curve
const LENS_OUTLINE = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 1.98);
  s.bezierCurveTo(0.9, 2.0, 1.6, 2.27, 2.7, 2.3);
  s.bezierCurveTo(3.9, 2.34, 5.1, 2.34, 6.3, 2.28);
  s.quadraticCurveTo(6.9, 2.25, 6.92, 1.6);
  s.bezierCurveTo(6.94, 0.5, 6.86, -0.55, 6.58, -1.2);
  s.quadraticCurveTo(6.1, -2.26, 4.6, -2.33);
  s.bezierCurveTo(3.4, -2.42, 2.35, -2.36, 1.78, -2.02);
  s.bezierCurveTo(1.28, -1.72, 1.0, -0.66, 0, -0.62);
  s.bezierCurveTo(-1.0, -0.66, -1.28, -1.72, -1.78, -2.02);
  s.bezierCurveTo(-2.35, -2.36, -3.4, -2.42, -4.6, -2.33);
  s.quadraticCurveTo(-6.1, -2.26, -6.58, -1.2);
  s.bezierCurveTo(-6.86, -0.55, -6.94, 0.5, -6.92, 1.6);
  s.quadraticCurveTo(-6.9, 2.25, -6.3, 2.28);
  s.bezierCurveTo(-5.1, 2.34, -3.9, 2.34, -2.7, 2.3);
  s.bezierCurveTo(-1.6, 2.27, -0.9, 2.0, 0, 1.98);
  let pts = s.getSpacedPoints(720); pts.pop();
  if (THREE.ShapeUtils.isClockWise(pts)) pts.reverse();
  return pts;
})();
{
  const out = LENS_OUTLINE, n = out.length;
  // faces: dense grid on the analytic wrap surface, trimmed to the outline by an alpha mask
  const LX = 7.1, LY = 2.6, cvs = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const am = cvs(4096, 1500), ax = am.getContext('2d'); ax.fillStyle = '#000'; ax.fillRect(0, 0, 4096, 1500); ax.fillStyle = '#fff';
  ax.beginPath(); out.forEach((p, k) => { const X = (p.x + LX) / (2 * LX) * 4096, Y = (LY - p.y) / (2 * LY) * 1500; k ? ax.lineTo(X, Y) : ax.moveTo(X, Y); }); ax.closePath(); ax.fill();
  const alphaTex = new THREE.CanvasTexture(am); alphaTex.anisotropy = 8;
  const cv = cvs(16, 512), cx = cv.getContext('2d');
  const gr = cx.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, 'rgba(62,44,50,0.82)'); gr.addColorStop(0.35, 'rgba(88,60,68,0.7)'); gr.addColorStop(0.65, 'rgba(118,88,96,0.5)'); gr.addColorStop(0.88, 'rgba(140,114,120,0.3)'); gr.addColorStop(1, 'rgba(150,128,134,0.2)');
  cx.fillStyle = gr; cx.fillRect(0, 0, 16, 512);
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  M.lens.map = tex; M.lens.alphaMap = alphaTex; M.lens.alphaTest = 0.02; M.lens.color.setHex(0xffffff); M.lens.opacity = 1; M.lens.roughness = 0.05; M.lens.metalness = 0.2; M.lens.clearcoat = 0.7; M.lens.clearcoatRoughness = 0.04; M.lens.envMapIntensity = 0.55; M.lens.needsUpdate = true;
  M.lensEdge = M.lens.clone(); M.lensEdge.alphaMap = null; M.lensEdge.alphaTest = 0;
  const face = (dz, flip) => {
    const g = new THREE.PlaneGeometry(2 * LX, 2 * LY, 220, 80), p = g.attributes.position, nr = g.attributes.normal;
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), nx = 0.09 * x, ny = 0.024 * y, l = Math.hypot(nx, ny, 1), sg = flip ? -1 : 1;
      p.setZ(k, lensZ(x, y) + dz); nr.setXYZ(k, sg * nx / l, sg * ny / l, sg / l); }
    if (flip) { const ix = g.index.array; for (let k = 0; k < ix.length; k += 3) { const t = ix[k + 1]; ix[k + 1] = ix[k + 2]; ix[k + 2] = t; } }
    return g;
  };
  var lensParts = [];
  const lf = mesh(face(0, false), M.lens, frame, false); lf.renderOrder = 3; lensParts.push(lf);
  const lb = mesh(face(-LENS_T, true), M.lens, frame, false); lb.renderOrder = 2; lensParts.push(lb);
  // polished edge band
  const pos = [], uv = [], ix = [];
  out.forEach(p => { const z = lensZ(p.x, p.y); pos.push(p.x, p.y, z, p.x, p.y, z - LENS_T); uv.push((p.x + 7) / 14, (p.y + 2.5) / 5, (p.x + 7) / 14, (p.y + 2.5) / 5); });
  for (let i = 0; i < n; i++) { const a = 2 * i, b = 2 * ((i + 1) % n); ix.push(a, a + 1, b, b, a + 1, b + 1); }
  const eg = new THREE.BufferGeometry(); eg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); eg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); eg.setIndex(ix); eg.computeVertexNormals();
  { const le = mesh(eg, M.lensEdge, frame, false); le.renderOrder = 2; lensParts.push(le); }
  { // rim: wraps the lens edge in a groove; slightly heavier along the brow
    const rp = [], ri = [];
    for (let i = 0; i < n; i++) {
      const p = out[i], q = out[(i + 1) % n], o = out[(i - 1 + n) % n];
      let tx = q.x - o.x, ty = q.y - o.y; const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl;
      const nx0 = 0.09 * p.x, ny0 = 0.024 * p.y, nl = Math.hypot(nx0, ny0, 1), N = new THREE.Vector3(nx0 / nl, ny0 / nl, 1 / nl);
      const Tg = new THREE.Vector3(tx, ty, -0.09 * p.x * tx - 0.024 * p.y * ty).normalize(), B = new THREE.Vector3().crossVectors(Tg, N).normalize();
      const w = smooth((p.y - 1.0) / 1.0) * (1 - smooth((Math.abs(p.x) - 5.6) / 1.0));
      const sec = { x0: -0.09, x1: 0.13 + 0.17 * w, z0: -0.31, z1: 0.08 + 0.06 * w, rt: 0.08 + 0.04 * w, rb: 0.06 };
      const z = lensZ(p.x, p.y);
      ringXZ(sec).forEach(([a, dd]) => rp.push(p.x + B.x * a + N.x * dd, p.y + B.y * a + N.y * dd, z + B.z * a + N.z * dd));
    }
    for (let i = 0; i < n; i++) for (let j = 0; j < RN; j++) { const a = i * RN + j, b = i * RN + (j + 1) % RN, c = ((i + 1) % n) * RN + j, dd = ((i + 1) % n) * RN + (j + 1) % RN; ri.push(a, b, c, b, dd, c); }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex(ri); rg.computeVertexNormals();
    mesh(rg, M.frame, frame);
  }
  // clear nose pads on short posts bonded to the back of the lens
  [-1, 1].forEach(o => {
    const bx = o * 0.98, by = -0.95, bz = lensZ(bx, by) - LENS_T;
    const post = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.42, 12), M.pad, frame, false); lensParts.push(post);
    post.position.set(bx * 0.96, by - 0.05, bz - 0.2); post.rotation.x = Math.PI / 2; post.rotation.z = o * 0.25;
    const pad = mesh(new THREE.SphereGeometry(0.34, 28, 18), M.pad, frame, false); lensParts.push(pad);
    pad.scale.set(0.32, 1, 0.62); pad.position.set(o * 0.8, -1.1, bz - 0.42); pad.rotation.z = o * 0.42; pad.rotation.y = -o * 0.35;
  });
}

// ---------- 1.8 proximal temple + 2.3 / 2.4 / 2.5 ----------
const TE = new THREE.Group(); TE.rotation.x = -Math.PI / 2; TE.position.set(-W, YH, ZH); frame.add(TE);
mesh(sweepTemple(0, HINGE_T, true, false), M.frame, TE); foldCaps.push(mesh(sweepCap(HINGE_T, true), M.frame, TE, false));
const barrel = () => { const g = new THREE.CylinderGeometry(0.075, 0.075, 1.0, 24); g.rotateX(Math.PI / 2); return g; };
mesh(barrel(), M.hinge, TE, false).position.copy(hingeLocal());
TE.updateMatrixWorld(true);
const HL = TE.localToWorld(hingeLocal());
const PL = new THREE.Group(); PL.position.copy(HL); root.add(PL);
const T = new THREE.Group(); T.rotation.x = -Math.PI / 2; T.position.set(-W - HL.x, YH - HL.y, ZH - HL.z); PL.add(T);
const SOCKET_SEC = { x0: -0.72, x1: 0.02, z0: -0.02, z1: 1.47, r: 0.16 }; // follows the distal piece's rounded corners
{
  var proxTube = mesh(sweepTemple(HINGE_T, 1, false, false), M.prox, T); foldCaps.push(mesh(sweepCap(HINGE_T, false), M.prox, T, false));
  var proxBlock = mesh(annulus(MOUTH_SEC, SOCKET_SEC, MOUTH), M.prox, T); jointCaps.push(proxBlock);
  var proxSock = mesh(loft([Object.assign({ y: -0.6 }, SOCKET_SEC), Object.assign({ y: MOUTH }, SOCKET_SEC)], false, false), M.prox, T);
  const ins = rr(-0.72, 0.02, -0.02, 1.47, 0.16); ins.holes.push(rr(-0.62, -0.08, 0.43, 1.37, 0.06, true));
  var insul = mesh(extrudeY(ins, -0.55, 0), M.insul, T);
  var icover = mesh(extrudeY(rr(-0.72, 0.02, -0.02, 1.47, 0.16), -0.6, -0.55), M.icover, T);
  const sr = rr(-0.72, 0.02, -0.02, 1.47, 0.16); sr.holes.push(rr(-0.705, 0.005, -0.005, 1.455, 0.15, true));
  var seal = mesh(extrudeY(sr, 0.32, 0.42), M.seal, T);
}

// ---------- 1.9 distal temple (user's Cartridge_Case) ----------
const D = new THREE.Group(); T.add(D);
// The collar fairing covers the outer skin of the distal piece between the joint and COLLAR_END;
// drop those hidden outer faces so the two surfaces never fight. Cavity walls and the spigot stay.
function trimUnderCollar(g) {
  const p = g.attributes.position, ix = g.index.array, keep = [];
  for (let t = 0; t < ix.length; t += 3) {
    let cx = 0, cy = 0, cz = 0; for (let k = 0; k < 3; k++) { cx += p.getX(ix[t + k]); cy += p.getY(ix[t + k]); cz += p.getZ(ix[t + k]); }
    cx /= 3; cy /= 3; cz /= 3;
    const outer = Math.abs(cx + 0.35) > 0.3 || cz > 1.4 || cz < 0.4 + 0.05 * cy - 0.05;
    if (!(outer && cy > MOUTH + 0.03 && cy < COLLAR_END - 0.03)) keep.push(ix[t], ix[t + 1], ix[t + 2]);
  }
  g.setIndex(keep); return g;
}
const caseMesh = mesh(meshGeom(MESH.case), M.case, D); // outer skin under the collar was cut away exactly in preprocessing
addCollar(D, M.collar);
const orS = rr(-0.735, 0.035, -0.012, 1.478, 0.19); orS.holes.push(rr(-0.7, 0, 0.015, 1.45, 0.17, true));
const oring = mesh(extrudeY(orS, 0.22, 0.30), M.oring, D);
// 1.11 friction-fit ribs
const ribs = new THREE.Group(); D.add(ribs);
[5.7, 5.85, 6.0].forEach(y => [1.35, 0.45].forEach(z => {
  const g = new THREE.CylinderGeometry(0.026, 0.026, 0.5, 10); g.rotateZ(Math.PI / 2);
  const m = mesh(g, M.rib, ribs); m.position.set(-0.35, y, z);
}));

// ---------- 1.4 cartridge (user's cartridge) + 1.10 product ----------
const CG = new THREE.Group(); D.add(CG);
function placeCart(m) { m.rotation.x = Math.PI / 2; m.position.set(-1.14, 6.95, 0.45); }
const shell = mesh(meshGeom(MESH.cart), M.shell, CG, false); placeCart(shell); shell.renderOrder = 2;
const colGeom = new THREE.BoxGeometry(0.42, 1, 0.8); colGeom.translate(0, 0.5, 0);
const column = mesh(colGeom, M.product, CG); column.position.set(-0.35, 0.1, 0.9);
const piston = mesh(new THREE.BoxGeometry(0.44, 0.05, 0.82), M.piston, CG);
const stemGeom = new THREE.BoxGeometry(0.2, 1, 0.6); stemGeom.translate(0, -0.5, 0);
const stem = mesh(stemGeom, M.product, CG); stem.position.set(-0.35, 0.076, 0.9);
const TG = new THREE.Group(); CG.add(TG);
const tip = mesh(meshGeom(MESH.tip), M.product, TG); placeCart(tip);
// ----- cartridge variants: lipstick (your tip), twist-up lip liner, lip gloss with chrome applicator -----
M.chrome = new THREE.MeshStandardMaterial({ color: 0xe9ebef, metalness: 1, roughness: 0.12, side: THREE.DoubleSide });
M.liner = new THREE.MeshStandardMaterial({ color: 0xe8e3e6, roughness: 0.45 });
M.glossBead = new THREE.MeshPhysicalMaterial({ color: 0xb45a64, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.85 });
const tipLiner = new THREE.Group(); TG.add(tipLiner);
{ // tapered pencil sleeve, then a fine lead with a sharpened point
  const sl = new THREE.CylinderGeometry(0.2, 0.085, 0.3, 40); const s1 = mesh(sl, M.liner, tipLiner); s1.position.set(-0.35, -0.075, 0.9);
  const ld = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.14, 24), M.product, tipLiner); ld.position.set(-0.35, -0.29, 0.9);
  const pt = mesh(new THREE.CylinderGeometry(0.055, 0.006, 0.13, 24), M.product, tipLiner); pt.position.set(-0.35, -0.425, 0.9);
}
const stemLiner = mesh((() => { const g = new THREE.CylinderGeometry(0.2, 0.2, 1, 40); g.translate(0, -0.5, 0); return g; })(), M.liner, CG); stemLiner.position.set(-0.35, 0.076, 0.9);
const tipGloss = new THREE.Group(); CG.add(tipGloss);
const glossBead = (() => { // chrome angled applicator with a dispensing hole, on a frosted collar
  const ax = -0.35, az = 0.9, y0 = 0.075, N = 48, S = 16, r0 = 0.215, r1 = 0.16, L0 = 0.52, k = 0.16, pos = [], idx = [];
  const len = th => L0 + k * Math.sin(th);                // slanted cut: longer on the underside
  for (let i = 0; i <= S; i++) for (let j = 0; j < N; j++) { const th = j / N * Math.PI * 2, sN = i / S, r = r0 + (r1 - r0) * Math.pow(sN, 0.8);
    pos.push(ax + Math.cos(th) * r, y0 - 0.06 - sN * len(th), az + Math.sin(th) * r * 1.0); }
  for (let i = 0; i < S; i++) for (let j = 0; j < N; j++) { const a = i * N + j, b = i * N + (j + 1) % N; idx.push(a, a + N, b, b, a + N, b + N); }
  const cBase = pos.length / 3; let cy = 0; for (let j = 0; j < N; j++) { const th = j / N * Math.PI * 2; pos.push(ax + Math.cos(th) * r1, y0 - 0.06 - len(th), az + Math.sin(th) * r1); cy += y0 - 0.06 - len(th); }
  pos.push(ax, cy / N, az); for (let j = 0; j < N; j++) idx.push(cBase + j, cBase + (j + 1) % N, cBase + N);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  mesh(g, M.chrome, tipGloss);
  const col = mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.07, 48), M.shell, tipGloss, false); col.position.set(ax, y0 - 0.03, az);
  // the hole sits on the slanted face, a little toward its upper edge
  const fy = y0 - 0.06 - L0, nrm = new THREE.Vector3(0, -1, -k / r1).normalize();
  const hole = mesh(new THREE.CircleGeometry(0.045, 24), M.window, tipGloss, false);
  hole.position.set(ax, fy + nrm.y * 0.004 + 0.035 * (k / r1) * 0.5, az + 0.035); hole.lookAt(hole.position.clone().add(nrm));
  const bead = mesh(new THREE.SphereGeometry(0.06, 24, 16), M.glossBead, tipGloss, false); bead.position.copy(hole.position).addScaledVector(nrm, 0.01);
  bead.userData.n = nrm.clone(); bead.userData.p0 = bead.position.clone();
  return bead;
})();
const CART_TYPES = [
  { id: 'lipstick', name: 'Lipstick', note: 'Bullet twists up out of the cartridge.' },
  { id: 'liner', name: 'Lip liner', note: 'Fine pencil lead twists up for precise lines.' },
  { id: 'gloss', name: 'Lip gloss', note: 'The thumbwheel pushes gloss out through the chrome applicator.' },
];
let cartType = 'lipstick';
function setCartType(t) {
  cartType = t; tip.visible = t === 'lipstick'; tipLiner.visible = t === 'liner'; tipGloss.visible = t === 'gloss';
  document.querySelectorAll('[data-ctype]').forEach(b => b.setAttribute('aria-pressed', b.dataset.ctype === t));
  const n = CART_TYPES.find(c => c.id === t); const h = document.getElementById('ctypeNote'); if (h) h.textContent = n.note;
}

// ---------- 1.6 pushing mechanism, 1.7 end-pusher, 2.2 thumbwheel, 2.1 cover ----------
const MG = new THREE.Group(); D.add(MG);
const RG = new THREE.Group(); MG.add(RG);
{
  const rod = mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.4, 18), M.rod, RG); rod.position.set(-0.475, 7.3, 0.9);
  for (let y = 6.7; y < 7.97; y += 0.055) { const t = mesh(new THREE.BoxGeometry(0.03, 0.022, 0.1), M.rod, RG, false); t.position.set(-0.427, y, 0.9); }
}
const headG = new THREE.Group(); RG.add(headG);
mesh(new THREE.BoxGeometry(0.34, 0.04, 0.07), M.head, headG); mesh(new THREE.BoxGeometry(0.07, 0.04, 0.34), M.head, headG);
mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 16), M.head, headG).position.y = 0.04;
headG.position.set(-0.35, 6.555, 0.9);
const WG = new THREE.Group(); WG.position.set(-0.225, 7.15, 0.9); MG.add(WG);
{
  const hub = new THREE.CylinderGeometry(0.17, 0.17, 0.12, 36); hub.rotateX(Math.PI / 2); mesh(hub, M.wheel, WG);
  for (let i = 0; i < 30; i++) {
    const a = i / 30 * Math.PI * 2, t = mesh(new THREE.BoxGeometry(0.045, 0.028, 0.12), M.wheel, WG, false);
    t.position.set(Math.cos(a) * 0.185, Math.sin(a) * 0.185, 0); t.rotation.z = a;
  }
  const mk = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), M.mark, WG, false); mk.rotation.x = Math.PI / 2; mk.position.set(0.1, 0, 0.065);
}
const win = mesh(new THREE.BoxGeometry(0.006, 0.58, 0.46), M.window, D, false); win.position.set(0.003, 7.15, 0.9);
const CV = new THREE.Group(); D.add(CV);
{
  const s = rr(6.8, 7.5, 0.62, 1.2, 0.2);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.01, bevelSegments: 3 });
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1)); g.translate(0.006, 0, 0);
  mesh(g, M.cover, CV);
  for (let i = 0; i < 3; i++) { const r = mesh(new THREE.BoxGeometry(0.004, 0.012, 0.22), M.cover, CV, false); r.position.set(0.0215, 7.36 + i * 0.035, 0.91); } // faint thumb grip
}

// ---------- 1.2 complete opposite temple (same outer form as the operative side, mirrored) ----------
const OTE = new THREE.Group(); OTE.rotation.x = -Math.PI / 2; OTE.position.set(W, YH, ZH); OTE.scale.x = -1; frame.add(OTE);
mesh(sweepTemple(0, HINGE_T, true, false), M.frame, OTE); foldCaps.push(mesh(sweepCap(HINGE_T, true), M.frame, OTE, false));
mesh(barrel(), M.hinge, OTE, false).position.copy(hingeLocal());
OTE.updateMatrixWorld(true);
const HR = OTE.localToWorld(hingeLocal());
const PR = new THREE.Group(); PR.position.copy(HR); root.add(PR);
const OT = new THREE.Group(); OT.rotation.x = -Math.PI / 2; OT.position.set(W - HR.x, YH - HR.y, ZH - HR.z); OT.scale.x = -1; PR.add(OT);
const OT_X0 = OT.position.x;
mesh(sweepTemple(HINGE_T, 1, false, true), M.opp, OT); foldCaps.push(mesh(sweepCap(HINGE_T, false), M.opp, OT, false));
addCollar(OT, M.oppCollar);
mesh(caseMesh.geometry, M.opp, OT);

// ---------- parts registry (patent text) ----------
const PARTS = [
  { id: '1.1', name: 'Front Frame', mats: [M.lens, M.pad], obj: frame, at: [-3.4, 2.42, -0.45], off: [-30, -50], d: 'The primary structural body of the eyewear: a wrap shield lens that fills the whole front, held in a slim rim with the same finish as the temples. Each end piece carries a hinge so the temples fold. It holds the lens, rests on the face, and anchors both temple assemblies.' },
  { id: '1.2', name: 'Complete Unaltered Opposite Temple', mats: [M.opp], obj: OT, at: [-0.35, 5.5, 1.45], off: [36, -42], d: 'The standard, non-operative arm on the other side of the frame. It gives structural balance and normal wearability.' },
  { id: '1.8', name: 'Proximal Temple Piece', mats: [M.prox], obj: T, at: [-0.35, -2.0, 1.5], off: [-26, -52], d: 'Stays permanently attached to the front frame. It is swept as one surface from the lens edge back to the joint, narrowing to the exact profile of the distal piece. Its hollow cavity is the docking station and protective cap for the lip product while the glasses are worn.' },
  { id: '1.9', name: 'Distal Temple Piece', mats: [M.case, M.collar], obj: D, at: [-0.35, 3.6, 1.45], off: [10, -58], d: 'The detachable rear of the temple. It holds the cartridge and the advancement mechanism, and works on its own as a hand-held applicator once removed.' },
  { id: '1.3', name: 'Protective O-Ring', mats: [M.oring], obj: oring, at: [-0.35, 0.26, 1.485], off: [-40, -44], d: 'Compressible gasket on the mating end of the distal piece. It seals against the inside of the proximal cavity to keep out moisture, lint and debris.' },
  { id: '2.5', name: 'Sealing Ring', mats: [M.seal], obj: seal, at: [-0.35, 0.37, 1.47], off: [-58, 34], internal: true, d: 'Stationary gasket inside the opening of the proximal piece. It compresses against the O-ring (1.3) to form a redundant, hermetic seal when docked.' },
  { id: '2.4', name: 'Thermal Insulation', mats: [M.insul], obj: insul, at: [-0.35, -0.28, 1.4], off: [-80, -20], internal: true, d: 'Insulating lining (for example an aerogel layer or double-walled polymer) in the proximal cavity. It limits heat from the head or sun so the product does not melt.' },
  { id: '2.3', name: 'Internal Cover', mats: [M.icover], obj: icover, at: [-0.35, -0.58, 0.6], off: [-78, 34], internal: true, d: 'The closed end of the proximal cavity. It acts as the end-stop and stationary cap over the exposed cosmetic tip when the distal piece is docked.' },
  { id: '1.4', name: 'Replaceable Cartridge', mats: [M.shell], obj: CG, at: [-0.35, 3.2, 0.45], off: [-6, 56], internal: true, d: 'A swappable container for the cosmetic. It slides into the distal cavity so the wearer can change product type or shade.' },
  { id: '1.10', name: 'Lip Product (Changeable)', mats: [M.product], obj: TG, at: [-0.35, -0.3, 1.2], off: [-56, -36], d: 'The cosmetic itself: lipstick, balm, gloss, liner, tint or stain. It extends and retracts from the cartridge.' },
  { id: '1.11', name: 'Friction-Fit Rib', mats: [M.rib], obj: ribs, at: [-0.35, 5.85, 0.45], off: [26, 56], internal: true, d: 'Ridges molded inside the distal housing. They grip the cartridge so it cannot fall out when the glasses point down, but still let you pull it out on purpose.' },
  { id: '1.6', name: 'Built-in Pushing Mechanism', mats: [M.rod], obj: RG, at: [-0.46, 7.75, 0.9], off: [52, 46], internal: true, d: 'The drive inside the distal piece. Here it is a toothed push-rod driven by the thumbwheel pinion, turning rotation into precise linear travel.' },
  { id: '1.7', name: 'Cartridge End-Pusher', mats: [M.head], obj: headG, at: [0, 0, 0], off: [16, 70], internal: true, d: 'A universal interface on the front of the push-rod. It docks with the follower at the back of any cartridge to push the product out or pull it back.' },
  { id: '2.2', name: 'Thumbwheel', mats: [M.wheel], obj: WG, at: [0.2, 0, 0], off: [62, 34], d: 'User-turned dial linked to the pushing mechanism. One full turn moves the product about 12.6 mm (pinion radius 2 mm).' },
  { id: '2.1', name: 'Thumbwheel Cover', mats: [M.cover], obj: CV, at: [0.02, 7.15, 1.2], off: [44, -60], d: 'Flush shield on the inward-facing side of the distal piece. It hides the thumbwheel to keep the outside of the glasses clean-looking.' },
];
const partById = {}; PARTS.forEach(p => partById[p.id] = p);
// raycast map: mesh -> part id
const pickables = [];
PARTS.slice().reverse().forEach(p => p.obj.traverse(o => { if (o.isMesh && !o.userData.part) { o.userData.part = p.id; pickables.push(o); } }));
// meshes under T that belong to the proximal piece (registered via T traverse above would claim all) – fix ownership:
[proxTube, proxBlock, proxSock].forEach(m => m.userData.part = '1.8');
[insul].forEach(m => m.userData.part = '2.4'); icover.userData.part = '2.3'; seal.userData.part = '2.5';
caseMesh.userData.part = '1.9'; win.userData.part = '2.1'; oring.userData.part = '1.3';
shell.userData.part = '1.4'; column.userData.part = '1.10'; stem.userData.part = '1.10'; piston.userData.part = '1.4';

function rand(seed) { let v = seed; return () => (v = (v * 16807) % 2147483647) / 2147483647; }
// ---------- temple design: gem wing, script initial, dotted trail and a star gem ----------
// Laid out on the outer face of each temple in temple space (y along the temple, z up).
const designGroups = [];
{
  const L = SPINE.getLength();
  const faceT = y => { const t = clamp(1 - (MOUTH - y) / L, 0, 1), s = spineSec(t); return { x: -0.35 + s.x0, z0: s.z0, z1: s.z1 }; };
  const faceD = y => { const s = y < COLLAR_END ? templeSec(y) : DIST_SEC(y); return { x: s.x0, z0: s.z0, z1: s.z1 }; };
  const inPoly = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const gemGeo = new THREE.LatheGeometry([[0.001, -0.2], [0.86, -0.2], [1.0, -0.02], [0.92, 0.16], [0.72, 0.32], [0.46, 0.44], [0.001, 0.44]].map(([r, h]) => new THREE.Vector2(r, h)), 10);
  gemGeo.rotateZ(Math.PI / 2);
  const cupGeo = new THREE.TorusGeometry(1.08, 0.17, 8, 40); cupGeo.rotateX(Math.PI / 2); cupGeo.rotateZ(Math.PI / 2);
  if (!M.setting) M.setting = new THREE.MeshStandardMaterial({ color: 0xb9bcc4, metalness: 1, roughness: 0.3 });
  const starShape = (() => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.068 : 0.17; const p = [Math.cos(a) * r, Math.sin(a) * r]; i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]); } s.closePath(); return s; })();
  const starGem = (R0, R1, h) => { // faceted star: a raised centre with a facet to every point and notch
    const pos = [], P = []; for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R1 : R0; P.push([Math.cos(a) * r, Math.sin(a) * r]); }
    for (let i = 0; i < 10; i++) { const a = P[i], b = P[(i + 1) % 10]; pos.push(0, 0, h, a[0], a[1], 0, b[0], b[1], 0, 0, 0, -0.02, b[0], b[1], 0, a[0], a[1], 0); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); return g; };

  function build(parentT, parentD, mirrorGlyph) {
    const gT = new THREE.Group(), gD = new THREE.Group(); parentT.add(gT); parentD.add(gD); designGroups.push(gT, gD);
    const lists = { T: [], D: [] };
    const gem = (side, y, z, sz) => { const f = (side === 'T' ? faceT : faceD)(y); lists[side].push([f.x - sz * 0.1, y, z, sz]); };

    // 1) wing: two swept flicks of pavé gems rising from the lower front of the temple
    const Y0 = -2.3, Y1 = -0.5;
    const UV = [[0, 0.06], [0.3, 0.02], [0.62, 0.03], [0.86, 0.12], [0.97, 0.36], [1.0, 0.8], [0.9, 0.6], [0.8, 0.5], [0.84, 0.98], [0.7, 0.72], [0.52, 0.45], [0.32, 0.24], [0.12, 0.1]];
    const wing = new THREE.CatmullRomCurve3(UV.map(([u, v]) => { const y = Y0 + (Y1 - Y0) * u, f = faceT(y); return new THREE.Vector3(y, f.z0 + 0.1 + v * (f.z1 - f.z0 - 0.22), 0); }), true, 'centripetal')
      .getSpacedPoints(160).map(p => [p.x, p.y]);
    const sp = 0.112;
    for (let r = 0, z = -1.0; z < 1.7; z += sp * 0.866, r++) for (let y = Y0 + (r % 2) * sp / 2; y < Y1 + 0.1; y += sp) if (inPoly(wing, y, z)) gem('T', y, z, 0.046);

    // 2) script initial, drawn in fine gems, whose tail becomes the shooting-star trail
    const gc = 1.3, flipY = y => mirrorGlyph ? 2 * gc - y : y;
    const glyph = new THREE.CatmullRomCurve3([[1.02, 0.42], [1.18, 0.78], [1.36, 1.16], [1.4, 1.34], [1.3, 1.36], [1.22, 1.16], [1.2, 0.8], [1.2, 0.46], [1.26, 0.32], [1.4, 0.36], [1.5, 0.5]]
      .map(([y, z]) => new THREE.Vector3(flipY(y), z, 0)), false, 'centripetal');
    const along = (curve, step, sz) => { const n = Math.max(2, Math.round(curve.getLength() / step)); curve.getSpacedPoints(n).forEach(p => gem('D', p.x, p.y, sz)); };
    along(glyph, 0.078, 0.032);
    const STAR = [4.45, 0.82];
    along(new THREE.CatmullRomCurve3([[flipY(1.5), 0.5], [2.4, 0.6], [3.4, 0.72], [STAR[0] - 0.36, STAR[1] - 0.03]].map(([y, z]) => new THREE.Vector3(y, z, 0))), 0.085, 0.03);
    [[3.0, 0.62], [2.8, 0.84], [3.15, 0.95]].forEach(([y, z]) => along(new THREE.LineCurve3(new THREE.Vector3(y, z, 0), new THREE.Vector3(STAR[0] - 0.38, STAR[1] + (z - STAR[1]) * 0.3, 0)), 0.085, 0.024));

    // 3) the star itself: one faceted star-cut gem
    const sg = starGem(0.31, 0.13, 0.11);
    const fx = faceD(STAR[0]).x;
    sg.applyMatrix4(new THREE.Matrix4().set(0, 0, -1, fx + 0.005, 1, 0, 0, STAR[0], 0, 1, 0, STAR[1], 0, 0, 0, 1));
    if (!M.starGem) { M.starGem = M.crystal.clone(); M.starGem.side = THREE.DoubleSide; }
    const star = mesh(sg, M.starGem, gD, false); star.userData.part = '1.9';

    const R = rand(mirrorGlyph ? 7 : 3), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    [['T', gT], ['D', gD]].forEach(([k, g]) => {
      const L2 = lists[k]; if (!L2.length) return;
      const im = new THREE.InstancedMesh(gemGeo, M.crystal, L2.length);
      const cup = new THREE.InstancedMesh(cupGeo, M.setting, L2.length);
      L2.forEach(([x, y, z, sz], i) => { e.set(R() * 6, 0, 0); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(sz, sz, sz)); im.setMatrixAt(i, m4); cup.setMatrixAt(i, m4); });
      g.add(im); g.add(cup);
    });
  }
  build(T, D, true);
  // opposite temple: a companion distal-shaped group so the design sits on the same faces
  const OD = new THREE.Group(); OT.add(OD);
  build(OT, OD, false);
}
function setDesign(on) { designGroups.forEach(g => g.visible = on); }

// hidden internals must not cast shadows through the shell they sit in
{ const shellMats = new Set([M.prox, M.case, M.collar, M.cover, M.opp, M.oppCollar, M.frame]);
  [T, OT].forEach(g => g.traverse(o => { if (o.isMesh && !shellMats.has(o.material)) o.castShadow = false; })); }

// ---------- state + animation ----------
const AXL = new THREE.Vector3(0, 1, 0.06).normalize(), AXR = new THREE.Vector3(0, 1, -0.06).normalize();
const S = { detach: 1, adv: 0.35, cover: 1, cart: 0, explode: 0, fold: 0 };
const G = Object.assign({}, S);
let waits = [];
let busy = false;
function to(k, v) { G[k] = v; return new Promise(res => waits.push({ k, v, res })); }
function stepState(dt) {
  const rate = reduceMotion ? 40 : 7;
  for (const k in S) {
    const d = G[k] - S[k];
    if (Math.abs(d) < 0.0015) S[k] = G[k];
    else S[k] += d * Math.min(1, dt * rate) + Math.sign(d) * Math.min(Math.abs(d), dt * 0.08);
  }
  waits = waits.filter(w => { if (Math.abs(S[w.k] - w.v) < 0.003) { S[w.k] = w.v; w.res(); return false; } return true; });
}
function applyState() {
  const t = S.detach, p1 = smooth(t / 0.45), p2 = smooth((t - 0.45) / 0.55), e = S.explode, a = S.adv, u = S.cart;
  D.position.set(-2.9 * p2, 1.7 * p1 + 0.5 * p2 + 2.0 * e, -0.25 * p2);
  TG.position.y = (cartType === 'gloss' ? 0 : -a) - 1.4 * e;
  stem.scale.y = Math.max(a, 0.001); stem.visible = cartType === 'lipstick' && a > 0.002;
  stemLiner.scale.y = Math.max(a, 0.001); stemLiner.visible = cartType === 'liner' && a > 0.002;
  { const k = cartType === 'gloss' ? smooth(a / ADV_MAX) : 0; glossBead.visible = k > 0.02; glossBead.scale.setScalar(0.4 + 1.1 * k);
    glossBead.position.copy(glossBead.userData.p0).addScaledVector(glossBead.userData.n, 0.03 * k); tipGloss.position.y = -1.4 * e; }
  column.scale.y = Math.max(0.01, 6.475 - a - 0.1);
  piston.position.set(-0.35, 6.5 - a, 0.9);
  RG.position.y = -a;
  WG.rotation.z = a / WHEEL_R;
  CV.position.set(2.6 * e, 0.9 * S.cover, 0);
  CG.position.set(0, -7.6 * smooth(u), 2.4 * e + 0.25 * Math.sin(Math.PI * u));
  oring.position.y = -1.2 * e;
  ribs.position.z = -1.5 * e;
  MG.position.z = -2.3 * e;
  WG.position.x = -0.225 + 1.6 * e;
  win.visible = e < 0.02 && S.cover > 0.04;
  foldCaps.forEach(m => m.visible = S.fold > 0.002 || e > 0.002);
  jointCaps.forEach(m => m.visible = S.detach > 0.002 || e > 0.002 || viewMode !== 'solid');
  { const open = S.detach > 0.002 || e > 0.002 || viewMode !== 'solid'; [insul, seal, icover, proxSock, oring].forEach(m => m.visible = open); }
  seal.position.y = 1.3 * e; insul.position.z = 2.5 * e; icover.position.z = 4.0 * e;
  frame.position.z = 2.6 * e; OT.position.x = OT_X0 - 2.2 * e;
  const fk = smooth(S.fold);
  PL.quaternion.setFromAxisAngle(AXL, -1.53 * fk); PR.quaternion.setFromAxisAngle(AXR, 1.36 * fk);
}

// ---------- shades ----------
const SHADES = [
  { name: 'Rosewood', type: 'Lip balm', c: 0xb45a64 },
  { name: 'Cherry', type: 'Lip stain', c: 0xa3122a },
  { name: 'Mulberry', type: 'Lip tint', c: 0x7a1f4b },
  { name: 'Bare', type: 'Lipstick', c: 0xc99383 },
  { name: 'Coral', type: 'Lip gloss', c: 0xe5654f },
  { name: 'Clear', type: 'Lip balm', c: 0xeedfd2 },
];
let shadeIdx = 0;
const shadesEl = $('#shades');
SHADES.forEach((s, i) => {
  const b = document.createElement('button'); b.className = 'shade'; b.id = 'shade' + i; b.setAttribute('aria-pressed', i === shadeIdx);
  b.innerHTML = `<i style="background:#${s.c.toString(16).padStart(6, '0')}"></i><b>${s.name}</b>`;
  b.addEventListener('click', () => swapShade(i));
  shadesEl.appendChild(b);
});
function setShade(i) { shadeIdx = i; M.product.color.setHex(SHADES[i].c); M.glossBead.color.setHex(SHADES[i].c); [...shadesEl.children].forEach((b, j) => b.setAttribute('aria-pressed', j === i)); }

// ---------- sequences ----------
async function run(fn) { if (busy) return; busy = true; syncUI(); try { await fn(); } finally { busy = false; syncUI(); } }
async function ensureDetached() { if (G.fold > 0) await to('fold', 0); if (G.detach < 1) { if (S.adv > 0) await to('adv', 0); await to('detach', 1); } }
async function dock() {
  if (G.cart > 0) await to('cart', 0);
  if (S.adv > 0.001) { flash('Retracting the product before docking (2.3 is an end-stop).'); await to('adv', 0); }
  await to('cover', 0);
  await to('detach', 0);
}
async function detach() { if (G.fold > 0) await to('fold', 0); await to('detach', 1); }
async function toggleFold() { if (G.fold > 0) { await to('fold', 0); return; } if (G.explode > 0) { G.explode = 0; ui.explode.value = 0; ui.expOut.textContent = '0%'; } if (G.detach > 0 || G.cart > 0) await dock(); await to('fold', 1); }
async function toggleCart() {
  if (G.cart > 0) { await to('cart', 0); return; }
  await ensureDetached();
  if (S.adv > 0.001) await to('adv', 0);
  await to('cart', 1);
}
async function swapShadeSeq(i) {
  if (i === shadeIdx && G.cart === 0) return;
  if (G.cart === 0) {
    await ensureDetached(); if (S.adv > 0.001) await to('adv', 0); await to('cart', 1);
  }
  setShade(i);
  await new Promise(r => setTimeout(r, reduceMotion ? 0 : 250));
  await to('cart', 0);
  flash(`${SHADES[i].name} ${CART_TYPES.find(c => c.id === cartType).name.toLowerCase()} cartridge loaded.`);
}
async function swapTypeSeq(t) {
  if (t === cartType && G.cart === 0) return;
  if (G.cart === 0) { await ensureDetached(); if (S.adv > 0.001) await to('adv', 0); await to('cart', 1); }
  setCartType(t);
  await new Promise(r => setTimeout(r, reduceMotion ? 0 : 250));
  await to('cart', 0);
  flash(`${CART_TYPES.find(c => c.id === t).name} cartridge loaded.`);
}
document.querySelectorAll('[data-ctype]').forEach(b => b.onclick = () => run(() => swapTypeSeq(b.dataset.ctype)));
function swapShade(i) { run(() => swapShadeSeq(i)); }
function canAdvance() { return G.detach === 1 && S.detach > 0.98 && G.cart === 0 && S.cart < 0.01 && !busy; }
function setAdv(cm) {
  if (!canAdvance()) { flash(G.detach < 1 ? 'Detach the distal temple first. When docked, the internal cover (2.3) caps the tip.' : 'Load a cartridge first.'); syncUI(); return; }
  if (G.cover < 1) G.cover = 1;
  G.adv = clamp(cm, 0, ADV_MAX); syncUI();
}

// ---------- UI wiring ----------
const ui = { dock: $('#btnDock'), detach: $('#btnDetach'), adv: $('#adv'), advOut: $('#advOut'), cover: $('#btnCover'), retract: $('#btnRetract'), cart: $('#btnCart'), hint: $('#advHint'), pill: $('#statePill'), status: $('#statusText'), explode: $('#explode'), expOut: $('#expOut') };
ui.dock.onclick = () => run(dock);
ui.detach.onclick = () => run(detach);
ui.adv.oninput = () => setAdv(+ui.adv.value / 10);
ui.cover.onclick = () => { G.cover = G.cover > 0.5 ? 0 : 1; syncUI(); };
ui.retract.onclick = () => setAdv(0);
ui.cart.onclick = () => run(toggleCart);
ui.fold = $('#btnFold'); ui.fold.onclick = () => run(toggleFold);
ui.explode.oninput = () => { if (G.fold > 0) G.fold = 0; G.explode = +ui.explode.value; ui.expOut.textContent = Math.round(G.explode * 100) + '%'; };
let toastT; function flash(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600); }

function syncUI() {
  const docked = G.detach === 0, out = G.cart > 0;
  ui.dock.setAttribute('aria-pressed', docked); ui.detach.setAttribute('aria-pressed', !docked);
  ui.dock.disabled = ui.detach.disabled = busy;
  ui.adv.disabled = !canAdvance(); ui.retract.disabled = !canAdvance() || G.adv === 0;
  ui.cover.textContent = G.cover > 0.5 ? 'Close cover 2.1' : 'Open cover 2.1';
  ui.cart.textContent = out ? 'Insert cartridge' : 'Detach cartridge';
  document.querySelectorAll('[data-ctype]').forEach(b => b.disabled = busy);
  ui.fold.textContent = G.fold > 0 ? 'Unfold temples' : 'Fold temples'; ui.fold.disabled = busy;
  ui.dock.setAttribute('aria-pressed', docked && G.fold === 0);
  ui.cart.disabled = busy;
  [...shadesEl.children].forEach(b => b.disabled = busy);
  ui.hint.className = 'hint' + (docked ? ' warn' : '');
  ui.hint.textContent = docked ? 'Locked while assembled. Detach the distal temple to extend the product.' : out ? 'No cartridge loaded.' : 'Drag the slider, or drag the wheel itself in the view.';
}
function statusText() {
  if (busy) return [S.detach < G.detach ? 'Moving' : 'Working', 'Moving parts into place…'];
  if (G.fold > 0) return ['Folded', 'Temples folded on their hinges for storage. The distal pieces stay docked, so the product stays capped and sealed.'];
  if (G.cart > 0) return ['Cartridge out', `Cartridge 1.4 is out of the housing. Insert it, or pick a shade to load a different one.`];
  if (G.detach === 0) return ['Assembled', 'Wearable as normal glasses. The tip sits in the insulated cavity (2.4), capped by the internal cover (2.3), with seals 1.3 and 2.5 compressed.'];
  const mm = (G.adv * 10).toFixed(1);
  if (G.adv > 0) return ['Applicator', `Distal temple detached and used as a hand-held applicator. ${SHADES[shadeIdx].name} ${CART_TYPES.find(c => c.id === cartType).name.toLowerCase()} ${cartType === 'gloss' ? 'dispensed' : 'extended'} ${mm} mm.`];
  return ['Detached', 'Distal temple detached. Open the cover and roll the thumbwheel to extend the product.'];
}
function frameUI() {
  ui.advOut.textContent = (S.adv * 10).toFixed(1) + ' mm';
  if (document.activeElement !== ui.adv) ui.adv.value = (G.adv * 10).toFixed(1);
  const [p, s] = statusText(); if (ui.pill.textContent !== p) ui.pill.textContent = p; if (ui.status.textContent !== s) ui.status.textContent = s;
}

// view modes
let viewMode = 'solid';
const housing = [M.case, M.collar, M.prox, M.cover];
function setView(m) {
  viewMode = m;
  ['Solid', 'Xray', 'Section'].forEach(n => $('#v' + n).setAttribute('aria-pressed', m === n.toLowerCase()));
  housing.forEach(mat => { mat.transparent = m === 'xray'; mat.opacity = m === 'xray' ? 0.16 : 1; mat.depthWrite = m !== 'xray'; mat.needsUpdate = true; });
  [M.insul].forEach(mat => { mat.opacity = m === 'xray' ? 0.55 : 0.92; });
  const clip = m === 'section';
  [M.case, M.collar, M.shell, M.prox, M.insul, M.seal, M.oring].forEach(mat => { mat.clippingPlanes = clip ? [mat === M.prox || mat === M.insul || mat === M.seal ? planeP : planeD] : []; mat.needsUpdate = true; });
  if (m === 'section' && camMode !== 'side' && camMode !== 'mech') setCam('side');
}
$('#vSolid').onclick = () => setView('solid'); $('#vXray').onclick = () => setView('xray'); $('#vSection').onclick = () => setView('section');

// camera presets
let camMode = 'persp', camAnim = null;
const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
const box = new THREE.Box3(), sph = new THREE.Sphere();
function fitFrom(dir, pad) {
  box.makeEmpty(); root.updateMatrixWorld(true); box.expandByObject(root); box.getBoundingSphere(sph);
  const vf = THREE.MathUtils.degToRad(camera.fov), hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect), f = Math.min(vf, hf);
  const dist = sph.radius / Math.sin(f / 2) * pad;
  return [sph.center.clone().add(dir.clone().normalize().multiplyScalar(dist)), sph.center.clone()];
}
function camTargets(m) {
  if (m === 'side') return fitFrom(v3(-1, 0.06, 0), 0.8);
  if (m === 'top') return fitFrom(v3(0, 1, 0.02), 0.82);
  if (m === 'mech') { const w = WG.getWorldPosition(new THREE.Vector3()); return [w.clone().add(v3(5.2, 3.2, 3.0)), w]; }
  return fitFrom(v3(-0.72, 0.6, 0.68), 1.08);
}
const FIG = { persp: 'Perspective', side: 'Fig. 1 · Side view', top: 'Fig. 2 · Top-down plan view', mech: 'Thumbwheel 2.2 · inward face' };
function setCam(m, instant) {
  camMode = m; document.querySelectorAll('[data-cam]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cam === m)); $('#figLabel').textContent = FIG[m];
  const [p, t] = camTargets(m);
  if (instant || reduceMotion) { camera.position.copy(p); controls.target.copy(t); controls.update(); camAnim = null; return; }
  camAnim = { p0: camera.position.clone(), t0: controls.target.clone(), p1: p, t1: t, k: 0 };
}
document.querySelectorAll('[data-cam]').forEach(b => b.onclick = () => { if (b.dataset.cam === 'mech' && G.detach === 1) { G.cover = 1; syncUI(); } setCam(b.dataset.cam); });

// ---------- callouts ----------
const callouts = $('#callouts'), svg = $('#leaders');
const NS = 'http://www.w3.org/2000/svg';
let selected = '1.9', showLabels = true;
PARTS.forEach(p => {
  const c = document.createElement('button'); c.className = 'chip'; c.innerHTML = `${p.id}<span class="nm">${p.name}</span>`; c.setAttribute('aria-label', `${p.id} ${p.name}`);
  c.addEventListener('click', () => select(p.id)); callouts.appendChild(c); p.chip = c;
  p.line = document.createElementNS(NS, 'line'); p.dot = document.createElementNS(NS, 'circle'); p.dot.setAttribute('r', 2.2); svg.appendChild(p.line); svg.appendChild(p.dot);
});
$('#chkLabels').onchange = e => { showLabels = e.target.checked; };
$('#chkDesign').onchange = e => setDesign(e.target.checked);
$('#chkLens').onchange = e => lensParts.forEach(m => m.visible = e.target.checked);
const partsEl = $('#parts');
PARTS.slice().sort((a, b) => { const [a1, a2] = a.id.split('.').map(Number), [b1, b2] = b.id.split('.').map(Number); return a1 - b1 || a2 - b2; }).forEach(p => {
  const li = document.createElement('li'); const b = document.createElement('button'); b.className = 'part'; b.dataset.id = p.id;
  b.innerHTML = `<code>${p.id}</code>${p.name}${p.internal ? '<em>internal</em>' : ''}`; b.onclick = () => select(p.id); li.appendChild(b); partsEl.appendChild(li);
});
function select(id, quiet) {
  selected = id; const p = partById[id];
  $('#info').innerHTML = `<h3><span>${p.id}</span>${p.name}</h3><p>${p.d}</p><div class="src">Patent description · ${p.id.startsWith('2') ? 'Fig. 2' : 'Fig. 1'}</div>`;
  partsEl.querySelectorAll('.part').forEach(b => b.classList.toggle('on', b.dataset.id === id));
  PARTS.forEach(q => { q.chip.classList.toggle('on', q.id === id); q.mats.forEach(m => { if (m.emissive) { const hi = q.id === id && !quiet; m.emissive.setHex(hi ? 0xb0245a : 0x000000); m.emissiveIntensity = hi ? 0.2 : 0; } }); });
  if (!quiet && p.internal && viewMode === 'solid') { setView('xray'); flash(`Switched to X-ray to show ${p.name}.`); }
}
const tmpV = new THREE.Vector3();
function updateCallouts() {
  const w = stage.clientWidth, h = stage.clientHeight, sc = w < 600 ? 0.7 : 1, see = viewMode !== 'solid';
  PARTS.forEach(p => {
    let vis = showLabels;
    if (p.id === '1.4' || p.id === '1.10') vis = vis && true;
    if (p.id === '1.6' || p.id === '1.7' || p.id === '1.11' || p.id === '2.2') vis = vis && (see || S.explode > 0.2 || (p.id === '2.2' && S.cover > 0.6 && S.detach > 0.5));
    if (p.id === '1.10' && S.detach < 0.5 && !see && S.explode < 0.2) vis = false;
    if ((p.id === '2.3' || p.id === '2.4' || p.id === '2.5') && !see && S.explode < 0.2 && S.detach < 0.5) vis = false;
    if (p.id === '1.4' && !see && S.cart < 0.5 && S.explode < 0.2) vis = false;
    if (w < 600 && p.internal && !see && S.explode < 0.2 && !(p.id === '1.4' && S.cart > 0.5)) vis = false;
    if (p.id === selected && showLabels) vis = true;
    tmpV.set(p.at[0], p.at[1], p.at[2]); p.obj.localToWorld(tmpV); tmpV.project(camera);
    if (tmpV.z > 1) vis = false;
    const x = (tmpV.x * 0.5 + 0.5) * w, y = (-tmpV.y * 0.5 + 0.5) * h;
    const cx = x + p.off[0] * sc, cy = y + p.off[1] * sc;
    p.chip.hidden = !vis; p.line.style.display = p.dot.style.display = vis ? '' : 'none';
    if (!vis) return;
    p.chip.style.left = cx + 'px'; p.chip.style.top = cy + 'px';
    p.chip.classList.toggle('dim', p.internal && !see && S.explode < 0.2 && p.id !== selected && !(p.id === '1.4' && S.cart > 0.5));
    p.line.setAttribute('x1', x); p.line.setAttribute('y1', y); p.line.setAttribute('x2', cx); p.line.setAttribute('y2', cy);
    p.dot.setAttribute('cx', x); p.dot.setAttribute('cy', y);
  });
}

// ---------- picking + wheel drag ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let drag = null, downAt = null;
function hit(ev) {
  const r = renderer.domElement.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hs = ray.intersectObjects(pickables.filter(o => o.visible), false).filter(h => !(viewMode === 'xray' && ['1.9', '1.8', '2.1'].includes(h.object.userData.part)) && !(viewMode === 'section' && h.point && isClipped(h)));
  return hs[0];
}
function isClipped(h) { const m = h.object.material; return m.clippingPlanes && m.clippingPlanes.some(pl => pl.distanceToPoint(h.point) < 0); }
renderer.domElement.addEventListener('pointerdown', ev => {
  downAt = [ev.clientX, ev.clientY];
  const h = hit(ev);
  if (h && h.object.userData.part === '2.2') {
    if (!canAdvance()) { setAdv(G.adv); return; }
    drag = { y: ev.clientY, a: G.adv }; controls.enabled = false; renderer.domElement.setPointerCapture(ev.pointerId); renderer.domElement.style.cursor = 'grabbing';
  }
});
renderer.domElement.addEventListener('pointermove', ev => {
  if (drag) { setAdv(drag.a + (drag.y - ev.clientY) * 0.004); return; }
  if (ev.pointerType === 'mouse' && !ev.buttons) { const h = hit(ev); renderer.domElement.style.cursor = h ? (h.object.userData.part === '2.2' && canAdvance() ? 'grab' : 'pointer') : 'default'; }
});
renderer.domElement.addEventListener('pointerup', ev => {
  if (drag) { drag = null; controls.enabled = true; renderer.domElement.style.cursor = 'grab'; return; }
  if (downAt && Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1]) < 5) { const h = hit(ev); if (h) select(h.object.userData.part); }
  downAt = null;
});

// ---------- loop ----------
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w / h < 1 ? 44 : 30; camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
const clock = new THREE.Clock();
const wp = new THREE.Vector3();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.1);
  stepState(dt); applyState();
  if (camAnim) {
    camAnim.k = Math.min(1, camAnim.k + dt * 1.6); const k = smooth(camAnim.k);
    camera.position.lerpVectors(camAnim.p0, camAnim.p1, k); controls.target.lerpVectors(camAnim.t0, camAnim.t1, k);
    if (camAnim.k >= 1) camAnim = null;
  }
  controls.update();
  root.updateMatrixWorld(true);
  // section planes follow each piece's centreline
  T.localToWorld(wp.set(-0.35, 0, 0)); planeP.constant = -wp.x;
  D.localToWorld(wp.set(-0.35, 0, 0)); planeD.constant = -wp.x;
  renderer.render(scene, camera);
  updateCallouts(); frameUI();
  requestAnimationFrame(tick);
}
controls.addEventListener('start', () => { camAnim = null; });

setCartType('lipstick'); resize(); setView('solid'); setCam('persp', true); setShade(0); select('1.9', true); syncUI(); applyState();
requestAnimationFrame(tick);
// ---------- amiré site build: product-page defaults and a small public API ----------
showLabels = false;
const FINISHES = {
  noir:   { c: 0x1d1b20, m: 0.0, r: 0.48, cc: 0.45 },
  silver: { c: 0xc3c5c9, m: 0.95, r: 0.26, cc: 0.3 },
  gold:   { c: 0xc29a4e, m: 1.0, r: 0.28, cc: 0.3 },
  abiola: { c: 0x45281a, m: 0.05, r: 0.4, cc: 0.6 },
  damiana:{ c: 0x3a0a16, m: 0.25, r: 0.3, cc: 0.8 },
  abeke:  { c: 0xa0bddb, m: 0.0, r: 0.42, cc: 0.5 },
};
const frameMats = [M.frame, M.prox, M.case, M.collar, M.cover, M.opp, M.oppCollar];
function setFinish(key) {
  const f = FINISHES[key] || FINISHES.noir;
  frameMats.forEach(m => { m.color.setHex(f.c); m.metalness = f.m; m.roughness = f.r; m.clearcoat = f.cc; m.needsUpdate = true; });
  M.cover.color.offsetHSL(0, 0, 0.02);
}
// open on the assembled glasses, slowly turning
G.detach = S.detach = 0; G.adv = S.adv = 0; G.cover = S.cover = 0;
applyState(); setCam('persp', true);
controls.autoRotate = !reduceMotion; controls.autoRotateSpeed = 0.7;
const api = {
  setFinish,
  setTip: t => run(async () => { await swapTypeSeq(t); setCam('persp'); }),
  fold: () => run(toggleFold),
  isFolded: () => G.fold > 0,
  toggleApplicator: () => run(async () => { if (G.detach > 0) await dock(); else await detach(); setCam('persp'); }),
  isDetached: () => G.detach > 0,
  twist: () => run(async () => {
    if (G.fold > 0) await to('fold', 0);
    if (G.detach < 1) await detach();
    if (G.cart > 0) await to('cart', 0);
    if (camMode === 'persp') setCam('persp');
    G.cover = 1; await to('adv', G.adv > 0 ? 0 : 0.5);
  }),
  isTwisted: () => G.adv > 0,
  setLenses: on => lensParts.forEach(m => m.visible = on),
  setGems: on => setDesign(on),
  setAutoRotate: on => { controls.autoRotate = on; },
  isAutoRotating: () => controls.autoRotate,
  resetView: () => { setCam('persp'); },
  onChange: fn => { api._cb = fn; },
};
let lastBusy = null;
setInterval(() => { if (api._cb && busy !== lastBusy) { lastBusy = busy; api._cb({ busy }); } }, 120);
window.SarafinaViewer = api;
window.dispatchEvent(new Event('sarafina-ready'));

})();
