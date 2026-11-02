#!/bin/bash
# Build every scene project and the act cards; save each scene's sound events (paper slides, stamps,
# drops, pins, impacts, story turns) to events.json for remotion/scripts/ic_cues.py.
# Usage: tools/build_all.sh [scene numbers...]   (default: 1-10 and acts)
cd "$(dirname "$0")/.." || exit 1
EC=/opt/ec/effectcraft-0.18.0-linux-x86_64/bin/effectcraft-cli
LIST=${@:-"1 2 3 4 5 6 7 8 9 10 acts"}
for n in $LIST; do
  f=s$n; [ "$n" = acts ] && f=acts
  $EC script "$PWD/$f.jsx" --empty --save-as "$PWD/$f.ecproj" 2>&1 | grep -v '^{' > "/tmp/build_$f.log"
  grep -q "^saved" "/tmp/build_$f.log" || { echo "FAILED $f"; tail -5 "/tmp/build_$f.log"; continue; }
  grep "^EVENTS" "/tmp/build_$f.log" | head -1
done | python3 -c '
import json, sys, os
p = "events.json"; ev = json.load(open(p)) if os.path.exists(p) else {}
for line in sys.stdin:
    if line.startswith("EVENTS"):
        _, n, rest = line.split(" ", 2); ev[n] = json.loads(rest)
    else: print(line, end="")
json.dump(ev, open(p, "w"), indent=0); print("events.json:", {k: len(v) for k, v in sorted(ev.items(), key=lambda kv: int(kv[0]))})'
