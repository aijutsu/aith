#!/usr/bin/env bash
# Read-only report of what changed in a submodule between two commits, and
# which upstream post-update steps exist at the new commit. Changes nothing.
#
# Usage: review.sh <submodule-path> <old-commit> <new-commit>
set -eu

[ $# -eq 3 ] || { echo "usage: $0 <submodule-path> <old-commit> <new-commit>" >&2; exit 2; }
sub=$1 old=$2 new=$3

g() { git -C "$sub" "$@"; }
section() { printf '\n## %s\n\n' "$1"; }
subsection() { printf '\n### %s\n\n' "$1"; }
or_none() { local out; out=$(cat); if [ -n "$out" ]; then printf '%s\n' "$out"; else echo "(none)"; fi; }

for c in "$old" "$new"; do
  g cat-file -e "$c^{commit}" 2>/dev/null || { echo "unknown commit $c in $sub — run: git -C $sub fetch --tags origin" >&2; exit 1; }
done

section "Range"
echo "old: $(g describe --tags --always "$old") ($(g rev-parse "$old"))"
echo "new: $(g describe --tags --always "$new") ($(g rev-parse "$new"))"
if g merge-base --is-ancestor "$old" "$new"; then
  echo "direction: forward, $(g rev-list --count "$old..$new") commits"
else
  echo "direction: NOT FORWARD (downgrade or diverged history) — confirm with the user before continuing"
fi

section "Release tags in range"
g tag --merged "$new" --no-merged "$old" --sort=creatordate | sed 's/^/- /' | or_none

changelogs=$(g diff --name-only "$old" "$new" \
  | grep -iE '(^|/)(changelog|changes|history|news|releases?|upgrading)(\.(md|markdown|txt|rst))?$' || true)

section "Changelog additions"
if [ -z "$changelogs" ]; then
  echo "(no changelog file changed in this range — rely on the commit log and diffs below)"
fi
printf '%s\n' "$changelogs" | while IFS= read -r f; do
  [ -n "$f" ] || continue
  subsection "$f"
  g diff --unified=0 "$old" "$new" -- "$f" | grep -E '^\+' | grep -vE '^\+\+\+ ' | sed 's/^+//' || true
done

section "Flagged: breaking changes, migrations, deprecations, new requirements"
{
  printf '%s\n' "$changelogs" | while IFS= read -r f; do
    [ -n "$f" ] || continue
    g diff --unified=0 "$old" "$new" -- "$f" | grep -E '^\+[^+]' | sed "s|^+|$f: |" || true
  done
  g log --no-merges --format='commit %h: %s' "$old..$new"
} | grep -iE 'breaking|migrat|deprecat|removed|renamed|requires|no longer|must now' | or_none

section "Prerequisite changes (runtime versions, engines, package manager)"
{
  g diff --unified=0 "$old" "$new" -- .nvmrc .node-version .tool-versions .python-version .ruby-version go.mod \
    | grep -E '^[-+][^-+]' || true
  g diff --unified=0 "$old" "$new" -- package.json \
    | grep -E '^[-+].*"(engines|packageManager|node|npm|pnpm|bun|yarn)"[[:space:]]*:' || true
} | or_none

section "Changed files on common learner-facing surfaces"
g diff --stat=160 "$old" "$new" -- 'README*' 'docs/' 'setup/' 'scripts/' 'bin/' '*.sh' \
  package.json .env.example 'config-examples/' '.claude/skills/*.md' '.claude/commands/' \
  ':!*.test.*' ':!*.spec.*' | or_none

section "Where the changes are (share of changed files by directory)"
g diff --dirstat=files,2 "$old" "$new" | or_none

section "Commits in range (no merges)"
g log --no-merges --format='- %h %s' "$old..$new" | or_none

section "Post-update candidates at the new commit"

subsection "Skills and commands named for update, upgrade, or migration"
g ls-tree -r --name-only "$new" -- .claude/skills .claude/commands \
  | grep -E '(^|/)SKILL\.md$|^\.claude/commands/.*\.md$' \
  | while IFS= read -r f; do
      if g show "$new:$f" | sed -n '1,10p' | grep -qiE '^name:.*(updat|upgrad|migrat)'; then echo "- $f"; fi
    done | or_none

subsection "Skills and commands added, changed, or removed in this range"
g diff --name-status "$old" "$new" -- .claude/skills .claude/commands \
  | grep -E '(^|/)SKILL\.md$|commands/[^/]*\.md$' | or_none

subsection "Migration and upgrade scripts (top level, scripts/, setup/, bin/)"
g ls-tree -r --name-only "$new" \
  | grep -E '^([^/]+|(scripts|setup|bin)/[^/]+)$' \
  | grep -iE '(migrat|upgrad|update)[^/]*\.(sh|bash|ts|js|mjs|cjs|py)$' \
  | grep -vE '\.(test|spec)\.' | or_none

subsection "Migration and upgrade guides added or changed in this range"
g diff --name-only "$old" "$new" | grep -iE '(migrat|upgrad)[^/]*\.md$' | or_none

subsection "package.json scripts that look like update steps"
{ g show "$new:package.json" 2>/dev/null || true; } \
  | grep -E '^[[:space:]]*"(migrate|upgrade|update|postinstall|postupdate)[^"]*"[[:space:]]*:' | or_none

subsection "Nested submodules"
if g cat-file -e "$new:.gitmodules" 2>/dev/null; then
  echo "yes — after checkout run: git -C $sub submodule update --init --recursive"
else
  echo "(none)"
fi
