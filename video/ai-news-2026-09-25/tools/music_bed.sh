#!/usr/bin/env bash
# Loop the 30 s music clip to the video's length and duck it under the voice with a sidechain
# compressor, so the bed lifts in the gaps between stories and sits back while Joey talks.
set -euo pipefail
FFMPEG=${1:-ffmpeg}
cd "$(dirname "$0")/.."
DUR=$(python3 -c "import json;print(json.load(open('src/data/timeline.json'))['duration'])")
"$FFMPEG" -loglevel error -y -stream_loop -1 -i public/audio/music-loop.mp3 -i public/audio/vo-spaced.wav -filter_complex "
[0:a]atrim=0:${DUR},asetpts=N/SR/TB,aresample=44100,volume=0.42[m];
[1:a]aresample=44100,aformat=channel_layouts=stereo,volume=2[sc];
[m][sc]sidechaincompress=threshold=0.02:ratio=6:attack=25:release=400:makeup=1[duck];
[duck]afade=t=in:d=0.6,afade=t=out:st=$(python3 -c "print(${DUR}-2.6)"):d=2.6[out]" -map "[out]" -c:a pcm_s16le public/audio/music-bed.wav
echo "music bed: ${DUR}s"
