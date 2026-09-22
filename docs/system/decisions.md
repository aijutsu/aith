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
