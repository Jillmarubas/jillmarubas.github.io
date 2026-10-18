#!/usr/bin/env bash
# Install the ArtCraft family's Linux apps (github.com/storytold) into a cloud session.
#
#   bash scripts/install-craft-apps.sh                 # all apps, latest release
#   bash scripts/install-craft-apps.sh effectcraft     # only the apps you name
#   EFFECTCRAFT_VERSION=0.9.2 bash scripts/install-...  # pin one app to a version
#
# Apps go to $CRAFT_DIR (default /opt/craft); their commands are linked into
# $CRAFT_BIN (default /usr/local/bin). An app already installed at the wanted
# version is skipped, so running this twice is cheap.
#
# ArtCraft itself is not included: it ships for Windows and macOS only and
# needs a screen. Install it on your own computer from getartcraft.com.

set -euo pipefail

ALL_APPS=(effectcraft filmcraft photocraft lightcraft vectorcraft designcraft figcraft pdfcraft)
CRAFT_DIR="${CRAFT_DIR:-/opt/craft}"
CRAFT_BIN="${CRAFT_BIN:-/usr/local/bin}"
apps=("$@")
[ ${#apps[@]} -eq 0 ] && apps=("${ALL_APPS[@]}")

mkdir -p "$CRAFT_DIR" "$CRAFT_BIN"
failed=()

# Release tags newest first (v1.2.3 style only).
tags_for() {
  git ls-remote --tags --refs "https://github.com/storytold/$1" 2>/dev/null |
    awk -F/ '{print $3}' | grep -E '^v[0-9]' | sort -V | tac
}

install_app() {
  local app=$1 pin_var pin tags tag ver url tmp
  pin_var="$(echo "$app" | tr '[:lower:]' '[:upper:]')_VERSION"
  pin="${!pin_var:-}"
  if [ -n "$pin" ]; then tags="v${pin#v}"; else tags=$(tags_for "$app" | head -6); fi
  if [ -z "$tags" ]; then echo "$app: no release tags found"; return 1; fi

  # Not every tag has a Linux build, so walk back from the newest one.
  for tag in $tags; do
    ver=${tag#v}
    if [ -f "$CRAFT_DIR/$app/.version" ] && [ "$(cat "$CRAFT_DIR/$app/.version")" = "$ver" ]; then
      echo "$app $ver: already installed"
      link_app "$app"
      return 0
    fi
    url="https://github.com/storytold/$app/releases/download/$tag/$app-$ver-linux-x86_64.tar.gz"
    tmp=$(mktemp)
    if curl -fsSL --max-time 600 -o "$tmp" "$url"; then
      rm -rf "$CRAFT_DIR/$app" && mkdir -p "$CRAFT_DIR/$app"
      tar xzf "$tmp" -C "$CRAFT_DIR/$app" --strip-components=1
      rm -f "$tmp"
      echo "$ver" > "$CRAFT_DIR/$app/.version"
      link_app "$app"
      echo "$app $ver: installed"
      return 0
    fi
    rm -f "$tmp"
  done
  echo "$app: no Linux build found in tags: $(echo $tags | tr '\n' ' ')"
  return 1
}

link_app() {
  local b
  for b in "$CRAFT_DIR/$1"/bin/*; do
    [ -x "$b" ] && ln -sf "$b" "$CRAFT_BIN/$(basename "$b")"
  done
}

for app in "${apps[@]}"; do
  install_app "$app" || failed+=("$app")
done

if [ ${#failed[@]} -gt 0 ]; then
  echo "Failed: ${failed[*]}" >&2
  exit 1
fi
echo "Done. Commands such as effectcraft-cli and filmcraft-cli are in $CRAFT_BIN."
