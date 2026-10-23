#!/bin/sh
# Builds (where asked), renders at 960x540 and QCs each chapter of the first review batch, then the cards.
cd "$(dirname "$0")"
Q=../../.claude/skills/video-research/scripts
for c in "$@"; do
  name=${c%%:*}; comp=${c#*:}; short=$(echo "$name" | sed 's/^ch//')
  [ -n "$BUILD" ] && ./build.sh "$name"
  effectcraft-cli render "$name.ecproj" --comp "$comp" --out "$PWD/out/${short}_540.mp4" --format h264 --resolution half --progress 2> "out/render_$name.log" || { echo "RENDER FAILED $name"; continue; }
  cuts=$(grep '^CUTS' "out/$name.log" | sed 's/CUTS \[//; s/\]//')
  echo "== QC $short"
  python3 $Q/frame_qc.py "out/${short}_540.mp4" --mentions "out/$name.mentions.json" --cuts "$cuts" --sheet "out/qc_$short.png" | grep -E "MISS|pop|spike|blank|sync:|RESULT"
  python3 $Q/flicker_check.py "out/${short}_540.mp4" --map "out/flicker_$short.png" | grep -E "FLICKER|RESULT"
  python3 $Q/flash_check.py "out/${short}_540.mp4" | tail -1
done
echo BATCH DONE
