#!/bin/bash
# Final master, step 1: render parts at full 1080p (high bitrate) with their mixes into render/master/.
# Usage: tools/master.sh "s3 Scene3 mix/s3.wav" "acts:Act2 act2 mix/c1.wav" ...   (same job format as queue.sh)
# Step 2 is tools/master_4k.sh: join the parts in film order and upscale to 3840x2160.
cd "$(dirname "$0")/.." || exit 1
EC=/opt/ec/effectcraft-0.18.0-linux-x86_64/bin/effectcraft-cli
MIXD=../../remotion/out/invisible-cassette
mkdir -p render/master
declare -A built
for job in "$@"; do
  set -- $job; spec=$1; out=$2; mix=$3
  proj=${spec%%:*}; comp=${spec#*:}; [ "$proj" = "$spec" ] && comp=$out && out=$proj
  if [ -z "${built[$proj]}" ]; then $EC script "$PWD/$proj.jsx" --empty --save-as "$PWD/$proj.ecproj" 2>&1 | grep -v '^{' | tail -1; built[$proj]=1; fi
  $EC $proj.ecproj render --comp "$comp" --out "$PWD/render/master/$out-v.mp4" --format h264 --resolution full --quality best --audio off --bitrate 30000 2>&1 | tail -1
  ffmpeg -y -v error -i render/master/$out-v.mp4 -i $MIXD/$mix -map 0:v -map 1:a -c:v copy -c:a pcm_s16le -shortest render/master/$out.mov \
    && rm -f render/master/$out-v.mp4 && echo "done $out"
done
