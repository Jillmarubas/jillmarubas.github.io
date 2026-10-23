#!/bin/sh
# Builds one chapter project and saves its mentions list: ./build.sh ch02_tanks
set -e
cd "$(dirname "$0")"
mkdir -p out
effectcraft-cli script "$PWD/$1.jsx" --empty --save-as "$PWD/$1.ecproj" > "out/$1.log" 2>&1 || { tail -5 "out/$1.log"; exit 1; }
grep '^MENTIONS ' "out/$1.log" | sed 's/^MENTIONS //' > "out/$1.mentions.json"
grep -v '^MENTIONS ' "out/$1.log" | tail -2
