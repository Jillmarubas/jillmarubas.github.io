"""Download ElevenLabs VO clips: maps session ids (src/vs1010/sessions.txt) to content URLs in a saved
creative_get_flow_run_status result, saves public/vs1010/vo/<key>.mp3."""
import json, sys, subprocess, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sess = dict(l.split()[::-1] for l in open(f'{R}/src/vs1010/sessions.txt') if l.strip())
for f in sys.argv[1:]:
    for g in json.load(open(f))['generations']:
        if g.get('status') != 'completed': continue
        sid = g['content_url'].split('/content_generation/')[1].split('/')[0]
        if sid in sess:
            out = f'{R}/public/vs1010/vo/{sess[sid]}.mp3'
            subprocess.run(['curl', '-sSfL', '-o', out, g['content_url']], check=True)
            print(sess[sid], g['duration_secs'])
