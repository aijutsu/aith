# Building community agents with NanoClaw: contributor notes

This README is for people who maintain this course. It is not published. Learners read [index.md](./index.md), which is published at https://aith.aijutsu.dev/001-building-agents-with-nanoclaw/.

- `index.md` is the course page: the objectives, the list of lessons, and the References table. Each lesson is a folder with its own `index.md`: `01-installations/` and `02-setting-up-nanoclaw/`. Images sit next to the lesson that uses them. `course.yaml` is the course manifest. Both follow the [course format](../../docs/system/course-format.md).
- `nanoclaw/` is our fork of NanoClaw, pinned as a submodule. We customised it with NanoClaw's own `/add-codex` and `/add-telegram` skills. The fork lives at https://github.com/aijutsu/aith-nanoclaw-codex-telegram. See `AGENTS.md` → Fork submodules.
- To move the fork to a newer NanoClaw version, use this repository's `update-submodule` skill. It runs NanoClaw's own `/update-nanoclaw` skill for you, and then checks the course against the new version.

## What the install steps depend on

The steps in the two lessons, `01-installations/index.md` and `02-setting-up-nanoclaw/index.md`, describe what the pinned fork does. They were checked against the fork at `9e4ee0c8` on 2026-09-22. When the pin moves, check these again (the `update-submodule` skill asks you to re-check every course instruction):

| Course step | Depends on (paths inside `nanoclaw/`) |
| --- | --- |
| Supported systems (macOS, Linux, Windows only through WSL2) | `README.md` → Requirements |
| Install Git and jq | The Telegram token check pipes `getMe` through `jq` (`.claude/skills/add-telegram/SKILL.md`). Setup never installs `jq`. |
| Install Docker; on Windows, Docker Desktop with WSL integration | `setup/container.ts`, `setup/install-docker.sh`. If `docker` is missing, setup installs Docker Engine itself (on WSL, inside Ubuntu, which we don't want). |
| On a Mac, OrbStack (recommended) or Docker Desktop, running before setup | `setup/container.ts`: when Docker isn't running, setup runs `open -a Docker`, which starts Docker Desktop but not OrbStack. When `docker` is missing, `setup/install-docker.sh` installs Docker Desktop. |
| Install Codex before setup | `setup/providers/codex.ts`: ChatGPT sign-in needs the `codex` command, and setup exits without it. |
| `$setup` only tells you to run `bash nanoclaw.sh` | `.claude/skills/setup/SKILL.md`, and `.agents/skills` → `.claude/skills` (how Codex finds the skills). |
| Run setup yourself, not inside Codex | `nanoclaw.sh` and `setup/auto.ts` read answers from the terminal (`/dev/tty`) and hand it to `codex login`. |
| Step 7's helper accordions: `$setup` in Codex, `/setup` in Claude Code | Both read `.claude/skills/setup/SKILL.md` (Codex through the `.agents/skills` link). |
| What setup offers when it fails | `setup/lib/claude-handoff.ts` (`offerClaudeOnFailure`), `setup/providers/codex.ts` (`offerCodexFailureAssist`). Before the runtime is picked, failures go to Claude ("Want to debug this with Claude?", or "Claude CLI is needed to diagnose this. Install it now?" when it isn't installed). After Codex is picked, setup offers "Want to debug this with Codex?" first, but only if `codex` runs and `~/.codex/auth.json` exists. It falls back to Claude only if Claude is installed and signed in. |
| `--agent-provider codex` | `setup/lib/setup-config.ts` (the flag), `setup/auto.ts` (it skips the runtime picker and the pre-built image offer). |
| The table of setup questions | The prompts in `setup/auto.ts`, `setup/providers/codex.ts`, `setup/channels/`, and `.claude/skills/add-telegram/SKILL.md`. Quote them exactly. |
| BotFather steps and Group Privacy | `.claude/skills/add-telegram/SKILL.md`, and https://core.telegram.org/bots/features |
| Don't move the folder after setup | `src/install-slug.ts`: the service name is made from the folder path. |
| Private chats answer every message; groups need a mention | `src/channels/telegram.ts` |
