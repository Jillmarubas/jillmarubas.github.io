#!/bin/bash
# Usage: tools/queue.sh "s3 Scene3 mix/s3.wav" "acts:Act2 Act2 mix/c1.wav" ...   renders jobs one after another
# A job "proj:comp out mix" renders comp from proj.jsx into render/<out>-half(-av).mp4 (proj built once).
cd "$(dirname "$0")/.." || exit 1
EC=/opt/ec/effectcraft-0.18.0-linux-x86_64/bin/effectcraft-cli
MIXD=../../remotion/out/invisible-cassette
declare -A built
for job in "$@"; do
  set -- $job; spec=$1; out=$2; mix=$3
  proj=${spec%%:*}; comp=${spec#*:}; [ "$proj" = "$spec" ] && comp=$out && out=$proj
  if [ -z "${built[$proj]}" ]; then $EC script "$PWD/$proj.jsx" --empty --save-as "$PWD/$proj.ecproj" 2>&1 | grep -v '^{' | tail -1; built[$proj]=1; fi
  $EC $proj.ecproj render --comp "$comp" --out "$PWD/render/$out-half.mp4" --format h264 --resolution half --audio off --bitrate 6000 2>&1 | tail -1
  ffmpeg -y -v error -i render/$out-half.mp4 -i $MIXD/$mix -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest render/$out-half-av.mp4 && rm -f render/$out-half.mp4 && echo "done $out"
done
