#!/bin/sh
# Download every Higgsfield image listed in the job manifests.
cd "$(dirname "$0")"
for list in images/higgsfield_jobs.txt; do
  while read -r name url; do [ -n "$name" ] && curl -sSf -m 120 -o "images/$name.png" "$url" && echo "ok $name"; done < "$list"
done
while read -r name job url; do [ -n "$name" ] && curl -sSf -m 120 -o "people/$name.png" "$url" && echo "ok $name"; done < people/higgsfield_jobs.txt
