#!/usr/bin/env python3
"""Mixer for The Invisible Cassette. One cue list per scene (JSON), one stereo WAV out.

Usage: python3 -I scripts/mix_ic.py <cues.json> <out.wav>

cues.json: {"duration": s, "cues": [
  {"f": "path", "at": film_s, "bus": "vo|music|amb|sfx", "gain": dB, "trim": [from_s, to_s],
   "fade_in": s, "fade_out": s, "lowpass": Hz, "loop_to": film_s}, ...],
 "rumble": [[from_s, to_s, dB], ...],      # X1: 45 Hz + 90 Hz (phones can't play 45 Hz)
 "silence": [[from_s, to_s], ...],          # story-turn dips on the music bed only
 "bassout": [[at_s, dur_s], ...],           # story-turn bass drop-out on the music bed (highpass 180 Hz)
 "shepard": [[from_s, to_s, dB], ...]}      # X2: endlessly rising Shepard tone + ticking clock, cut dead at to_s
Rules (video-research + SOP): sources are loudness-matched first; music is ducked under the voice
with sidechain compression; every hit peaks well above the bed; master -14 LUFS / -1 dBTP, 48 kHz.
"""
import json, subprocess, sys, tempfile, os

SR = 48000
TARGET = {"vo": -18.0, "music": -27.0, "amb": -34.0}  # integrated LUFS per bus before gain
cfg = json.load(open(sys.argv[1]))
out = sys.argv[2]
dur = cfg["duration"]
tmp = tempfile.mkdtemp()


def run(args):
    subprocess.run(args, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def prep(i, c):
    """Cut, loop, fade and level one cue into a stereo 48 kHz WAV that starts at film time 0."""
    src = c["f"]
    pre = os.path.join(tmp, f"p{i}.wav")
    af = []
    if "trim" in c:
        af.append(f"atrim={c['trim'][0]}:{c['trim'][1]},asetpts=PTS-STARTPTS")
    if "lowpass" in c:
        af.append(f"lowpass=f={c['lowpass']}")
    loop = []
    if "loop_to" in c:
        loop = ["-stream_loop", "-1"]
        af.append(f"atrim=0:{c['loop_to'] - c['at']},asetpts=PTS-STARTPTS")
    if c.get("fade_in"):
        af.append(f"afade=t=in:d={c['fade_in']}")
    run(["ffmpeg", "-y", *loop, "-i", src, "-af", ",".join(af + [f"aresample={SR}"]) if af else f"aresample={SR}", "-ac", "2", pre])
    if c.get("fade_out"):
        d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", pre], capture_output=True, text=True).stdout)
        p2 = os.path.join(tmp, f"q{i}.wav")
        run(["ffmpeg", "-y", "-i", pre, "-af", f"afade=t=out:st={max(0, d - c['fade_out'])}:d={c['fade_out']}", p2])
        pre = p2
    lvl = os.path.join(tmp, f"l{i}.wav")
    bus = c["bus"]
    if bus in TARGET:
        norm = f"loudnorm=I={TARGET[bus] + c.get('gain', 0)}:TP=-2:LRA=20"
    else:  # sfx: peak-normalise to -3 dBFS + gain, so hits stay punchy
        norm = f"dynaudnorm=f=500:p=0.71:m=1,volume={c.get('gain', 0)}dB"
    run(["ffmpeg", "-y", "-i", pre, "-af", f"{norm},aresample={SR},adelay={int(c['at'] * 1000)}|{int(c['at'] * 1000)},apad=whole_dur={dur}", "-t", str(dur), lvl])
    return bus, lvl


buses = {"vo": [], "music": [], "amb": [], "sfx": []}
for i, c in enumerate(cfg["cues"]):
    b, f = prep(i, c)
    buses[b].append(f)

# X1 sub-rumble: 45 Hz body + 90 Hz so phone speakers still feel it, faded in and out per window
for k, (a, b, db) in enumerate(cfg.get("rumble", [])):
    f = os.path.join(tmp, f"r{k}.wav")
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"aevalsrc=0.6*sin(2*PI*45*t)+0.35*sin(2*PI*90*t)*(0.75+0.25*sin(2*PI*0.5*t)):s={SR}:d={b - a}",
         "-af", f"afade=t=in:d=2,afade=t=out:st={max(0, b - a - 2)}:d=2,volume={db}dB,adelay={int(a * 1000)}|{int(a * 1000)},apad=whole_dur={dur}", "-ac", "2", "-t", str(dur), f])
    buses["amb"].append(f)

