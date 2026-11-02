#!/bin/bash
# Usage: tools/render_scene.sh <name> <comp> [mix.wav]  -> render/<name>-half.mp4 (+ -av.mp4 with the mix)
cd "$(dirname "$0")/.." || exit 1
N=$1; C=$2; MIX=$3
EC=/opt/ec/effectcraft-0.18.0-linux-x86_64/bin/effectcraft-cli
$EC script "$PWD/$N.jsx" --empty --save-as "$PWD/$N.ecproj" 2>&1 | grep -v '^{' | tail -2
$EC $N.ecproj render --comp "$C" --out "$PWD/render/$N-half.mp4" --format h264 --resolution half --audio off 2>&1 | tail -1
if [ -n "$MIX" ]; then ffmpeg -y -v error -i render/$N-half.mp4 -i "$MIX" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest render/$N-half-av.mp4 && echo "muxed render/$N-half-av.mp4"; fi
