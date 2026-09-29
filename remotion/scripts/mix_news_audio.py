"""Master the AI News soundtrack into one file (SOP: single <Audio>, one mastered mix).

Inputs: out/ainews0929-timeline.json (from scripts/dump_news_timeline.ts), the VO clips in
audio-src/ainews0929/vo, and the bed / cues in out/ainews0929/sfx (scripts/make_news_sfx.py).
Targets: voice at -17 dBFS RMS, music ducked ~13 dB under the voice and lifted in the gaps,
every cue >= 6 dB over the music at its moment, peaks limited to -1 dBFS.
Writes out/ainews0929-mix.wav and prints a report. Needs numpy; decodes with `npx remotion ffmpeg`.
"""
import json, subprocess, sys, wave
import numpy as np

SR = 48000
TL = json.load(open('out/ainews0929-timeline.json'))
FPS = TL['fps']
N = int(np.ceil(TL['totalFrames'] / FPS * SR))
db = lambda x: 20 * np.log10(max(x, 1e-9))
amp = lambda d: 10 ** (d / 20)
rms = lambda x: float(np.sqrt(np.mean(x ** 2))) if len(x) else 0.0


def load(path):
    # Remotion's ffmpeg is a minimal build: WAV is the only raw-ish muxer it has
    tmp = 'out/ainews0929/_decode.wav'
    subprocess.run(['npx', 'remotion', 'ffmpeg', '-loglevel', 'error', '-y', '-i', path, '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', tmp], capture_output=True, check=True)
    with wave.open(tmp) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float64) / 32768


def speech_rms(x, win=0.4):
    """RMS over the voiced windows only (ignores pauses), so levels reflect the voice itself."""
    n = int(win * SR)
    w = np.array([rms(x[i:i + n]) for i in range(0, len(x) - n, n)])
    return float(np.sqrt(np.mean(w[w > w.max() * 0.1] ** 2)))


def smooth(env, attack, release):
    """One-pole follower on a per-sample gain envelope (different speeds up and down)."""
    out = np.empty_like(env); y = env[0]
    a, r = np.exp(-1 / (attack * SR)), np.exp(-1 / (release * SR))
    for i, v in enumerate(env):
        k = a if v < y else r
        y = k * y + (1 - k) * v
        out[i] = y
    return out


# ---------- voice ----------
VO_TARGET = -16.0  # lands at about -17 after the limiter
voice = np.zeros(N)
vo_mask = np.zeros(N, bool)
clips = [b for b in TL['blocks'] if b['kind'] == 'vo']
raw = {b['id']: load(f"audio-src/ainews0929/vo/{b['id']}.mp3") for b in clips}
gain = amp(VO_TARGET - db(speech_rms(np.concatenate(list(raw.values())))))  # one gain for all clips: same take, same level
for b in clips:
    x = raw[b['id']] * gain
    i = int(b['start'] * SR)
    voice[i:i + len(x)] += x[: N - i]
    vo_mask[i:i + len(x)] = True

# ---------- music: loop the bed, duck under the voice ----------
bed = load('out/ainews0929/sfx/bed.wav')
music = np.tile(bed, N // len(bed) + 1)[:N]
music *= amp(VO_TARGET - 13 - db(rms(bed)))  # under voice: 13 dB below the voice
lift = np.where(vo_mask, 1.0, amp(7))  # gaps (title, stingers, end card): music comes up 7 dB
lift = smooth(lift[::48], 0.25, 0.6)  # follower at 1 kHz, then back to audio rate
lift = np.interp(np.arange(N), np.arange(len(lift)) * 48, lift)
music *= lift
music[-int(2.5 * SR):] *= np.linspace(1, 0, int(2.5 * SR))  # fade with the picture

# ---------- cues: each lands at least 6 dB over the music at its moment ----------
cues = np.zeros(N)
files = {k: load(f'out/ainews0929/sfx/{k}.wav') for k in {c['file'] for c in TL['sfx']}}
report = []
peaks_over = []
for c in TL['sfx']:
    x = files[c['file']]
    body = speech_rms(x, 0.05)  # loudness of the cue's body, not its peak
    i = int(max(0, c['at'] - 6) / FPS * SR)  # starts 6 frames early so the swell peaks on the cut
    under = rms(music[i:i + len(x)])
    over = 8 if c['file'] == 'whoosh' else 11
    x = x * amp(db(under) + over - db(body))
    cues[i:i + len(x)] += x[: N - i]
    report.append(db(speech_rms(x, 0.05)) - db(under))
    peaks_over.append(db(np.abs(x).max()) - db(under))

# ---------- sum, limit to -1 dBFS ----------
mix = voice + music + cues
thr = amp(-1.0)
blk = 240  # 5 ms look-ahead blocks
pad = (-len(mix)) % blk
peaks = np.abs(np.pad(mix, (0, pad))).reshape(-1, blk).max(1)
g = np.minimum(1, thr / np.maximum(peaks, 1e-9))
g = np.minimum(g, np.roll(g, -1))  # reach the gain one block early
g = smooth(g, 0.001, 0.08)
mix *= np.interp(np.arange(N), np.arange(len(g)) * blk + blk / 2, g)[:N]
mix = np.clip(mix, -thr, thr)

with wave.open('out/ainews0929-mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    s = (mix * 32767).astype('<i2')
    w.writeframes(np.stack([s, s], 1).tobytes())

print(f'length        {N / SR:.2f} s')
print(f'voice         {db(speech_rms(mix[vo_mask])):.1f} dBFS RMS (SOP: -16 to -18)')
print(f'music under   {db(rms(music[vo_mask])):.1f} dBFS RMS  ({db(rms(music[vo_mask])) - db(speech_rms(voice[vo_mask])):.1f} dB vs voice)')
print(f'music in gaps {db(rms(music[~vo_mask][: -int(3 * SR)])):.1f} dBFS RMS')
print(f'cues over music: min {min(report):.1f} dB, median {np.median(report):.1f} dB ({len(report)} cues)')
print(f'cue peaks over music: min {min(peaks_over):.1f} dB (SOP: >= 12)')
print(f'master peak   {db(np.abs(mix).max()):.2f} dBFS')
if min(report) < 6 or min(peaks_over) < 12 or db(np.abs(mix).max()) > -0.99:
    sys.exit('mix check failed')
