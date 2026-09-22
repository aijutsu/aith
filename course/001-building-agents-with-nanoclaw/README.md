# Building community agents with NanoClaw: contributor notes

This README is for people who maintain this course. It is not published. Learners read [index.md](./index.md), which is published at https://aith.aijutsu.dev/001-building-agents-with-nanoclaw/.

- `index.md` is the course page. `course.yaml` is the course manifest. Both follow the [course format](../../docs/system/course-format.md).
- `nanoclaw/` is our fork of NanoClaw, pinned as a submodule. We customised it with NanoClaw's own `/add-codex` and `/add-telegram` skills. The fork lives at https://github.com/aijutsu/aith-nanoclaw-codex-telegram. See `AGENTS.md` → Fork submodules.
- To move the fork to a newer NanoClaw version, use this repository's `update-submodule` skill. It runs NanoClaw's own `/update-nanoclaw` skill for you, and then checks the course against the new version.
