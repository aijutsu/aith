# AGENTS.md

Instructions for any AI agent working in this repository.

## What this repository is

Course materials for "AI in the Heartlands" by Aijutsu: hands-on courses that teach non-technical people to build things with AI. The repository is public, but not open source: anyone may learn from it for free, while the materials are copyright Aijutsu Pte. Ltd., and teaching or reusing them needs written approval ([LICENSE.md](LICENSE.md), with the full [Terms of Use](course/terms.md)). The written material is the product. The only code here is what checks and publishes it: a validator for the [course format](docs/system/course-format.md), a VitePress site built from `course/` and published at https://aith.aijutsu.dev, and Terraform for the Cloudflare resources that serve it.

The repository lives on Gitea at https://gohan.aijutsu.dev/aijutsu/aith (`origin`), where CI runs. https://github.com/aijutsu/aith is a read-only public mirror, kept in sync by Gitea's push mirror, which overwrites it: never merge pull requests or push there. Apply GitHub pull requests on Gitea instead (see [github-mirror.md](docs/system/github-mirror.md)). This rule is only for `aijutsu/aith`. [Fork submodules](#fork-submodules) such as `aijutsu/aith-nanoclaw-codex-telegram` live on GitHub and have no copy on Gitea. Push them to GitHub directly.

**Read the docs before you implement, and write back to them after.** Start at [docs/README.md](docs/README.md) and read the docs that cover the area you are changing. When you finish, update those docs in the same change: what changed, new decisions in [docs/system/decisions.md](docs/system/decisions.md), and anything that cost you time in [docs/system/known-issues.md](docs/system/known-issues.md).

**Your main responsibility is to keep the course materials up to date**: accurate for the pinned versions of the software they reference, accurate about the outside services they mention (plans, prices, sign-up steps), and consistent with the rules below.

## Layout

