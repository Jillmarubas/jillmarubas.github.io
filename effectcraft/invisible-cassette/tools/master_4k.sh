#!/bin/bash
# Final master, step 2: join the 1080p parts from tools/master.sh in film order and upscale to 4K.
# Lanczos upscale with a light sharpen, H.264 High at ~40 Mbps (YouTube's 4K24 SDR guidance), AAC 320k,
# fast start. Output: render/The_Invisible_Cassette_4K.mp4
cd "$(dirname "$0")/.." || exit 1
ORDER="s1 s2 act2 s3 s4 act3 s5 s6 act4 s7 s8 act5 s9 s10"
: > render/master/concat.txt
for p in $ORDER; do
  [ -f "render/master/$p.mov" ] || { echo "missing render/master/$p.mov"; exit 1; }
  echo "file '$PWD/render/master/$p.mov'" >> render/master/concat.txt
done
ffmpeg -y -v error -stats -f concat -safe 0 -i render/master/concat.txt \
  -vf "fps=24,scale=3840:2160:flags=lanczos,unsharp=5:5:0.4:5:5:0.0,format=yuv420p" \
  -c:v libx264 -preset fast -profile:v high -b:v 40M -maxrate 50M -bufsize 80M -g 48 -bf 2 \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 \
  -c:a aac -b:a 320k -ar 48000 -movflags +faststart \
  render/The_Invisible_Cassette_4K.mp4
