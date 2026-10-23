// Helpers for the EffectCraft build of the compressor cutaway.
var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 30;

// A 3D model layer from assets/<name>.glb, in millimetres scaled to S px.
function model(comp, name) {
  var l = comp.layers.__new(__call("layer.newModel", { comp: comp.layers.__comp, path: ROOT + "/assets/" + name + ".glb", name: name }));
  l.property("Geometry Options").property("Model Scale").setValue(META.S);
  return l;
}
function prim(comp, kind, name, o) {
  o = o || {};
  o.comp = comp.layers.__comp; o.kind = kind; o.name = name;
  return comp.layers.__new(__call("layer.new3dPrimitive", o));
}
function tr(l, n) { return l.property("Transform").property(n); }
// Bake one value per frame (from ANIM) onto a property.
function bake(prop, track, map) {
  var ts = [], vs = [];
  for (var f = 0; f < track.length; f++) { ts.push(f / FPS); vs.push(map ? map(track[f]) : track[f]); }
  prop.setValuesAtTimes(ts, vs);
}
