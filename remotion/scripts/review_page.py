#!/usr/bin/env python3
"""Build the review page from review/page.html and a manifest made by scripts/review_parts.py.

Writes <dir>/index.html (the manifest inlined) and prints the preview files in publish batches: the Artifact tool
takes at most 64 MB per publish, so each batch stays under BATCH_MB and later batches add to the same page.

Usage: python3 scripts/review_page.py out/review/hcai
"""
import json, os, sys

BATCH_MB = 60
root = os.path.join(os.path.dirname(__file__), '..')
d = sys.argv[1]
m = json.load(open(os.path.join(d, 'manifest.json')))
page = open(os.path.join(root, 'review/page.html')).read().replace('__MANIFEST__', json.dumps(m, separators=(',', ':')))
open(os.path.join(d, 'index.html'), 'w').write(page)
print(f"index.html {len(page) // 1024} KB")

srcs = [p['src'] for c in m['chapters'] for p in c['parts'] if p['src']]
batches, cur, size = [], {}, 0
for s in srcs:
    b = os.path.getsize(os.path.join(d, s))
    if cur and size + b > BATCH_MB * 1e6:
        batches.append(cur); cur, size = {}, 0
    cur[s] = os.path.join(d, s); size += b
if cur:
    batches.append(cur)
total = sum(os.path.getsize(os.path.join(d, s)) for s in srcs)
print(f'{len(srcs)} preview files, {total / 1e6:.0f} MB, {len(batches)} batches')
json.dump(batches, open(os.path.join(d, 'batches.json'), 'w'), indent=1)
