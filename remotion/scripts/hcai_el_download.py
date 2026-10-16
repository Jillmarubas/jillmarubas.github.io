"""Download ElevenLabs generations from a saved creative_get_flow_run_status result, naming them by prompt prefix."""
import json, sys, subprocess, os
ROOT = os.path.join(os.path.dirname(__file__), '..')
NAMES = {
 'Instrumental documentary underscore, cold open': 'music/m0', 'Instrumental documentary underscore, calm': 'music/m1',
 'Instrumental documentary underscore, lower': 'music/m2', 'Instrumental documentary underscore, soft cold': 'music/m3',
 'Instrumental documentary underscore, quiet and human': 'music/m4', 'Instrumental documentary underscore, deep and earthy': 'music/m5',
 'Instrumental documentary underscore, tight': 'music/m6', 'Instrumental documentary underscore, lighter': 'music/m7',
 'Instrumental documentary underscore for the ending': 'music/m8',
 'A single crisp laptop keyboard': 'sfx/key', 'A firm satisfying Enter': 'sfx/enter', 'Someone typing': 'sfx/typing', 'A short soft airy swoosh': 'sfx/swoosh',
 'Cinematic documentary title sting': 'sfx/sting_title', 'Inside a loud data center': 'sfx/fans', 'Distant constant low-frequency': 'sfx/hum_night',
 'An oven door': 'sfx/oven', 'Several industrial gas turbine': 'sfx/turbines', 'Slow single water drops': 'sfx/drips', 'Industrial cooling tower': 'sfx/cooling_tower',
 'A sharp dramatic orchestral': 'sfx/sting', 'A packed town hall': 'sfx/meeting', 'A ballpoint pen': 'sfx/pen', 'High-voltage transmission': 'sfx/powerline',
 'Old 1970s television': 'sfx/tv_static', 'A fast mechanical number counter': 'sfx/counter', 'Fine dry sand': 'sfx/sand', 'Hand tools digging': 'sfx/digging',
 'A convoy of heavy tanker': 'sfx/trucks', 'A 19th-century stationary': 'sfx/steam_engine', 'Room tone of an empty office': 'sfx/room_tone',
 'A computer monitor switching off': 'sfx/monitor_off', 'A single printed photograph': 'sfx/photo_drop', 'A heavy rubber stamp': 'sfx/stamp',
 'Circuit boards and electronic scrap': 'sfx/ewaste', 'A street protest': 'sfx/protest', "A judge's wooden gavel": 'sfx/gavel', 'Large wind turbine': 'sfx/wind_turbine'}
d = json.load(open(sys.argv[1]))
print('completed', d['all_completed'], 'failures', d['has_failures'])
for g in d['generations']:
    n = next((v for k, v in NAMES.items() if g['prompt'].startswith(k)), None)
    if not n or g['status'] != 'completed':
        print('skip', g['status'], g['prompt'][:40]); continue
    u = next(m['url'] for m in d['media'] if m['generation_id'] == g['id'])
    p = os.path.join(ROOT, 'out/hcai', n + '.mp3'); os.makedirs(os.path.dirname(p), exist_ok=True)
    if not os.path.exists(p): subprocess.run(['curl', '-sS', '-o', p, u], check=True)
    print('ok', n, g.get('duration_secs'))
