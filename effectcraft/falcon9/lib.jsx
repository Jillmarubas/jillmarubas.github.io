// Helpers for the Falcon 9 episode in EffectCraft. World units are metres (+Y up, +Z toward the camera,
// as modelled in remotion/src/falcon9/model.ts); EffectCraft comp space is pixels (+Y down, +Z away).
var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 30;

function Scene(comp, S) {
  this.comp = comp;
  this.S = S; // px per metre
  this.CID = comp.layers.__comp;
}
Scene.prototype.cmd = function (id, o) { o = o || {}; o.comp = this.CID; return __call(id, o); };
// World metres -> comp px.
Scene.prototype.p = function (x, y, z) { return [960 + this.S * x, 540 - this.S * y, -this.S * z]; };
Scene.prototype.model = function (name, pos, layerName) {
  var l = this.comp.layers.__new(this.cmd("layer.newModel", { path: ROOT + "/assets/" + name + ".glb", name: layerName || name }));
  l.property("Geometry Options").property("Model Scale").setValue(this.S);
  l.threeDLayer = true;
  var p = pos || [0, 0, 0];
  l.property("Transform").property("Position").setValue(this.p(p[0], p[1], p[2]));
  return l;
};
Scene.prototype.nul = function (name, pos) {
  var n = this.comp.layers.addNull();
  n.name = name;
  n.threeDLayer = true;
  // Nulls default to a [50, 50] anchor; children are placed relative to it, so zero it.
  n.property("Transform").property("Anchor Point").setValue([0, 0, 0]);
  var p = pos || [0, 0, 0];
  n.property("Transform").property("Position").setValue(this.p(p[0], p[1], p[2]));
  return n;
};
// A child layer at the parent's origin.
function attach(child, parent) {
  child.parent = parent;
  child.property("Transform").property("Position").setValue([0, 0, 0]);
}
// three.js rotation (radians) -> EffectCraft degrees: Y and Z flip sign under the axis mapping.
function degY(rad) { return (-rad * 180) / Math.PI; }
function degZ(rad) { return (-rad * 180) / Math.PI; }

