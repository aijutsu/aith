---
name: update-submodule
description: Bump any pinned Git submodule in this course repo to a newer version and prove the course still works with it — review the upstream changelog and diff between the current and target pins, find and handle upstream post-update steps (update/migration skills, scripts, guides), move the pin, re-check every course instruction against the new version, and log the event in docs/updates.md. Use this whenever someone asks to update, bump, upgrade, re-pin, or "move to the latest" version of a submodule or referenced repository (e.g. "update nanoclaw to v2.4.0", "is there a newer version we should be on?", "bump all submodules"), and before changing any submodule pin by hand.
argument-hint: "[submodule-path] [target-tag-or-commit]"
---

# Update a submodule

Course materials are written against a pinned version of every referenced repository (see `AGENTS.md`). Moving a pin is only safe once you have read what changed upstream, dealt with upstream's post-update steps, and re-checked every instruction a learner follows. This works the same for every submodule in the repo, whichever course it belongs to.

**Fork submodules take a different path at steps 1, 3, 4, and 5** (see `AGENTS.md` → Fork submodules). A fork's pin is an Aijutsu commit that carries customisations, so the upstream target is merged into the fork's `main`, never checked out over it. A submodule is a fork when it has an `upstream` remote: `git -C "$SUB" remote get-url upstream` succeeds. Set `FORK=1` if it does, `FORK=0` if not, and follow the **Fork:** notes below when `FORK=1`.

The helper scripts live next to this file in `scripts/`. `review.sh` only reads; `log-event.sh` only appends to `docs/updates.md`. Use absolute paths and `git -C` rather than `cd`, since the shell's working directory may be reset between commands:

```bash
ROOT=$(git rev-parse --show-toplevel)
SKILL="$ROOT/.claude/skills/update-submodule"
```

## 1. Pick the submodule and the target

- List every submodule and its pin: `git -C "$ROOT" submodule status`. If the user didn't say which one and there is more than one, ask. For "bump all submodules", run this whole skill once per submodule — each gets its own review, checks, and log row.
- Set `SUB="$ROOT/<path>"` and `SUBREL=<path>` (relative to `$ROOT`).
- Fetch upstream: `git -C "$SUB" fetch --tags origin`.
- If the user gave no target, show the newest release tags (`git -C "$SUB" tag --sort=-creatordate | head`) and recommend the newest one — `AGENTS.md` prefers pinning to tags. Confirm before going on.
- Resolve both ends of the range:

  ```bash
  NEW=$(git -C "$SUB" rev-parse --verify "<target>^{commit}")
  OLD=$(git -C "$ROOT" ls-files -s -- "$SUBREL" | awk '{print $2}')   # the pin the superproject records
  ```

- Check the checkout matches the recorded pin and is clean: `git -C "$SUB" rev-parse HEAD` must equal `$OLD`, and `git -C "$SUB" status --porcelain` must be empty. If either is off, stop and ask — someone moved or edited the submodule outside this process, and the review would compare the wrong range.
- **Fork:** new releases come from the original project, not the fork. Fetch both remotes: `git -C "$SUB" fetch origin` and `git -C "$SUB" fetch --tags upstream`, then pick the target from upstream's tags. Call it `TARGET` rather than `NEW`, since the new pin will be the merge commit made in step 5. Also check that the checkout is on `main` (`git -C "$SUB" branch --show-current`) and that `main` has been pushed (`git -C "$SUB" status -sb` shows no `ahead`). Then find the upstream commit the fork was last synced to:

  ```bash
  TARGET=$(git -C "$SUB" rev-parse --verify "<upstream-tag>^{commit}")
  BASE=$(git -C "$SUB" merge-base "$OLD" "$TARGET")
  ```

## 2. Inventory what the course relies on

Before reading upstream changes, find everything in the course that depends on this repository, so you know what to look for. Search all course material under `course/` — not just the course that contains the submodule, since later courses may reuse it. That includes the home page `course/index.md` (prerequisites), the glossary `course/glossary.yaml`, and each course's `course.yaml`:

```bash
git -C "$ROOT" grep --untracked -n -i -e '<name>' -e '<command>' -e '<path>' -- course
```

