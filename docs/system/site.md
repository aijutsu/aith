# The course site (VitePress)

How `.vitepress/` turns `course/` into https://aith.aijutsu.dev. The content rules are in [course-format.md](./course-format.md); building and deploying are in [publishing.md](./publishing.md).

The one rule behind everything here: **`course/` stays renderer-neutral.** Anything only VitePress understands (layouts, the hero, navigation, custom rendering) lives in `.vitepress/` and is worked out from the course format's own data. A future course platform must be able to read `course/` without VitePress.

## Files

| Path | What it does |
| --- | --- |
| `.vitepress/config.mts` | The site config: sources, exclusions, navigation, the home hero, search, edit links, and the footer. |
| `.vitepress/course-overview-plugin.ts` | Tags the home page's Course Overview list so `custom.css` shows it as cards. See [Course Overview cards](#what-the-config-does). |
| `.vitepress/courses-plugin.ts` | Renders the `:::courses` block: one card per course, from `discoverCourses()`. |
| `.vitepress/glossary-plugin.ts` | Renders the `:::glossary` block from `course/glossary.yaml`. |
| `.vitepress/theme/index.ts`, `.vitepress/theme/custom.css` | The default theme with the site's brand colour and the light/dark switch placement. See [Theme](#theme). |
| `.vitepress/theme/details-scroll.ts` | The theme's one behaviour: opening or closing a collapsible section scrolls its header to the top of the screen. See [Theme](#theme). |
| `.vitepress/theme/aith-splash.webp`, `.vitepress/theme/aith-splash-dark.webp` | The pictures behind the home hero: by day for light mode, at night for dark mode. `cwebp -q 82` copies of the original PNGs (2.3 MB to 278 KB, and 2.5 MB to 343 KB). Only `custom.css` uses them. See [Hero banner](#theme). |
| `.vitepress/seo.ts`, `.vitepress/og-image.jpg` | Search and answer-engine metadata, and the 1200×630 social card. See [SEO and AEO](#seo-and-aeo). |
| `.vitepress/analytics.ts`, `worker/` | Plausible analytics, proxied through the site's own Worker. See [analytics.md](./analytics.md). |
| `format/courses.mjs` | Content discovery (courses, published pages, submodule paths, anchor slugs). Shared with the validator, so the site and `make validate` read the layout the same way. |
| `package.json`, `package-lock.json` | Pinned dev dependencies: `vitepress ^1.6.4`, `markdown-it-container`, `gray-matter`, `yaml`, `ajv`, `wrangler ^4`. Use `make install` (`npm ci`). There are no npm scripts: the Makefile is the only entry point. |
| `.nvmrc` | Node 24. wrangler 4 needs Node 22 or newer. |

## What the config does

- **Sources.** `srcDir: 'course'`. `srcExclude` comes from `contentExcludes()`: every `README.md`, plus every submodule path from `.gitmodules`. The globs are relative to `srcDir`, e.g. `001-building-agents-with-nanoclaw/nanoclaw/**`. A new submodule is excluded automatically. The NanoClaw submodule alone has about 180 Markdown files that must never be published.
- **Vite root.** Vite's root is `course/`, so the submodules sit inside it. `vite.server.watch.ignored` lists them, so the dev server doesn't watch them.
- **Clean URLs.** `cleanUrls: true` gives `/glossary` instead of `/glossary.html`. On Cloudflare, `html_handling: auto-trailing-slash` (in `wrangler.jsonc`) serves `glossary.html` for `/glossary`, and redirects `/glossary.html` to `/glossary` (307).
- **Last updated.** `lastUpdated: true` reads each page's date from Git. That is why CI checks out the full history (`fetch-depth: 0`).
- **Search.** `search.provider: 'local'` builds an offline index into the site. It includes the glossary table.
- **Edit and source links.** They point at the public GitHub mirror (`https://github.com/aijutsu/aith/edit/main/course/:path`), not at Gitea, because Gitea is behind Cloudflare Access. See [github-mirror.md](./github-mirror.md).
- **Footer.** `themeConfig.footer` holds two lines, shown at the bottom of every page (see [Footer on every page](#theme)):
  - `message`: "Open-source course materials by Aijutsu, free for self-learning", and a link to the Terms of Use (`/terms`, from `course/terms.md`).
  - `copyright`: the copyright notice for Aijutsu Pte. Ltd. (202610279E), and that the materials may not be reproduced, or used in other course materials, without written approval.

  Both are raw HTML (`v-html`), so links in them are plain `<a href="/…">`, and the build's dead-link check doesn't see them. The year (2026) is the year of first publication, so it is written in, not worked out at build time. The notice, `course/terms.md` and the root `LICENSE.md` must say the same thing: change all three together, and update the "last changed" date at the top of the terms page.

  The `message` line still says "Open-source course materials". `LICENSE.md` says the opposite (the materials are public, but the licence is not an open-source one). Rewording the footer and the home page intro is an [open follow-up](./known-issues.md#open-follow-ups).
- **Navigation is generated.** `discoverCourses()` finds every `course/NNN-slug/` folder:
  - course titles come from `course.yaml`;
  - lessons come from `NN-slug/index.md` frontmatter, listed under their course in folder order. The default theme turns the sidebar order into "Previous page" and "Next page" links at the bottom of each page, so learners can read a course from start to end.
  - **sub-lessons nest under their lesson.** `lessonItems()` in `config.mts` builds a sidebar group the same way at every level, from each lesson's own `lessons` array, so a lesson with sub-lessons becomes an open group with its overview page as the group's link. The default theme styles sidebar items down to `level-5`; the format stops at `level-3` (course, lesson, sub-lesson). The prev/next links walk the tree in reading order, so the last sub-lesson of one lesson leads to the next lesson.

  Nothing is hand-maintained. A new course shows up in the sidebar and on the Courses page as soon as its folder and `course.yaml` exist.

  The sidebar's "Reference" group is the one hand-written part: Glossary, Terms of Use, then About Aijutsu (`course/about.md`). The prev/next links at the bottom of a page follow the sidebar order, so the Glossary's "Next page" is the Terms of Use, and the Terms' is About Aijutsu.
- **The top nav has one link, "Courses Overview", to the Courses page.** It and the sidebar's "Courses" heading both go to `/courses`. The nav link's `activeMatch` (`^/(courses|\d{3}-)`) keeps it highlighted on every course and lesson page too. The glossary isn't in the top nav: readers reach it from the sidebar's "Reference" group and the home hero's "Glossary" button.
- **Home hero.** `transformPageData` gives `course/index.md` the `home` layout and a hero built from the page's `title` and `description`. The hero's buttons go to the first course and to the glossary.
  - **Mutate `pageData.frontmatter` in place.** A returned object is shallow-merged, and a returned `frontmatter` would replace the page's `title` and `description`.
  - `course/index.md` has no `# H1`, because the hero already shows the title.
  - The hero has no `image` key. Its picture is a CSS background, set in `custom.css` (see [Hero banner](#theme)).
- **Course Overview cards.** On the home page, the Course Overview is shown as a grid of cards, like the default theme's home features (`features:` frontmatter, which `course/` can't use). The content stays a plain Markdown list, so it still reads as a list on GitHub.
  - `courseOverviewPlugin` is a markdown-it core rule. It runs only for `index.md` (`env.relativePath`). It finds the top-level ordered list that links to a course folder (`./NNN-slug/index.md`), not the heading, so renaming the heading doesn't break the cards. It adds `class="course-overview"` and `role="list"` (Safari drops list semantics from VoiceOver when `list-style` is `none`).
  - Items with no link in their first line are courses not yet written. They get `class="planned"` and a "Coming soon" badge. Linking an item (as in [adding-a-course.md](../features/adding-a-course.md)) makes its card clickable and removes the badge.
  - `custom.css` copies the sizes and colours of `VPFeature.vue`: `--vp-c-bg-soft` card, 12px corners, a 48px `--vp-c-default-soft` icon box, which shows the course number (a CSS counter). Written courses get a brand-coloured number box and a brand border on hover. The grid has 1 column, 2 from 640px, and 3 from 960px, like `VPFeatures`.
  - The title link's `::after` covers the card, as on the Courses page. Links inside a card's sub-list get `z-index: 1`, so they stay clickable above it.
- **Courses block.** `coursesPlugin` registers a `markdown-it-container` named `courses`. At build time it lists every course from `discoverCourses()`, as a card with the course's number, title, summary, and lesson count (when it has lessons).
  - The cards are numbered 1, 2, 3 in folder order. Folder numbers may have gaps, so the card doesn't show them.
  - Each card's title is an `<h2>` whose `id` is the course's `id` from `course.yaml`. The id never changes, so `courses#building-agents-with-nanoclaw` keeps working after a rename. The `<h2>` also puts each course in the page outline.
  - The whole card is clickable: the title link's `::after` is stretched over the card. The default theme makes every `.vp-doc` heading `position: relative`, which would trap the `::after` inside the heading, so `custom.css` sets the card's `<h2>` back to `static`.
  - Like the glossary block, it escapes data and wraps its output in `<div v-pre>`.
- **Glossary block.** `glossaryPlugin` registers a `markdown-it-container` named `glossary`. At build time it reads `course/glossary.yaml` and renders the type list and the terms table.
  - It HTML-escapes names and renders descriptions with `md.renderInline`.
  - It wraps everything in `<div v-pre>`. VitePress compiles Markdown output as a Vue template, and `v-pre` stops Vue from reading `{{ }}` in the text.
  - Each term row gets `id="<slug>"`, from the same `slugify()` the validator uses, so `glossary.md#node-js` works. Types get `id="type-<slug>"`.

## SEO and AEO

Metadata for search engines, social cards, and answer engines (ChatGPT, Perplexity, Google's AI Overviews). `.vitepress/seo.ts` works it all out from the course format's own data (page frontmatter, `course.yaml`, `glossary.yaml`), so `course/` has no SEO keys. Pages only need a good `title` and `description`.

| What | Where | Details |
| --- | --- | --- |
| `sitemap.xml` | `sitemap` in `config.mts` | VitePress's own. Clean URLs, from every published page. |
| Canonical URL | `seoHead()`, from `transformHead` | `pageUrl()` gives the same string as the page's `<loc>` in the sitemap: `/` for the home page, `/<dir>/` for a course or lesson, `/<name>` for other pages. The 404 page gets no metadata. |
| Open Graph, Twitter card | `seoHead()` | Title (the page's own; the site name on the home page), description, URL, and the social card. `og:type` is `website` on the home page and `article` elsewhere, with `article:modified_time` from Git. `og:site_name` is in `head`. |
| JSON-LD | `seoHead()` | One `@graph` per page. See below. |
| Social card | `.vitepress/og-image.jpg` → `/og-image.jpg` | A 1200×630 crop of the light-mode hero picture, right-aligned to keep the people. `writeSeoFiles()` copies it to the site root, so its URL doesn't change (Vite would hash it). |
| `robots.txt` | `writeSeoFiles()`, from `buildEnd` | Allows every crawler, including AI crawlers and answer engines, and points to the sitemap. |
| `llms.txt` | `writeSeoFiles()` | A Markdown map of the site for LLMs ([llmstxt.org](https://llmstxt.org)): the site summary, every course and lesson with its description, and the reference pages. A sub-lesson's label carries the path down from the course title ("Course: Lesson: Sub-lesson"), so each line stands alone. |

JSON-LD, by page:

| Page | Nodes |
| --- | --- |
| Home (`index.md`) | `WebSite`, and Aijutsu as an `Organization` in full (legal name, UEN, founder, services). |
| About (`about.md`) | `AboutPage` whose `mainEntity` is Aijutsu, and the full `Organization`. It says the same things as the page. |
| Courses (`courses.md`) | `ItemList` of the courses. |
| Glossary (`glossary.md`) | `DefinedTermSet`: every term as a `DefinedTerm`, with its description (Markdown removed), its anchor URL, and its reference `url` as `sameAs`. |
| A course (`NNN-slug/index.md`) | `Course` from `course.yaml`: title, summary, `isAccessibleForFree`, provider Aijutsu, its own lessons as `hasPart`, and `outcomes`/`prerequisites` when the manifest has them. |
| A lesson (`NNN-slug/NN-slug/index.md`) | `LearningResource` (a lesson), `isPartOf` its course, and its sub-lessons as `hasPart` when it has any. |
| A sub-lesson (`NNN-slug/NN-slug/NN-slug/index.md`) | `LearningResource`, `isPartOf` its **lesson**, not the course. |
| Terms (`terms.md`) | None. |

- **Every lesson node has an `@id` of `<its url>#lesson`.** The `isPartOf` and `hasPart` links between course, lesson and sub-lesson use those ids, so an engine that reads several pages joins them into one tree instead of seeing repeated copies.
- **Aijutsu's `@id` is `https://aijutsu.dev/#organization`,** the same as in aijutsu.dev's own JSON-LD (`src/lib/seo.ts` in aijutsu/website). Engines then see one organisation across both sites. Keep the two in step.
- **`transformHead` and `buildEnd` run only in `make site-build`.** `make site` doesn't show these tags or files: check them in `.vitepress/dist`.
- **JSON-LD is escaped:** every `<` becomes `<`, so no text can close the `<script>` early.
- **Checking a build:** every page's canonical must appear in `sitemap.xml`, byte for byte, and every JSON-LD block must parse. Google's [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/) check the live pages.
- **Adding a kind of page:** add its JSON-LD to `pageGraph()` in `seo.ts`, and a line to `llms.txt` if it's a reference page.

## Theme

`.vitepress/theme/index.ts` extends the default theme, adds `custom.css`, and runs one behaviour in the browser (`details-scroll.ts`). The CSS changes only colours (CSS variables), where the light/dark switch shows, the home hero's picture, the look of the course cards, the Course Overview cards and collapsible sections, how wide images are on desktop, and the footer on pages with a sidebar. Keep it that way. The behaviour is one delegated event listener, started from the theme's `setup()`; keep any new behaviour in that one file. A custom layout or Vue component is a bigger step: record it in [decisions.md](./decisions.md) first.

- **Brand colour `#C83122`.** VitePress uses three brand shades: `--vp-c-brand-1` for link text, `-2` for hover, and `-3` for button backgrounds (with white text).

  | Shade | Light | Dark | Why |
  | --- | --- | --- | --- |
  | `-1` (links) | `#C83122` | `#D96F64` | `#C83122` is 5.4:1 on white, but only 3.2:1 on the dark background (WCAG AA needs 4.5:1). `#D96F64` is 5.2:1. |
  | `-2` (hover) | `#AA2A1D` | `#CF4A3D` | Darker on hover in light mode, lighter in dark mode. |
  | `-3` (buttons) | `#C83122` | `#C83122` | White text on it is 5.4:1 in both modes. |

  Check contrast again when you change any of these. Links must stay at 4.5:1 or more on `--vp-c-bg`, `--vp-c-bg-alt` (sidebar) and `--vp-c-bg-soft`.
- **Tips and notes stay indigo.** By default, `--vp-c-tip-*` and `--vp-c-note-*` follow the brand colour. With a red brand, a `> [!TIP]` would look like a `> [!CAUTION]`, so `custom.css` points them at the default theme's `--vp-c-indigo-*`.
- **Light/dark switch.** The site starts in light mode, whatever the device setting: `appearance: { initialValue: 'light' }` in `config.mts`. The reader's choice is remembered in `localStorage` (`vitepress-theme-appearance`).
  - VitePress uses the value twice: in the small script in the page head that sets `.dark` before the page draws (so there's no flash of the wrong theme), and in `useDark` (@vueuse/core), which runs the switch.
  - VitePress's type only allows `initialValue: 'dark'`, but both places accept `'light'`. The line has a `@ts-expect-error` (checked with `tsc`: without it, TypeScript reports `Type '"light"' is not assignable to type '"dark"'`). If VitePress widens the type, the directive fails and can go.
  - When the reader switches to the same theme as their device, `useDark` stores `auto`, not the theme. The page then follows the device, which gives the same result.
  - **Where the switch shows.** The default theme shows the switch in the nav bar only at 1280px and wider, and hides it in the "…" menu below that. `custom.css` shows it in the nav bar from 768px, and hides the copy in the "…" menu (with `:has()`). Below 768px it stays in the ☰ menu, because the phone nav bar has no room.
- **Images are at most 400px wide on desktop** (768px and wider). Most course images are phone screenshots taken on a 2x screen: 728px wide for a 364px-wide phone. At the full column width (about 688px) they showed at almost twice their real size, and a tall one filled the screen. On phones they still use the full page width. A wide desktop screenshot would be hard to read at 400px: if the course needs one, add a way to mark wide images (or click-to-zoom), and record it in [decisions.md](./decisions.md).
- **Hero banner.** A picture sits behind the home hero: `aith-splash.webp` (by day) in light mode, and `aith-splash-dark.webp` (at night, with a neon city) in dark mode. Both are 1870×841, with open space on the left and the people on the right, so the same fade and crops work for both. The picture is decoration only (a CSS background, with no alt text): the hero's title and tagline carry the meaning.
  - **One variable picks the picture.** `--hero-picture` on `.VPHome .VPHero` holds the day picture, and `.dark` overrides it with the night one. The phone banner and the desktop background both use it. Vite rewrites a `url()` inside a custom property like any other, so both files get hashed names, and a browser downloads only the picture for the theme it shows.
  - **It starts under the nav bar.** The hero box starts at the top of the page, under the nav bar, and on desktop the nav bar is see-through at the top of the home page. Nav text over the sky was unreadable in light mode. So the picture is a `::before` layer that starts at `--vp-nav-height`.
  - **From 960px** the picture fills the hero. The hero is `min(45vw, 640px)` tall below the nav, so the whole picture shows up to about 1420px wide, and wider screens crop a little off the top and bottom. The content is centred vertically. The tagline is 440px wide (not 576px), so it stays over the sky, and uses `--vp-c-text-1` (the default `text-2` is too faint over the picture).
  - **The fade follows the theme.** Light mode has a white fade (82% at the left edge, 75% behind the text), with the usual red title and dark text, and a white text glow. Dark mode has a black fade (70%, then 60%), with a white title and a dark text shadow. The colours are the `--hero-fade-*` and `--hero-text-shadow` variables on `.VPHome .VPHero`, overridden under `.dark`.
  - **The fade follows the text column, not the screen.** It stays strong up to 460px right of the text's left edge (`--hero-text-left`: the 64px padding, or `50% - 576px` once the 1152px content is centred), then fades out over 280px. A fade in screen percentages failed: at 1024px and 1920px, 16% of the pixels behind the tagline were below 4.5:1. Now, at 1024, 1440 and 1920px, the worst pixel behind the tagline is 6.3:1 in light mode and 4.6:1 in dark mode, and behind the title 3.4:1 (red, light mode) and 4.9:1 (white, dark mode). The title is large text, which needs 3:1. The dark-mode tagline has the least room: its worst pixels are bright neon windows in the night picture. If a new night picture fails, raise `--hero-fade-text` under `.dark` (now 60%).
  - **The long fade tail reaches the people between 960px and about 1200px,** where the text and the people share the middle of the screen. In light mode it puts a white haze over the left side of the boy and the girl. That's the cost of a gentle fade.
  - **Below 960px** it's a banner above the normal hero text: 2:1 from 640px, and 3:2 on phones, anchored right, so the people stay large.
  - **To change a picture,** run `cwebp -q 82 -m 6 -sharp_yuv <new>.png -o .vitepress/theme/aith-splash.webp` (or `aith-splash-dark.webp` for dark mode). Keep the two pictures in the same layout. If the people aren't on the right, move the fade and the phone crop (`right center`). Then measure the text contrast again in both themes, against every pixel behind the text, at 1024, 1440 and 1920px.
  - **Screenshots and tests in dark mode:** set `localStorage['vitepress-theme-appearance'] = 'dark'` before the page loads (Playwright: `page.addInitScript`). A dark device setting (`colorScheme: 'dark'`) no longer gives dark mode, because the site starts in light.
- **Collapsible sections** (`<details>`, see [course-format.md](./course-format.md#markdown)) get a border and a bold `summary`, like the default theme's custom blocks. Three fixes make them work inside `.vp-doc`:
  - `summary` gets `margin: 0`. The default theme gives it a paragraph's 16px margins, which made a closed section almost twice as tall as its title.
  - Code blocks inside get `margin: 16px 0`. Below 640px the default theme makes code blocks run edge to edge with `margin: 16px -24px`, which pushed them out of the box. The default theme does the same for its own custom blocks.
  - An open section has no background. A grey fill matched the code-block background in light mode, and code blocks vanished into it.
- **Opening or closing a section scrolls its header to the top of the screen** (`details-scroll.ts`). Sections of one group share a `name`, so opening one closes the others. When the open one is above, everything below it — including the header the reader just clicked — slides up by the height of the section that closed, and the reader loses their place. The header now lands 16px below whatever the theme keeps stuck at the top, so the steps the reader picked start where they are looking.
  - **The offset is measured, not written in.** What covers the top of the screen changes with width, and there is no CSS variable for the local nav bar's height. `stickyBottom()` adds up the `.VPNav` and `.VPLocalNav` bars that are `fixed` or `sticky` right now, from their computed `top` and their height. Measured in Chrome at three widths:

    | Width | Stuck at the top | Offset |
    | --- | --- | --- |
    | Below 960px | The local nav bar only. The nav bar is `position: relative` and scrolls away. | 48px |
    | 960 to 1279px | The nav bar, with the local nav bar under it. | 112px |
    | 1280px and wider | The nav bar only. The local nav bar is `display: none`. | 64px |

  - **It listens for `click` on the summary, not for the `toggle` event.** `toggle` doesn't bubble, and a group with a `name` fires two of them for one click — one for the section closing, one for the one opening — which would give two scrolls racing each other. A click on the summary happens once, and covers the keyboard too: Enter or Space on a focused `summary` dispatches one.
  - **It reads the layout one frame later.** A `<details>` opens or closes *after* its summary's click event, so during the handler the old height is still in place. The measurement is inside a `requestAnimationFrame`, as the default theme's own `scrollTo` does for heading anchors.
  - **Smooth only for short hops.** It animates when the jump is under one screen height and snaps for longer ones, again matching heading anchors. Under `prefers-reduced-motion` it always snaps: a `behavior` of `'smooth'` passed to `scrollTo` beats the `scroll-behavior: auto !important` the default theme sets for that media query, so `details-scroll.ts` checks the query itself.
  - **The header can't always reach the top.** Closing the last section on a short page leaves too little below it, so the browser scrolls as far as it can and the header stops lower. There is no way around it.
- **Footer on every page.** The default theme hides the footer on every page with a sidebar (`.VPFooter.has-sidebar { display: none }`). Our sidebar is on every page except the home page, so the copyright notice would never show next to the course itself. `custom.css` shows it again:
  - The selector is `.VPContent.has-sidebar ~ .VPFooter.has-sidebar`. `VPFooter` comes right after `VPContent` in the layout, and the extra class outranks the theme's scoped `.VPFooter.has-sidebar[data-v-…]`.
  - From 960px the sidebar is fixed on the left, so the footer gets the same left padding as `VPContent` (the sidebar width, plus 32px), and from 1440px the same centring. Its text then lines up with the page, not with the whole screen. Below 960px the sidebar is a slide-out menu, and the footer uses the full width.
  - If the default theme's footer or sidebar layout changes (e.g. in VitePress 2), check the footer on a course page at 390, 1024 and 1600px.
- **Overriding the default theme's CSS.** Its component styles are scoped, e.g. `.VPNavBarAppearance[data-v-…]`. An override needs a more specific selector (`.VPNavBar .content-body .VPNavBarAppearance`), not just a later one.

## Gotchas

- **Dead links fail the build.** That includes links to pages that exist on disk but are excluded (any README, anything in a submodule). This is on purpose.
- **Restart after glossary or `course.yaml` edits.** After editing `course/glossary.yaml` or a `course.yaml`, restart `make site`. Pages are cached by their Markdown source, and `glossary.md` and `courses.md` themselves haven't changed.
- **Restart `make site-preview` after a rebuild.** The preview server lists `.vitepress/dist` once when it starts. After `make site-build`, the page asks for the new, renamed CSS and JS files, gets a 404, and shows up unstyled or broken.
- **The glossary and courses pages on GitHub.** GitHub shows `course/glossary.md` and `course/courses.md` with a literal `:::glossary` or `:::courses` marker, because only the site renders them. On GitHub, read `course/glossary.yaml`, or the Course Overview in `course/index.md`.
- **Keep the Course Overview a tight list.** No blank lines between its items. A blank line makes it a "loose" list: each title is wrapped in a `<p>`, which adds space, and the card-wide link (`li > a`) stops working. The list also shows as cards only while at least one item links to a course folder. With no course linked, it falls back to a plain list (and `make validate` fails anyway).
- **`{{ }}` in Markdown is live Vue.** VitePress evaluates it. The validator forbids it outside code, so content can't depend on the renderer by accident.
- **Declared dependencies.** `markdown-it-container` and `gray-matter` are only bundled inside VitePress, not exported. So `package.json` declares them itself.
- **`npm audit` warnings.** They report issues in the Vite and esbuild versions that VitePress 1.6.4 bundles. They affect only the local dev server. VitePress 2 is still alpha (npm tag `next`). Stay on 1.x until it is stable, then upgrade; that should clear them.

## Adding something to the renderer

- **A new `:::` block.** Add its name to `ALLOWED_BLOCKS` in `format/courses.mjs` and to the block table in [course-format.md](./course-format.md). Then add a `markdown-it-container` plugin in `.vitepress/`, like `glossary-plugin.ts`. Wrap its output in `v-pre`, and escape all data.
- **A new kind of page.** Add it to the Layout table in [course-format.md](./course-format.md) and to `knownPage()` in `format/validate.mjs` first. The validator rejects Markdown in unknown places.
- **Anything a page needs** (layout, sidebar, hero): work it out in `config.mts` from `course.yaml` and frontmatter. Never add VitePress keys to files in `course/`; the page schema rejects them.
