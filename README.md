# AI in the Heartlands

> AI in the Heartlands is a hands-on course brought to you by [Aijutsu](https://aijutsu.dev) with the objective of empowering the everyday man-on-the-street to use AI to build things for themselves and their communities.

**To follow the course, go to https://aith.aijutsu.dev.** The same pages are in [`course/`](./course/index.md) if you prefer to read them on GitHub. Workshop info is at https://aijutsu.dev/ai-in-the-heartlands.

This README is for people who contribute to the course materials. All materials are open source, and pull requests are welcome on GitHub. The materials are copyright Aijutsu Pte. Ltd.: anyone may learn from them for free, but teaching them or using them in other course materials needs written approval. The [Terms of Use](./course/terms.md) have the details, including what a pull request lets Aijutsu do with your change. GitHub is a public mirror: the maintainers work on Aijutsu's own Git server and bring your pull request across from there (see [github-mirror.md](./docs/system/github-mirror.md)).

## How this repository works

- Everything learners read lives in `course/`. Each folder's `index.md` is its published page. `README.md` files, like this one, are notes for contributors and are never published.
- The layout follows a small set of rules, the [course format](./docs/system/course-format.md), so that tools can read it reliably. A validator checks those rules.
- The site is built with [VitePress](https://vitepress.dev/) and served by Cloudflare. Every push to `main` publishes it. See [publishing](./docs/system/publishing.md).
- Every Git repository the course uses is included as a Git submodule, pinned to a specific version, so the course steps always match the software. [Updating submodules](#updating-submodules) below explains how to move to a newer version or change a customised copy. Every version change is logged in [docs/updates.md](./docs/updates.md).
- Rules for AI agents (and a good summary for humans) are in [AGENTS.md](./AGENTS.md).

## Getting started

You need Git, Node.js 22 or newer, and `make`.

```bash
git clone --recurse-submodules https://github.com/aijutsu/aith.git
# Aijutsu maintainers clone from Gitea instead:
#   git clone --recurse-submodules git@gohans.aijutsu.dev:aijutsu/aith.git
cd aith
make install     # install the site's tools
make site        # preview the site at http://localhost:5173 while you edit
```

Before you open a pull request, run:

```bash
make validate    # checks course/ against the course format
make site-build  # builds the site; fails if any link is broken
```

If you changed `worker/` (the site's analytics proxy), also run `make worker-test`.

Run `make help` to see every command.

## Updating submodules

The course teaches software made by other people, such as NanoClaw. Each one is a Git submodule: a Git repository inside this one. This repository doesn't store a submodule's files. It stores only the ID of the one commit the course is written for, called the **pin**. Updating a submodule means moving its pin, then checking that the course still matches it.

There are two kinds of submodule:

| Kind | What it is | How it changes |
| --- | --- | --- |
| Upstream | An untouched copy of the original project, pinned to a release tag. | Only by moving to a newer release ([flow 1](#flow-1-an-upstream-submodule-gets-a-new-release)). |
| Fork | Aijutsu's own copy of the project on GitHub, changed for the course. Inside it, `origin` is the fork and `upstream` is the original project. | By moving to a newer upstream release ([flow 2](#flow-2-nanoclaw-a-fork-gets-a-new-release)), or by customising it here ([flow 3](#flow-3-customise-a-fork-from-this-repository)). |

| Submodule | Kind | Pushed to | Upstream |
| --- | --- | --- | --- |
| `course/001-building-agents-with-nanoclaw/nanoclaw` | Fork, with the Codex and Telegram skills | https://github.com/aijutsu/aith-nanoclaw-codex-telegram | https://github.com/nanocoai/nanoclaw |

Where each push goes:

- **This repository** goes to `origin`, which is Gitea. Never push to `github.com/aijutsu/aith`. It is a mirror, and Gitea overwrites it ([github-mirror.md](./docs/system/github-mirror.md)).
- **A fork** goes to its own GitHub repository. It isn't mirrored, so you push to it directly.
- **The order matters.** If this repository points at a fork commit that isn't on GitHub yet, every clone fails with `not our ref`. With the setting below, one `git push` from this repository pushes the fork first, then this repository.

### Set up once per clone

You need push access to the fork (members of the `aijutsu` GitHub org have it). To run NanoClaw's skills you also need what NanoClaw needs: Node.js 22+, pnpm 10+, Docker, and [Claude Code](https://claude.ai/download).

```bash
N=course/001-building-agents-with-nanoclaw/nanoclaw
git config push.recurseSubmodules on-demand      # `git push` here pushes the fork first
git -C $N remote set-url --push origin git@github.com:aijutsu/aith-nanoclaw-codex-telegram.git
git -C $N remote add upstream https://github.com/nanocoai/nanoclaw.git
```

### Before every change: start from the pin

A fork must be on its `main` branch, and exactly at the pin, before you change it. After a clone or `git submodule update`, a submodule sits on a "detached HEAD": it has no branch, so new commits made there are easy to lose.

```bash
git pull                                          # this repository, from Gitea
git submodule update --init --recursive           # check out every pin
git -C $N fetch origin
git -C $N switch main
git -C $N merge --ff-only origin/main
git -C $N rev-parse HEAD                          # these two commit IDs must match
git ls-files -s $N | awk '{print $2}'
git -C $N status --porcelain                      # must print nothing
```

If the IDs differ, someone pushed to the fork without moving the pin. If `status` prints anything, there are unsaved changes. Sort either one out before you go on.

### Flow 1: an upstream submodule gets a new release

Ask an AI agent to run the `update-submodule` skill, for example "update `<submodule>` to `<tag>`". The skill is in [.claude/skills/update-submodule/SKILL.md](./.claude/skills/update-submodule/SKILL.md). Agents without skill support can follow it step by step. It asks you before anything that changes files:

1. Fetch the release tags, and pick the target (the newest tag, unless you say otherwise).
2. Find every place the course relies on the submodule.
3. Review the changelog and the full diff between the old and new pins (`scripts/review.sh`).
4. List upstream's post-update steps, such as migrations and upgrade guides, and which ones learners must now do.
5. Move the pin: `git -C <path> checkout --detach <tag>`, then `git add <path>`.
6. Re-check every course page against the new version, fix what changed, and run `make validate site-build`.
7. Add a row to [docs/updates.md](./docs/updates.md) (`scripts/log-event.sh`).
8. Stage the pin, the course fixes, and the log row for one commit. You commit and `git push`.

### Flow 2: NanoClaw (a fork) gets a new release

NanoClaw has its own rule: **every update goes through its `/update-nanoclaw` skill, never `git pull` or `git merge`** ([customizing.md](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/main/docs/customizing.md#upgrading)). That skill does much more than a merge:

- It works in a separate staging copy, so nothing changes until the new version passes its checks.
- It refreshes the installed channels and providers (Telegram, Codex) from upstream's `channels` and `providers` branches.
- It installs dependencies, builds, and runs the full test suite.
- It runs any migrations the release needs, and asks before each one.
- If NanoClaw runs as a service on your machine, it stops it, then restarts it and checks that it's healthy. If NanoClaw isn't running, it skips these steps.
- If the build or health check fails, it rolls back Git and NanoClaw's local data.

The `update-submodule` skill runs `/update-nanoclaw` for you, inside the fork. Ask an agent to "update nanoclaw to `<tag>`". Here is what happens, so you can follow along or do it by hand:

1. **Start from the pin** ([above](#before-every-change-start-from-the-pin)).
2. **Pick the target.** Run `git -C $N fetch --tags upstream`, then `git -C $N tag --sort=-creatordate | head` to list the newest releases. Prefer a release tag. If the course needs something newer than the latest release, `upstream/main` is allowed.
3. **Review only what upstream changed** since the fork last took an update:

   ```bash
   BASE=$(git -C $N merge-base HEAD <tag>)
   .claude/skills/update-submodule/scripts/review.sh $N $BASE <tag>
   git -C $N diff --stat $BASE HEAD                 # the fork's own changes: where conflicts can happen
   ```

4. **Run `/update-nanoclaw` inside the fork.** By default it takes the newest `upstream/main`, so tell it which release you want:

   ```bash
   cd $N
   claude                                           # start Claude Code in the fork, then type:
   # /update-nanoclaw to <tag> (use <tag> as the --upstream-ref)
   ```

   It shows you what will change and asks before it switches over. Only `phase: complete` means success. After that, the fork's `main` has a merge commit, plus any refreshed skill files.
5. **Check the result:**

   ```bash
   git -C $N merge-base --is-ancestor <tag> HEAD && echo "merged"
   git -C $N status --porcelain                     # must print nothing
   ```

6. **Move the pin and re-check the course.** Run `git add $N`, and fix any course pages the release affects. Then run `make validate site-build`. Log the event with `.claude/skills/update-submodule/scripts/log-event.sh $N <old-pin> $(git -C $N rev-parse HEAD)`.
7. **Commit and push.** `git commit`, then `git push`. This pushes the fork's `main` to GitHub first, then this repository to Gitea.

If `/update-nanoclaw` fails, it rolls itself back. Don't finish the job with `git merge`: fix the cause, and run it again. To undo a finished update before you push, run `pnpm exec tsx scripts/update-nanoclaw.ts rollback --id <id>` inside the fork. The ID is in its report.

### Flow 3: customise a fork from this repository

Never edit an upstream submodule. Send the change to the original project instead. Forks are how the course gets changes of its own.

**Which AI agent to use.** Claude Code started inside the fork reads both NanoClaw's instructions and this repository's `AGENTS.md`. Codex stops at the fork's own Git root, so it reads only NanoClaw's. That's why the fork's `CLAUDE.md`, which its `AGENTS.md` links to, ends with a short "Aijutsu fork" section pointing back to [AGENTS.md](./AGENTS.md#fork-submodules). That section is the one hand edit allowed in an upstream file. Keep it as the last section. If an update brings a conflict there, keep upstream's text and put the section back at the end.

NanoClaw has a rule for this too: **every change is a skill** ([skills-model.md](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/main/docs/skills-model.md)). A skill brings its own code and tests. On every update, `/update-nanoclaw` refreshes the installed channels and providers, and the tests show when a skill breaks. A change edited straight into NanoClaw's code has neither protection, so the next update can break it without anyone noticing.

#### 3a. Apply an existing NanoClaw skill

For example `/add-telegram` or `/add-codex`. The full list is in the fork's `.claude/skills/` folder.

1. **Start from the pin** ([above](#before-every-change-start-from-the-pin)).
2. **Run the skill inside the fork:**

   ```bash
   cd $N
   claude                                           # start Claude Code in the fork, then type e.g. /add-telegram
   ```

   Skills may ask for secrets, like a Telegram bot token. They save them in `.env`, which Git ignores.
3. **Commit in the fork.** Skills don't commit for you:

   ```bash
   git -C $N status                                 # read it: no .env, keys, tokens, data/, store/, groups/, or logs/
   git -C $N add -A
   git -C $N commit -m "Apply /add-telegram skill"
   ```

4. **Move the pin, and record the change:**
   - Run `git add $N`.
   - Add the skill to the "Customised with" column of the fork table in [AGENTS.md](./AGENTS.md#fork-submodules).
   - If the course now teaches something new, update its pages. If the fork's purpose changed, also update the course's `course.yaml` and its References table.
   - Run `make validate site-build`.
5. **Commit and push:** `git commit -m "Pin NanoClaw fork: add Telegram"`, then `git push`.

#### 3b. Make a change that no skill covers

NanoClaw's advice: edit the code directly and get it working, then turn your edits into a skill ([customizing.md](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/main/docs/customizing.md#how-you-actually-work)).

1. Start from the pin, and make your change inside the fork.
2. Ask a coding agent, inside the fork, to turn the change into a skill that follows NanoClaw's [skill-guidelines.md](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/main/docs/skill-guidelines.md). The skill goes in the fork's `.claude/skills/<name>/`, with a test for each place it touches NanoClaw's own code.
3. Commit, move the pin, and push, exactly as in [3a](#3a-apply-an-existing-nanoclaw-skill), steps 3 to 5.

Don't pin edits that aren't a skill yet. NanoClaw also suggests a "recipe" skill that lists all of a fork's skills in the order to apply them. This fork doesn't have one yet.

### Never do these

- Run `git pull`, `git merge`, or `git rebase` against upstream inside the NanoClaw fork. Use `/update-nanoclaw`.
- Run `git submodule update --remote`, or add `branch =` to `.gitmodules`. Pins move only through the flows above.
- Commit inside a submodule on a detached HEAD.
- Push commits to a fork without moving the pin here. The next update checks that the fork's `main` matches the pin, and stops if it doesn't.
- Push to `github.com/aijutsu/aith`.
- Commit `.env` files, keys, tokens, or runtime data.

## Contributor Documentation

Start at [docs/README.md](./docs/README.md), which lists every doc.

| Doc | What it covers |
| --- | --- |
| [docs/features/adding-a-course.md](./docs/features/adding-a-course.md) | Step by step: add a new course to the site. |
| [docs/features/reading-the-course-site.md](./docs/features/reading-the-course-site.md) | What learners get on the site, and how to suggest a change. |
| [docs/system/course-format.md](./docs/system/course-format.md) | Where course files go, `course.yaml`, the glossary, and which Markdown you can use. |
| [docs/system/site.md](./docs/system/site.md) | How VitePress builds the site from `course/`. |
| [docs/system/publishing.md](./docs/system/publishing.md) | How the site is built and deployed, and the Cloudflare and Terraform setup. |
| [docs/system/github-mirror.md](./docs/system/github-mirror.md) | Where the repository lives (Gitea), and how the public GitHub mirror works. |
| [docs/system/decisions.md](./docs/system/decisions.md) | What we chose and why. |
| [docs/system/known-issues.md](./docs/system/known-issues.md) | Gotchas and open follow-ups. |
| [docs/updates.md](./docs/updates.md) | Log of every submodule version change. |
| [AGENTS.md](./AGENTS.md) | Writing rules and maintenance rules. |
