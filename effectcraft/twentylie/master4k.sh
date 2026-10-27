#!/bin/sh
# Final 4K master: the 1080p picture upscaled (lanczos + light sharpening, per CLAUDE.md:
# work in 1080p, upscale the final), with the master audio at -14 LUFS / -1 dBTP.
cd "$(dirname "$0")/renders"
ffmpeg -loglevel error -y -i the20lie_cut1_1080p.mp4 -i film_audio_master.wav -map 0:v -map 1:a \
  -vf "scale=3840:2160:flags=lanczos,unsharp=5:5:0.35:5:5:0" -c:v libx264 -preset medium -crf 15 \
  -profile:v high -pix_fmt yuv420p -r 24000/1001 -c:a aac -b:a 320k -movflags +faststart -shortest \
  the20lie_master_4k.mp4.tmp.mp4 && mv the20lie_master_4k.mp4.tmp.mp4 the20lie_master_4k.mp4 && echo MASTER DONE
