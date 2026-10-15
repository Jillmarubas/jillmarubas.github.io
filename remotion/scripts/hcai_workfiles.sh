#!/usr/bin/env bash
# "The Hidden Cost of AI" keeps its heavy working files out of git: the licensed images (public/hcai, ~92 MB)
# and the ElevenLabs voice, music and effects (out/hcai, ~72 MB, paid credits). One tarball in the Remotion bucket
# holds them. The mix (out/hcai/mix.wav) is rebuilt from them with scripts/mix_hcai.py.
#   scripts/hcai_workfiles.sh save      # pack and upload
#   scripts/hcai_workfiles.sh restore   # download and unpack into a fresh clone
set -euo pipefail
cd "$(dirname "$0")/.."
KEY=projects/hidden-cost-of-ai/workfiles.tar
TAR=out/hcai-workfiles.tar
export GLOBAL_AGENT_HTTP_PROXY=${HTTPS_PROXY:-}
case "${1:-}" in
  save)
    tar -cf "$TAR" public/hcai out/hcai/vo out/hcai/music out/hcai/sfx out/hcai/sfx_user out/hcai/vo_segments.json out/hcai/picks.json \
      out/hcai/meta.json out/hcai/water_bottle_rembg.webp out/hcai/question_mark_rembg.webp out/hcai/cands/*.json
    node -r global-agent/bootstrap scripts/upload-delivery.mjs "$TAR" "$KEY" application/x-tar ;;
  restore)
    mkdir -p out
    node -r global-agent/bootstrap scripts/s3-get.mjs "$KEY" "$TAR"
    tar -xf "$TAR" && echo "restored; now: python3 scripts/mix_hcai.py" ;;
  *) echo "usage: $0 save|restore"; exit 1 ;;
esac
