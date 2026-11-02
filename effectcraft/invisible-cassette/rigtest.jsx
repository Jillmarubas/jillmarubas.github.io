var ROOT = File($.fileName).parent.fsName;
var W = 1920, H = 1080, FPS = 24;
function img(n){ return app.project.importFile(new ImportOptions(new File(ROOT + "/assets/" + n))); }
var c = app.project.items.addComp("Rig", W, H, 1, 10, FPS);
// background plate: desk at Z = +350
var d = c.layers.add(img("desk_oak.png")); d.threeDLayer = true;
d.property("Transform").property("Position").setValue([W/2, H/2, 350]);
d.property("Transform").property("Scale").setValue([70, 70, 100]);
// midground: manila card at Z = 0 with a typed line
var m = c.layers.add(img("manila.png")); m.threeDLayer = true;
m.property("Transform").property("Position").setValue([W/2, H/2, 0]);
m.property("Transform").property("Scale").setValue([30, 30, 100]);
var t = c.layers.addText("MAY 6, 2010 // 14:42:00 EDT");
var doc = t.property("Source Text").value; doc.font = "CourierPrime-Bold"; doc.fontSize = 46; doc.fillColor = [0.1,0.09,0.07]; doc.justification = ParagraphJustification.CENTER_JUSTIFY;
t.property("Source Text").setValue(doc);
t.threeDLayer = true; t.property("Transform").property("Position").setValue([W/2, H/2+10, -1]);
t.property("Source Text").expression = 'var s = "MAY 6, 2010 // 14:42:00 EDT"; s.substr(0, Math.max(0, Math.floor((time - 1) * 18)));';
// foreground occluder at Z = -250 (should be soft from the camera's depth of field)
var fg = c.layers.addSolid([0.15,0.12,0.09], "FG bar", 400, 1400, 1); fg.threeDLayer = true;
fg.property("Transform").property("Position").setValue([200, H/2, -250]);
// 35 mm camera: zoom = 1920 * 35 / 36
var Z = 1866.67;
var cam = c.layers.addCamera("Camera 35mm", [W/2, H/2]);
cam.autoOrient = AutoOrientType.NO_AUTO_ORIENT;
var co = cam.property("Camera Options");
co.property("Zoom").setValue(Z);
co.property("Depth of Field").setValue(1);
co.property("Focus Distance").setValue(Z);
co.property("Aperture").setValue(160);
co.property("Blur Level").setValue(100);
cam.property("Transform").property("Position").setValue([W/2, H/2, -Z]);
writeLn("ok layers " + c.numLayers);
