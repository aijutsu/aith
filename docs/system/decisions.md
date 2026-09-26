# Decisions

What we chose, why, what we turned down, and when to look again. Newest at the bottom. Don't reopen a decision without new information. If you do reopen one, add a new entry rather than editing the old one.

## 2026-09-22 — Publish the course as a static site at aith.aijutsu.dev

**Chosen:** A static site built from `course/` and served by Cloudflare at https://aith.aijutsu.dev. Learners read the site. The repository is for contributors.

**Why:** The Markdown on GitHub was the only way to read the course, and it mixed learner content with maintainer notes.

## 2026-09-22 — `index.md` is the published page; `README.md` is for contributors

**Chosen:** Each folder's `index.md` is its published page. A `README.md` is optional, never published, and holds notes for contributors. The home page is `course/index.md`.

**Turned down:** Using `README.md` as the published page. That gives one file per folder that also reads well on GitHub. But the maintainer notes would have to move out of it, and VitePress would need URL rewrites (not tested). VitePress maps `index.md` to a folder URL natively, and relative links like `./001-…/index.md` work on both GitHub and the site.

## 2026-09-22 — A versioned course format, with a future course platform in mind

**Chosen:** [Course format v1](./course-format.md). It is a small, declarative content contract:
- a folder with `course.yaml` is a course, and a repo may hold several;
- each course has a stable `id`, and folder numbers only set the order;
- page frontmatter is limited;
- Markdown is a portable subset;
- one glossary lives in `course/glossary.yaml`;
- a validator (`make validate`) and JSON Schemas enforce it.

It is spec-light on purpose: lesson fields and exercise blocks are reserved, not specified.

**Why:** Aijutsu may build a course-material platform that ingests repositories in this format and shows each as a course. The format is the contract between authors and any renderer. The VitePress site is just the first renderer. A platform can't run authors' code, so everything must be data. It will also track learner progress, so identity can't depend on paths.

**Turned down:**
- One repo per course: simpler ingestion, but this repo already holds a whole series.
- A Markdown glossary table: a platform can't use it for hover definitions or to merge glossaries.
- Specifying lessons now: no lessons exist yet.

**Revisit:** When the first lesson is written (define lesson fields), or when the platform work starts. The schemas and `format/courses.mjs` are meant to be reused there.

## 2026-09-22 — VitePress as the site generator

**Chosen:** VitePress 1.x (`^1.6.4`).

**Why:**
- It reads `course/` in place (`srcDir`).
- It excludes READMEs and submodules (`srcExclude`).
- It maps `index.md` to folder URLs, and rewrites relative `.md` links.
- A dead link fails the build, and there is offline search.
- It uses markdown-it, a CommonMark parser that a TypeScript platform could use too, so custom blocks could be shared.
- It has no schema validation, but we need a separate validator for the platform anyway.

**Turned down:**
- **Astro Starlight:** very good, with Zod-checked frontmatter and a remark pipeline. But it expects content in `src/content/docs`, and reading `course/` in place was unverified.
- **Zensical / Material for MkDocs:**
  - As of September 2026, Zensical is at 0.0.x, with 0.1.0 due on 5 November 2026. It still uses the Python-Markdown dialect.
  - Its CommonMark parser and module API are planned, with no dates.
  - It has no AST export.
  - Material for MkDocs only gets fixes until May 2027.
- **MyST (mystmd):** a specified dialect with a JSON AST that a platform could ingest. But its directives show up as code on GitHub.
- **Docusaurus:** the heaviest option, and it treats `README.md` as a folder index by default.

**Revisit:**
- Upgrade to VitePress 2 when it is stable. That should also clear the dev-server `npm audit` warnings.
- Look at Zensical again after 0.1.0 and its CommonMark work.

## 2026-09-22 — Cloudflare Workers static assets, not Pages

**Chosen:** A Worker (`aith`) serving `.vitepress/dist` as static assets. **Terraform owns the Worker and its custom domain. wrangler (`make deploy`) owns versions and deployments.** `wrangler.jsonc` has no `routes`, and `workers_dev` and `preview_urls` are `false` to match Terraform's `subdomain` setting.

