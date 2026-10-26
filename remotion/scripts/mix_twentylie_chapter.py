#!/usr/bin/env python3
"""Sound mix for one chapter of The $20 Lie. Film times match effectcraft/twentylie/chapterN.jsx:
a 12.3 s music-only chapter card, then the voice-over (take A, pauses tightened) from VO0.

    python3 mix_twentylie_chapter.py 3 out.wav

Same chain as the cold open: VO highpass + compression + air; music ducked under the VO by
sidechain compression; effects on the frames of their actions; at most ~5 kinds of sound at once.
The chapter is normalised to -14 LUFS here only for previewing; the full film is normalised again
as one piece when it is assembled.
"""
import json, os, subprocess, sys
import numpy as np

N = int(sys.argv[1]); OUT = sys.argv[2]
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "src", "twentylie")
A = lambda p: os.path.join(R, "audio", p)
TL = [(l["start"], l["end"]) for l in json.load(open(os.path.join(R, f"timing_ch{N}.json")))["lines"]]
VO0 = 12.3
TAIL = {1: 1.4, 2: 1.4, 3: 1.4, 4: 2.6}[N]
DUR = VO0 + TL[-1][1] + TAIL
def L(i, f=0.0): return VO0 + TL[i][0] + f * (TL[i][1] - TL[i][0])   # film time inside line i
def S(i): return VO0 + max(0.0, TL[i][0] - 0.1)                         # shot start on line i

PAPER, WSOFT, WHIP, HIT, RISE = "sfx/paper_thin.mp3", "sfx/whoosh_short_soft.mp3", "sfx/whoosh_soft_cinematic.mp3", "sfx/deep_cinematic_doc.mp3", "sfx/riser_cinematic.mp3"
PRINT, REG, TICK = "sfx/receipt_printer.mp3", "sfx/cash_register_error.mp3", "sfx/clock_tick_deep.mp3"
UNEASE, RESOLVE = "music/unease_beneath_the_surface.mp3", "music/dual_motif_resolve.mp3"

# Chapter card (same on every chapter): strip slides in, title pops, marker underline, out.
card = [(PAPER, 0.05, -9), (PRINT, 0.15, -16), (WSOFT, 1.25, -13), (PAPER, 2.0, -15), (WHIP, VO0 - 0.45, -12)]
stampfx = lambda t: [(HIT, t, -17), (PAPER, t, -11)]

# music: (file, source start s, film start, film end, fade in, fade out, card level dB, bed level dB)
if N == 1:
    music = [(RESOLVE, 0, 0, DUR - 0.9, 1.0, 0.05, -9, -18)]
    sfx = card + stampfx(VO0 + 0.15) + [
        (WSOFT, L(0, 0.27), -16), (WSOFT, L(1, 0.62), -12), (PAPER, L(2, 0.45), -14), (PAPER, L(2, 0.72), -14),
        (WSOFT, L(3, 0.05), -14), (PAPER, S(4), -13), (WHIP, S(5), -11), (PAPER, L(6, 0.45), -15), (PAPER, L(7, 0.1), -16),
        (WSOFT, S(8), -15), (PAPER, L(9, 0.15), -10), (WSOFT, L(11, 0.62), -14), (HIT, L(12, 0.88), -16),
        (RISE, DUR - 0.9 - 0.45, -12), (HIT, DUR - 0.9, -5)]
elif N == 2:
    music = [(UNEASE, 30, 0, L(15, 0.75), 1.0, 0.05, -9, -18)]
    sfx = card + stampfx(VO0 + 0.15) + [
        (WSOFT, L(0, 0.45), -12), (WHIP, S(1), -12), (PAPER, L(2, 0.1), -15), (PAPER, S(3), -12),
        (WHIP, L(4, 0.6), -11), (WSOFT, L(5, 0.3), -16)] + stampfx(S(7) + 0.2) + [
        (WSOFT, L(7, 0.18) + 0.3, -12), (WHIP, L(7, 0.52), -13), (TICK, S(8), -11), (TICK, S(8) + 10, -16)] + stampfx(S(9) + 0.15) + [
        (REG, L(10, 0.85), -12), (PAPER, L(11, 0.55), -13), (WSOFT, L(12, 0.45), -15), (HIT, L(12, 0.82), -8),
        (PAPER, L(13, 0.45), -15), (RISE, L(15, 0.75) - 0.45, -12), (HIT, L(15, 0.75), -3)]
elif N == 3:
    music = [(UNEASE, 120, 0, L(9, 0.0) + 1.5, 1.0, 3.0, -9, -18)]
    sfx = card + stampfx(VO0 + 0.15) + [
        (WSOFT, L(0, 0.3) + 0.25, -12), (WHIP, L(1, 0.42), -12), (PRINT, L(2, 0.7), -10), (REG, L(2, 0.7) + 0.35, -11)] + \
        stampfx(L(2, 0.7) + 0.35) + [(PAPER, S(3) + 0.15 + 0.25 * k, -12 - k) for k in range(5)] + [
        (PAPER, L(4, 0.3), -14), (HIT, L(4, 0.85), -17), (WSOFT, S(5) + 0.25, -12)] + stampfx(S(6) + 0.15) + [
        (WSOFT, L(6, 0.45), -13)] + stampfx(L(7, 0.85)) + [(PAPER, L(8, 0.55), -14), (HIT, L(9, 0.35), -8),
        (WSOFT, S(10) + 0.1, -13), (WSOFT, L(10, 0.75), -13), (PAPER, L(11, 0.3), -13), (PAPER, S(12) + 0.2, -12),
        (RISE, DUR - 0.6 - 0.45, -11), (HIT, DUR - 0.6, -5)]