# X2 Shepard tone: eight octave-spaced partials whose pitch rises forever (Gaussian loudness over the
# octave position hides each wrap), with a soft 1 Hz clock tick; it ends dead (no fade-out) at `to`
def shepard_wav(path, d, db):
    import numpy as np, wave
    n = int(d * SR); t = np.arange(n) / SR
    y = np.zeros(n)
    for i in range(8):
        pos = np.mod(i + t / 10.0, 8.0)                 # octave position, rises one octave per 10 s
        f = 30.0 * 2.0 ** pos
        ph = 2 * np.pi * np.cumsum(f) / SR               # continuous phase: no clicks at the wrap
        y += np.exp(-((pos - 4) ** 2) / 2.2) * np.sin(ph)
    y *= 0.12
    tm = np.mod(t, 1.0)
    y += 0.5 * np.exp(-tm * 70) * np.sin(2 * np.pi * 1800 * t)
    y *= np.minimum(1, t / 4.0) * 10 ** (db / 20)        # 4 s fade-in, hard stop at the end
    y = np.clip(y, -1, 1)
    pcm = (np.repeat(y[:, None], 2, axis=1) * 32767).astype("<i2")
    with wave.open(path, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())


for k, (a, b, db) in enumerate(cfg.get("shepard", [])):
    raw = os.path.join(tmp, f"shr{k}.wav"); f = os.path.join(tmp, f"sh{k}.wav")
    shepard_wav(raw, b - a, db)
    run(["ffmpeg", "-y", "-i", raw, "-af", f"adelay={int(a * 1000)}|{int(a * 1000)},apad=whole_dur={dur}", "-t", str(dur), f])
    buses["amb"].append(f)


def sum_bus(files, name):
    o = os.path.join(tmp, f"{name}.wav")
    if not files:
        run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r={SR}:cl=stereo", "-t", str(dur), o])
        return o
    ins = sum([["-i", f] for f in files], [])
    run(["ffmpeg", "-y", *ins, "-filter_complex", f"amix=inputs={len(files)}:normalize=0:duration=longest", "-t", str(dur), o])
    return o


vo, mu, am, fx = (sum_bus(buses[k], k) for k in ("vo", "music", "amb", "sfx"))
# story-turn silences on the music bed only
dips = "".join(f",volume=enable='between(t,{a},{b})':volume=0.03" for a, b in cfg.get("silence", []))
dips += "".join(f",highpass=f=180:enable='between(t,{a},{a + d})'" for a, d in cfg.get("bassout", []))
mixf = (f"[1:a]asplit=2[vok][vom];[0:a]equalizer=f=2500:t=q:w=1.2:g=-3{dips}[mus];"
        f"[mus][vok]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[duck];"
        f"[vom]highpass=f=90[vo];[duck][vo][2:a][3:a]amix=inputs=4:normalize=0[m]")
pre_master = os.path.join(tmp, "pre.wav")
run(["ffmpeg", "-y", "-i", mu, "-i", vo, "-i", am, "-i", fx, "-filter_complex", mixf, "-map", "[m]", "-t", str(dur), pre_master])
# two-pass loudnorm to -14 LUFS / -1 dBTP
meas = subprocess.run(["ffmpeg", "-i", pre_master, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(meas[meas.rfind("{"):meas.rfind("}") + 1])
run(["ffmpeg", "-y", "-i", pre_master, "-af", f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample={SR}", "-ar", str(SR), out])
print("wrote", out)
