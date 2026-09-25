#!/usr/bin/env bash
# Tame the SFX before they go in the mix: no content above 7 kHz (the part that stabs on
# headphones), no sub rumble, and peaks capped at -6 dBFS so a cue can never outshout the voice.
set -euo pipefail
FFMPEG=${1:-ffmpeg}
cd "$(dirname "$0")/../public/audio/sfx"
for s in whoosh impact pop; do
  "$FFMPEG" -loglevel error -y -i "$s.mp3" -af "highpass=f=35,lowpass=f=7000,lowpass=f=7000,alimiter=limit=0.5:level=false" -ar 44100 "$s-soft.wav"
done
ls -la *-soft.wav