else:
    music = [(UNEASE, 200, 0, S(12) + 0.3, 1.0, 0.6, -9, -19),
             (RESOLVE, 40, S(12) - 0.3, L(15, 0.0), 0.6, 1.5, -18, -18),
             (UNEASE, 90, S(19), DUR - 0.5, 2.0, 2.5, -20, -20)]
    sfx = card + [(WSOFT, L(0, 0.2), -15), (WSOFT, L(0, 0.72), -15), (WHIP, S(2), -12), (PAPER, L(2, 0.35), -15),
        (PAPER, L(3, 0.6), -14), (WSOFT, S(4) + 0.1, -15), (HIT, L(7, 0.35), -16),
        (WSOFT, L(8, 0.42), -14), (WSOFT, L(8, 0.62), -14), (WSOFT, L(8, 0.82), -14), (REG, L(9, 0.55), -14),
        (PRINT, S(10) + 0.2, -15), (PAPER, L(11, 0.72), -14), (PAPER, L(18, 0.45), -9),
        (WSOFT, L(19, 0.62), -15), (PAPER, S(20) + 0.2, -14)]

# Shepard tone (chapter 3): an endlessly rising pitch from "Then, in September" up to "Read that again".
shep = None
if N == 3:
    a, b, sr = L(9, 0.0), L(14, 0.0), 48000
    t = np.arange(int((b - a) * sr)) / sr
    out = np.zeros_like(t)
    for k in range(7):
        pos = (k + t / 6.0) % 7                       # each voice climbs one octave every 6 s
        f = 55 * 2 ** pos
        env = np.exp(-0.5 * ((pos - 3.5) / 1.3) ** 2)  # fade at the top and bottom of the range
        out += env * np.sin(2 * np.pi * np.cumsum(f) / sr)
    out *= np.linspace(0.15, 1.0, len(t)) ** 1.5     # it grows as the tension builds
    out[-int(0.02 * sr):] *= np.linspace(1, 0, int(0.02 * sr))  # cut dead on "Read that again"
    out = (out / np.max(np.abs(out)) * 0.5 * 32767).astype(np.int16)
    shep = OUT + ".shepard.wav"
    import wave
    with wave.open(shep, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(out.tobytes())
# Final tone (chapter 4): the music fades out to one quiet tone under the last question.
tone = None
if N == 4:
    a, sr = L(20, 0.0), 48000
    t = np.arange(int((DUR - a) * sr)) / sr
    env = np.minimum(1, t / 1.5) * np.clip((DUR - a - t) / 2.0, 0, 1)
    out = (env * (np.sin(2 * np.pi * 110 * t) + 0.3 * np.sin(2 * np.pi * 220 * t)) * 0.25 * 32767).astype(np.int16)
    tone = OUT + ".tone.wav"
    import wave
    with wave.open(tone, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(out.tobytes())

ms = lambda x: int(round(x * 1000))
inputs = ["-i", os.path.join(R, "vo", f"ch{N}_takeA_tight.mp3")]
fc = [f"[0:a]aresample=48000,highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=10:release=150,"
      f"highshelf=f=8000:g=2,adelay={ms(VO0)}:all=1,apad,atrim=0:{DUR},asplit={len(music) + 1}[vo]" + "".join(f"[k{i}]" for i in range(len(music)))]
mix = ["[vo]"]
for i, (f, src, s, e, fi, fo, lc, lb) in enumerate(music):
    n = len(inputs) // 2; inputs += ["-i", A(f)]
    seg = e - s
    # Card level until the voice starts, bed level after; the bed is ducked under the voice.
    vol = f"volume='if(lt(t+{s},{VO0}),{10 ** (lc / 20):.4f},{10 ** (lb / 20):.4f})':eval=frame"
    fc.append(f"[{n}:a]aresample=48000,atrim={src}:{src + seg},asetpts=PTS-STARTPTS,afade=t=in:d={fi},"
              f"afade=t=out:st={max(0, seg - fo)}:d={fo},{vol},equalizer=f=2500:t=q:w=1:g=-4,adelay={ms(s)}:all=1,apad,atrim=0:{DUR}[m{i}]")
    fc.append(f"[m{i}][k{i}]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[md{i}]")
    mix.append(f"[md{i}]")
for extra, gain in ((shep, -14), (tone, -20)):
    if extra:
        n = len(inputs) // 2; inputs += ["-i", extra]
        start = L(9, 0.0) if extra == shep else L(20, 0.0)
        fc.append(f"[{n}:a]volume={gain}dB,adelay={ms(start)}:all=1,apad,atrim=0:{DUR}[x{n}]"); mix.append(f"[x{n}]")
for j, (f, t, g) in enumerate(sfx):
    n = len(inputs) // 2; inputs += ["-i", A(f)]
    fc.append(f"[{n}:a]aresample=48000,volume={g}dB,adelay={ms(max(0, t))}:all=1,apad,atrim=0:{DUR}[s{j}]"); mix.append(f"[s{j}]")
fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0[mixed]")
tmp = OUT + ".pre.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[mixed]", "-ac", "2", "-ar", "48000", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", ln, "-ar", "48000", OUT], check=True)
for f in (tmp, shep, tone):
    if f and os.path.exists(f): os.remove(f)
print(f"wrote {OUT} ({DUR:.2f} s)")
