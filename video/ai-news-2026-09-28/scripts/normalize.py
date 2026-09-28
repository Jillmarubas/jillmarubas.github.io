"""Loudness-normalise every raw ElevenLabs take in data/vo-raw/ to -16 LUFS / -1.5 dBTP
(two-pass linear loudnorm) and write it to public/vo/. Takes already done are skipped.
    python3 scripts/normalize.py"""
import glob, json, os, re, subprocess

for src in sorted(glob.glob("data/vo-raw/*.mp3")):
    dst = "public/vo/" + os.path.basename(src)
    if os.path.exists(dst):
        continue
    probe = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json",
                            "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(re.findall(r"\{[^{}]+\}", probe)[-1])
    af = (f"loudnorm=I=-16:TP=-1.5:LRA=11:linear=true:measured_I={m['input_i']}:measured_TP={m['input_tp']}"
          f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}")
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", src, "-af", af, "-ar", "44100",
                    "-c:a", "libmp3lame", "-b:a", "192k", dst], check=True)
    print(f"{os.path.basename(src)}: {m['input_i']} LUFS -> -16")
