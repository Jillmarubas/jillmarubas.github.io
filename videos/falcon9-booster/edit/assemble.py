#!/usr/bin/env python3
"""Assembles chapter renders, chapter cards, the paced voiceover and the music bed into one film.

    python3 edit/assemble.py --parts 00_cold_open,card01,01_giant,card02,02_tanks --res 540 --out out/review.mp4

Video: effectcraft/falcon9/out/<part>_<res>.mp4 (chapters) and out/card<NN>_<res>.mp4 (cards), cut end to end.
Audio (48 kHz):
- voiceover: edit/out/<chapter>.wav, starting with its chapter (same length as the chapter render);
- music: edit/music.wav looped/trimmed, ducked under the voice with sidechain compression, swelling on the
  cards (music-only beats), faded in and out;
- master: two-pass linear loudnorm to -14 LUFS, -1 dBTP.
Also writes <out>.timeline.json: each part's start, end and the words spoken (for the review room).
"""
import argparse, json, pathlib, subprocess

ROOT = pathlib.Path(__file__).resolve().parent
EC = ROOT.parents[2] / 'effectcraft' / 'falcon9' / 'out'
ap = argparse.ArgumentParser()
ap.add_argument('--parts', required=True)
ap.add_argument('--res', default='540')
ap.add_argument('--out', required=True)
ap.add_argument('--music', default=str(ROOT / 'music.wav'))
ap.add_argument('--music-db', type=float, default=-21.0, help='music level under the voice before ducking')
args = ap.parse_args()

def dur(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)], capture_output=True, text=True, check=True).stdout)

parts, t = [], 0.0
for p in args.parts.split(','):
    v = EC / f'{p}_{args.res}.mp4'
    d = dur(v)
    vo = ROOT / 'out' / f'{p}.wav'
    timing = ROOT / 'out' / f'{p}.timing.json'
    words = json.load(open(timing))['words'] if timing.exists() else []
    # Shot cuts inside the chapter, from the EffectCraft build log ("CUTS [...]", chapter seconds).
    cuts, log = [], EC / f'ch{p}.log'
    if not log.exists():
        log = EC / f"ch{p.replace('07a_', '07_')}.log"  # chapter 7a is built as ch07_math
    if log.exists():
        for ln in log.read_text().splitlines():
            if ln.startswith('CUTS '):
                cuts = [round(t + c, 3) for c in json.loads(ln[5:])]
    parts.append({'name': p, 'video': str(v), 'start': round(t, 3), 'end': round(t + d, 3), 'vo': str(vo) if vo.exists() else None, 'cuts': cuts,
                  'words': [{'w': x['w'], 's': round(x['s'] + t, 3), 'e': round(x['e'] + t, 3)} for x in words]})
    t += d
total = t
print(f'{len(parts)} parts, {total:.2f} s')

out = pathlib.Path(args.out)
tmp = out.with_suffix('')
# 1. Picture: concatenate (all parts share size and frame rate).
lst = tmp.with_name(tmp.name + '_list.txt')
lst.write_text(''.join(f"file '{p['video']}'\n" for p in parts))
pic = tmp.with_name(tmp.name + '_pic.mp4')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(lst), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-an', str(pic)], check=True)

# 2. Voice track: each chapter's VO at its start.
inputs, filt, labels = [], [], []
for i, p in enumerate([p for p in parts if p['vo']]):
    inputs += ['-i', p['vo']]
    filt.append(f'[{i}:a]aresample=48000,highpass=f=90,acompressor=threshold=0.125:ratio=2.5:attack=8:release=120,equalizer=f=9000:t=h:w=4000:g=2,adelay={int(p["start"] * 1000)}|{int(p["start"] * 1000)}[v{i}]')
    labels.append(f'[v{i}]')
nvo = len(labels)
filt.append(''.join(labels) + f'amix=inputs={nvo}:normalize=0,apad=whole_dur={total:.3f},atrim=0:{total:.3f}[vo]')
# 3. Music: loop to length, dip the voice band, duck under the voice, fade in/out.
music = pathlib.Path(args.music)
if music.exists():
    inputs += ['-stream_loop', '-1', '-i', str(music)]
    m = nvo
    filt.append(f'[vo]asplit=2[vo1][vosc]')
    filt.append(f'[{m}:a]aresample=48000,atrim=0:{total:.3f},volume={args.music_db}dB,equalizer=f=2200:t=q:w=1.2:g=-4,'
                f'afade=t=in:d=2.5,afade=t=out:st={max(0, total - 4):.3f}:d=4[mus]')
    filt.append('[mus][vosc]sidechaincompress=threshold=0.04:ratio=6:attack=25:release=450:makeup=1[duck]')
    filt.append('[vo1][duck]amix=inputs=2:normalize=0[mix]')
else:
    print('no music bed found, voice only')
    filt.append('[vo]anull[mix]')
pre = tmp.with_name(tmp.name + '_pre.wav')
# A gentle peak limiter, so the linear loudness pass can reach -14 LUFS without hitting the -1 dBTP ceiling.
filt.append('[mix]alimiter=level_in=1.6:limit=0.56:attack=4:release=60:level=0[lim]')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[lim]', '-ar', '48000', '-c:a', 'pcm_s24le', str(pre)], check=True)

# 4. Loudness: measure, apply the gain that lands -14 LUFS, then a true-peak limiter at -1.2 dBTP. Measure
# again and correct once (the limiter takes a little off the top).
def measure(f):
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(f), '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True)
    return json.loads(r.stderr[r.stderr.rindex('{'):])
gain = -14 - float(measure(pre)['input_i'])
fin = tmp.with_name(tmp.name + '_fin.wav')
for _ in range(6):
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(pre), '-af', f'volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.84:attack=1:release=60:level=0,aresample=48000',
                    '-c:a', 'pcm_s24le', str(fin)], check=True)
    m = measure(fin)
    print(f"loudness {float(m['input_i']):.1f} LUFS, true peak {float(m['input_tp']):.1f} dBTP")
    if abs(float(m['input_i']) + 14) < 0.3:
        break
    gain += 1.3 * (-14 - float(m["input_i"]))  # the limiter eats part of each step
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(pic), '-i', str(fin), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', str(out)], check=True)
fin.unlink()
json.dump({'duration': round(total, 3), 'fps': 30, 'parts': parts}, open(str(out) + '.timeline.json', 'w'), indent=0)
for f in (lst, pic, pre):
    f.unlink()
print('wrote', out)
