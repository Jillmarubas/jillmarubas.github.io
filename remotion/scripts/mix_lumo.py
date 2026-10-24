"""Mix the Lumo concept ad: Asher v4 voice at 0.6 s + the user's ElevenLabs SFX at the times in
src/lumo/SFX.md (files in public/lumo/sfx/, any missing file is skipped). Writes out/lumo/mix.wav,
mastered to -14 LUFS / -1 dBTP, then muxes out/lumo/lumo-ad.mp4 from out/lumo/picture.mp4."""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.join(os.path.dirname(__file__), '..')
SR, DUR = 48000, 24.0
N = int(DUR * SR)
TMP = '/tmp/lumo_mix'
os.makedirs(TMP, exist_ok=True)

def load(path):
    out = os.path.join(TMP, os.path.basename(path) + '.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '2', '-ar', str(SR), '-sample_fmt', 's16', out], check=True)
    w = wave.open(out)
    return np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32).reshape(-1, 2) / 32768

def place(buf, sig, t, gain=1.0):
    i0 = int(t * SR)
    sig = sig[: max(0, N - i0)]
    buf[i0:i0 + len(sig)] += sig * gain

rms = lambda x: float(np.sqrt((x ** 2).mean() + 1e-12))
voice = np.zeros((N, 2), np.float32)
place(voice, load(os.path.join(ROOT, 'public/lumo/vo.mp3')), 0.6)
v_rms = rms(voice[np.abs(voice).max(1) > 0.02])

fx = np.zeros((N, 2), np.float32)
rows = re.findall(r'^\| \d+ \| (\S+) \| ([\d.]+) s \|', open(os.path.join(ROOT, 'src/lumo/SFX.md')).read(), re.M)
used = []
for name, at in rows:
    stem = os.path.splitext(name)[0]
    cand = [f for f in os.listdir(os.path.join(ROOT, 'public/lumo/sfx')) if os.path.splitext(f)[0] == stem] if os.path.isdir(os.path.join(ROOT, 'public/lumo/sfx')) else []
    if not cand:
        continue
    s = load(os.path.join(ROOT, 'public/lumo/sfx', cand[0]))
    env = np.abs(s).max(1)
    on = int(np.argmax(env > 0.04 * env.max()))
    s = s[max(0, on - int(0.005 * SR)):]
    body = rms(s[np.abs(s).max(1) > 0.03 * np.abs(s).max()])
    place(fx, s, float(at), v_rms / body * 10 ** (-9 / 20))  # effects sit ~9 dB under the voice
    used.append(stem)
print(len(used), 'sfx placed:', ', '.join(used))

mix = voice + fx
pre = os.path.join(TMP, 'pre.wav')
w = wave.open(pre, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((np.clip(mix / max(1.0, np.abs(mix).max()), -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', pre, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
af = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000"
out = os.path.join(ROOT, 'out/lumo')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', pre, '-af', af, '-ar', '48000', os.path.join(out, 'mix.wav')], check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', os.path.join(out, 'picture.mp4'), '-i', os.path.join(out, 'mix.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', os.path.join(out, 'lumo-ad.mp4')], check=True)
print('wrote out/lumo/lumo-ad.mp4')
