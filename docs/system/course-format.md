# Course format v1

This is the contract for how course material is laid out in this repository. Two things read it today, and more may later:

- the **validator** (`make validate`), which checks that the rules below hold;
- the **course site** at https://aith.aijutsu.dev, built by VitePress (see [publishing.md](./publishing.md)).

A future course platform may ingest any repository that follows this format and show each course in it. That is why the rules are strict: the content must mean the same thing to every tool that reads it, without running any code from the repository.

## Principles

1. **Declarative.** Everything a reader needs — structure, order, titles, metadata — comes from folder names, YAML, and Markdown. Nothing comes from a renderer's code config.
2. **Portable.** Pages use a small Markdown subset that shows correctly on GitHub, on the site, and in any CommonMark tool.
3. **Stable identity.** A course is identified by its `id`, never by its folder name or title. Folder numbers only set the order.
4. **Renderer-neutral content.** Anything that only one renderer understands (VitePress layouts, heroes, components) lives in that renderer's config, not in `course/`.

## Versions

Each course declares `format: 1` in its `course.yaml`. Adding optional fields or new allowed blocks keeps the format at 1. Renaming or removing anything, or changing what a field means, needs a new format number and a migration note here.

## Layout

The content root is `course/`. A file's role comes from where it is:

| Path | Role |
| --- | --- |
| `course/index.md` | Home page of this repository's courses. Must link to every course. |
| `course/courses.md` | Courses page. Lists every course with a `:::courses` block. |
| `course/glossary.yaml` | The single glossary (data). |
| `course/glossary.md` | Glossary page. Shows the glossary with a `:::glossary` block. |
| `course/terms.md` | Terms of Use page: the copyright, what readers may do with the materials, and what needs written approval from Aijutsu. |
| `course/about.md` | About page: who makes the courses (Aijutsu), what else they do, and how to reach them. |
| `course/NNN-slug/` | A course. `NNN` is a three-digit order number (`001`, `002`, …). |
| `course/NNN-slug/course.yaml` | The course manifest. Required. |
| `course/NNN-slug/index.md` | The course's main page. Required. |
| `course/NNN-slug/NN-slug/index.md` | A lesson: one part of a course, on its own page. `NN` is a two-digit order number (`01`, `02`, …). Its frontmatter also has an `id` (see [Lesson frontmatter](#lesson-frontmatter)). |
| `course/NNN-slug/NN-slug/NN-slug/index.md` | A sub-lesson: one part of a lesson, on its own page, numbered the same way. Its parent lesson's `index.md` is then the overview: what the sub-lessons cover, and in what order. Lessons nest two levels deep and no further (`LESSON_DEPTH` in `format/courses.mjs`). |

Slugs use lowercase letters, digits, and single hyphens. Any other Markdown file under `course/` is an error, so new kinds of pages are added to this spec first.

Sub-lessons are optional. Use them when one lesson covers several things a learner does one after another, and each one is long enough to be its own page (course 001's `01-installations/` has one page per tool). A lesson with no sub-lessons is still a normal lesson page.

**Never published**, and never read as content:

- any `README.md` (READMEs are repo-only notes for contributors);
- anything inside a submodule (paths come from `.gitmodules`);
- dot-folders and `node_modules`.

Images and other files a page uses sit next to that page, in an `img/` folder: `02-setting-up-nanoclaw/01-telegram-bot/img/botfather-profile.png`, used as `./img/botfather-profile.png`. Name a file for what it shows, in lowercase with hyphens, so the next author can tell the screenshots apart without opening them. An `img/` folder belongs to one page; a picture two pages need is copied, not shared from a folder above.

## `course.yaml`

Schema: [`format/schema/course.schema.json`](../../format/schema/course.schema.json).

| Field | Required | Meaning |
| --- | --- | --- |
| `format` | yes | Always `1` for this version. |
| `id` | yes | Stable identifier, a slug. **Never change it** once published: a platform tracks learner progress by it. |
| `title` | yes | Course title. The site uses it in navigation. |
| `summary` | yes | One or two plain-English sentences about the course. |
| `outcomes` | no | List of what a learner can do after the course. |
| `prerequisites` | no | List of what a learner needs before starting. |
| `software` | no | The course's submodules: `name`, `path` (relative to the course folder), `url` (as in `.gitmodules`; the fork, for fork submodules), and `upstream` (the original project, for forks). Must list exactly the submodules inside the course folder. |

Example:

```yaml
format: 1
id: building-agents-with-nanoclaw
title: Building community agents with NanoClaw
summary: Learn the basics of AI agents by building your own with NanoClaw.
software:
  - name: NanoClaw
    path: nanoclaw
    url: https://github.com/aijutsu/aith-nanoclaw-codex-telegram
    upstream: https://github.com/nanocoai/nanoclaw
```

## Page frontmatter

Schema: [`format/schema/page.schema.json`](../../format/schema/page.schema.json). Every published page starts with:

```yaml
---
title: Building community agents with NanoClaw   # required
description: One plain-English sentence.         # optional
---
```

No other keys are allowed (lessons add one, below). In particular, no renderer keys such as `layout`, `hero`, `sidebar`, or `outline`. The site decides those itself (the home page's hero is built from its `title` and `description`).

### Lesson frontmatter

Schema: [`format/schema/lesson.schema.json`](../../format/schema/lesson.schema.json). A lesson, at either level, has the page fields, plus a required `id`:

```yaml
---
id: installations # never change this, even if the folder or title changes
title: Getting Started
description: Get your computer ready for the course.
---
```

- `id` is a slug. Base it on the folder name without the number: `01-installations/` → `installations`.
- It is unique among the lessons that share the same parent: a lesson's id within its course, a sub-lesson's id within its lesson. So a page is identified by the ids on the way down to it — course `building-agents-with-nanoclaw`, lesson `installations`, sub-lesson `make` — and a platform tracks learner progress by that path.
- **Never change it** once the lesson is published, even if the folder, number or title changes.
- Lesson ids were defined in v1 before any lesson was published, so no published content changed meaning.

## `glossary.yaml`

Schema: [`format/schema/glossary.schema.json`](../../format/schema/glossary.schema.json).

```yaml
types:
  Concept: An idea or a way of working. ...
terms:
  - term: API
    type: Concept
    description: Short for Application Programming Interface. ...
    url: https://en.wikipedia.org/wiki/API
```

- `type` must be one of the keys under `types`.
- Terms are unique and sorted alphabetically, ignoring case.
- Each term gets an anchor on the glossary page from its name: lowercase, with every run of other characters replaced by `-` (`Node.js` → `node-js`, `SOC 2 Type II` → `soc-2-type-ii`). Link to a term with `../glossary.md#node-js`.

## Markdown

Allowed:

- CommonMark, plus GitHub tables and task lists.
- GitHub alerts: `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]`, `> [!CAUTION]`.
- Collapsible sections, for steps that differ by operating system: `<details>` with a `<summary>`. They open and close on GitHub, on the site, and in any CommonMark tool.

  ```markdown
  <details name="install-git">
  <summary>macOS</summary>

  1. Open Terminal.

  </details>
  ```

  - Leave a blank line after `</summary>` and before `</details>`. Without it, the Markdown inside is shown as raw text. `make validate` checks the first one.
  - Give the sections of one group the same `name`. Opening one then closes the others, like an accordion. Browsers that don't support `name` just let several stay open.
  - Put them at the top level of the page (under a heading), not inside a list item.
- Named blocks from this list, written `:::name` on their own line and closed with `:::`:

  | Block | Meaning |
  | --- | --- |
  | `courses` | Lists every course in order, from each `course.yaml` (`title`, `summary`), with a link to the course. Used only in `course/courses.md`. |
  | `glossary` | Shows the whole glossary from `glossary.yaml`. Used only in `course/glossary.md`. |

Not allowed (the validator rejects these outside code blocks and inline code):

- components or capitalised HTML tags (`<Badge>`), `<script>`, `<style>`;
- VitePress containers such as `::: tip` (use GitHub alerts instead);
- template syntax: `{{ … }}`.

## Links

- Link between pages with **relative links to the `.md` file**, e.g. `./001-building-agents-with-nanoclaw/index.md` or `../glossary.md#fork`. These work on GitHub and on the site. Count the `../` from the page's own folder: the glossary is `../glossary.md` from a course page, `../../glossary.md` from a lesson, and `../../../glossary.md` from a sub-lesson.
- **Link to a page, not to a heading inside it**, when the target may be reorganised. A sub-lesson's address (`../01-installations/05-codex/index.md`) survives renumbering; an anchor into a long page (`#step-4-install-codex`) does not, and neither the validator nor the site build checks anchors.
- Never link to a `README.md` or into a submodule with a relative link: those files are not published, and the site build fails on dead links. Link to files in a submodule with a full GitHub URL instead.

## Checking

| Command | Checks |
| --- | --- |
| `make validate` | Schemas; page locations, including how deep lessons nest; no renderer keys or disallowed syntax; `<details>` closed, with a blank line after `</summary>`; every lesson has an `id`, unique among the lessons with the same parent; unique course `id`s; every course linked from `course/index.md`; `software` matches `.gitmodules`; glossary types, uniqueness, and order. |
| `make site-build` | Everything the renderer needs, including **dead links** (the build fails on any). |

CI runs both on every pull request.

## Where the pieces live

| Path | What |
| --- | --- |
| `format/schema/*.schema.json` | JSON Schemas (draft 2020-12), usable from any language. |
| `format/courses.mjs` | Content discovery: courses, the lesson tree, published pages, submodule exclusions, anchor slugs. Shared by the validator and the site, so both read the layout the same way. `discoverCourses()` gives every lesson a `lessons` array (its sub-lessons, empty when it has none), a `path` from the content root, and a `depth`, so callers walk the tree the same way at every level. `flattenLessons()` gives one flat list in reading order. |
| `format/validate.mjs` | The validator. |
| `.vitepress/` | The VitePress renderer. Nothing in `course/` depends on it. |

## Reserved for later versions

Ideas kept open so they can be added without breaking v1: lesson fields (`duration`, `outcomes`), exercise/solution/checkpoint blocks, notes for instructors only, and translations.
