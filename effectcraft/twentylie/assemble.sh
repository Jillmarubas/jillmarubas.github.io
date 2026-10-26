#!/bin/sh
# Mux each part's picture with its sound mix, join the full film, check flashes and loudness,
# and encode the phone-size review parts. Run after render_all.sh finishes.
set -e
cd "$(dirname "$0")"
M=../../remotion/scripts
[ -f renders/coldopen_mix.wav ] || python3 $M/mix_twentylie_coldopen.py "$PWD/renders/coldopen_mix.wav"
for n in 1 2 3 4; do [ -f renders/chapter${n}_mix.wav ] || python3 $M/mix_twentylie_chapter.py $n "$PWD/renders/chapter${n}_mix.wav"; done
for p in coldopen chapter1 chapter2 chapter3 chapter4; do
  ffmpeg -loglevel error -y -i renders/${p}_video.mp4 -i renders/${p}_mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest renders/${p}_final.mp4
done
printf "file '%s'\n" coldopen_final.mp4 chapter1_final.mp4 chapter2_final.mp4 chapter3_final.mp4 chapter4_final.mp4 > renders/film_list.txt
ffmpeg -loglevel error -y -f concat -safe 0 -i renders/film_list.txt -c:v copy -c:a aac -b:a 192k renders/the20lie_cut1_1080p.mp4
python3 ../../.claude/skills/video-research/scripts/flash_check.py renders/the20lie_cut1_1080p.mp4 | tail -3
ffmpeg -hide_banner -i renders/the20lie_cut1_1080p.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"
python3 $M/review_parts.py renders/review coldopen=renders/coldopen_final.mp4 ch1=renders/chapter1_final.mp4 \
  ch2=renders/chapter2_final.mp4 ch3=renders/chapter3_final.mp4 ch4=renders/chapter4_final.mp4
python3 $M/review_page.py renders/review ../../remotion/src/twentylie/review_meta.json