- `README.md` (the apex README) — for contributors: what the repository is, how to preview and check the site, and where the docs are. Not published.
- `LICENSE.md` — the repository's licence: all rights reserved, with the "free to learn from" permission. It covers everything here, summarises `course/terms.md`, and defers to it. Not published, and not an open-source licence. Change it only together with the terms.
- `course/` — all published course material, in [course format v1](docs/system/course-format.md).
  - `course/index.md` — the site's home page: why the course exists, prerequisites, and the Course Overview (every course, in order).
  - `course/courses.md` — the Courses page. Its `:::courses` block lists every course from its `course.yaml`, so it needs no edits when a course is added.
  - `course/glossary.yaml` — the **only** glossary in the repository. `course/glossary.md` shows it on the site.
  - `course/terms.md` — the Terms of Use, and the one place the full terms live. Two other files repeat its copyright notice: the site footer (`themeConfig.footer` in `.vitepress/config.mts`) and `LICENSE.md`. Change all three together, and update the "last changed" date at the top of the terms.
  - `course/about.md` — About Aijutsu, the company that makes the courses. Four sections, in order: who Aijutsu is, what it does (three services × three domains), why it runs this course, and who is on the team, then the contact section. The team section has one `###` block per person; add new people there. Its content comes from https://aijutsu.dev: when that site changes what Aijutsu does, update this page. The service names and descriptions are repeated in `makesOffer` in `.vitepress/seo.ts`, and the founder's past roles and coaching credential in its `founder` node; change both together. It has its own writing rules (see [Writing rules](#writing-rules)).
  - `course/NNN-<slug>/` — one directory per course, numbered in course order (e.g. `course/001-building-agents-with-nanoclaw/`).
    - `course.yaml` — the course manifest, with a stable `id` that never changes.
    - `index.md` — the course's main page: the index of that course's materials, organised by topic, plus a References table.
    - `NN-<slug>/index.md` — optional lessons: one part of the course per page, numbered in order (e.g. `01-installations/`). Each has an `id` in its frontmatter (e.g. `id: installations`) that never changes, like a course's `id`. The sidebar lists them by itself.
      - `NN-<slug>/NN-<slug>/index.md` — optional sub-lessons, numbered the same way (e.g. `01-installations/04-make/`). The lesson's own `index.md` is then the overview of them. Lessons nest two levels deep and no further. A sub-lesson's `id` is unique within its lesson, not the whole course.
    - `README.md` — optional notes for contributors. READMEs are never published.
    - Submodules for the Git repositories that course uses (e.g. `course/001-building-agents-with-nanoclaw/nanoclaw`). A submodule is either an upstream copy or, when a course needs a customised version, an Aijutsu fork (see [Fork submodules](#fork-submodules)). Submodules are never published.
- `docs/updates.md` — the Submodule Update Events log: one row per submodule bump, written by the `update-submodule` skill.
- `docs/README.md` — the index of all contributor docs. Read it before implementing anything.
- `docs/features/` — what learners and authors can do (reading the site, adding a course).
- `docs/system/` — how the repository works:
  - `course-format.md` — the content rules.
  - `site.md` — the VitePress renderer, including SEO and AEO metadata.
  - `analytics.md` — Plausible analytics through the site's Worker.
  - `publishing.md` — site build, Cloudflare, Terraform.
  - `github-mirror.md` — Gitea and the GitHub mirror.
  - `decisions.md` — what we chose and why.
  - `known-issues.md` — gotchas and open follow-ups.
- `.gitea/workflows/site.yml` — Gitea Actions CI: check, build, and deploy. Don't add `.github/workflows/`: Gitea would ignore it.
- `format/` — the course format's JSON Schemas, content discovery code, and validator. `.vitepress/` — the site's VitePress config, including its SEO metadata (`seo.ts`) and analytics snippet (`analytics.ts`).
- `worker/` — the `aith` Worker's script: the Plausible analytics proxy (`make worker-test`). Everything else the Worker serves is the built site.
- `deploy/infra/cloudflare/` — Terraform for the site's Cloudflare Worker and domain. Its settings are in `deploy/config/`.
- `Makefile` — every command (`make help` lists them). `.claude/skills/` — skills for maintaining this repository.

When you add a course, create its directory with a `course.yaml` and an `index.md`, and link it from the Course Overview in `course/index.md` (courses not yet written are listed there without a link). When you add, rename, or remove course material, update the topic index in that course's `index.md` in the same change. Before you finish any change to `course/`, run `make validate site-build`. Both must pass.

## Writing rules

All published course material is written for non-technical readers, in basic-to-intermediate English only. That is everything under `course/`, including glossary descriptions. READMEs and `docs/system/` are for contributors and may be more technical, but keep them plain too.

- Use short sentences and common words. One idea per sentence.
- Explain what something is for before explaining how to use it.
- When a technical term is unavoidable, explain it in plain words where it first appears, or link to its glossary entry.
- When the reader must type a command, say **where** to type it, show the exact command, and say what should happen after it runs. Link the word "terminal" to the page that opens one, on its first use in each section a reader might open on its own (each `<details>`, and the page's own prose). Name the right window for the system: Terminal on a Mac, the Ubuntu terminal on Windows, and PowerShell where a Windows step really means PowerShell.
- Match the voice of the existing glossary, e.g. "Think of it like a USB plug for AI: one standard plug that works with many different things."

**One exception: `course/about.md`** (About Aijutsu). It is Aijutsu's company page, not course material, and it is written for answer engines (AEO) as much as for learners:

- Write in Aijutsu's voice ("we"), and use the proper technical and business terms. The plain-English rules above don't apply, and new terms on this page don't need glossary entries (link to existing ones where they fit).
- Phrase each heading as a question people ask ("Who founded Aijutsu?"), and make the first sentence under it a complete answer that names Aijutsu, so it still makes sense when an answer engine quotes it alone.
- Use the same names everywhere: Aijutsu, Aijutsu Pte. Ltd., Joseph Matthias Goh, AI in the Heartlands. Keep the legal name, the UEN, and Singapore somewhere on the page, so an answer engine can identify the company without the facts table the page used to carry.
- Don't attribute the text to Aijutsu's website ("the website says"), and don't copy prices: link to https://aijutsu.dev/pricing.

### Aijutsu's voice

These rules are taken from Aijutsu's own rewrites of drafted copy (2026-09-23). They apply to `course/about.md` and to any other page written in Aijutsu's own voice, such as the home page intro. They do **not** apply to course material, the glossary, or the Terms of Use. When a draft is rewritten, read the rewrite against the draft and add what you learn here.

- **Open with a concrete question, not a mission statement.** A drafted "Aijutsu runs AI in the Heartlands to find out what everyday people would build…" became: Aijutsu runs it "to answer the curious question of: **\"What would my neighbour build if they had some practical and applicable knowledge of how to build with AI?\"**". Put the idea in a question a real person would ask, in their frame ("my neighbour", not "everyday people"), and bold it.
- **Keep the informal register. Don't smooth it into corporate English.** "TL;DR", "drop an email to", "Find Joseph on LinkedIn if you'd like", "Majority of AI workshops" without the article. These are deliberate. Editing them into "In summary", "email", or "Joseph is on LinkedIn" removes the voice.
- **People before technology.** A drafted "AI lets small teams achieve outsized outcomes" became "consultants backed by years of industry experience leveraging AI to empower small teams to achieve outsized outcomes". The people and their experience are the subject; AI is the instrument they use.
- **Lead with conviction, then the CV.** A drafted "Joseph Matthias Goh founded Aijutsu. He is a builder and a coach, with over a decade of…" became "Founded Aijutsu in 2026 as a way of bringing back a consultancy culture where consultants care about doing the right thing rather than getting paid for as long as possible." Why the thing exists comes before the credentials that qualify it.
- **Say the pointed thing plainly.** "it's rare to have *certified* instructors also have actual prior industry experience"; "actual industry best-practices rather than textbook theories". Name the real difference, and italicise the word the sentence turns on. Don't hedge it into "some providers may…".
- **Cut positioning that isn't evidence.** A drafted "You work with a senior operator directly, not with an account manager in front of a bench" was deleted, while "led the company through its ISO 27001 and SOC 2 Type II compliance audits" was kept. A claim earns its place when something checkable backs it: a role held, an audit led, a product shipped.
- **Name an offer the way a buyer would search for it.** "Workshops" became "Instructor-led classes for individuals and companies"; "Licensing and group courses" became "Licensing opportunities".
- **Keep legalese out of body prose.** "Aijutsu (Aijutsu Pte. Ltd.) is a founder-led…" became "Aijutsu is a founder-led…". The legal name and the UEN belong in the contact section, and are required there.
- **Where this collides with the AEO rule, AEO wins for the first sentence only.** Aijutsu writes subject-dropped openers ("Founded Aijutsu in 2026…"), which an answer engine can't attribute when it quotes the section alone. So name the subject in the first sentence under a heading, then write as conversationally as the voice wants.

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
- Markdown is CommonMark, GitHub tables and task lists, GitHub alerts (`> [!NOTE]`), `<details>` collapsible sections (e.g. one per operating system), and the allowed `:::` blocks. No components, `<script>`, VitePress containers (`::: tip`), or `{{ }}`.
- Link pages with relative `.md` links. Never link to a README or into a submodule with a relative link; use a full GitHub URL for submodule files.
- Anything only the site needs goes in `.vitepress/`, not in `course/`.

To change the format itself, update the spec, the schemas in `format/schema/`, and the validator in the same change.

## Publishing

CI (Gitea Actions, `.gitea/workflows/site.yml`) checks every pull request and publishes `main` to https://aith.aijutsu.dev. See [publishing.md](docs/system/publishing.md). Terraform in `deploy/infra/cloudflare/` owns the Cloudflare Worker and its domain. `make deploy` (wrangler) uploads the built site. Infrastructure targets follow one pattern: `make deploy-tf-<module>-init`, `-plan` and `-apply` for each folder in `deploy/infra/` (today: `deploy-tf-cloudflare-*`). Add the same three targets when you add a module. Don't add `routes` to `wrangler.jsonc`. Never commit `.envrc`, API tokens, or Terraform state.

## Referenced repositories

Every Git repository the course materials reference must be included as a submodule, pinned to a specific version, inside the course directory that uses it. A link in a References table is fine, but only in addition to the submodule — never instead of it.

The step-by-step flows for every kind of submodule change are in [Updating submodules](README.md#updating-submodules) in the apex README. That section is the reference for humans. The rules below are the same flows, written for agents. Keep the two in step: when you change one, change the other in the same commit.

These rules apply to every submodule:

- List every submodule in its course's `course.yaml` under `software` (`name`, `path`, `url`, and `upstream` for forks). `make validate` checks this list against `.gitmodules`.
- A pin moves in only two ways. (1) To a newer upstream version, for any submodule: only through the `update-submodule` skill (see [Bumping a submodule version](#bumping-a-submodule-version)). (2) To a new customisation commit, for a fork submodule only: by the flow in [Fork submodules](#fork-submodules). Don't set `branch =` in `.gitmodules`, and don't run `git submodule update --remote`.
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
- **Start from the pin.** Work on `main`: after a clone the submodule is on a detached HEAD, and commits made there are easy to lose. Before any change, the fork's `main` must equal the recorded pin, and `git -C <fork> status --porcelain` must be empty. If not, stop and ask.
- **Taking upstream changes.** Use the project's own update tool. For NanoClaw, that is `/update-nanoclaw`, and only that: NanoClaw's rule is that every update goes through it, never a raw `git pull`, `git merge`, or `git rebase` of upstream, because it also runs migrations and refreshes installed channels and providers. If it fails, let it roll back and report. Don't finish the job by hand. The `update-submodule` skill drives this.
- **Customising.** Use the project's own customisation tools, run from inside the submodule. For NanoClaw, every change is a skill (`docs/skills-model.md`): apply an existing one (`/add-*`, `/customize`), or, when none fits, edit the code, get it working, then turn the edit into a skill in the fork's `.claude/skills/<name>/` following `docs/skill-guidelines.md`. Don't pin edits that aren't a skill yet. After a customisation, add the skill to the "Customised with" column of the table below.
- **Instructions inside the fork.** An agent started inside the submodule may not see this file. Claude Code reads every `CLAUDE.md` from its folder up to `/`, so it sees both. Codex stops at the Git root, and inside a submodule that is the submodule itself, so Codex sees only the fork's own `AGENTS.md`. So every fork ends its own instructions file (NanoClaw: `CLAUDE.md`, which its `AGENTS.md` links to) with a short "Aijutsu fork" section that points here. That section is the one allowed hand edit to an upstream file. Keep it last, keep it in step with this section, and when an update brings a conflict there, keep upstream's text and put the section back at the end.
- **Secrets.** Before every commit, read `git -C <fork> status`. Never commit `.env` files, keys, tokens, or runtime data. NanoClaw's `.gitignore` already covers `.env*`, `*.keys.json`, `data/`, `store/`, `groups/`, and `logs/`. Stop and ask if anything like that shows up anyway.
- **Pin.** The pin is a commit on the fork's `main` that has been pushed to the fork. The release-tag rule doesn't apply. Push the fork before (or together with) the course repository commit that records the pin. `push.recurseSubmodules on-demand` does this for you.

```bash
# Set up once after cloning (N is the fork submodule's path)
N=course/001-building-agents-with-nanoclaw/nanoclaw
git -C $N switch main
git -C $N remote set-url --push origin git@github.com:aijutsu/<fork-name>.git
git -C $N remote add upstream <original-project-url>

# Start from the pin
git submodule update --init --recursive
git -C $N fetch origin && git -C $N switch main && git -C $N merge --ff-only origin/main
test "$(git -C $N rev-parse HEAD)" = "$(git ls-files -s $N | awk '{print $2}')"   # fork main == pin

# Save a skill's changes (skills don't commit for you)
git -C $N status                                                 # no .env, keys, or data
git -C $N add -A && git -C $N commit -m "Apply /add-telegram skill"
git add $N                                                       # then update the table below
make validate site-build
git commit -m "Pin NanoClaw fork: add Telegram"
git push                                                         # pushes the fork's main first
```

Never push commits to a fork without moving the pin in the same push. The next update checks that the fork's `main` equals the pin, and stops if it doesn't.

Current fork submodules:

| Submodule | Fork | Upstream | Customised with |
| --- | --- | --- | --- |
| `course/001-building-agents-with-nanoclaw/nanoclaw` | https://github.com/aijutsu/aith-nanoclaw-codex-telegram | https://github.com/nanocoai/nanoclaw | `/add-codex`, `/add-telegram`, the `community-assistant` template in `templates/community/` (the course picks it under **From local templates**), and the "Aijutsu fork" section at the end of `CLAUDE.md` |

When you add, customise, or retire a fork, update this table, the course's `course.yaml` `software` entry, and the References table in the course's `index.md` in the same change.

## Bumping a submodule version

Every submodule bump — for any submodule, in any course — follows the `update-submodule` skill in `.claude/skills/update-submodule/SKILL.md`. Agents without skill support should read that file and follow it step by step; its helper scripts are plain shell. The skill has a separate path for fork submodules: upstream changes are merged into the fork's `main` with the project's own update tool, never checked out over it, and the merged fork is pushed before the pin moves.

A bump is not finished until the upstream changelog and diff between the old and new pins have been reviewed, upstream post-update steps have been handled, every course instruction has been re-checked against the new version, `make validate site-build` passes, and a row has been added to the Submodule Update Events table in `docs/updates.md`. The pin change, the course fixes, and the log row go in one commit.
