# Docs

Documentation for people (and AI agents) who work on this repository. None of it is published: the course site is built from `course/` only.

**Read the docs that cover your change before you start, and update them in the same change when you finish.** Record new decisions in [decisions.md](./system/decisions.md) and new gotchas in [known-issues.md](./system/known-issues.md). `AGENTS.md` and `CLAUDE.md` require this.

## What users can do (`features/`)

| Doc | What it covers |
| --- | --- |
| [reading-the-course-site.md](./features/reading-the-course-site.md) | What learners get at https://aith.aijutsu.dev, and how they can suggest a change. |
| [adding-a-course.md](./features/adding-a-course.md) | Step by step: add a new course so that it appears on the site. |

## How the system works (`system/`)

| Doc | What it covers |
| --- | --- |
| [course-format.md](./system/course-format.md) | The content contract (course format v1): where files go, `course.yaml`, page frontmatter, the glossary, allowed Markdown. Enforced by `make validate`. |
| [site.md](./system/site.md) | How VitePress (`.vitepress/`) turns `course/` into the site: exclusions, generated navigation, the home hero and its banner picture, the Course Overview cards, the glossary block, the footer (copyright notice and Terms of Use link), the theme (brand colour, light/dark switch). |
| [publishing.md](./system/publishing.md) | Build, CI, and deploy; Cloudflare, Terraform, tokens, state, first-time setup, recovery. |
| [github-mirror.md](./system/github-mirror.md) | Gitea as the source of truth, the public GitHub push mirror, and how to take GitHub pull requests. |
| [decisions.md](./system/decisions.md) | What we chose and why, with the alternatives we turned down and when to revisit. |
| [known-issues.md](./system/known-issues.md) | Gotchas we have hit, and open follow-ups. |

## Logs

| Doc | What it covers |
| --- | --- |
| [updates.md](./updates.md) | Every submodule version change, written by the `update-submodule` skill. |
