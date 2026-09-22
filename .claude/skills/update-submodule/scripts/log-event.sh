#!/usr/bin/env bash
# Append one row to the Submodule Update Events table in docs/updates.md,
# creating the section if it is missing.
#
# Usage: log-event.sh <submodule-path> <old-commit> <new-commit>
# UPDATES_LOG=<file> overrides the target file (for testing).
set -eu

[ $# -eq 3 ] || { echo "usage: $0 <submodule-path> <old-commit> <new-commit>" >&2; exit 2; }
sub=$(cd "$1" && pwd -P) old=$2 new=$3

root=$(git -C "$sub" rev-parse --show-superproject-working-tree)
[ -n "$root" ] || { echo "$1 is not a submodule" >&2; exit 1; }
root=$(cd "$root" && pwd -P)
rel=${sub#"$root"/}
log=${UPDATES_LOG:-$root/docs/updates.md}
heading='## Submodule Update Events'

# Browsable commit links when the remote is served over (or maps to) https.
url=$(git -C "$sub" remote get-url origin 2>/dev/null \
  | sed -E 's#^git@([^:]+):#https://\1/#; s#^ssh://git@([^/]+)/#https://\1/#; s#^https://[^/@]+@#https://#; s#\.git$##' || true)

ref() {
  local sha short desc
  sha=$(git -C "$sub" rev-parse "$1")
  short=$(git -C "$sub" rev-parse --short=8 "$1")
  desc=$(git -C "$sub" describe --tags --always "$1")
  case $url in
    https://*) printf '[`%s`](%s/commit/%s) (%s)' "$short" "$url" "$sha" "$desc" ;;
    *) printf '`%s` (%s)' "$short" "$desc" ;;
  esac
}

ts=$(date +%Y-%m-%dT%H:%M:%S%z | sed -E 's/([0-9]{2})([0-9]{2})$/\1:\2/')
name=$(git -C "$root" config user.name || true)
runner="${name:-unknown git author} (local user: $(id -un))"
row="| $ts | \`$rel\` | $(ref "$old") | $(ref "$new") | $runner |"

mkdir -p "$(dirname "$log")"
[ -f "$log" ] || : > "$log"
if ! grep -qxF "$heading" "$log"; then
  if [ -s "$log" ]; then printf '\n' >> "$log"; fi
  printf '%s\n\n%s\n%s\n' "$heading" \
    '| Timestamp | Submodule | Before | After | Run by |' \
    '| --- | --- | --- | --- | --- |' >> "$log"
fi

# Insert after the last row of the first table under the heading, so any
# content that follows the table stays where it is.
tmp=$(mktemp)
awk -v row="$row" -v heading="$heading" '
  !done && in_tbl && !/^\|/ { print row; done = 1; in_tbl = 0 }
  { print }
  $0 == heading          { in_sec = 1; next }
  in_sec && /^## /       { in_sec = 0 }
  in_sec && !done && /^\|/ { in_tbl = 1 }
  END { if (!done && in_tbl) print row; else if (!done) exit 3 }
' "$log" > "$tmp" || { rm -f "$tmp"; echo "no table found under '$heading' in $log" >&2; exit 1; }
cat "$tmp" > "$log"   # rewrite in place so the file keeps its permissions
rm -f "$tmp"
echo "$row"