**Why:**
- Cloudflare's Pages docs say: "Start new projects with Workers."
- `cloudflare_pages_project` has open drift bugs in provider v5 (#7288, #7303).
- Cloudflare documents splitting Terraform (the Worker) from wrangler (versions) as a supported pattern.
- wrangler only touches domains it lists, so the two tools don't fight.

**Turned down:** Pages with Git integration. It gives free PR previews, but it has the drift bugs, and it needs the Cloudflare GitHub app on the org.

## 2026-09-22 — The Worker is named `aith`

**Chosen:** `aith`, which matches the repository name. `wrangler.jsonc` `name` and `deploy/config/production.tfvars` `worker_name` must agree.

**Turned down:** `ai-in-the-heartlands`, for readability in the dashboard. We tried it and then went back to the repo name.

**Note:** A Worker's name can't change in place. Renaming it now means Terraform replaces the Worker and its custom domain.

## 2026-09-22 — Terraform state in the shared `aijutsu-terraform-state` R2 bucket

**Chosen:** The bucket that zworker provisions (`deploy/infra/cloudflare-r2-tfstate`), under the key `aith/cloudflare/terraform.tfstate`. That follows zworker's `<project>/<module>/terraform.tfstate` convention. Bucket and key live in `deploy/config/production.tfbackend`.

**Why:** One state bucket for all aijutsu projects, as zworker's `tfstate-bucket` skill sets out. Nothing new to create.

**Accepted cost:** R2 can't limit a credential to one key prefix. So the state key pair can read every project's state, and no secret may live in this module's state.

## 2026-09-22 — Keep the Cloudflare account ID out of the repo

**Chosen:** The Makefile builds the R2 endpoint (`AWS_ENDPOINT_URL_S3`) and `TF_VAR_account_id` from `CLOUDFLARE_ACCOUNT_ID` in the environment. Neither the tfbackend nor the tfvars file contains the account ID.

**Why:** This repository is public. zworker, which is private, commits the ID. We don't.

## 2026-09-22 — Terraform make targets follow zworker's `deploy-tf-*` pattern

**Chosen:**
- Each module gets `make deploy-tf-<module>-init`, `-plan` and `-apply`. They all go through a generic `.tf` target (`INFRA`, `ENV`, `CMD`).
- There is also `deploy-tf-reconfigure` for backend changes, and `deploy-tf-validate` checks every module.
- `init` runs with `-input=false` and plan/apply don't, so apply still asks for confirmation.

**Why:** It matches the other aijutsu repos, so there is one way to run infrastructure everywhere.

## 2026-09-22 — Gitea is the source of truth; GitHub is a push mirror

**Chosen:**
- The repository lives at https://gohan.aijutsu.dev/aijutsu/aith, which is private and behind Cloudflare Access. CI runs there on Gitea Actions.
- Gitea's **built-in push mirror** copies it to https://github.com/aijutsu/aith, which is public.
- The site's edit and source links, and the README's clone command, point at GitHub.

**Why:** Aijutsu moved its version control to Gitea. The course is public and open source, and learners can't get past Cloudflare Access.

**Consequence:** The push mirror force-pushes and prunes. So a pull request must never be merged on GitHub; it is taken into Gitea instead ([github-mirror.md](./github-mirror.md)).

**Turned down:**
- A `mirror-to-github.yml` workflow, which is fast-forward only and fails loudly on divergence. It was written, then dropped for Gitea's own mechanism, which needs no Actions secret.
- Pointing the links at Gitea: learners would hit a login page.

## 2026-09-22 — CI on Gitea Actions, the same way as the sister repos

**Chosen:** `.gitea/workflows/site.yml`, with the runner rules from `aijutsu/observatory`:
- **Runner and image:** `runs-on: ubuntu-latest`, with no `container:` image.
- **Actions:** `actions/checkout@v4` is the only action.
- **Toolchains:** Node (24.12.0) and Terraform (1.15.1) are installed with `curl` at pinned versions.
- **Cache:** no npm cache.
- **Steps:** every step is a `make` target.
- **Deploy:** `make deploy` runs on pushes to `main`.

**Why:**
- The runner (`gitea/runner:1.0.0`) runs JavaScript actions on the job container's own Node, which only the default image has.
- Current `setup-node` and `setup-terraform` releases need the `node24` action runtime.
- The runner's job cache is off.

**Turned down:** Keeping GitHub Actions. That CI would have run on the mirror, not on the source of truth.

## 2026-09-22 — Brand colour `#C83122`, with a lighter link colour in dark mode

**Chosen:** `#C83122` as the site's brand colour, set in `.vitepress/theme/custom.css`. It is used for links and buttons in light mode, and for buttons in dark mode. Dark-mode links use `#D96F64`, a lighter tint. Tips and notes stay on the default theme's indigo. The shades are in [site.md](./site.md#theme).

**Why:**
- `#C83122` as link text on the dark background is 3.2:1, below WCAG AA (4.5:1). `#D96F64` is 5.2:1. Buttons keep the exact colour, because white text on `#C83122` is 5.4:1 in both modes.
- The default theme colours tips and notes with the brand colour. A red tip would look like a caution, which is also red.

**Turned down:** `#C83122` for links in dark mode too. It matches the brand exactly, but it's hard to read for many learners.

## 2026-09-22 — The light/dark switch sits in the nav bar from 768px

**Chosen:** A small CSS override that shows VitePress's own switch in the nav bar at 768px and wider, and removes its copy from the "…" menu. Phones keep it in the ☰ menu. `appearance` stays at the default: follow the device setting until the reader chooses.

**Why:** The default theme only puts the switch in the nav bar at 1280px and wider. Below that it's inside the "…" menu, where most readers on a laptop won't find it.

**Turned down:**
- A custom switch component: the built-in one already follows the device setting and remembers the reader's choice.
- The switch in the phone nav bar too: the title, search and ☰ buttons already fill it.

## 2026-09-22 — A Courses page, generated from `course.yaml`

**Chosen:** `course/courses.md`, a new page whose `:::courses` block lists every course from its `course.yaml`. The nav's "Courses" link and the sidebar's "Courses" heading go there. The home page's Course Overview stays as it is: it's the full plan, including courses not yet written.

**Why:**
- "Courses" went to the first course, which will be wrong as soon as there's a second.
- It's the same pattern as the glossary: data in YAML, and a page that shows it with a block. Adding a course needs no edit to the page, and a platform can ignore the page and read the manifests itself.
- Each card's anchor is the course's `id`, which never changes.

**Turned down:**
- A hand-written list: one more list to keep in step with the folders.
- Pointing "Courses" at the home page's Course Overview (`/#course-overview`): it lands learners halfway down a long page, among courses that don't exist yet.
- Moving the Course Overview off the home page: the home page must link to every course (`make validate`), and the plan belongs next to the course's purpose.

**Format:** A new optional page and a new block are additions, so the format stays at v1.

## 2026-09-22 — Images are at most 400px wide on desktop

**Chosen:** One CSS rule in `.vitepress/theme/custom.css`: `.vp-doc img` gets `max-width: min(100%, 400px)` at 768px and wider. Phones are unchanged.

**Why:** The course's images are phone screenshots taken on a 2x screen (728px wide). At the full column width they showed at almost twice their real size, and the tallest one (728×1120) was over 1,000px tall. At 400px they are close to real phone size and still readable.

**Turned down:**
- A height cap only: it shrinks tall screenshots, but a wide phone screenshot (728×586) would still fill the column.
- Working out each image's real size at build time (from its pixel density): more code than the problem needs, and many tools strip that metadata.

**Revisit:** When a page needs a wide image, such as a desktop screenshot or a diagram. 400px is too small for those. Add a way to mark wide images, or click-to-zoom.

## 2026-09-22 — The home page's Course Overview is shown as cards

**Chosen:** The Course Overview in `course/index.md` stays a plain Markdown list. On the site, a markdown-it core rule (`.vitepress/course-overview-plugin.ts`) tags it, and `custom.css` shows it as cards that copy the default theme's home feature cards (`VPFeature.vue`). Courses not yet written get a "Coming soon" badge. The details are in [site.md](./site.md#what-the-config-does).

**Why:**
- We wanted the look of the home page at https://docs.adsgram.ai, which is VitePress's `features:` frontmatter.
- `course/` can't hold renderer keys, and the list must still read well on GitHub (site.md tells GitHub readers to use it). Decorating it in the renderer changes neither.
- The cards stay in the same place on the page, under their heading, after the TL;DR and prerequisites.
- The rule finds the list by its link to a course folder, which `make validate` already requires on the home page. The heading was renamed ("Course Overview" to "Courses Overview") the same day, so a CSS selector on the heading's id would have quietly turned the cards back into a list.

**Turned down:**
- Building `features:` in `transformPageData`, which gives the real `VPFeatures` component. Six of the seven courses exist only in this list (they have no `course.yaml`), so the config would have to parse the Markdown. The cards would show above the TL;DR, and the list would show a second time below them unless the config also removed it.
- CSS only, on `h2#courses-overview + ol`: it breaks when the heading is renamed, and it needs `:has()` to tell written courses from planned ones.
- A new `:::` block: a course format change, and GitHub would show the marker instead of the list.

**Revisit:** When most courses are written. Then the cards could be built from each `course.yaml` (`summary`, `outcomes`), like the Courses page, rather than from the list.

## 2026-09-22 — Collapsible sections are HTML `<details>`, not a `:::` block

**Chosen:** Pages may use `<details>` with a `<summary>` for content that differs by operating system. Sections of one group share a `name`, so opening one closes the others. `make validate` checks that each `<details>` is closed and has a blank line after `</summary>`.

**Why:** It is the only option that works everywhere without code. GitHub shows it as a collapsible section, VitePress passes it through, and every CommonMark tool keeps it. A platform can read it as plain HTML.

**Turned down:**
- VitePress's `::: details`: it is renderer syntax, which the format forbids, and it shows as raw text on GitHub.
- A new `:::os` or `:::tabs` block: it would need a renderer plugin, and GitHub would show the markers as text.
- Tabs: they need JavaScript, and they don't exist on GitHub.

## 2026-09-22 — Course 001 installs NanoClaw with `bash nanoclaw.sh --agent-provider codex`

**Chosen:** The course installs Git, Docker and Codex first, then has learners run setup themselves with `--agent-provider codex`. Windows learners use WSL2 with Ubuntu, and Docker Desktop with WSL integration. `$setup` in Codex is kept as a short demo of skills.

**Why:**
- NanoClaw's `setup` skill only tells the user to run `bash nanoclaw.sh`. Setup reads answers from the terminal, so it can't run inside Codex's shell.
- Without the flag, setup shows a pre-built image offer (default: yes) before the runtime picker. That image is for Claude only.
- ChatGPT sign-in needs the Codex command installed before setup starts.
- On WSL without Docker Desktop, setup would install Docker Engine inside Ubuntu instead.
- On macOS, setup needs Homebrew (for Node.js) anyway, so the course installs Homebrew in the Git step and uses it for Git, jq and Docker Desktop.

The details, with file paths, are in `course/001-building-agents-with-nanoclaw/README.md`.

## 2026-09-22 — The home hero has the splash picture as a full-width background

**Chosen:** The splash picture fills the home hero on desktop, with the title, tagline and buttons over the sky on the left, and a dark fade behind them. Below 960px it's a banner above the text. It's CSS only (`custom.css`), with a compressed copy of the picture in `.vitepress/theme/aith-splash.webp`. The details are in [site.md](./site.md#theme).

**Why:**
- The picture was drawn as a banner: open sky on the left, people on the right. That is the usual place for hero text.
- The picture only decorates the site, and AGENTS.md says anything only the site needs goes in `.vitepress/`, not `course/`. A CSS `url()` also lets Vite hash the file and add it to the build, with no copy step.
- At 278 KB it costs a learner on a phone about a tenth of the 2.3 MB original.

**Turned down:**
- VitePress's hero `image` (the spot right of the text): it is made for a square logo of at most 320px. This banner would be about 560×250px, with the people very small. The image path would also need a `public/` folder in `course/`, or a copy step.
- The picture in `course/img/`, or an `image` key in page frontmatter: it's not course content, and a frontmatter key would be a course format change for one picture.
- A dark fade in screen percentages: measured, it left the tagline below 4.5:1 at 1024px and 1920px. The fade now follows the text column.

**Revisit:** If a future course platform wants a cover picture for the series. Then add an optional field to the course format, and move the picture into `course/`.

## 2026-09-22 — OrbStack is the recommended Docker on macOS in course 001

**Chosen:** The macOS Docker steps offer OrbStack first, as the recommended choice, and Docker Desktop second. Windows and Linux are unchanged.

**Why:** OrbStack is smaller and lighter than Docker Desktop, which matters on learners' laptops. It gives the same `docker` command (it switches the Docker context to `orbstack`), so NanoClaw works with it unchanged. Its Homebrew package needs macOS 14 or newer, the same as Docker Desktop, so the prerequisites don't change.

**Trade-offs:**
- OrbStack is free only for personal, non-commercial use. Work use needs its Pro plan ($8 per user per month, as of September 2026). Docker Desktop is also free for small businesses. The course says this next to each option.
- NanoClaw's setup only knows how to start Docker Desktop (`open -a Docker`). With OrbStack, learners must open it before setup. The course says so in Steps 3 and 7.

## 2026-09-22 — Course 001 setup: the agent runs on Codex, the setup helper can be Codex or Claude Code

**Chosen:** Step 7 has two accordions, "Codex" and "Claude Code", for the helper that learners use during setup: to try NanoClaw's setup skill (`$setup` or `/setup`), and to debug a failed step. The setup command, `bash nanoclaw.sh --agent-provider codex`, and the question table are shared, so the agent runs on Codex either way.

**Why:** Some learners already pay for Claude and know Claude Code. NanoClaw's setup is built around Claude for failure help: before the runtime is picked, only Claude can debug a failure. So a learner with Claude Code gets help at every stage.

**Accepted cost:** The Claude Code path needs two plans: Claude Pro or higher for the helper, and ChatGPT for the agent. The pre-requisites say so, and the Claude Code accordion repeats it.

## 2026-09-22 — The home hero's fade follows the theme, with a longer tail

**Chosen:** This changes the fade from the splash picture entry above. In light mode the fade behind the hero text is white, with the usual red title and dark text. In dark mode it stays black, with white text. In both themes the fade-out after the text is 280px long instead of 200px. The details are in [site.md](./site.md#theme).

**Why:**
- A black fade and white text in light mode made the hero a dark block at the top of an otherwise light page. A white fade keeps the hero in the page's theme.
- The 200px fade-out ended in a visible edge. A 40% longer tail makes the change from fade to picture gentler.
- Measured in both themes at 1024, 1440 and 1920px, every pixel behind the text still passes: the title needs 3:1 and gets at least 3.4:1; the tagline needs 4.5:1 and gets at least 4.9:1.

**Accepted cost:** Between 960px and about 1200px wide, the longer tail reaches the people. In light mode it puts a white haze over the left side of the boy and the girl.

## 2026-09-22 — Copyright and Terms of Use: free to learn from, approval needed to teach or reuse

**Chosen:**
- The materials are copyright Aijutsu Pte. Ltd. (202610279E). `course/terms.md` is the Terms of Use. Anyone may read and learn from the materials for free. Teaching them, copying them elsewhere, or using them in other course materials needs written approval. Requests to license the materials, or to have Aijutsu run a course, go to hello@aijutsu.dev.
- The terms also cover the usual points for a learning site: what learners build is theirs; suggested changes give Aijutsu a licence to use them; other people's software (such as the NanoClaw submodule) keeps its own licence; use at your own risk; limits on liability; privacy; changes to the terms; Singapore law.
- The site footer carries the copyright notice and a link to the terms, on every page. The default theme shows the footer only on pages without a sidebar, which here is only the home page, so `custom.css` shows it everywhere ([site.md](./site.md#theme)).
- The sidebar lists the terms too, under "Reference", after the glossary. Readers see it without scrolling to the bottom of a long course page.
- The page is called "Terms of Use", not "Terms of Service". The site offers materials to read, with no accounts or service to sign up for.

**Why:**
- Aijutsu runs paid workshops from these materials. Learners should be able to learn on their own for free, but others shouldn't run the courses as their own.
- The repository has no licence file, so by default all rights are reserved. The terms say what readers may do on top of that.
- A copyright notice only on the home page would never be seen by someone reading, or copying, a course page.

**Turned down:**
- An open licence such as CC BY-SA or CC BY-NC. Both let anyone teach the materials (BY-NC still allows free classes), which is the one thing that needs approval.
- The terms in a `LICENSE` file only: learners read the site, not the repository.

**Wording:** The footer, the home page and the README still call the materials "open source", meaning their files are public. Under the Open Source Initiative's definition, a licence that limits who may teach them is not open source. The terms page says what "open" means here. If the wording causes confusion, "free to learn from" or "source-available" are more exact.

**Revisit:** Have a lawyer review the terms. Revisit when paid workshops or licences get their own terms, or when a `LICENSE` file is added for GitHub readers.

## 2026-09-22 — The site starts in light mode; dark mode has its own hero picture

**Chosen:**
- The site starts in light mode, whatever the reader's device setting, with `appearance: { initialValue: 'light' }`. The switch still works, and the reader's choice is remembered. This replaces "follow the device setting until the reader chooses" in the light/dark switch entry above.
- In dark mode the home hero shows a night version of the splash picture (`aith-splash-dark.webp`), with the same layout as the day one. The details are in [site.md](./site.md#theme).

**Why:**
- Light as the starting theme was Aijutsu's call. No further reason was recorded; add it here if it matters later.
- A night scene suits dark mode better than the day picture under a black fade.

**Turned down:**
- `appearance: false`: light only, but it removes the switch, and some learners need dark mode.
- A custom switch component, or a script in `head` that sets the theme: VitePress's own `initialValue` already feeds both the no-flash head script and the switch. It only needs a `@ts-expect-error`, because VitePress's type lists only `'dark'`.

**Accepted cost:** Learners whose device is set to dark see light mode on their first visit, until they flip the switch.

## 2026-09-22 — One top nav link, "Courses Overview"; an About Aijutsu page

**Chosen:**
- The top nav has one link, "Courses Overview", to the Courses page (`/courses`). The "Glossary" link is gone from it. The glossary stays in the sidebar ("Reference") and in the home hero's buttons.
- A new page, `course/about.md` ("About Aijutsu"), in the sidebar's "Reference" group, after the Terms of Use. It says who makes the courses, what Aijutsu does, how it works, who the founder is, and what the name means. It is written from https://aijutsu.dev, in the course's plain-English style.
- The page is a new known page in the course format (the Layout table, and `knownPage()` in `format/validate.mjs`). An optional page is an addition, so the format stays at v1.

**Why:** Aijutsu asked for a simpler top bar and an About page. The About page links to aijutsu.dev for prices instead of copying them, so the course doesn't carry prices that go out of date (AGENTS.md makes the course responsible for keeping prices it quotes correct).

**Open question:** "Courses Overview" in the nav goes to the Courses page, which lists only the courses that are written. The home page's "Courses Overview" section lists every planned course. If readers expect the full plan, point the nav link at `/#courses-overview`, or rename one of the two.

## 2026-09-22 — The About page is written in Aijutsu's voice, for answer engines

**Chosen:** This changes the style of the About page from the entry above. `course/about.md` is the one page under `course/` that the plain-English writing rules don't cover. It is written in Aijutsu's voice ("we"), with proper technical and business terms, and structured for answer engine optimisation (AEO):
- question headings ("What does Aijutsu do?", "Who founded Aijutsu?"), each answered in its first sentence, which names Aijutsu;
- an "at a glance" facts table (legal name, UEN, founder, focus areas, services, contact);
- the same names everywhere, and a frontmatter `description` that summarises the company in one sentence.

It doesn't say where its text comes from, and it links to aijutsu.dev for prices. The rules are in AGENTS.md ("Writing rules").

**Why:**
- Aijutsu asked for it. The page describes a company to potential clients and partners, and to AI answer engines, not a skill to learners. Rewording "readiness sprint" or "ISO 27001" into plain English would make it less precise for the people who need those terms.
- Answer engines quote single passages. A heading that matches the question, and an answer that names Aijutsu, can be quoted on its own.

**Turned down:** Structured data (schema.org `Organization` as JSON-LD). It helps answer engines further, but `course/` allows no `<script>`. If wanted, `config.mts` can add it to the `/about` page's `<head>` (`transformHead`), without touching `course/`.

## 2026-09-22 — Course 001 is split into lessons; lessons use page frontmatter only

**Chosen:** The course page (`001-building-agents-with-nanoclaw/index.md`) states the objectives, lists the lessons, and keeps the References table. The content moved into two lessons: `01-installations/` (prerequisites, terminal, Git, Docker, Codex) and `02-setting-up-nanoclaw/` (Telegram bot, download, setup, first message). Their steps are numbered from 1 in each lesson. Lessons are the `NN-slug/index.md` pages the format already allowed. They have the same frontmatter as any page. The site already listed them in the sidebar, and the Courses page counts them.

**Why:** The single page had grown to over 400 lines. Lessons give learners short pages, a place to stop, and "Next page" links.

**Still open:** a lesson `id`, like a course's `id`, so a platform can track progress even if a lesson folder is renamed. It is still reserved, together with `duration` and `outcomes`. Adding a required field is easy before the lessons are published, and harder after (see [Versions](./course-format.md#versions)).

## 2026-09-22 — Lessons have a stable `id` in their frontmatter

**Chosen:** Every lesson's frontmatter has a required `id`: a slug, unique within its course, that never changes. It is the folder name without its number (`01-installations/` → `installations`), the same rule as course ids. `format/schema/lesson.schema.json` checks its shape, and `make validate` checks that it is unique in the course. Course 001's lessons are `installations` and `setting-up-nanoclaw`.

**Why:** A lesson's folder, and so its URL, can change when lessons are added, split or renumbered. A future platform needs something fixed to track progress by: the course `id` plus the lesson `id`. It was added before any lesson was published, so the format stays at v1.

**Turned down:**
- A `lessons:` list in `course.yaml`: a second place to keep in step with the folders, far from the page it describes.
- Using the folder name as the id: renumbering a lesson would change it.

**Supersedes:** the "Still open" note in "Course 001 is split into lessons" above.

## 2026-09-22 — SEO and AEO metadata, worked out from the course format's data

**Chosen:** `.vitepress/seo.ts` adds, at build time: a canonical URL, Open Graph and Twitter tags, and one schema.org JSON-LD `@graph` per page (`transformHead`); `robots.txt`, `llms.txt` and a fixed-URL social card (`buildEnd`); and VitePress's own `sitemap.xml`. Details in [site.md](./site.md#seo-and-aeo).

**Why:**
- Aijutsu asked for SEO and AEO metadata. Answer engines quote structured facts and llms.txt; search engines need canonicals and a sitemap.
- Everything comes from frontmatter, `course.yaml` and `glossary.yaml`, so `course/` gets no SEO keys, and a new course or term gets its metadata by itself. The glossary becomes a `DefinedTermSet`, which answer engines can quote term by term.
- Aijutsu's JSON-LD `@id` is `https://aijutsu.dev/#organization`, the one aijutsu.dev uses, so engines join the two sites' Aijutsu into one organisation.
- `robots.txt` allows every crawler. AEO needs answer engines to read the site.

**Turned down:**
- SEO fields in page frontmatter (`image`, `keywords`, …): a course format change, and renderer data in `course/`. The title and description are enough.
- A per-page social card (with the page title drawn on it): more build tooling for little gain. One card for the whole site.
- Blocking AI training crawlers (such as `CCBot` and `Google-Extended`) while allowing answer engines: a trade-off Aijutsu hasn't asked for. It is two lines in `ROBOTS_TXT` if wanted.

## 2026-09-22 — Plausible analytics through the site's own Worker

**Chosen:** Cookieless Plausible analytics, self-hosted at ponzu.aijutsu.dev, through the `aith` Worker on disguised same-origin paths (`/js/p.js`, `/api/e`). The Worker gets a script (`worker/`); `assets.run_worker_first` runs it only for those two paths. The page's snippet runs only on `aith.aijutsu.dev`. The Terms of Use's privacy section says what it records. Details in [analytics.md](./analytics.md).

**Why:**
- Aijutsu asked for Plausible, proxied so ad-blockers don't block it, following aijutsu/website. It uses the same Plausible, the same "new script", the same Access bypass, and the same safeguards (forward the visitor's IP and User-Agent; turn an upstream redirect into a 502).
- Same-origin on `aith.aijutsu.dev` is the most first-party option: no CORS, and no second hostname for blocklists to learn.
- `run_worker_first` keeps every page a plain static-asset response, with no Worker invocation.

**Turned down:**
- Sending events through the website's proxy on `anya.aijutsu.dev`: it would tie this public repository's analytics to another repository's Worker, and it's cross-origin.
- A separate analytics Worker and hostname: more Terraform and DNS for the same result.
- The classic Plausible script with `data-domain` (works without a per-site file name): aijutsu.dev uses the new script, and one pattern is easier to run.

**Accepted cost:** Analytics stays off until the site is added in Plausible and its tracker's file name is set as `PLAUSIBLE_SCRIPT` in `wrangler.jsonc` ([analytics.md](./analytics.md#turning-it-on)). Until then the Worker answers `/js/p.js` with 404, and nothing is sent.

## 2026-09-23 — A `LICENSE.md` at the root: a summary that defers to the Terms of Use

**Chosen:**
- The repository has a root `LICENSE.md`. It covers everything here, including the code in `format/`, `.vitepress/`, `worker/` and `deploy/`: all rights reserved, with the "free to learn from" permission carved out.
- It is a summary, about 45 lines. `course/terms.md` stays the one place the full terms live, and `LICENSE.md` says so: "Where the two differ, the Terms of Use apply."
- It states plainly that it is not an open-source licence, and that the files being public is not permission to reuse them.
- It excludes the Git submodules under `course/` and the npm dependencies, which keep their own licences.
- The apex `README.md` and `AGENTS.md` no longer call the repository "open source". They say public, or public but not open source.

**Why:**
- This closes the "Revisit" item on [Copyright and Terms of Use](#2026-09-22--copyright-and-terms-of-use-free-to-learn-from-approval-needed-to-teach-or-reuse) above, and supersedes its "The repository has no licence file" reasoning. All rights reserved by default was correct, but it only works for a reader who knows that a missing licence means no permission. Most people check for a LICENSE file and read nothing into its absence.
- GitHub and Gitea both surface a `LICENSE` file in the repository header. That is where someone deciding whether they may reuse the materials looks first, and they may never reach the site.
- A summary, not a second copy of the terms, keeps one source of truth. The copyright notice is already in two places (`course/terms.md` and the site footer); a full restatement would make a third legal text to keep in step, and the footer has already drifted once.
- Once `LICENSE.md` says "not an open-source licence", a README two lines away saying "open source" is a contradiction a reader would have to resolve. Changing the contributor-facing wording was cheaper than qualifying it.

**Turned down:**
- MIT, Apache-2.0, CC BY-SA, or CC BY-NC. Every one permits teaching the materials, which is the single thing that needs approval. CC BY-NC-ND is closest, but its "NonCommercial" still allows free classes, and it can't be revoked.
- Dual-licensing: MIT for the publishing code (`format/`, `.vitepress/`, `worker/`, `deploy/`), proprietary for `course/`. It would let others reuse the machinery, but it puts a licence boundary through a repository whose product is the writing, and every new file would need a side picked.
- Restating the terms in full so `LICENSE.md` stands alone. Rejected for the drift cost above.

**Accepted cost:** GitHub and Gitea will label the repository "Other" rather than a recognised licence, and it won't appear in open-source licence filters. That is accurate.

**Still open:** The published site still says "open source" in the home page intro (`course/index.md`) and the footer message (`themeConfig.footer`). Both are learner-facing copy, so they were left for Aijutsu to reword. See [known-issues.md](./known-issues.md).

**Revisit:** Have a lawyer review `LICENSE.md` alongside the terms. Revisit if the publishing code is ever split into its own repository, where an open licence would cost nothing.

## 2026-09-23 — Lessons may hold sub-lessons, one level deep

**Chosen:** A lesson folder may hold lesson folders of its own: `course/NNN-slug/NN-slug/NN-slug/index.md`. The parent lesson's `index.md` becomes the overview, and each sub-lesson is a page. It stops there: `LESSON_DEPTH = 2` in `format/courses.mjs`, and `make validate` rejects a third level.

Course 001's `01-installations/` is the first user. It was one page with eight steps, and is now an overview plus one page per tool: `01-terminal/`, `02-git/`, `03-docker/`, `04-make/`, `05-codex/`.

**Why:**
- The installations lesson had grown to 265 lines, with every operating system's steps for four tools on one page. A learner installing Docker had to scroll past Git, and the page's own outline was the only way to find anything.
- One page per tool gives each one its own URL, its own "Next page" link, and its own place in the sidebar. A learner can stop after Git and come back to Docker.
- The overview page can then do what a long page can't: say what each tool is for, before any installing starts.
- Nesting is additive. Nothing about a lesson changed, no published id changed, and a course with no sub-lessons reads exactly as before. So the format stays at v1 (see [Versions](./course-format.md#versions)).
- The change is small because `format/courses.mjs` is shared: making lesson discovery recursive there gave the validator, the sidebar, the sitemap, `llms.txt` and the JSON-LD the same new shape at once.

**Ids:** A lesson's `id` is unique within its course; a sub-lesson's within its lesson. A page is then identified by the ids down to it (course, lesson, sub-lesson), which is what a platform tracks progress by.

**Turned down:**
- **Each tool as a top-level lesson** (`02-terminal/`, `03-git/`, …, `07-setting-up-nanoclaw/`). No format change at all, but it flattens the course into seven equal lessons and loses the fact that installing is one phase of the course. The Courses page's lesson count would say seven.
- **Keeping one page, with a tools table at the top.** The cheapest option, and it was considered seriously. It fixes the "what is each tool for" gap but not the length, the scrolling, or the lack of per-tool URLs.
- **Unlimited nesting.** Discovery would be simpler (no depth check), but the sidebar and the JSON-LD would have to handle any depth, and no course needs it. Two levels is a rule the validator can enforce.

**Accepted cost:** Relative links from a sub-lesson are one level deeper (`../../../glossary.md`). Nothing checks that automatically apart from the site build's dead-link check, which does catch a wrong count.

**Revisit:** If a course ever needs three levels. Raising `LESSON_DEPTH` is a one-line change, but check the sidebar's look at `level-4` and add a row to the JSON-LD table in [site.md](./site.md#seo-and-aeo) first.

## 2026-09-23 — The course site reports into the `aijutsu.dev` Plausible site, split by Hostname

**Chosen:** The site loads the `aijutsu.dev` tracker, so its visits land in that Plausible site, alongside aijutsu.dev's. The course site is the `aith.aijutsu.dev` value of Plausible's **Hostname** dimension. `PLAUSIBLE_SCRIPT` in `wrangler.jsonc` holds that tracker's id. This settles the "Accepted cost" in "Plausible analytics through the site's own Worker" above: nothing has to be created in Plausible, and analytics works from the first deploy.

**Why:**
- It is Plausible's own way to cover subdomains: the same tracker everywhere, and the Hostname filter to separate them. Plausible records the hostname on every pageview.
- One dashboard for everything on `aijutsu.dev`, including the path a reader takes from the marketing site to the course.
- No second site to set up, and no second tracker id to keep in step.

**Accepted cost:**
- Totals mix both sites until a Hostname filter is set.
- The Pages report groups by path without the hostname, so `/about` on both sites adds up.
- Goals are shared.
- Plausible's "Verify installation" step can't see this site: the tracker is proxied and added by an inline script. Check the dashboard for a live visitor instead.

**Turned down:**
- **Its own Plausible site** (`aith.aijutsu.dev`): cleaner totals, its own goals, no path mixing. It needs the site created in the dashboard, and its own tracker id here. This is the way back if the numbers get muddled: add the site, change `PLAUSIBLE_SCRIPT`, and nothing else moves.
- **The classic tracker with `data-domain`** (configured by hostname, no id): it also needs a separate site, and it's Plausible's older tracker, unlike aijutsu.dev's.

**A correction worth keeping:** the first version of this decision claimed a shared site could not tell the two sites' pages apart. That was wrong: the Hostname filter does exactly that. Only the default, unfiltered Pages report merges identical paths.

## 2026-09-23 — Every install page checks twice: before the steps, and after

**Chosen:** Inside each operating system's `<details>` on an install page, three bold labels in a fixed order: **Check if it's already installed.**, **Install it.**, **Check that it works.** The closing check moved inside the accordion, so it is per system, with only that system's troubleshooting. The page-level `## Check that it works` section is gone.

The two checks answer different questions, so they are usually different commands: `docker --version` (is it there?) then `docker run hello-world` (does it run?); `codex --version` then `codex login status`. Where they would be the same command (Git on Windows and Linux, Make everywhere), the first check ends the section — "skip the rest of this section" — rather than sending the reader to the bottom to type it again.

**Why:**
- These are common tools. A learner who already has Git, Docker or Make had no way to find that out without working through steps that would either fail or silently reinstall. The first check gives them permission to skip, which is the difference between a 40-minute lesson and a 2-minute one.
- The closing check was one section for all three systems, so its troubleshooting listed every system's fix ("On a Mac… On Windows… On Linux…"). A reader only ever needs their own. Inside the accordion each page says one thing.
- A reader opens exactly one accordion, so repeating the check in all three is not repetition they see.

**Bold labels, not headings.** `outline: 'deep'` puts every `##`–`######` into the page's "On this page" list, including headings inside a closed `<details>`. Three headings × three systems would have made a nine-item outline of three repeated names. Bold labels keep the outline at "Install it" and "Next", and match the style the Docker page already used (`**Recommended: OrbStack.**`).

**Turned down:**
- **Keeping one page-level "Check that it works".** The smaller change, and it avoids writing the check three times. But it can't be tailored per system, which is what made the old one clumsy.
- **A single check at the top that covers the whole page.** It would have to test every tool at once and couldn't say which step to jump to.

**Accepted cost:** The check text is now written three times per page, so a change to a check has to be made three times. `make validate` can't catch a copy that drifts.

**Note:** `01-installations/05-codex/` has no accordions — the steps are identical on every system — so its three labels are `##` headings, and its outline is the fuller one.

## 2026-09-23 — The About page is restructured: who Aijutsu is, what it does, why it runs the course, who is on the team

**Chosen:**
- `course/about.md` is restructured to four top-level sections, in this order: **About Aijutsu** (the intro paragraph alone), **What does Aijutsu do?**, **Why does Aijutsu run AI in the Heartlands?**, and **Who is on the Aijutsu team?**, with the contact section left at the end.
- The team section is a per-person `###` block, so it grows as Aijutsu hires. Today it holds the founder only: Joseph Matthias Goh, his three previous roles (Head of Platform Engineering at watchTowr, Platform Architect at StashAway, DevOps Engineer at GovTech), his Newfield Ontological Coaching Certification, and his LinkedIn profile. It sits second-to-last, after the reader knows what Aijutsu does and why the course exists.
- "What does Aijutsu do?" is a services × domains model, not a list of offerings. Three services (senior technical advisory, transformation journey facilitation, bespoke app and web app development) are delivered in three domains (AI, cloud, compliance). Two lists name them, then a 3×3 table says what each service looks like in each domain.
- Removed: the engagement-model table, "Who does Aijutsu work with?", "What makes Aijutsu different?", and the "Aijutsu" name etymology. The founder biography was cut and then brought back as the team section, with specifics the old bio didn't have. The `aijutsu.dev/pricing` link is gone from the page; aijutsu.dev is the only place with pricing now.
- Headings stay third-person questions that name Aijutsu ("What does Aijutsu do?"), even though the brief phrased them in the first person ("What do we do?"). The body keeps Aijutsu's "we" voice.
- `.vitepress/seo.ts` was updated in the same change: `makesOffer` now carries the three new service names and descriptions, `knowsAbout` gains cloud migration and compliance automation, the organisation `description` matches the page's opening sentence, and the `founder` node gains a description, `alumniOf` (watchTowr, StashAway, GovTech) and `hasCredential` (the Newfield certification) to match the team section.

**Why:**
- Aijutsu asked for the three-section shape. The page had grown to eight sections, and the services were described three different ways (a services list, an engagement table, and a differentiators list) that had to be kept in step by hand.
- The services × domains matrix is the shape of the business: the same three services are sold into three domains. A flat list forced each domain to be repeated inside each service's paragraph.
- The AEO rule in `AGENTS.md` is that a heading must still make sense when an answer engine quotes its section alone. "What do we do?" has no subject once extracted; "What does Aijutsu do?" does. Same reason the first sentence of each section names Aijutsu.
- `seo.ts` holds a second, machine-readable copy of the services (its comment says "course/about.md says the same"). Renaming the services on the page alone would have made the JSON-LD contradict the visible text for the engines the page exists to serve.
- A per-person team section is how a practice that sells senior attention proves it. Naming the companies and the audits is a concrete, checkable claim; "over a decade of experience" is not. It reads better late in the page, once the reader knows what is on offer.
- The "at a glance" facts table is removed, and with it the `AGENTS.md` rule that required it. The table repeated facts the page already made, and a reader met it before being told what Aijutsu does. Most of what it carried is still on the page: Singapore in the intro, the legal name and UEN in the contact section, the founder in the team section, services and domains in their own lists. Two facts are dropped entirely — "Clients: founders, operators, and enterprises", and the link to aijutsu.dev/pricing.

**Turned down:**
- Folding the removed sections in as subsections. It keeps every fact, but the page stays long and the three-section shape stops being visible, which was the point.
- Leaving the removed sections after the three new ones. Same problem, and it puts the weakest material last where the contact details belong.
- A flat services list with no matrix. Cheaper to maintain, but it loses the one thing the new structure is for: showing that any service can be engaged in any domain.

**Accepted cost:**
- The engagement models (custom application development, readiness sprint, adoption sprint) and their durations are gone. Anyone wanting them is sent to aijutsu.dev.
- The nine matrix cells were written from the brief and the previous copy. They describe a real practice's services, so Aijutsu should check them before this is published.

**Supersedes:** the About page's shape as set out in "The About page is written in Aijutsu's voice, for answer engines" (2026-09-22) above: the "at a glance" facts table and the engagement, differentiators and etymology sections are gone. That entry's AEO rules — question headings, a self-contained first sentence naming Aijutsu, no copied prices — all still hold.

**Revisit:** When aijutsu.dev changes what Aijutsu does, as `AGENTS.md` already requires for this page.

## 2026-09-23 — Every command block says where to type it

**Chosen:** In the line directly above every fenced command, the course names the window: "In Terminal, run:" on a Mac, "In the Ubuntu terminal, run:" on Windows, "In the terminal, run:" on Linux, "In your terminal, run:" where the steps are the same everywhere. The word links to the "Open a terminal" page (`01-installations/01-terminal/`) **once per section** — the first command inside each `<details>`, and the first in a page's own prose.

Course 001 has 49 command blocks. All 49 now name a window; 14 carry the link.

**Why:**
- The course is written for people who have never used a terminal. A bare code block with a copy button doesn't say where it goes, and "open a terminal" was said once, a page or two earlier.
- Windows is the case that actually breaks. `wsl --install` runs in PowerShell, and everything after it runs in the Ubuntu terminal. Both are "a terminal" to a beginner, and typing `sudo apt install` into PowerShell fails in a way they can't read. Those blocks now say which window, and the PowerShell ones carry no link, so the link never points at the wrong window.

**Once per section, not once per command.** A reader opens exactly one `<details>`, so a link in each is a link they will see. Repeating it on all eleven blocks of the Git page would put the same href on screen three times in a row. This also matches the writing rule in `AGENTS.md`: link a term where it first appears.

**Turned down:**
- **Linking every occurrence.** Literal, and it needs no judgement about what a "section" is, but it reads as noise.
- **Linking the glossary entry (`glossary.md#terminal`) instead.** The glossary says what a terminal *is*. A reader stuck at a command needs the page that says how to *open* one, which is the sub-lesson.
- **A note once at the top of each page.** That is what the course effectively had, and it is the thing that didn't work: readers arrive mid-page from the sidebar or a search result.

**Accepted cost:** Nothing enforces this. A new command block with no lead-in passes `make validate` and the site build. The check is reading the page, or re-running the one-off audit over the fenced blocks.

## 2026-09-23 — Opening a collapsible section scrolls its header to the top of the screen

**Chosen:** When a reader opens or closes a `<details>` section on any page, the site scrolls that section's `<summary>` to 16px below whatever the theme keeps stuck at the top of the screen. `.vitepress/theme/details-scroll.ts` does it, in one delegated listener started from the theme's `setup()`. The details are in [site.md](./site.md#theme).

**Why:**
- Sections for each operating system share a `name` ([course-format.md](./course-format.md#markdown)), which makes them one accordion: opening "Windows" closes "macOS". When the open one is above, the page under the reader's cursor jumps up by the height of the section that just closed, and they land in the middle of steps they didn't pick. The install pages are where this hurts most: those sections are 20 to 50 lines long.
- The header is what the reader aimed at, so it is the thing to pin. Putting it at the top also gives the steps below it the whole screen.
- **The offset is measured from the theme's own bars, not written in.** What covers the top changes with width (48, 112 or 64px), the local nav bar has no height variable to read, and a measured offset survives a VitePress bump that changes those heights.
- **A `click` on the summary, not the `toggle` event.** `toggle` doesn't bubble, and a named group fires two per click, which would race. One click covers the mouse and the keyboard together.
- **Smooth under one screen height, instant beyond it, instant under `prefers-reduced-motion`** — the same rule the default theme uses for heading anchors, so a section and a heading link behave alike.
- Checked in headless Chrome at 1600, 1024 and 390px: opening, switching within a group, closing, Enter on a focused summary, and with reduced motion on. The header landed within 1px of its mark in every case.

**Accepted cost:**
- Closing a section scrolls too, even when its header is already in view. It is a small move the reader didn't ask for, taken so that the header ends in the same place either way.
- Closing the last section on a short page leaves too little document below it, so the browser stops short and the header stays lower than 16px. Nothing can be done about that.
- This is the theme's first behaviour: until now it was the default theme plus CSS. The rule that a custom layout or Vue component needs a decision first still stands, and new behaviour belongs in this one file.

## 2026-09-23 — Aijutsu's voice is codified in AGENTS.md, learned from Aijutsu's own rewrites

**Chosen:**
- `AGENTS.md` gains an "Aijutsu's voice" sub-section under the `course/about.md` writing exception. Nine rules, each quoting the drafted line and the line Aijutsu replaced it with.
- It covers `course/about.md` and any other page written in Aijutsu's own voice, such as the home page intro. Not course material, not the glossary, not the Terms of Use.
- It carries an instruction to keep learning: when a draft is rewritten, read the rewrite against the draft and add what it teaches.
- Where the voice collides with the AEO rule (Aijutsu writes subject-dropped openers such as "Founded Aijutsu in 2026…"), AEO wins for the first sentence under a heading only. After that, the voice wins.

**Why:**
- Aijutsu rewrote most of the drafted About copy, and asked that the change be learned rather than repeated. Rules written from the actual before/after pairs are checkable; a general instruction to "write in Aijutsu's voice" is not, and had already produced copy that needed rewriting.
- `AGENTS.md` is the one file every agent reads, so Codex and Claude Code get the same rules. A note kept only in one assistant's memory would not reach the others.
- The quoted before/after pairs are the useful part. They make it obvious that "TL;DR", "drop an email to" and "Majority of AI workshops" are deliberate register, not errors to be smoothed away, which is exactly the mistake an agent optimising for correctness would make.

**Turned down:**
- A separate `docs/system/voice.md`. The rules are three screens from the writing rules they qualify, and `AGENTS.md` already holds the about-page exception.
- Recording the rules only as personal assistant memory: other agents wouldn't see them, and the repository requires that agent instructions live in `AGENTS.md`.

**Revisit:** Every time Aijutsu rewrites drafted copy. The section says so itself.

## 2026-09-23 — Claude Code gets its own optional page, marked optional in its title

**Chosen:** `01-installations/06-claude-code/`, titled "Install Claude Code (optional)". It is the last page of the Getting Started lesson, after Codex. The install and sign-in steps moved there out of the Claude Code accordion in `02-setting-up-nanoclaw/`, which now links to it.

**Why:**
- Claude Code was already in the course, but only as two steps buried inside a `<details>` in lesson 2, where a reader deciding whether they want it would never see them. Every other tool the course installs has a page.
- The page can now do what the buried steps could not: say who should install it and who should skip it, and say plainly that the agent runs on Codex either way. That last point was the real confusion risk — Claude Code is the reader's helper, not the agent's brain.
- Lesson 2 gets shorter, and its two helper accordions become symmetrical: both now say "you installed this in the Getting Started lesson" and start with the same three steps.

**Optional, and the title says so.** The sidebar, the course page and the overview table all carry the word, so a reader never has to open the page to find out they can skip it. The Codex page's "Next" offers it and names the alternative, rather than marching the reader into it.

**Turned down:**
- **Leaving the install inside lesson 2.** Fewest moving parts, but it keeps the decision invisible and makes the two helper accordions asymmetrical — one installing a tool mid-setup, the other not.
- **A required page.** Claude Code needs a paid Claude plan on top of the ChatGPT Plus the course already requires. Making it required would raise the course's cost of entry for no gain.
- **Putting it before Codex.** Required tools come first; the optional one is easiest to skip at the end.

**Accepted cost:** The install command and `claude auth status --text` are pinned to nothing — they are Claude Code's own, not the fork's, so `update-submodule` won't re-check them. They have a row in the course README's dependency table instead.

## 2026-09-23 — Lesson 2 is split into one page per step, and images live in `img/`

**Chosen:**
- `02-setting-up-nanoclaw/` becomes an overview plus four sub-lessons, one per step: `01-telegram-bot/`, `02-download-nanoclaw/`, `03-run-setup/`, `04-say-hi/`. Its `index.md` keeps the fork note and gains a table of the steps, the same shape `01-installations/index.md` already uses for its tools.
- Each sub-lesson is a sidebar entry, because `lessonItems()` in `.vitepress/config.mts` already recurses. No renderer change was needed.
- The two ways to make a Telegram bot (the BotFather mini app, or the chat) are `<details>` sections of one group, `name="new-bot"`, like the Codex/Claude Code helper sections on the setup page.
- Page images move into an `img/` folder next to the page, named for what they show (`img/botfather-mini-app-home.png`), replacing screenshots dropped in as `image.png`, `image-1.png`, … This is now written in [course-format.md](./course-format.md#layout).

**Why:**
- The lesson was one long page with four `### Step N` headings. A reader doing setup over two sittings had no address to come back to, and the sidebar showed the lesson as a single entry while Getting Started listed every tool. The two lessons now read the same way.
- Each step ends at a natural stopping point (a bot token, a downloaded folder, a running agent), which is what a page break is for.
- An accordion for the two bot flows means a reader follows one, not both. As headings they read as eight steps to do in order, which is what the page looked like before.
- `image-4.png` and `image-5.png` were near-identical screenshots of the same screen, and only one was used. Names that say what a picture shows make that obvious at a glance.

**Turned down:**
- **Leaving "Say hi to your agent" on the overview page.** It is short, but it is the step that proves setup worked, and a reader who comes back to check their agent wants an address for it.
- **Numbering the pages "Step 1…Step 4" in their titles.** The folder numbers already order them, and the sidebar shows them in order. Titles that say what the reader does survive a renumbering; "Step 3" does not.
- **A shared `img/` folder for the lesson.** Images belong to the page that uses them, so the page and its pictures move together.

**Accepted cost:**
- Anchors into the old page (`…/02-setting-up-nanoclaw/index.md#step-3-set-up-nanoclaw`, which `01-installations/06-claude-code/index.md` used) are gone. Nothing checks anchors, so they were found by hand. Links to the pages themselves are unaffected.
- `img/botfather-mini-app-token-blank.png` is kept but unused: it is the same screen as `botfather-mini-app-token.png`, with the placeholder bot name. Delete it if nobody wants it.

## 2026-09-23 — A "Cleaning Up" lesson, starting with uninstalling NanoClaw

**Chosen:** A third lesson, `03-cleaning-up/`, with one sub-lesson today: `01-uninstalling-nanoclaw/`. It teaches NanoClaw's own `./uninstall.sh`, then deleting the checkout folder. Its overview says the lesson is skippable while the reader is still using NanoClaw, and lists what removal cannot undo.

**Why:**
- The course tells a reader to install a background service, a Docker image and a credential file on their own computer. It has to tell them how to take it off again, or the only exit is guessing.
- It is a lesson, not a page on the setup lesson: cleaning up is a phase of the course, like Getting Started and Setting up NanoClaw, and it will grow a page per thing the course leaves behind (a Notion integration, a second channel).
- The steps are checked against the pinned fork, like every other instruction: `uninstall.sh` is a shim over `nanoclaw.sh --uninstall`, the four confirm groups come from `GROUPS` in `setup/uninstall/flow.ts`, and each has a row in the course README's dependency table so `update-submodule` re-checks them.

**What the page promises, and why it can:** nothing is deleted until every question is answered, Enter keeps (`initialValue: false`), and Ctrl-C during the questions changes nothing. That is the uninstaller's own design — it runs on the `node_modules` it deletes, so it decides everything first and removes the runtime last.

**Turned down:**
- **A "Troubleshooting / Uninstall" section on the setup page.** It would put "how to delete your agent" on the page where the reader is building it, and it would not have a sidebar entry to come back to months later.
- **Teaching `./uninstall.sh -y`.** It deletes everything found without asking. The preview flag (`-n`) is taught instead, which is the flag a first-time reader actually wants.
- **Telling the reader to delete Git, Docker, Make and Codex.** They are ordinary tools that other work uses. The page lists them as left alone instead.

**Accepted cost:** The page tells a non-technical reader to run `rm -rf ~/nanoclaw`, which has no undo and no Trash. It carries a warning, and offers deleting the folder in the file manager first. `.env` is backed up to `.env.bak` *inside that folder*, so the page says to move it out before the folder goes — that trap is easy to miss and costs the reader their keys.

## 2026-09-23 — Clicking a picture shows it big (a lightbox), instead of marking wide images

**Chosen:** `.vitepress/theme/lightbox.ts`, a second delegated listener on `document`, and its styles in `custom.css`. Clicking a picture in a page lays it over the page; clicking the dimmed area around it, the close button, or pressing Escape puts it back. Clicking the picture itself does nothing, so it can't be shut by accident while it is being read.

**Why:**
- The 400px cap on desktop images is right for a phone screenshot at 2x, and wrong for a wide one. Course 001 now has an 893×332 screenshot of Codex in a terminal, and at 400px its text can't be read. [site.md](./site.md#theme) had already named this case and asked for a way to mark wide images, or click-to-zoom.
- Click-to-zoom beats marking wide images: the author doesn't have to decide anything per picture, there is no new syntax in `course/`, and the course format stays renderer-neutral. A `wide` marker would have been a format change for a display problem.
- No dependency. medium-zoom is the usual choice, but this is ~130 lines of plain DOM against a stable browser API, and the repository has no runtime dependencies to keep it that way.

**The size it grows to** is the smallest of: the screen less its padding, the picture's own pixels but never under 720px, and the width that still fits the height. The 720px floor matters: most course screenshots are 374–412px wide, so a natural-size-only rule would have dimmed the page and changed nothing for five of the eight pictures in lesson 2. A little softness on those beats a click that does nothing.

**Checked** in headless Chrome over CDP, at 1440×900 and 390×844: the overlay opens on click and sits above the sidebar; the picture ends up at 893×332 (from 400) on desktop and 351×130 on a phone; a 728×1120 screenshot fits the height at 466×717; a 407×65 strip grows to 720×115; clicking the picture keeps it open; the dimmed area, the close button and Escape all close it; the scrollbar is restored on close; a modified click is ignored; and opening a collapsible section still scrolls without opening a lightbox.

**Turned down:**
- **Raising the 400px cap for wide images**, with a marker in the Markdown. It puts a display decision in the content, and a wide screenshot would still be smaller than its own pixels.
- **Making every picture focusable** (`tabindex="0"`, `role="button"`) so the keyboard can open it. It would mean writing attributes into content VitePress hydrates, and re-writing them after every route change. Once open, the lightbox is fully usable by keyboard; a keyboard-only reader still has the picture in the page and the browser's own zoom.
- **A Vue component.** The theme's rule is that behaviour is a delegated listener in its own file. A component would be the first one, and it buys nothing here.

**Accepted cost:** pictures under ~720px are shown larger than their own pixels, so they are slightly soft. On a phone the lightbox is only a little bigger than the page (351px against 273px), because the screen is the limit; pinch-zoom still works on it.

## 2026-09-23 — The setup page has one path, and starts the agent from a template

**Chosen:** `02-setting-up-nanoclaw/03-run-setup/` no longer has the two helper accordions (`$setup` in Codex, `/setup` in Claude Code). It has one path: run `bash nanoclaw.sh --agent-provider codex` in the terminal, and answer the table of questions. The first agent now comes from **the NanoClaw template library**, using the **`family-assistant`** template, instead of a fresh agent. A "Common issues" table carries the two prompts that stop most readers.

**Why:**
- Every reader did the same thing anyway — the accordions taught a skill invocation whose only output was "now run `bash nanoclaw.sh`", which is the command the next section gives. Cutting them removes a step that looked like setup but wasn't.
- A template gives a new reader an agent that already does something, instead of an empty one.
- The helper still matters when setup fails, so the page keeps one sentence about it, and the optional Claude Code page stays as it was.

**Checked against the pinned fork** (`setup/auto.ts`): `From the NanoClaw template library` (`:1067`), `Choose a template` (`:1158`), the OneCLI prompt and `Install a fresh instance for NanoClaw` (`:375`, `:384`), and the test-agent cleanup warning (`:651`).

**Watch out — the templates are not pinned.** `setup/templates.ts:12` clones https://github.com/nanocoai/nanoclaw-templates at run time, and the fork's own `templates/` ships empty. So `family-assistant` (`lifestyle/family-assistant`, checked 2026-09-23) can change or disappear without any submodule bump, and `update-submodule` will not catch it. It has a row in the course README's dependency table and in [known-issues.md](./known-issues.md), and it is the one course instruction that needs checking on a plain review. Whether that repository should be a pinned submodule, as [AGENTS.md](../../AGENTS.md) requires of referenced repositories, is an open question: the reader never clones it, so a pin would only give us a copy to check against.

**Knock-on edits, in the same change:** the page's own two sentences that pointed at the removed sections; `01-installations/06-claude-code/index.md`, which told a reader who skips Claude Code to "use the **Codex** section"; the course README's accordion note, its "keep three things in step" list, and two dependency rows that are gone; and three stale pointers in [known-issues.md](./known-issues.md).

## 2026-09-23 — The first agent comes from a `community-assistant` template shipped in the fork

**Chosen:** The setup page answers **From local templates**, then **`community-assistant`**. The template lives in the fork at `templates/community/community-assistant/`, and the pin moved to `96848d13` to carry it. This replaces the answers in the entry above (the NanoClaw template library, `family-assistant`), which stood for a few hours and was never published.

**Why:**
- It pins what the reader gets. The library option clones https://github.com/nanocoai/nanoclaw-templates when setup runs, so its contents could change under the course with no submodule bump, and `update-submodule` would never catch it. A template in the fork moves only when we move it.
- `community-assistant` is the agent this course is about — neighbourhood events, a member roster, requests, a lending library, all in Notion — so lesson 3's Notion work has something to build on.
- Upstream ships `templates/` empty, so the fork is the only place this can live.

**Checked against the pin** (`96848d13`): the `local` option at `setup/auto.ts:1069`, `Choose a template` at `:1158`, `What next?` at `:657` and `Your assistant is ready.` at `:933`. The picker's label is the last part of the ref (`setup/templates.ts:147`), so the answer is `community-assistant`, not `community/community-assistant`. `plugin.json` names it the same.

**Open, for the maintainer:** [AGENTS.md](../../AGENTS.md) says every NanoClaw customisation is a skill, and that edits which aren't a skill yet shouldn't be pinned. This template is a committed folder, not a skill. It is in the fork table's "Customised with" column, but either the rule wants a `/add-community-assistant` skill in the fork, or the rule wants an exception for content (templates, prompts) as opposed to code. Worth settling before the next customisation.

## 2026-09-23 — A data-sources lesson, and "Say hi" folded into the setup page

**Chosen:**
- **"Say hi to your agent" stops being a sub-lesson.** Its content is the end of `02-setting-up-nanoclaw/03-run-setup/`, under a "Say hi to your agent" heading. `04-say-hi/` and its lesson id (`say-hi`) are gone.
- **A new third lesson, `03-setting-up-data-sources/`**, between setting up NanoClaw and cleaning up, with three sub-lessons: `01-notion-page/`, `02-notion-connection/`, `03-watch-it-fill/`.
- **`03-cleaning-up/` becomes `04-cleaning-up/`.** The folder number changed; the lesson `id` (`cleaning-up`) did not, and no link into it broke, because its own links are relative to the lesson folder.

**Why:**
- The setup page already ends with a screenshot of the first Telegram message, with the reader's own "hello" in it. A separate page then told them to do the thing they had just seen themselves do. Replying is the same moment as finishing setup, not a step after it.
- The agent could chat but had nowhere to keep anything, which is the gap the `community-assistant` template is built around: Notion is its record. Until Notion is connected, every capability in that template is dead.
- The lesson sits before Cleaning Up because it is part of building the thing, and Cleaning Up is always last.

**What the reader does, and why it is three pages:** one empty parent page; a connection with a token and access to that page; then the handover and the payoff. The break between page two and page three is where the token changes hands, which is the one step with a real mistake in it — a valid token with no page access looks like a broken agent and returns `object_not_found`. The template's own `connecting-notion.md` calls that "the step most setups miss", so it gets its own check at the end of page two.

**The token never goes through the chat.** `mcp.json` ships `NOTION_TOKEN: "placeholder"` and the OneCLI vault swaps in the real value as the request leaves the container, so the agent never holds it. The course says this plainly, because a reader who has just pasted a bot token into a terminal will reasonably expect to paste this one to the bot.

**Turned down:**
- **Teaching the reader to build the five databases** (Members, Events, Items, Loans, Requests). The agent creates whatever is missing, and a hand-built set with different property names is worse than nothing: the template's references name the real properties.
- **A page per Notion concept** (workspace, page, database, connection). The reader needs one page, one connection, and a token.
- **Keeping `say-hi` as an empty stub page** to preserve the id. Nothing is published yet, so no learner's progress points at it.

**Notion's UI is the one unpinned dependency here.** The wording in the course (**Internal connections**, **Create a new connection**, the **Configuration** tab, **Installation access token**, **Content access** → **Edit access**, **•••** → **Connections** → **+ Add connection**) comes from https://developers.notion.com/guides/get-started/internal-connections, checked 2026-09-23 — not from the fork. The template's own reference still uses Notion's older names (`notion.so/profile/integrations`, "Internal Integration Token"); it tells the agent to expect drift and adapt, which the course pages can't do. There is a row for this in the course README's dependency table.

## 2026-09-24 — Nested numbered lists are numbered by the site: 1. / 1.1. / 1.1.1.

**Chosen:** CSS counters in `custom.css` give every nested ordered list its full number, with a trailing dot at each level, on every page. Only nested lists are touched: single-level lists keep the browser's marker. A markdown-it rule (`.vitepress/ordered-list-plugin.ts`) marks the lists the CSS may number, with `class="sub-numbers"` and `role="list"`, and skips three kinds it can't number correctly: one that starts at a number other than 1 (`counters()` can't read `start`), one nested under a bullet (no parent number to carry), and one another rule owns. A list it never sees keeps its own marker, so a miss shows plain numbering rather than none. Pages stay plain `1.` Markdown at every level. The details are in [site.md](./site.md#theme), and the author-facing rule is in [course-format.md](./course-format.md#markdown).

**Why:**
- The Notion lesson needed sub-steps inside a step, and without this the author had to type the numbers as prose. They were already wrong (the `1.1.`–`1.3.` block sat under step 2), and a picture indented as if it belonged to a sub-step rendered as a code block. Both problems disappear once the sub-steps are real list items.
- Numbers the site works out can't drift when a step is inserted, and they follow the page rather than the author's memory.
- It keeps `course/` renderer-neutral: the Markdown is ordinary nested lists that any CommonMark tool renders.

**Turned down:**
- **`::marker`**, which would keep the native markers and need no `role="list"`. Safari supports only `color` and `font-size` on it (MDN browser-compat-data), so every Mac and iPhone would show a flat `1.`.
- **Numbering single-level lists the same way**, for one consistent style. It would strip the markers from nearly every list in the course, and so need `role="list"` everywhere, for a result identical to what the browser already draws.
- **Keeping hand-typed numbers.** They are what broke, and nothing can nest under them.

**Accepted cost:** GitHub renders the same page with flat numbering (`1.` at every level), so a sub-step reads `1.` there and `2.1.` on the site. That is the trade-off already accepted for the Course Overview cards, which are a plain list on GitHub and cards on the site.

## 2026-09-24 — A page per package manager, and Codex and Claude Code move to Homebrew casks

**Chosen:**
- Two new pages between the terminal and Git: `02-homebrew/` ("Install Homebrew (macOS and Linux)") and `03-chocolatey/` ("Install Chocolatey (Windows)"). The tool pages after them shift to `04-git/`, `05-docker/`, `06-make/`, `07-codex/`, `08-claude-code/`, with their lesson `id`s unchanged.
- **Codex and Claude Code install from casks**: `brew install --cask codex` and `brew install --cask claude-code@latest`, replacing the two vendor `curl | sh` scripts, which stay on each page as a one-line fallback.
- **Homebrew goes inside Ubuntu on Windows**, used only for those two casks. `apt` keeps Git, jq and Make there, as on Linux.
- **Chocolatey's only job is Docker Desktop**, on the Windows side.

**Why:**
- Homebrew was already required, but it was installed in steps 1–4 of the **macOS** accordion on the Git page, where a reader met it as a side effect of installing Git and nothing named it. Windows had no package manager at all, and Docker Desktop was a manual download with five clicks.
- **The casks now ship Linux binaries** (`x86_64_linux` and `arm64_linux`, `depends_on: {}`), so the same command works on macOS, Linux and inside Ubuntu on Windows. That is what makes one path possible; it was not true when casks were macOS-only.
- `@latest` is load-bearing for Claude Code: that cask follows the newest release (2.1.281 when checked), while plain `claude-code` sits on a slower line (2.1.273). Codex has no `@latest` variant — `codex` is the equivalent.
- Homebrew's prerequisites on Linux (`build-essential procps curl file git`) install Git and Make, so the Git and Make pages get shorter rather than longer on those systems.

**Why Homebrew inside Ubuntu is safe on Windows**, given nobody here has a Windows machine to test on: Homebrew's docs say it "may be used on Linux and Windows Subsystem for Linux (WSL) 2", and list WSL 1 as Tier 3, where "you may experience issues running various executables installed by Homebrew". `wsl --install` gives WSL 2 on the Windows versions this course requires, so the supported setup is the default one. `01-terminal/` now tells a Windows reader to check the **VERSION** column of `wsl -l -v`, and to run `wsl --set-version Ubuntu 2` if it says `1`. That check is the guard on the whole Windows path.

**Turned down:**
- **Everything through Homebrew on Linux.** `brew install make` installs GNU Make 4 as `gmake` and leaves `make` alone, which reads as a broken instruction, and brew builds are slow on Linux for packages `apt` already has. The rule is: casks for what the distribution doesn't package, `apt`/`dnf` for what it does.
- **Chocolatey for Git, Make or Codex on Windows.** Those would land on the Windows side, where NanoClaw can't use them. Everything but Docker Desktop belongs inside Ubuntu.
- **Docker Engine from Homebrew on Linux.** There is no formula for the engine; Docker's own script stays.

**Accepted cost:** the Windows path costs an extra install (`build-essential` and Homebrew inside Ubuntu, a few minutes) for two CLI tools. In exchange, Codex and Claude Code have one command on every system, and the two pages keep their no-accordion shape. The Chocolatey package for Docker Desktop is community-maintained, not Docker's own, so `05-docker/` keeps the manual download as a fallback.

**Not verified here:** the Windows path end to end, and Homebrew on Linux. Every command comes from the vendor's current documentation, and the four cask names were resolved with `brew info --cask` on macOS. Worth one pass on a Windows machine before the course runs.

## 2026-09-24 — Call-outs carry an emoji for how serious they are

**Chosen:** A GitHub alert shows an emoji in front of its title on the site: 💡 for `NOTE`, `TIP`, `IMPORTANT` and `INFO`, ⚠️ for `WARNING`, and ‼️ for `CAUTION` and `DANGER`. Three emoji for three kinds — information, a warning, a serious warning — not one per alert type.

**Why:**
- The five alert types differ by a coloured bar and a word in capitals. A reader skimming an install page, who is mostly looking at commands, can miss the difference between "worth knowing" and "this deletes things with no undo".
- Three levels is what a reader can actually hold. `NOTE` and `IMPORTANT` both mean "read this"; the colour and the word still separate them for anyone who is reading closely.

**How, and why not in the Markdown:** `custom.css` sets `::before` content on `.custom-block-title`, inside `.github-alert`. An emoji typed into the page would be wrong on GitHub, where the same alert already gets GitHub's own icon, and it would put a rendering decision inside `course/`, which the format keeps renderer-neutral. The scoping class matters: `.github-alert` is on alerts only, so a VitePress `::: tip` container (which `course/` may not use anyway) is untouched.

**Two details that would otherwise cost an hour:** the emoji are CSS escapes, and ⚠️ and ‼️ (`\26a0`, `\203c`) need their variation selector `\fe0f` or the browser draws the plain black text glyph instead of the emoji. The gap after the emoji is a non-breaking space (`\a0`) so the title never wraps away from its icon.

**Checked** in headless Chrome, light and dark, by reading `getComputedStyle(title, '::before').content` for every type, including `caution` and `danger`, which no page uses yet.

**Open:** the one `IMPORTANT` in the course (don't move the `nanoclaw` folder after setup, in `02-download-nanoclaw/`) now shows 💡, though what it describes — a move that breaks the agent's background service — reads more like a `WARNING`. Left as it is, because retyping call-outs is a content decision, not a styling one.

## 2026-09-24 — `IMPORTANT` is a serious warning: ‼️ and red

**Chosen:** `> [!IMPORTANT]` moves out of the information group. It shows ‼️, like `CAUTION`, and its block turns red: `custom.css` points `--vp-c-important-1/2/3/soft` at the matching `--vp-c-danger-*`. This closes the open question in the entry above, which shipped `IMPORTANT` with 💡 a few hours earlier.

**Why:** the course uses `IMPORTANT` for exactly one thing — "don't move or rename the `nanoclaw` folder after setup", which silently breaks the agent's background service. That is not "key information", it is a way to break a working install, and 💡 next to it read like a tip. The default purple said the same thing: worth knowing, not dangerous.

**Why the variables, not the block:** `--vp-custom-block-important-bg` already reads from `--vp-c-important-soft`, so re-pointing the four colour variables changes the border, the text, the code background and the block background together, in light and dark, with no new rule per element. It also keeps this repository's one CSS rule intact: `custom.css` changes colours through variables.

**What it costs:** `IMPORTANT` and `CAUTION` now look alike — same red, same ‼️ — and differ only by the word. Acceptable: no page uses `CAUTION`, and both mean "this one can hurt". If a page ever needs to separate them, `CAUTION` is the one to restyle, not `IMPORTANT`.

**Checked** in headless Chrome, both themes: the block computes `rgba(244, 63, 94, 0.14)` in light and `0.16` in dark, with `content: "‼️ "` on the title.

## 2026-09-24 — The data-sources lesson follows the template: duplicate, don't build

**Chosen:** with the pin at `48d7260a`, lesson 3 is rewritten around what the `community-assistant` template now does:

- **The reader duplicates a published Notion template** (`01-notion-page/`, retitled "Copy the Louis template into Notion") instead of making an empty page. The agent never creates databases: "They arrive with the copy" (`references/community-onboarding.md`).
- **Sixteen databases, not five**, and the course lists them by theme rather than by property (`references/notion-schema.md`).
- **The agent is Louis** (`agentName` in the template's `plugin.json`, v1.1.0), and the pages, the lesson overview and the course page all say so.
- **The last page binds Louis to the reader's copy** (`03-watch-it-fill/`, retitled "Point Louis at your copy"): send him the link, he checks all sixteen are there and that the relations point inside the copy, then he remembers the page ID and never searches by title.
- **The token goes in with `make add-notion-connection`**, the Make target the fork added with its `add-notion-credentials` skill.

**Why:** the pin moved and the template underneath the lesson changed shape. The old lesson told readers to make an empty page and wait for the agent to build five tables — with the new template that produces an agent with nowhere to write and no way to recover, because it is forbidden from creating or title-searching databases.

**Two things this fixed elsewhere:**
- **Make finally has a job.** The fork now ships a `Makefile`, so `01-installations/06-make/` is no longer teaching a tool the course never uses. The open follow-up in [known-issues.md](./known-issues.md) is closed, and the course README row rewritten.
- **The credential step got safer.** `make add-notion-connection` prompts with the input hidden and writes the secret with the exact host pattern and header the gateway needs. The alternative — the gateway's `secret_url` — has to have its `path=` blanked by hand, and the skill says getting it wrong "surfaces later as an unexplained 401".

**The one unpinned dependency this adds:** the published template URL (`app.notion.com/p/Louis-the-Community-Builder-…`). The template README says the URL is handed over out of band and no plugin file contains it, so it can't be checked against the pin. It has a row in the course README's dependency table. If the page is republished, the course breaks and nothing here notices.

**Not verified by reading:** nobody has walked this lesson end to end against `48d7260a` — the duplicate, the connection, `make add-notion-connection`, and Louis binding to the copy. The steps come from the template's own references and from the screenshots in `02-notion-connection/`, which were taken on a real run of the connection half.

## 2026-09-24 — IBM Plex: Sans for the pages, Mono for code, both self-hosted

**Chosen:** the site drops Inter for **IBM Plex Sans** (the variable build, `wght` axis) and sets **IBM Plex Mono** for code, through VitePress's two font variables in `custom.css`. Both come from `@fontsource` packages pinned in `package.json` and are served from the site itself. `transformHtml` in `config.mts` re-points VitePress's hard-coded Inter preload at the Sans file. The details are in [site.md](./site.md#theme).

**Why:**
- Aijutsu asked for IBM Plex. One family in two voices keeps a command in a sentence looking like a command, which this course does constantly.
- Self-hosting keeps the privacy promise in `course/terms.md` intact: no third party sees a reader's IP address for a font. It is also what the default theme already does with Inter, so nothing new had to be invented.
- The variable Sans is one file for the four weights the theme uses, and a page ends up fetching about 60 KB of font — close to what Inter cost.

**Turned down:**
- **IBM Plex Mono for everything,** which was the first cut and was tried: it suits the brand, but monospace prose fits ~10–15% fewer words per line, and these are long lessons for non-technical readers.
- **Google Fonts.** One `<link>` instead of a dependency, but every reader's browser would call Google, which the terms say the site doesn't do.
- **Leaving Inter for the prose.** Plex Sans and Plex Mono are one family and sit together properly.
- **Keeping VitePress's Inter preload.** Nothing renders in Inter now, so it was ~50 KB fetched on every page for nothing.

**Accepted cost:** `transformHtml` matches VitePress's preload tag by pattern, so a VitePress upgrade can silently bring the Inter preload back. There's a row for it in [known-issues.md](./known-issues.md).

**Checked** in headless Chrome on a lesson page: prose, headings, navigation and sidebar compute to `IBM Plex Sans Variable`, inline code and code blocks to `IBM Plex Mono`, and the only font files fetched are `ibm-plex-sans-latin-wght-normal.woff2` and `ibm-plex-mono-latin-400-normal.woff2`.

## 2026-09-24 — A glossary word explains itself where it stands

**Chosen:** hovering a link into the glossary, or tabbing to it, opens a bubble with the term, its type and its definition (`.vitepress/theme/glossary-tooltip.ts`). The definition rides on the link itself: `glossary-link-plugin.ts` adds `data-glossary*` attributes to any link ending `glossary.md#<anchor>`. Clicking still goes to the glossary page, and a dotted underline marks the words that have a definition.

**Why:**
- The course explains a term where it first appears and links the rest to the glossary. Following that link costs the reader their place mid-instruction, which is the worst moment to lose it.
- Nothing changes in `course/`: pages keep writing `[token](../../../glossary.md#token)`, so the link still works on GitHub and without JavaScript, and the format stays renderer-neutral.
- Inlined, not fetched: the whole glossary is 12KB, a page carries only the terms it uses, and the bubble opens with no request.

**A tap doesn't open it, and that is the honest limit.** VitePress registers its router on `window` with `{capture: true}` and calls `go()` from behind an `await`. It therefore routes before any listener the theme can add, in either phase, and a `preventDefault` that arrives afterwards changes nothing — verified: the bubble opened and the page navigated anyway. Touch readers get the glossary page, which has the same words in full.

**Turned down**, because each buys the tap at a price worth more than 33 links:
- **Wrapping glossary links in `.vp-raw`**, which the router skips. Every glossary click would become a full page load instead of an SPA transition.
- **Stripping `href` while the bubble is open.** The router bails on a link with no href, but an `<a>` without one is no longer a link to assistive technology or to "open in new tab".

**Checked** in headless Chrome: the bubble opens on hover and on keyboard focus, carries the term and type, sets `aria-describedby`, stays inside the viewport, and closes on Escape, on leaving, and on scroll.

## 2026-09-24 — A fourth lesson: the agent meets other people

**Chosen:** `04-agent-playtime/`, between the data-sources lesson and Cleaning Up (which becomes `05-cleaning-up/`, id unchanged). Four sub-lessons: make a Telegram group and add the bot; connect the agent to it and watch a Notion round trip; add neighbours and meet the permission tiers; change the agent's personality.

**Why:** everything before it is one person talking to one agent in a private chat. The template is built for a community, and three of its ideas only appear once other people are in the room — that a message's *account* decides what the sender may do, that verification is an admin's job done in a DM, and that the Admin Log records it. A course that stopped at "it answers you" would never show them.

**What each page rests on, checked against `48d7260a`:**
- **The bot is the phone line; the agent is who answers.** `src/router.ts` creates a messaging group only when the bot is *mentioned*, then escalates through `channelRequestGate` because nothing is wired yet. That two-step is the lesson's spine, not an implementation detail to hide.
- **The card in the owner's DM** — `📣 Bot mentioned in new channel`, with `Connect to <agent>` / `Choose existing agent` / `Connect new agent` / `Reject` — is `buildApprovalOptions` in `src/modules/permissions/channel-approval.ts`.
- **Tiers, the matrix, DM-only verification and the append-only Admin Log** come from the template's own `references/permissions.md`.
- **Personality** is the `self-customize` container skill: memory and `instructions.prepend.md` are the agent's to edit without approval, while the composed `CLAUDE.md`/`AGENTS.md` is rebuilt every spawn. The course says to ask the agent first, and offers Codex for bigger edits.

**One correction to the brief:** the approval card asks which **agent** to connect, not which **template**. `createNewAgentGroup` makes an empty agent group; templates are only applied by `ncl groups create --template` or the setup wizard. The page therefore tells the reader to pick Louis, and says plainly that `Connect new agent` would give them a blank one.

**Screenshot placeholders.** `01-create-telegram-group/` carries `<!-- screenshot: … -->` comments where the author will add pictures. They render as nothing, so the page is publishable while it waits, and `grep -rn "screenshot:" course/` lists what is outstanding.

**Not verified by reading:** nobody has walked this lesson. The Telegram steps, the card, the tier behaviour and the personality edit all come from the fork's code and the template's references, not from a run.

## 2026-09-26 — NanoClaw 2.4.0: pin the fork's own update, and teach replying to Louis

**Chosen:** pin the fork's `main` at `273e181c`: upstream v2.4.0 plus 7 commits (`c313d061`), merged by the fork owner with `/update-nanoclaw`, plus the fork's own Telegram reply-threading (with force-reply) and sender-ID skills. Upstream's two newer commits (`d4ff64f4`, Claude's default output style) are left for the next `/update-nanoclaw`: the course runs on Codex, so they don't touch it.

**What 2.4.0 changed in the course:**
- **The OneCLI row left Common issues.** OneCLI now installs through the `add-onecli` skill, and its `scripts/setup.ts` reuses a healthy existing OneCLI without asking. The "Found an existing OneCLI… Install a fresh instance" prompt no longer exists.
- **The uninstaller asks about three groups, not four.** `setup/uninstall/onecli-agents.ts` is gone. OneCLI is now listed under "Shared gateway applications and credentials", which the uninstaller leaves alone, as the page already said.
- **Replying to Louis in a group.** `telegram-reply-threading` makes his answers quote the question and open the asker's reply box (Telegram's selective ForceReply), and makes replies to him reach him without a mention. The group page teaches this instead of "mention the bot each time".

**Why the fork's refactor matters to the course:** `/update-nanoclaw` reinstalls channel files from the registry, which silently dropped the fork's edits to `src/channels/telegram.ts`. The reply-threading edits now live in files that the update merges, so the behaviour the course teaches survives the next update.

**Not verified by reading:** nobody has run setup, the group conversation or the uninstaller on `273e181c`.
