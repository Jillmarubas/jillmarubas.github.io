import json, math, subprocess
def wind(s): return 1.5 * (math.sin(s / 3.2 * 2 * math.pi) + 0.35 * math.sin(s / 1.3 * 2 * math.pi + 0.7))
LAG = 0.18
def rot(p, c, deg):
    t = math.radians(deg); x, y = p[0] - c[0], p[1] - c[1]
    return [c[0] + x * math.cos(t) - y * math.sin(t), c[1] + x * math.sin(t) + y * math.cos(t)]
def pose(p, seg, s):
    # same nesting as the Remotion rig: top inside mid inside trunk
    q = list(p)
    if seg >= 3: q = rot(q, (300, 350), wind(s - 2 * LAG) * 2.2)
    if seg >= 2: q = rot(q, (300, 580), wind(s - LAG) * 1.4)
    return rot(q, (300, 1000), wind(s) * 0.6)
fixed = [(280, 996), (320, 996)]
moving = [((300, 780), 1), ((300, 600), 2), ((300, 470), 2), ((60, 625), 2), ((540, 625), 2), ((300, 300), 3), ((120, 420), 3), ((480, 420), 3), ((215, 220), 3), ((385, 220), 3), ((300, 110), 3)]
args = ['puppet.mesh', json.dumps({"layer": "Tree", "density": 12})] if False else []
for p in fixed:
    args += ['puppet.addPin', json.dumps({"layer": "Tree", "kind": "position", "position": list(p)})]
names = []
for i, (p, seg) in enumerate(moving):
    args += ['puppet.addPin', json.dumps({"layer": "Tree", "kind": "position", "position": list(p), "time": 0})]
args += ['file.save', json.dumps({"path": "/root/ectree/tree.ecproj"})]
out = subprocess.run(['effectcraft-cli', 'run', *args, '/root/ectree/tree.ecproj', '--json'], capture_output=True, text=True)
print(out.stdout[-600:], out.stderr[-600:])

res = json.loads(out.stdout)
results = res if isinstance(res, list) else res.get('results', res)
pin_ids = [r['result']['pin'] for r in results if r['command'] == 'puppet.addPin'][len(fixed):]
args = []
nkeys = 0
for (p, seg), uid in zip(moving, pin_ids):
    for k in range(0, 61):
        s = k * 0.1
        args += ['puppet.movePin', json.dumps({"layer": "Tree", "pin": uid, "position": pose(p, seg, s), "time": round(s, 3)})]
        nkeys += 1
args += ['file.save', json.dumps({"path": "/root/ectree/tree.ecproj"})]
out2 = subprocess.run(['effectcraft-cli', 'run', *args, '/root/ectree/tree.ecproj'], capture_output=True, text=True)
print('keyframes', nkeys, 'exit', out2.returncode, out2.stderr[-400:], out2.stdout[-200:])
