#!/bin/bash
# Builds the HyperFrames version into a project folder: bash build.sh <hyperframes-project-dir>
# The project comes from: npx hyperframes@0.8.185 init <dir> --example blank
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
REM="$HERE/../../.."
DST="$1"
mkdir -p "$DST/assets/fonts"
"$REM/node_modules/.bin/esbuild" "$HERE/host.ts" --bundle --format=esm --target=es2020 --resolve-extensions=.ts,.js --minify --outfile="$DST/assets/cutaway.js"
cp "$HERE/index.html" "$DST/index.html"
cp "$REM/public/cutaway/compressor_sfx.wav" "$REM/public/demo25d/grain.png" "$DST/assets/"
cp "$REM/node_modules/gsap/dist/gsap.min.js" "$DST/assets/" 2>/dev/null || curl -sSL https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js -o "$DST/assets/gsap.min.js"
for f in inter/files/inter-latin-500-normal inter/files/inter-latin-700-normal inter/files/inter-latin-800-normal fraunces/files/fraunces-latin-400-italic; do
  cp "$REM/node_modules/@fontsource/$f.woff2" "$DST/assets/fonts/"
done
echo "built $DST"
