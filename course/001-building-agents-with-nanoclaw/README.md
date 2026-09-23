# Building community agents with NanoClaw: contributor notes

This README is for people who maintain this course. It is not published. Learners read [index.md](./index.md), which is published at https://aith.aijutsu.dev/001-building-agents-with-nanoclaw/.

- `index.md` is the course page: the objectives, the list of lessons, and the References table. Each lesson is a folder with its own `index.md`: `01-installations/` and `02-setting-up-nanoclaw/`. Both are split into sub-lessons. Images sit in an `img/` folder next to the page that uses them, named for what they show (`img/botfather-mini-app-home.png`). `course.yaml` is the course manifest. Both follow the [course format](../../docs/system/course-format.md).
- `01-installations/` (titled "Getting Started") is split into sub-lessons, one per tool: `01-terminal/`, `02-git/`, `03-docker/`, `04-make/`, `05-codex/` and the optional `06-claude-code/`. Its own `index.md` is the overview (the pre-requisites, and a table of what each tool is for). Keep that table and the sub-lesson folders in step: adding or removing a tool means both. Sub-lesson pages are three levels under `course/`, so glossary links are `../../../glossary.md#term`.
- `02-setting-up-nanoclaw/` is split into sub-lessons, one per step: `01-telegram-bot/`, `02-download-nanoclaw/`, `03-run-setup/` and `04-say-hi/`. Its own `index.md` is the overview (the fork note, and a table of the steps). Keep that table and the sub-lesson folders in step. Where a step can be done in more than one way — the BotFather mini app or the chat, Codex or Claude Code as the setup helper — the ways are `<details>` sections of one group, not headings, so only one is open at a time.
- **Every install page follows the same shape.** Inside each operating system's `<details>`, in this order:
  1. **Check if it's already installed.** — one command, then what each result means. If the tool is there, it says where to skip to.
  2. **Install it.** — the steps.
  3. **Check that it works.** — one command, and what the reader should see. Troubleshooting for that system only.

  Write these three as **bold labels**, never as `###` headings. VitePress's `outline: 'deep'` would put every heading inside a `<details>` into the page's "On this page" list, so the reader would see macOS, Windows and Linux copies of the same three entries.

  Where the two checks would be the same command (Git on Windows and Linux, Make everywhere), the first one says "skip the rest of this section" instead of sending the reader to the second one to run it again. Where they differ (Docker: `docker --version` then `docker run hello-world`; Codex: `codex --version` then `codex login status`), the first routes to the second.

  **Every command block says where to type it**, in the line right above it: "In Terminal, run:", "In the Ubuntu terminal, run:", "In the terminal, run:". The word links to `01-terminal/` once per section — the first command in each `<details>`, and the first in the page's own prose — so a reader who opens one system's section always gets the link without the same href appearing ten times on a page. `make validate` can't check this; the audit is a one-off script over the fenced blocks.

  Two exceptions to watch. On Windows, `wsl --install` runs in **PowerShell**, not the Ubuntu terminal the rest of the course uses, so those blocks say PowerShell and carry no link. On `01-terminal/` itself nothing links to `01-terminal/`: its checks say "the Terminal window that just opened".

  Three pages vary, on purpose. `01-terminal/` uses **Open it.** instead of **Install it.** on macOS and Linux, where nothing is installed and the first check just says so. `05-codex/` and `06-claude-code/` have no `<details>` at all: the steps are the same on every system, so their labels are `##` headings, and each page says why it has no sections per system.

- **`06-claude-code/` is optional, and its title says so** ("Install Claude Code (optional)"). It is an alternative to Codex as the reader's helper for setup, not an extra requirement: the agent runs on Codex either way. Keep three things in step if this changes: the "Should you install it?" section on that page, the Claude Code accordion in `02-setting-up-nanoclaw/03-run-setup/index.md` (which links here rather than repeating the install), and the optional Claude-plan line in the `01-installations/index.md` pre-requisites.
- `nanoclaw/` is our fork of NanoClaw, pinned as a submodule. We customised it with NanoClaw's own `/add-codex` and `/add-telegram` skills. The fork lives at https://github.com/aijutsu/aith-nanoclaw-codex-telegram. See `AGENTS.md` → Fork submodules.
- To move the fork to a newer NanoClaw version, use this repository's `update-submodule` skill. It runs NanoClaw's own `/update-nanoclaw` skill for you, and then checks the course against the new version.

## What the install steps depend on

