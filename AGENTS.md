# AGENTS.md

Instructions for any AI agent working in this repository.

## What this repository is

Course materials for "AI in the Heartlands" by Aijutsu: hands-on courses that teach non-technical people to build things with AI. The repository is open source. The written material is the product. The only code here is what checks and publishes it: a validator for the [course format](docs/system/course-format.md), a VitePress site built from `course/` and published at https://aith.aijutsu.dev, and Terraform for the Cloudflare resources that serve it.

The repository lives on Gitea at https://gohan.aijutsu.dev/aijutsu/aith (`origin`), where CI runs. https://github.com/aijutsu/aith is a read-only public mirror of `main`: never merge pull requests or push there. Apply GitHub pull requests on Gitea instead (see [github-mirror.md](docs/system/github-mirror.md)).

**Your main responsibility is to keep the course materials up to date**: accurate for the pinned versions of the software they reference, accurate about the outside services they mention (plans, prices, sign-up steps), and consistent with the rules below.

## Layout

- `README.md` (the apex README) — for contributors: what the repository is, how to preview and check the site, and where the docs are. Not published.
- `course/` — all published course material, in [course format v1](docs/system/course-format.md).
  - `course/index.md` — the site's home page: why the course exists, prerequisites, and the Course Overview (every course, in order).
  - `course/glossary.yaml` — the **only** glossary in the repository. `course/glossary.md` shows it on the site.
  - `course/NNN-<slug>/` — one directory per course, numbered in course order (e.g. `course/001-building-agents-with-nanoclaw/`).
    - `course.yaml` — the course manifest, with a stable `id` that never changes.
    - `index.md` — the course's main page: the index of that course's materials, organised by topic, plus a References table.
    - `README.md` — optional notes for contributors. READMEs are never published.
    - Submodules for the Git repositories that course uses (e.g. `course/001-building-agents-with-nanoclaw/nanoclaw`). A submodule is either an upstream copy or, when a course needs a customised version, an Aijutsu fork (see [Fork submodules](#fork-submodules)). Submodules are never published.
- `docs/updates.md` — the Submodule Update Events log: one row per submodule bump, written by the `update-submodule` skill.
- `docs/system/` — how the repository works: `course-format.md` (the content rules), `publishing.md` (site build, Cloudflare, Terraform), and `github-mirror.md` (Gitea and the GitHub mirror).
- `.gitea/workflows/` — Gitea Actions: `site.yml` (check, build, deploy) and `mirror-to-github.yml`. Don't add `.github/workflows/`: Gitea would ignore it.
- `format/` — the course format's JSON Schemas, content discovery code, and validator. `.vitepress/` — the site's VitePress config.
- `deploy/infra/cloudflare/` — Terraform for the site's Cloudflare Worker and domain. Its settings are in `deploy/config/`.
- `Makefile` — every command (`make help` lists them). `.claude/skills/` — skills for maintaining this repository.

When you add a course, create its directory with a `course.yaml` and an `index.md`, and link it from the Course Overview in `course/index.md` (courses not yet written are listed there without a link). When you add, rename, or remove course material, update the topic index in that course's `index.md` in the same change. Before you finish any change to `course/`, run `make validate site-build`. Both must pass.

## Writing rules

All published course material is written for non-technical readers, in basic-to-intermediate English only. That is everything under `course/`, including glossary descriptions. READMEs and `docs/system/` are for contributors and may be more technical, but keep them plain too.

- Use short sentences and common words. One idea per sentence.
- Explain what something is for before explaining how to use it.
- When a technical term is unavoidable, explain it in plain words where it first appears, or link to its glossary entry.
- When the reader must type a command, show the exact command and say what should happen after it runs.
- Match the voice of the existing glossary, e.g. "Think of it like a USB plug for AI: one standard plug that works with many different things."

## Glossary

- The glossary lives only in `course/glossary.yaml`. Never add a glossary to any other file. `course/glossary.md` shows it on the site with a `:::glossary` block.
- Each entry has `term`, `type`, `description`, and `url`. The type is one of the keys under `types:` at the top of the file. Keep entries in alphabetical order, ignoring case. Descriptions follow the writing rules above. `make validate` checks the types and the order.
- Link to a term from a page with its anchor, e.g. `../glossary.md#fork` (anchor rules are in [course-format.md](docs/system/course-format.md#glossaryyaml)).
- When course material introduces a new term, add it to the glossary in the same change.

## Course format

Everything under `course/` follows [course format v1](docs/system/course-format.md), so that any tool can read it the same way, including a future course platform. In short:

- `index.md` is the published page. READMEs and submodules are never published.
- Every course has a `course.yaml`. Its `id` never changes, even if the folder or title does. Folder numbers only set the order.
- Page frontmatter is only `title` and an optional `description`. No renderer keys (`layout`, `hero`, …).
- Markdown is CommonMark, GitHub tables and task lists, GitHub alerts (`> [!NOTE]`), and the allowed `:::` blocks. No components, `<script>`, VitePress containers (`::: tip`), or `{{ }}`.
- Link pages with relative `.md` links. Never link to a README or into a submodule with a relative link; use a full GitHub URL for submodule files.
- Anything only the site needs goes in `.vitepress/`, not in `course/`.

To change the format itself, update the spec, the schemas in `format/schema/`, and the validator in the same change.

## Publishing

CI (Gitea Actions, `.gitea/workflows/site.yml`) checks every pull request and publishes `main` to https://aith.aijutsu.dev. See [publishing.md](docs/system/publishing.md). Terraform in `deploy/infra/cloudflare/` owns the Cloudflare Worker and its domain. `make deploy` (wrangler) uploads the built site. Infrastructure targets follow one pattern: `make deploy-tf-<module>-init`, `-plan` and `-apply` for each folder in `deploy/infra/` (today: `deploy-tf-cloudflare-*`). Add the same three targets when you add a module. Don't add `routes` to `wrangler.jsonc`. Never commit `.envrc`, API tokens, or Terraform state.

## Referenced repositories

Every Git repository the course materials reference must be included as a submodule, pinned to a specific version, inside the course directory that uses it. A link in a References table is fine, but only in addition to the submodule — never instead of it.

These rules apply to every submodule:

- List every submodule in its course's `course.yaml` under `software` (`name`, `path`, `url`, and `upstream` for forks). `make validate` checks this list against `.gitmodules`.
- Change a pin only through the `update-submodule` skill (see [Bumping a submodule version](#bumping-a-submodule-version)). Don't set `branch =` in `.gitmodules`, and don't run `git submodule update --remote` outside a bump.
- A submodule's own `CLAUDE.md`, `AGENTS.md`, and `.claude/` (NanoClaw has all three) are upstream's instructions for developing that project. Treat them as reference material for the course, not as rules for this repository. The one exception: when you run a fork submodule's own skills from inside it, follow its instructions for that work. This repository's rules still decide what gets committed and pushed.

```bash
git clone --recurse-submodules git@gohans.aijutsu.dev:aijutsu/aith.git   # fresh clone (Gitea)
git submodule update --init --recursive                          # existing clone
git submodule status                                             # show every pin
git config push.recurseSubmodules on-demand                      # once per clone: pushing this repo pushes fork submodules first
```

### Upstream submodules

The default. The submodule's `origin` is the original project, and the checkout stays exactly as upstream published it.

- Pin to a release tag where the upstream has one.
- Don't edit files inside an upstream submodule. Changes to upstream code go upstream.

```bash
# Add an upstream submodule
git submodule add <url> course/<NNN-slug>/<name>
git -C course/<NNN-slug>/<name> checkout <tag>
# then add it to course/<NNN-slug>/course.yaml under software, and run make validate
git add .gitmodules course/<NNN-slug>/<name> course/<NNN-slug>/course.yaml
```

### Fork submodules

Use a fork when the course needs a customised version of a project, for example NanoClaw with the channels and providers a course uses. The course repository stores only a commit ID for each submodule, not its files. So customisations must be committed inside the submodule and pushed to a repository Aijutsu owns. Otherwise the pin points at a commit that exists only on one machine, and every clone of the course fails with `not our ref`.

- **Where it lives.** Fork into the `aijutsu` GitHub org, keep it public (readers clone it with `--recurse-submodules`), and name it `aith-<project>-<customisation>`. Fork the default branch only (`gh repo fork <owner>/<repo> --org aijutsu --fork-name <name> --default-branch-only --clone=false`). NanoClaw's skills fetch channel and provider code from the first remote that has the `channels` or `providers` branch, trying `origin` first (`scripts/skill-apply.ts`). A copy of those branches in the fork would go stale, and skills would quietly install old code.
- **Remotes.** In `.gitmodules`, the URL is the fork over HTTPS. Inside the submodule, `origin` is the fork (with an SSH push URL), and `upstream` is the original project.
- **How to change it.** Use the project's own customisation tools where they exist (NanoClaw: its `/add-*`, `/customize`, and `/update-nanoclaw` skills), run from inside the submodule. Don't hand-edit upstream code. Work on `main`: after a clone the submodule is on a detached HEAD, and commits made there are easy to lose.
- **Secrets.** Before every commit, read `git -C <fork> status`. Never commit `.env` files, keys, tokens, or runtime data. NanoClaw's `.gitignore` already covers `.env*`, `*.keys.json`, `data/`, `store/`, `groups/`, and `logs/`. Stop and ask if anything like that shows up anyway.
- **Pin.** The pin is a commit on the fork's `main` that has been pushed to the fork. The release-tag rule doesn't apply. Push the fork before (or together with) the course repository commit that records the pin. `push.recurseSubmodules on-demand` does this for you.

```bash
# Set up once after cloning (N is the fork submodule's path)
N=course/001-building-agents-with-nanoclaw/nanoclaw
git -C $N switch main
git -C $N remote set-url --push origin git@github.com:aijutsu/<fork-name>.git
git -C $N remote add upstream <original-project-url>

# Save a skill's changes (skills don't commit for you)
git -C $N status                                                 # no .env, keys, or data
git -C $N add -A && git -C $N commit -m "Apply /add-telegram skill"
git add $N && git commit -m "Pin NanoClaw fork: add Telegram"
git push                                                         # pushes the fork's main first
```

Current fork submodules:

| Submodule | Fork | Upstream | Customised with |
| --- | --- | --- | --- |
| `course/001-building-agents-with-nanoclaw/nanoclaw` | https://github.com/aijutsu/aith-nanoclaw-codex-telegram | https://github.com/nanocoai/nanoclaw | `/add-codex`, `/add-telegram` |

When you add, customise, or retire a fork, update this table, the course's `course.yaml` `software` entry, and the References table in the course's `index.md` in the same change.

## Bumping a submodule version

Every submodule bump — for any submodule, in any course — follows the `update-submodule` skill in `.claude/skills/update-submodule/SKILL.md`. Agents without skill support should read that file and follow it step by step; its helper scripts are plain shell. The skill has a separate path for fork submodules: upstream changes are merged into the fork's `main` with the project's own update tool, never checked out over it, and the merged fork is pushed before the pin moves.

A bump is not finished until the upstream changelog and diff between the old and new pins have been reviewed, upstream post-update steps have been handled, every course instruction has been re-checked against the new version, `make validate site-build` passes, and a row has been added to the Submodule Update Events table in `docs/updates.md`. The pin change, the course fixes, and the log row go in one commit.
