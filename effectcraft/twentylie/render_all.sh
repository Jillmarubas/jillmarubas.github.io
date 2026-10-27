#!/bin/sh
# Render every part of the film (resumable: finished chunks are skipped). Run after a restart.
cd "$(dirname "$0")"
./render_chunks.sh coldopen ColdOpen 47.5
./render_chunks.sh chapter1 Chapter1 95.095
./render_chunks.sh chapter2 Chapter2 109.19241666666667
./render_chunks.sh chapter3 Chapter3 111.31954166666667
./render_chunks.sh chapter4 Chapter4 119.41095833333334
echo FILM PARTS DONE
