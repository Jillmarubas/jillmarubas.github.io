#!/bin/bash
# Final master, step 1: render parts at full 1080p (high bitrate) with their mixes into render/master/<part>.mov.
# Usage: tools/master.sh "s3 Scene3 mix/s3.wav 183.33" "acts:Act2 act2 mix/c1.wav 15" ...
#   (queue.sh's job format plus the part's length in seconds)
# Resumable: each part renders in 45 s chunks (--end is exclusive, so chunks join frame-exactly); a finished
# chunk is kept, so a stopped run picks up at the next chunk. Step 2 is tools/master_4k.sh.
cd "$(dirname "$0")/.." || exit 1
EC=/opt/ec/effectcraft-0.18.0-linux-x86_64/bin/effectcraft-cli
MIXD=../../remotion/out/invisible-cassette
CH=45
mkdir -p render/master
declare -A built
for job in "$@"; do
  set -- $job; spec=$1; out=$2; mix=$3; len=$4
  proj=${spec%%:*}; comp=${spec#*:}; [ "$proj" = "$spec" ] && comp=$out && out=$proj
  [ -f "render/master/$out.mov" ] && { echo "have $out"; continue; }
  if [ -z "${built[$proj]}" ]; then $EC script "$PWD/$proj.jsx" --empty --save-as "$PWD/$proj.ecproj" 2>&1 | grep -v '^{' | tail -1; built[$proj]=1; fi
  n=$(python3 -c "import math; print(math.ceil($len / $CH))")
  : > render/master/$out-chunks.txt
  for ((k = 0; k < n; k++)); do
    a=$((k * CH)); b=$(python3 -c "print(min($len, $(((k + 1) * CH))))")
    f=render/master/$out-c$(printf %02d $k).mp4
    echo "file '$PWD/$f'" >> render/master/$out-chunks.txt
    [ -f "$f" ] && continue
    $EC $proj.ecproj render --comp "$comp" --out "$PWD/$f.part.mp4" --format h264 --resolution full --quality best --audio off \
      --bitrate 30000 --start $a --end $b 2>&1 | tail -1
    [ -s "$f.part.mp4" ] && mv "$f.part.mp4" "$f" || { echo "FAILED $out chunk $k"; exit 1; }
  done
  ffmpeg -y -v error -f concat -safe 0 -i render/master/$out-chunks.txt -i $MIXD/$mix -map 0:v -map 1:a -c:v copy -c:a pcm_s16le \
    -shortest render/master/$out.mov && rm -f render/master/$out-c*.mp4 render/master/$out-chunks.txt && echo "done $out"
done
