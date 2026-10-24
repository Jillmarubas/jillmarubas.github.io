// Tree-sway test, the EffectCraft way: one flat picture of the tree, bent with puppet pins.
var ROOT = "/root/ectree"; // copy backdrop.png (TreeBackdrop still) and treeWhole.png here first
var comp = app.project.items.addComp("Tree", 720, 1080, 1, 6, 30);
var bg = comp.layers.add(app.project.importFile(new ImportOptions(new File(ROOT + "/backdrop.png"))));
var tree = comp.layers.add(app.project.importFile(new ImportOptions(new File(ROOT + "/treeWhole.png"))));
tree.name = "Tree";
// same place and size as the Remotion version: 90 %, trunk base at x 360, y 1040
tree.property("Transform").property("Scale").setValue([90, 90]);
tree.property("Transform").property("Anchor Point").setValue([300, 1000]);
tree.property("Transform").property("Position").setValue([360, 1040]);
writeLn("layers: " + comp.numLayers);