// EffectCraft 0.14: a parent null's Y Rotation did not reach its children (its Z Rotation does), and a layer's own
// rotations apply Y before Z. So each fin and leg carries its yaw in Orientation (applied last) and its fold in Z Rotation.
// Grid fins: k = 0 stowed, 1 deployed. Legs: k = 0 stowed, 1 deployed (LEG constants from model.ts).
var LEG = { stowedDeg: 4, deployedDeg: 120 };
// Local offset (px) of a point given in booster metres, for layers parented to the booster root.
Scene.prototype.local = function (x, y, z) { return [this.S * x, -this.S * y, -this.S * z]; };
Scene.prototype.hinge = function (name, pos, root) {
  var h = this.nul(name, [0, 0, 0]);
  if (root) h.parent = root;
  h.property("Transform").property("Position").setValue(root ? this.local(pos[0], pos[1], pos[2]) : this.p(pos[0], pos[1], pos[2]));
  return h;
};
Scene.prototype.fins = function (k, root, prefix) {
  var out = [];
  for (var i = 0; i < RIG.fins.length; i++) {
    var f = RIG.fins[i];
    var h = this.hinge((prefix || "") + "fin hinge " + (i + 1), f.pos, root);
    var fin = this.model("grid_fin", [0, 0, 0], (prefix || "") + "grid fin " + (i + 1));
    attach(fin, h);
    fin.property("Transform").property("Orientation").setValue([0, degY(f.yaw), 0]);
    fin.property("Transform").property("Z Rotation").setValue(degZ((Math.PI / 2) * (1 - k)));
    out.push(fin);
  }
  return out;
};
Scene.prototype.legs = function (k, root, prefix) {
  var out = [];
  for (var i = 0; i < RIG.legs.length; i++) {
    var g = RIG.legs[i];
    var h = this.hinge((prefix || "") + "leg hinge " + (i + 1), g.pos, root);
    var leg = this.model("leg", [0, 0, 0], (prefix || "") + "leg " + (i + 1));
    attach(leg, h);
    leg.property("Transform").property("Orientation").setValue([0, degY(g.yaw), 0]);
    var deg = LEG.stowedDeg + (LEG.deployedDeg - LEG.stowedDeg) * k;
    leg.property("Transform").property("Z Rotation").setValue(degZ((-deg * Math.PI) / 180));
    out.push(leg);
  }
  return out;
};
Scene.prototype.booster = function (o) {
  o = o || {};
  var cut = o.cut ? "_cut" : "";
  var off = o.at || [0, 0, 0];
  var root = this.nul("booster root", off);
  var parts = ["booster_shell" + cut, "booster_tanks" + cut, "engines", "thrusters"];
  for (var i = 0; i < parts.length; i++) attach(this.model(parts[i]), root);
  if (o.fill !== undefined) {
    var lx = this.model("lox" + cut); lx.parent = root; lx.property("Transform").property("Position").setValue(this.local(RIG.lox[0], RIG.lox[1], RIG.lox[2]));
    var rp = this.model("rp1" + cut); rp.parent = root; rp.property("Transform").property("Position").setValue(this.local(RIG.rp1[0], RIG.rp1[1], RIG.rp1[2]));
    lx.property("Transform").property("Scale").setValue([100, 100 * o.fill, 100]);
    rp.property("Transform").property("Scale").setValue([100, 100 * o.fill, 100]);
  }
  return root;
};
Scene.prototype.lights = function () {
  var key = this.comp.layers.__new(this.cmd("layer.newLight", { name: "Key light", kind: "Parallel", intensity: 115, castsShadows: true, shadowDarkness: 55, shadowDiffusion: 40 }));
  key.property("Transform").property("Position").setValue(this.p(-60, 120, 80));
  key.property("Transform").property("Point of Interest").setValue(this.p(0, 0, 0));
  var fill = this.comp.layers.__new(this.cmd("layer.newLight", { name: "Fill light", kind: "Parallel", intensity: 30, castsShadows: false }));
  fill.property("Transform").property("Position").setValue(this.p(80, 40, 50));
  fill.property("Transform").property("Point of Interest").setValue(this.p(0, 0, 0));
  this.comp.layers.__new(this.cmd("layer.newLight", { name: "Studio light", kind: "Environment", intensity: 75 }));
  this.comp.layers.__new(this.cmd("layer.newLight", { name: "Ambient", kind: "Ambient", intensity: 12 }));
};
// Two-node camera at `pos` looking at `target` (metres), vertical field of view `fov` degrees.
Scene.prototype.camera = function (pos, target, fov) {
  var zoom = 540 / Math.tan(((fov || 30) * Math.PI) / 360);
  var cam = this.comp.layers.__new(this.cmd("layer.newCamera", { name: "Camera", zoom: zoom }));
  cam.property("Transform").property("Position").setValue(this.p(pos[0], pos[1], pos[2]));
  cam.property("Transform").property("Point of Interest").setValue(this.p(target[0], target[1], target[2]));
  return cam;
};
Scene.prototype.floor = function (y) {
  var f = this.comp.layers.__new(this.cmd("layer.new3dPrimitive", { kind: "plane", name: "Floor shadows", width: 40000, height: 40000, position: this.p(0, y || 0, 0) }));
  f.property("Transform").property("X Rotation").setValue(90);
  this.cmd("material.set", { layers: [f.__id], acceptsShadows: "only", castsShadows: "off" });
};
// Studio background + environment image (bottom of the stack).
function studio(comp) {
  var bg = comp.layers.addSolid([0.93, 0.94, 0.95], "Background", W, H, 1);
  var ramp = bg.property("Effects").addProperty("Gradient Ramp");
  ramp.property("Start of Ramp").setValue([960, 480]);
  ramp.property("Start Color").setValue([0.984, 0.984, 0.988]);
  ramp.property("End of Ramp").setValue([960 + 1150, 480 + 380]);
  ramp.property("End Color").setValue([0.863, 0.875, 0.89]);
  ramp.property("Ramp Shape").setValue(2);
  var env = comp.layers.add(app.project.importFile(new ImportOptions(new File(ROOT + "/assets/studio_env.png"))));
  env.name = "Studio environment";
  __call("layer.environment", { comp: comp.layers.__comp, layers: [env.__id], on: true });
}
function newComp(name, dur) {
  var c = app.project.items.addComp(name, W, H, 1, dur || 1, FPS);
  c.renderer = "ADBE Advanced 3d";
  studio(c);
  return c;
}
