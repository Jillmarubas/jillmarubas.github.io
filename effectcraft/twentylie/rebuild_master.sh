#!/bin/sh
# Rebuild The $20 Lie from the repo in a fresh cloud session, then make the 4K master and upload it.
# Needs: network access to github.com (EffectCraft), d8j0ntlcm91z4.cloudfront.net (Higgsfield images),
# and valid AWS keys in the environment for the upload. Everything else is in the repo.
set -e
cd "$(dirname "$0")"
if ! command -v effectcraft-cli >/dev/null; then
  mkdir -p ~/ec && cd ~/ec
  curl -sSfL -O https://github.com/storytold/effectcraft/releases/download/v0.17.0/SHA256SUMS.txt
  curl -sSfL -O https://github.com/storytold/effectcraft/releases/download/v0.17.0/effectcraft-0.17.0-linux-x86_64.tar.gz
  grep linux-x86_64.tar.gz SHA256SUMS.txt | sha256sum -c && mkdir -p app && tar -xzf effectcraft-0.17.0-linux-x86_64.tar.gz -C app
  ln -sf ~/ec/app/effectcraft-0.17.0-linux-x86_64/bin/effectcraft-cli /usr/local/bin/effectcraft-cli
  cd - >/dev/null
fi
pip install -q fonttools brotli boto3 numpy 2>/dev/null || true
mkdir -p ~/.fonts && python3 -c "
from fontTools.ttLib import TTFont; import os
for f, o in [('Fraunces-900-normal.woff2', 'Fraunces-Black.ttf'), ('Fraunces-600-normal.woff2', 'Fraunces-SemiBold.ttf'), ('Fraunces-600-italic.woff2', 'Fraunces-SemiBoldItalic.ttf'), ('IBMPlexMono-500-normal.woff2', 'IBMPlexMono-Medium.ttf'), ('IBMPlexMono-400-normal.woff2', 'IBMPlexMono-Regular.ttf')]:
    t = TTFont('../../remotion/public/fonts/' + f); t.flavor = None; t.save(os.path.expanduser('~/.fonts/' + o))" && fc-cache -f
../../remotion/src/twentylie/fetch_assets.sh
mkdir -p assets && for f in ../../remotion/src/twentylie/images/*.png ../../remotion/src/twentylie/people/P*.png; do ln -sf "$(realpath "$f")" assets/; done
mkdir -p renders
for p in coldopen chapter1 chapter2 chapter3 chapter4; do
  effectcraft-cli script "$PWD/$p.jsx" --empty --save-as "$PWD/$p.ecproj" >/dev/null
done
./render_all.sh
./assemble.sh
cd renders
args=""; fc=""; i=0
for p in coldopen chapter1 chapter2 chapter3 chapter4; do
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 ${p}_video.mp4)
  args="$args -i ${p}_mix.wav"; fc="$fc[$i:a]atrim=0:$d,asetpts=PTS-STARTPTS[a$i];"; i=$((i+1))
done
ffmpeg -loglevel error -y $args -filter_complex "${fc}[a0][a1][a2][a3][a4]concat=n=5:v=0:a=1[out]" -map "[out]" -ar 48000 film_audio.wav
M=$(ffmpeg -hide_banner -i film_audio.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | python3 -c "import sys,json; t=sys.stdin.read(); j=json.loads(t[t.rindex('{'):t.rindex('}')+1]); print(f\"measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}\")")
ffmpeg -loglevel error -y -i film_audio.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:$M:linear=true" -ar 48000 film_audio_master.wav
sh ../master4k.sh
python3 ../upload_s3.py the20lie_master_4k.mp4
