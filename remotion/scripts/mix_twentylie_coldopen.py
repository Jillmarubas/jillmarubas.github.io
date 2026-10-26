#!/usr/bin/env python3
"""Sound mix for The $20 Lie cold open (47.5 s). Film times match effectcraft/twentylie/coldopen.jsx.

VO chain: highpass 90 Hz, gentle compression, air shelf. Music is ducked under the VO with
sidechain compression and stops dead at 39.95 s (the "small print" hard stop), then returns
under the title. Every effect sits on the frame of its visual action. Master: two-pass loudnorm
to -14 LUFS / -1 dBTP, 48 kHz.
"""
import json, os, subprocess, sys
R = os.path.join(os.path.dirname(__file__), "..", "src", "twentylie")
A = lambda p: os.path.join(R, "audio", p)
out = sys.argv[1] if len(sys.argv) > 1 else "coldopen_mix.wav"
DUR, VO_AT, STOP, TITLE = 47.5, 0.5, 39.95, 42.8

# (file, film time, gain dB)
sfx = [
    ("sfx/paper_thin.mp3", 7.55, -10),            # cut to the quote on paper
    ("sfx/whoosh_short_soft.mp3", 11.35, -14),    # LOSING MONEY locks in
    ("sfx/paper_thin.mp3", 14.2, -8),             # receipt drops in
    ("sfx/whoosh_short_soft.mp3", 14.65, -12),    # price tag slides in
    ("sfx/cash_register_error.mp3", 19.4, -9),    # cost passes $200
    ("sfx/whoosh_soft_cinematic.mp3", 24.15, -9), # whip pan into the receipts
    ("sfx/paper_thin.mp3", 24.75, -12),
    ("sfx/paper_thin.mp3", 25.1, -13),
    ("sfx/receipt_printer.mp3", 28.05, -12),      # the receipt prints
    ("sfx/whoosh_short_soft.mp3", 32.15, -15),    # red ink circle
    ("sfx/receipt_printer.mp3", 35.05, -11),      # the printer won't stop...
    ("sfx/receipt_printer.mp3", 36.9, -9),
    ("sfx/receipt_printer.mp3", 38.3, -7),
    ("sfx/riser_cinematic.mp3", 39.55, -12),      # peaks on the hard stop
    ("sfx/paper_thin.mp3", 39.95, -14),           # magnifier slides in, in silence
    ("sfx/riser_cinematic.mp3", 42.4, -10),
    ("sfx/deep_cinematic_doc.mp3", 42.8, -4),     # title impact
]
inputs = ["-i", os.path.join(R, "vo", "coldopen_takeA_tight.mp3"), "-i", A("music/unease_beneath_the_surface.mp3")]
for f, _, _ in sfx: inputs += ["-i", A(f)]
fc = []
ms = lambda t: int(round(t * 1000))
fc.append(f"[0:a]aresample=48000,highpass=f=90,acompressor=threshold=-20dB:ratio=3:attack=10:release=150,"
          f"highshelf=f=8000:g=2,adelay={ms(VO_AT)}:all=1,apad,atrim=0:{DUR},asplit=2[vo][vokey]")
# Music: bed under the VO until the hard stop, back at full under the title (from the track's 60 s mark).
fc.append(f"[1:a]aresample=48000,asplit=2[m1][m2]")
fc.append(f"[m1]atrim=0:{STOP},afade=t=in:d=1.5,volume=-14dB,equalizer=f=2500:t=q:w=1:g=-4,apad,atrim=0:{DUR}[bed]")
fc.append(f"[bed][vokey]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=300[bedd]")
fc.append(f"[m2]atrim=60:{60 + DUR - TITLE},asetpts=PTS-STARTPTS,afade=t=in:d=0.3,afade=t=out:st={DUR - TITLE - 0.8}:d=0.8,"
          f"volume=-9dB,adelay={ms(TITLE)}:all=1,apad,atrim=0:{DUR}[tm]")
labels = []
for i, (f, t, g) in enumerate(sfx):
    fc.append(f"[{i + 2}:a]aresample=48000,volume={g}dB,adelay={ms(t)}:all=1,apad,atrim=0:{DUR}[s{i}]")
    labels.append(f"[s{i}]")
fc.append("[vo][bedd][tm]" + "".join(labels) + f"amix=inputs={3 + len(sfx)}:normalize=0[mix]")
graph = ";".join(fc)
tmp = out + ".pre.wav"
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *inputs, "-filter_complex", graph, "-map", "[mix]", "-ac", "2", "-ar", "48000", tmp], check=True)
m = subprocess.run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
j = json.loads(m[m.rindex("{"):m.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", ln, "-ar", "48000", out], check=True)
os.remove(tmp)
print("wrote", out)