The steps in the lessons — `01-installations/` (its overview and its six sub-lessons) and `02-setting-up-nanoclaw/` (its overview and its four sub-lessons) — describe what the pinned fork does. They were checked against the fork at `9e4ee0c8` on 2026-09-22. When the pin moves, check these again (the `update-submodule` skill asks you to re-check every course instruction):

| Course step | Depends on (paths inside `nanoclaw/`) |
| --- | --- |
| Supported systems (macOS, Linux, Windows only through WSL2), in `01-installations/index.md` | `README.md` → Requirements |
| `01-installations/02-git/`: install Git and jq | The Telegram token check pipes `getMe` through `jq` (`.claude/skills/add-telegram/SKILL.md`). Setup never installs `jq`. |
| `01-installations/03-docker/`: install Docker; on Windows, Docker Desktop with WSL integration | `setup/container.ts`, `setup/install-docker.sh`. If `docker` is missing, setup installs Docker Engine itself (on WSL, inside Ubuntu, which we don't want). |
| `01-installations/03-docker/`: on a Mac, OrbStack (recommended) or Docker Desktop, running before setup | `setup/container.ts`: when Docker isn't running, setup runs `open -a Docker`, which starts Docker Desktop but not OrbStack. When `docker` is missing, `setup/install-docker.sh` installs Docker Desktop. |
| `01-installations/04-make/`: install Make | **Nothing in the fork.** NanoClaw has no `Makefile`, and no lesson runs `make` yet. The page is there for later parts of the course. See the open follow-up in [known-issues.md](../../docs/system/known-issues.md#open-follow-ups). |
| `01-installations/05-codex/`: install Codex before setup | `setup/providers/codex.ts`: ChatGPT sign-in needs the `codex` command, and setup exits without it. |
| `01-installations/05-codex/`: `codex login status` says `Logged in using ChatGPT` | The Codex CLI, not the fork. Checked against `codex-cli 0.154.0` on 2026-09-23. If OpenAI changes that subcommand or its wording, the page's last check breaks. `setup/providers/codex.ts` reads `~/.codex/auth.json` instead, so setup keeps working either way. |
| `01-installations/06-claude-code/`: install with `curl -fsSL https://claude.ai/install.sh \| bash`, then `claude auth status --text` | Claude Code, not the fork. Checked against `2.1.272 (Claude Code)` on 2026-09-23; `--text` prints `Login method:` and the plan name (the default is JSON, which is too noisy for the page). The fork only needs `claude` to exist and be signed in (`setup/lib/claude-handoff.ts`). |
| The version strings quoted in every "Check that it works" (`git version 2.55.0`, `jq-1.7.1`, `Docker version 29.4.0, build 9d7ad9f`, `GNU Make 3.81`/`4.3`, `codex-cli 0.154.0`) | Nothing in the fork. They are examples, and each page says the reader's number may differ. Refresh them if they get old enough to look wrong. |
| `$setup` only tells you to run `bash nanoclaw.sh` | `.claude/skills/setup/SKILL.md`, and `.agents/skills` → `.claude/skills` (how Codex finds the skills). |
| Run setup yourself, not inside Codex | `nanoclaw.sh` and `setup/auto.ts` read answers from the terminal (`/dev/tty`) and hand it to `codex login`. |
| The helper accordions in `02-setting-up-nanoclaw/03-run-setup/`: `$setup` in Codex, `/setup` in Claude Code | Both read `.claude/skills/setup/SKILL.md` (Codex through the `.agents/skills` link). |
| What setup offers when it fails | `setup/lib/claude-handoff.ts` (`offerClaudeOnFailure`), `setup/providers/codex.ts` (`offerCodexFailureAssist`). Before the runtime is picked, failures go to Claude ("Want to debug this with Claude?", or "Claude CLI is needed to diagnose this. Install it now?" when it isn't installed). After Codex is picked, setup offers "Want to debug this with Codex?" first, but only if `codex` runs and `~/.codex/auth.json` exists. It falls back to Claude only if Claude is installed and signed in. |
| `--agent-provider codex` | `setup/lib/setup-config.ts` (the flag), `setup/auto.ts` (it skips the runtime picker and the pre-built image offer). |
| The table of setup questions | The prompts in `setup/auto.ts`, `setup/providers/codex.ts`, `setup/channels/`, and `.claude/skills/add-telegram/SKILL.md`. Quote them exactly. |
| BotFather steps and Group Privacy | `.claude/skills/add-telegram/SKILL.md`, and https://core.telegram.org/bots/features |
| Don't move the folder after setup | `src/install-slug.ts`: the service name is made from the folder path. |
| Private chats answer every message; groups need a mention | `src/channels/telegram.ts` |