(`git grep` skips submodule contents by default, so this searches only our own material; `--untracked` includes new pages not yet added.) Search for the project's name, the commands learners type from it, file paths inside it, environment variables and config keys, version numbers, URLs to its docs, and the prerequisites it needs. Keep this list — steps 3 and 6 check against it.

## 3. Review the changes thoroughly

Run the report and read all of it:

```bash
"$SKILL/scripts/review.sh" "$SUB" "$OLD" "$NEW"
```

It prints the range and direction, release tags in the range, every changelog line added, flagged breaking/migration/deprecation lines, prerequisite changes, changed learner-facing files, the full commit list, and post-update candidates.

**Fork:** review only what upstream changed, with `"$SKILL/scripts/review.sh" "$SUB" "$BASE" "$TARGET"`. (`$OLD..$TARGET` would show "NOT FORWARD", because the fork's own commits aren't in upstream's history.) Use `$BASE` wherever this skill says `$OLD` in a diff command in this step. Then list what the fork has customised, since those are the files most likely to conflict: `git -C "$SUB" log --oneline "$BASE..$OLD"` and `git -C "$SUB" diff --stat "$BASE" "$OLD"`.

- **Direction.** If it is not forward (a downgrade or diverged history), stop and confirm with the user.
- **Read the changelog in full**, not only the flagged lines — a changed default or a renamed command often isn't labelled breaking. For each release tag in the range, also read the release notes when the remote is on GitHub (`gh release view <tag> -R <owner>/<repo>`); they sometimes say things the changelog doesn't.
- **Verify the changelog against the real changes.** Changelogs are written by people and miss things. Compare the commit list and the changed learner-facing files against what the changelog says. For any change that touches something in your step-2 inventory (setup scripts, README or docs, CLI commands, config, prerequisites, skills the course uses) and isn't explained in the changelog, read the diff itself: `git -C "$SUB" diff "$OLD" "$NEW" -- <path>`.
- **Follow migration notes and guides.** When the changelog links a migration or upgrade guide, read it at the new commit: `git -C "$SUB" show "$NEW:<path>"`.

Summarise for the user: breaking changes, changed prerequisites, renamed or removed commands, files, and flags, and new required steps — each marked as affecting the course (tied to an inventory item) or not. If the course would break in a way that can't be fixed in this change, say so and recommend stopping or choosing an earlier target before any pin moves.

## 4. Find upstream post-update steps

From the report's "Post-update candidates" section and any "Migration:" instructions in the changelog, list every update hook, skill, command, migration script, package script, and upgrade guide. Read each one and classify it:

- **Learner-facing** — a step people following the course must now do (for example "requires Node.js 22: run the Node installer, then the update command"). The course must teach it; handle it in step 6.
- **Applies to the pinned checkout here** — rare for an upstream submodule, which is a reference copy, not a running install. For a fork, the project's update tool always falls here (see **Fork:** below).
- **Not relevant** — only for features, platforms, or customisations the course doesn't use.

Upstream update tooling is usually built for a live install. NanoClaw's `/update-nanoclaw`, `/update-skills`, and `/migrate-*` skills are examples: they merge upstream, restart services, and rewrite `.env` and data. Running them here would change the pinned checkout or this machine. So present the classified list and get the user's go-ahead before running anything from the submodule, and never run it inside the pinned checkout. If an approved step leaves the submodule dirty (`git -C "$SUB" status --porcelain` is not empty), stop and tell the user — a dirty submodule is no longer the pinned upstream version.

**Fork:** the checkout is Aijutsu's customised install, so the project's own update tool is how the update gets applied. Use it in step 5 instead of avoiding it. For NanoClaw, that tool is `/update-nanoclaw`, run from inside `$SUB` on `main`. By default it merges `upstream/main`, so tell it to pass `$TARGET` as `--upstream-ref` to its `prepare` step. It refreshes installed skills, runs the tests, and may stop and restart the NanoClaw service on this machine. If no service is installed or running, it skips the stop, restart, and health steps (`scripts/update/service.ts`), so a checkout that isn't running is fine. Say that to the user, and get their go-ahead before running it. All the other rules above still apply.

## 5. Move the pin

Only after the user has seen the summary and the post-update plan:

```bash
git -C "$SUB" checkout --detach "$NEW"
git -C "$SUB" submodule update --init --recursive
git -C "$ROOT" add "$SUBREL"
git -C "$ROOT" diff --cached --submodule=log -- "$SUBREL"   # should show OLD..NEW
```

**Fork:** don't run `checkout --detach` here, because it would throw away the fork's customisations. On `main` instead, merge `$TARGET` with the project's update tool from step 4.

- **NanoClaw: `/update-nanoclaw` is the only way.** NanoClaw's own rule is that every update goes through it, never a raw `git pull` or `git merge`: it runs migrations and refreshes installed channels and providers, and a plain merge skips both. If it fails or stops, don't fall back to `git merge`. Let it roll back, then stop and tell the user what it reported. If it reports a conflict in `CLAUDE.md`, keep upstream's text and put the "Aijutsu fork" section back as the last section (`AGENTS.md` → Fork submodules). Once it has finished, check that the section is still the last one in the file.
- **A fork of a project with no update tool:** run `git -C "$SUB" merge --no-edit "$TARGET"`. Resolve conflicts so the fork keeps its customisations, then run the project's tests.

Once the update has finished and the tests pass, push the fork and record its new `main` as the pin:

```bash
NEW=$(git -C "$SUB" rev-parse HEAD)
git -C "$SUB" merge-base --is-ancestor "$TARGET" "$NEW"      # must succeed: the target is merged in
git -C "$SUB" status --porcelain                             # must be empty: no .env, keys, or data
git -C "$SUB" push origin main
git -C "$ROOT" add "$SUBREL"
git -C "$ROOT" diff --cached --submodule=log -- "$SUBREL"   # should show OLD..NEW
```

Pushing the fork here goes to a public repository. Tell the user before you push, even though the course-repo commit waits for step 8. In steps 6–8, `$NEW` is the fork's merge commit. `log-event.sh` builds its links from `origin`, which is the fork, so the links resolve.

## 6. Re-check the course against the new version

Walk every course page that uses this repository from top to bottom, as a learner would, and check each step against the files at `$NEW`. Don't check only the grep hits: a step can break because an earlier step changed.

- File paths still exist: `git -C "$SUB" cat-file -e "$NEW:<path>"`.
- Commands, flags, and skill names still exist and do the same thing (check package scripts, CLI help or source, and `.claude/skills/`).
- Setup steps and their order still match upstream's own README and setup docs.
- Prerequisites (runtime versions, accounts, tools) still match the Pre-requisites section of `course/index.md`.
- Expected output and messages described in the course still match what upstream prints.
- Glossary entries in `course/glossary.yaml` describing the project are still true.
- Learner-facing post-update steps from step 4 are taught where they're needed.

Fix every mismatch following `AGENTS.md`: basic-to-intermediate English, glossary changes only in `course/glossary.yaml`, and the course's `index.md` topic index updated if pages change. Then run `make validate site-build` from `$ROOT`; both must pass. Only actually run course steps (installers, setup scripts) if the user asks, and then in a scratch location, never in the pinned checkout. Anything you could only confirm by running it goes on a "not verified by reading" list — don't report it as working.

## 7. Log the event

```bash
"$SKILL/scripts/log-event.sh" "$SUB" "$OLD" "$NEW"
git -C "$ROOT" add docs/updates.md
```

This appends a row to the Submodule Update Events table in `docs/updates.md` (creating the section if it's missing): a local timestamp with its UTC offset, the submodule path, before and after commits (linked, with their `git describe` names), and who ran it (git `user.name` plus the local machine username).

## 8. Hand off

Report to the user:

- the range: old → new, the number of commits, and the release tags crossed;
- each breaking or notable change and how it was handled;
- post-update steps: run, taught in the course, or not relevant (with a reason);
- the course files changed;
- the "not verified by reading" list.

The pin, the course fixes, and the log row belong in one commit, so the history shows the bump together with its checks. Stage everything and draft a commit message that names the range and carries the "not verified by reading" list. Don't commit or push unless the user asks.
