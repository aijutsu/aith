# Known issues

Gotchas we have hit, each with where it's handled. Add one whenever something costs you time. The next person won't have your context.

## Cloudflare and Terraform

| Issue | What to do | Details |
| --- | --- | --- |
| `code 100124: Cannot attach custom domain: Worker 'aith' has no deployments` | On first setup, apply the Worker alone, run `make deploy`, then apply again. | [publishing.md](./publishing.md#first-time-setup) |
| A custom domain can't be created over an existing CNAME | Check that `aith.aijutsu.dev` has no DNS record before the first apply. | [publishing.md](./publishing.md#first-time-setup) |
| A plan after apply shows changes to `updated_on` or the certificate ID that never settle | Harmless (provider #7099). CI doesn't gate on `terraform plan`. | [publishing.md](./publishing.md#changing-infrastructure) |
| `wrangler deploy` may set Worker settings (such as observability) that Terraform then shows as drift | Read the plan. Add the setting to `cloudflare_worker.site` if we want to keep it. | [publishing.md](./publishing.md#changing-infrastructure) |
| `terraform init` fails with a confusing backend error | Usually `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` (the R2 state pair) are missing. init reads the state. The Makefile's `check-env` catches this. | [publishing.md](./publishing.md#tokens) |
| R2 has no bucket versioning | Lost state can't be rolled back. Import the resources again. | [publishing.md](./publishing.md#if-you-lose-the-state) |
| State locking on R2 isn't tested by Cloudflare or HashiCorp | Re-run the two-terminal lock test after any Terraform upgrade. | [publishing.md](./publishing.md#changing-infrastructure) |
| wrangler logs `No targets deployed for aith` | Expected: `wrangler.jsonc` lists no routes, because Terraform owns the domain. | [publishing.md](./publishing.md#who-owns-what) |

## Gitea, CI and the mirror

| Issue | What to do | Details |
| --- | --- | --- |
| `concurrency:` in workflows does nothing | Gitea supports it from 1.26 (go-gitea#32751). gohan.aijutsu.dev runs 1.24.6. Two quick pushes to `main` can deploy out of order; push again if the site looks stale. | [publishing.md](./publishing.md#ci-and-deploys) |
| A job with a `container:` image dies at `actions/checkout` (exit 127) | Don't set `container:`. Checkout needs the default image's Node. | `.gitea/workflows/site.yml` header |
| A job waits forever with no error | `runs-on` matches no online runner label, or Actions is off for the repo. | [github-mirror.md](./github-mirror.md#when-it-fails) |
| A `.github/workflows/` file doesn't run | Gitea reads `.gitea/workflows/` *or* `.github/workflows/`, and the first that exists wins. Put CI in `.gitea/workflows/`. | [github-mirror.md](./github-mirror.md#rules) |
| A commit or branch on GitHub vanished | The push mirror force-pushes and prunes. Take PRs into Gitea; never merge on GitHub. | [github-mirror.md](./github-mirror.md#rules) |
| `gohan.aijutsu.dev` returns a 302 to `cloudflareaccess.com`, or its API returns 404 | It's behind Cloudflare Access, and the repo is private. Connect WARP and sign in. Anonymous API calls can't see the repo. | [github-mirror.md](./github-mirror.md) |
| Gitea rejects a secret named `GITHUB_…` or `GITEA_…` | Those prefixes are reserved. Pick another name. | `.gitea/workflows/site.yml` header |

## Submodules and forks

| Issue | What to do | Details |
| --- | --- | --- |
| A file a skill copies into the NanoClaw fork doesn't show in `git status`, even as untracked | NanoClaw's `.gitignore` has a bare `AGENTS.md` line, which ignores every `AGENTS.md`. `/add-codex` copies `container/AGENTS.md`, Codex's base instructions. Add it with `git add -f`. Otherwise clones still build, but Codex agents quietly lose those instructions (only a warning in the log). After any skill, run `git check-ignore -v` on the files it copied. | [Fork submodules](../../AGENTS.md#fork-submodules) |
| NanoClaw skills fetch channel and provider code from `upstream`, not the fork | Expected. The fork has only `main`, so `scripts/skill-apply.ts` falls through to the first remote that has the `channels` or `providers` branch. Check that `upstream` is set before applying a skill. | [Fork submodules](../../AGENTS.md#fork-submodules) |

## NanoClaw setup (course 001)

| Issue | What to do | Details |
| --- | --- | --- |
| Setup exits with "The Codex CLI is not installed on this machine" | Install Codex before running setup. ChatGPT sign-in needs the `codex` command. | Course 001, Getting Started → Install Codex |
| Setup offers "Echo's hardened agent image" before asking which runtime to use | That image is for Claude only. Run setup with `--agent-provider codex`, which skips the offer and the picker. | [decisions.md](./decisions.md) |
| The Telegram step fails right after you paste a valid token | The token check needs `jq`, and setup doesn't install it. The course installs it in the Git step. | `course/001-building-agents-with-nanoclaw/README.md` |
| `$setup` in Codex doesn't set anything up | Expected. The skill only says to run `bash nanoclaw.sh`. Setup needs a real terminal, so it can't run inside Codex. The course no longer asks anyone to run it. | `nanoclaw/.claude/skills/setup/SKILL.md` |
| On Windows, setup installs Docker inside Ubuntu | `docker` wasn't found in WSL, so setup ran Docker's install script. Turn on Docker Desktop's WSL integration for Ubuntu, and check `docker run hello-world` before setup. | Course 001, Getting Started → Install Docker |
| On a Mac with OrbStack, setup says Docker isn't available | OrbStack wasn't running. Setup can only start Docker Desktop (`open -a Docker`). Open OrbStack, then run setup again. | Course 001, Run NanoClaw's setup |
| Setup fails, and doesn't offer "Want to debug this with Codex?" | Codex help only appears after setup has connected Codex, and only if `~/.codex/auth.json` exists (sign in to Codex first, in the table of answers). Earlier failures go to Claude. Without a Claude plan, answer **No** and ask Codex to read `logs/setup.log`. | `course/001-building-agents-with-nanoclaw/README.md` |
| "Choose a template" shows nothing, or not `community-assistant` | The course picks **From local templates**, which reads `templates/` inside the install. That template is committed in the fork, so this means the checkout is older than the pin (`96848d13`), or `templates/` is stale — a pre-plugin layout is warned about and then treated as empty (`listLocalTemplates()`). Don't switch the course to **From the NanoClaw template library**: that clones https://github.com/nanocoai/nanoclaw-templates at run time, which nothing pins. | `course/001-building-agents-with-nanoclaw/README.md` |
| Notion returns `object_not_found` for a page that plainly exists | The connection was never given access to it. A valid token grants nothing on its own — this is Notion's model, not a bug. Share the parent page; children inherit. | Course 001, Create a Notion connection |
| Notion reads fine but the rows belong to another community | The agent is bound to the published Louis template, or to somebody else's copy — they look identical. Send it the link to *your* copy; `connecting-notion.md` calls this out as the dangerous case, because everything still resolves. | Course 001, Point Louis at your copy |
| The agent asks for the Notion token in the chat | It shouldn't: `connecting-notion.md` forbids handling credential values, and the vault is the only place the token belongs. If a new template does this, fix the template, not the course. | `templates/community/community-assistant/skills/community-assistant/references/connecting-notion.md` |
| `brew install make` doesn't change what `make --version` says | Homebrew installs GNU Make 4 as `gmake` and leaves the system `make` alone. The course uses the system one (Apple's 3.81 on a Mac, `build-essential`'s on Linux) and says so on the Make page. | Course 001, Install Make |
| On Windows, `brew` or a cask installed by it fails oddly | Check `wsl -l -v`: Homebrew supports WSL 2, and treats WSL 1 as Tier 3 with known problems running installed executables. `wsl --set-version Ubuntu 2` fixes it. | Course 001, Open a terminal |
| A cask installs, but the command is still `command not found` | On Linux and WSL, Homebrew's **Next steps** (`eval "$(...)/brew shellenv"` written into `~/.bashrc`) have to be run, or nothing it installs is on the PATH. Close the terminal and open a new one afterwards. | Course 001, Install Homebrew |
| NanoClaw's `CLAUDE.md` says the service is `com.nanoclaw` / `nanoclaw` | Out of date. The name is made from the folder path (`src/install-slug.ts`). Use `bash setup/lib/restart.sh` to restart. | — |

## Site and content

| Issue | What to do | Details |
| --- | --- | --- |
| The build fails with `dead link` | Fix the link. Links to README files and into submodules are dead on purpose, because they aren't published. | [site.md](./site.md#gotchas) |
| The build fails with `dead link` after splitting a page into sub-lessons | Count the `../` again. A sub-lesson is one level deeper than a lesson, so the glossary is `../../../glossary.md`, and the lesson next door is `../../02-slug/index.md`. | [course-format.md](./course-format.md#links) |
| A link into another page still works, but lands at the top of it | The anchor is gone (`#step-4-install-codex` after the steps were split into pages). Neither `make validate` nor the site build checks anchors. Link to the page, not to a heading inside it, whenever the target may be reorganised. | [course-format.md](./course-format.md#links) |
| `make validate` says `not a known page location` for a page that looks right | Lessons nest two levels and no further (`LESSON_DEPTH` in `format/courses.mjs`). A third `NN-slug/` level is rejected. | [course-format.md](./course-format.md#layout) |
| The Markdown inside a `<details>` shows as raw text | Leave a blank line after `</summary>`. `make validate` checks this. | [course-format.md](./course-format.md#markdown) |
| A sub-step is numbered `1.` on the site, not `1.1.` | It isn't a list item. Indent it to its parent's text so it nests, and write it as a plain `1.` — never type the sub-number. A hand-typed `1.1.` line is a paragraph, and anything under it (a picture, a command) lands in the wrong place, or renders as a code block. | [course-format.md](./course-format.md#markdown) |
| Sub-steps show plain `1.`, `2.` instead of `2.1.`, `2.2.` | Expected in three cases: the list starts at a number other than 1 (`<ol start>`, which CSS counters can't read), it sits under a bullet, or another rule already claimed it (the Course Overview cards). `ordered-list-plugin.ts` marks only the lists it can number correctly; the rest keep the browser's own. | [site.md](./site.md#theme) |
| GitHub shows a sub-step as `1.`, the site as `2.1.` | Expected: the numbering is the site's, and GitHub numbers each level from 1. The Markdown is the same either way. | [site.md](./site.md#theme) |
| A glossary edit doesn't show in `make site` | Restart `make site`. | [site.md](./site.md#gotchas) |
| `course/glossary.md` on GitHub shows `:::glossary` | Expected. Only the site renders the table. | [site.md](./site.md#gotchas) |
| `npm audit` reports Vite and esbuild advisories | They affect only the local dev server. They clear when we move to VitePress 2. | [site.md](./site.md#gotchas) |
| The light/dark switch seems missing | Below 1280px the default theme hides it in the "…" menu. `custom.css` shows it in the nav bar from 768px. On phones it's in the ☰ menu. | [site.md](./site.md#theme) |
| An override in `custom.css` has no effect | Default theme styles are scoped (`.Foo[data-v-…]`). Use a more specific selector, not just a later one. | [site.md](./site.md#theme) |
| The footer (and its copyright notice) shows only on the home page | The default theme hides `VPFooter` on every page with a sidebar. `custom.css` shows it again with `.VPContent.has-sidebar ~ .VPFooter.has-sidebar`, padded right of the fixed sidebar from 960px. | [site.md](./site.md#theme) |
| A screenshot shows the current page's sidebar entry grey, not in the brand colour | The theme fades link colours over 0.25s. Wait about half a second after the page loads before taking a screenshot or reading a colour. | — |
| After a rebuild, `make site-preview` shows the site unstyled or broken | The preview server lists `dist/` only when it starts, so the new asset files return 404. Restart it. | [site.md](./site.md#gotchas) |
| The validator reported `":::More" is not an allowed block` for an ordinary paragraph | Fixed: the block check used `\s*`, which crossed the line break after a closing `:::`. It now uses `[ \t]*`. Don't use `\s` in line-anchored regexes over page text. | `format/validate.mjs` |
| `make site-preview` fails with `EADDRINUSE` on port 4173 | Another preview is still running (`lsof -iTCP:4173 -sTCP:LISTEN`). Stop it, or run `npx vitepress preview --port 4174`. | — |
| The home page's Course Overview shows as a plain list, not cards | The list must link to at least one course folder, and be a tight list (no blank lines between items). The heading's name doesn't matter. | [site.md](./site.md#gotchas) |
| `.vitepress/dist` doesn't match the source (e.g. an old heading id) | `dist/` is only as new as the last `make site-build`. Rebuild before reading its HTML. | — |
| The home hero's tagline is hard to read at some screen widths | The text column is placed in pixels, so a fade set in screen percentages ends in the wrong place on narrow and wide screens. Tie the fade to the text column (`--hero-text-left`). After changing the picture, the fade or the hero text colours, measure contrast in both themes against every pixel behind the text at 1024, 1440 and 1920px, not only by eye. Read the text colours from the page (`getComputedStyle`): the title's colour is `-webkit-text-fill-color` on `.name`, which is also the `.clip` element. | [site.md](./site.md#theme) |
| A screenshot or test with a dark device setting (`colorScheme: 'dark'`) shows light mode | Expected: the site starts in light mode. Set `localStorage['vitepress-theme-appearance'] = 'dark'` before the page loads (Playwright: `page.addInitScript`). | [site.md](./site.md#theme) |
| The editor flags `appearance: { initialValue: 'light' }` in `config.mts` | VitePress's type only lists `'dark'`, but the value goes to `useDark`, which takes `'light'`. The line has a `@ts-expect-error`. The build doesn't type-check the config, and the repository has no `tsc`: check with a throwaway TypeScript install. | [site.md](./site.md#theme) |
| A Playwright click on the light/dark switch fails with "strict mode violation" | The nav bar has two switches: one in the bar, one in the "…" menu. Use `.VPNavBarAppearance .VPSwitchAppearance`. | — |
| A collapsible section doesn't scroll when it's opened, or scrolls twice | Don't listen for the `toggle` event. It doesn't bubble, so a listener on `document` only sees it in the capture phase, and a `<details>` group with a `name` fires two per click: one for the section closing, one for the one opening. Listen for `click` on `.vp-doc details > summary` instead. That also covers Enter and Space on a focused summary. | [site.md](./site.md#theme) |
| The scroll after opening a section lands where the page was before | Read the layout inside a `requestAnimationFrame`. A `<details>` opens or closes *after* its summary's click event, so in the handler itself the old height is still in place. | [site.md](./site.md#theme) |
| The page still animates its scroll with "reduce motion" turned on | A `behavior` of `'smooth'` passed to `scrollTo` beats the `scroll-behavior: auto !important` the default theme sets under `prefers-reduced-motion`. Check the media query in JavaScript and pass `'auto'` instead. | [site.md](./site.md#theme) |
| A section's header stops short of the top when it's closed | Expected, and not fixable. The page ran out of content below the header, so the browser scrolled as far as it could. | [site.md](./site.md#theme) |
| Driving the site in headless Chrome: clicks work but nothing else does | The page's own JavaScript never ran, so only native behaviour (a `<details>` toggling) works. A quick tell: `.VPLocalNav` stays hidden above 960px, because it only appears once Vue has worked out the page outline. Wait for `window.__VITEPRESS__` before acting on the page. | — |
| A screenshot in `img/` is stale or was never used, and nothing complains | Expected: the build bundles only the images a page links to, and `make validate` doesn't look at `img/` at all. After rewriting a page, check `img/` against the page by hand. | [course-format.md](./course-format.md#layout) |
| A picture in the lightbox won't grow past its own pixels | The `width`/`height` attributes on the overlay's `<img>` are a presentational hint for the `width` property, and `max-width` only caps a size — it can't raise one. Size it with `width`, as `custom.css` does. | [site.md](./site.md#theme) |
| A screenshot of the lightbox looks barely dimmed | It was taken during the 0.12s fade. Wait ~500ms before capturing. The backdrop is `rgba(0, 0, 0, 0.75)`: over a white page it measures RGB 64, so check the pixels before believing the picture. | — |
| Driving Chrome over CDP: `Execution context was destroyed` right after connecting | The tab was still navigating to the page when the first `Runtime.evaluate` arrived. Re-run, or wait for the load event before evaluating. | — |
| The SEO tags, `robots.txt` or `llms.txt` are missing in `make site` | `transformHead` and `buildEnd` run only in a build. Check `.vitepress/dist` after `make site-build`. | [site.md](./site.md#seo-and-aeo) |

## The Worker and analytics

| Issue | What to do | Details |
| --- | --- | --- |
| `wrangler dev` or a deploy fails with `Incorrect type for map entry 'EVENT_PATH': the provided value is not of type 'function or ExportedHandler'` | The Workers runtime treats every named export of the entry module as an entry point. Export only the default handler from `worker/index.ts`, and keep constants and helpers in `worker/analytics.ts`. Unit tests can't catch this: only the real runtime does (`make worker-dev`). | [analytics.md](./analytics.md#files) |
| Locally, every call from the Worker to Plausible fails with `Error: internal error; reference = …` (500) | Cloudflare WARP inspects encrypted traffic, and the local runtime doesn't trust its "Gateway CA - Cloudflare Managed G1". Run with `NODE_EXTRA_CA_CERTS` pointing at that CA, exported from the System keychain. curl works without it, because it uses the keychain. | [analytics.md](./analytics.md#checking-it) |
| `/api/e` returns 502 | The upstream didn't answer 2xx. `returned 302` in the Worker logs means ponzu's Cloudflare Access bypass for `/api/*` is gone. | [analytics.md](./analytics.md#if-events-stop) |
| `/js/p.js` returns 404 | `PLAUSIBLE_SCRIPT` in `wrangler.jsonc` is empty: analytics is off until the site is added in Plausible. | [analytics.md](./analytics.md#turning-it-on) |

## Local tooling (macOS)

| Issue | What to do |
| --- | --- |
| GNU Make 3.81 (the macOS default) broke a target-specific `export VAR := https://…`: the `:` in the value confused it | Assign the value to a plain variable first, then export that variable, as the Makefile does for `AWS_ENDPOINT_URL_S3`. |
| `printenv A B` prints only `A` on macOS | BSD `printenv` takes one name. Use `env \| grep` when checking several variables. |
| `.envrc` isn't loaded in non-interactive shells (agents, scripts) | Run `direnv exec . <command>` to load it for one command. |
| Playwright (for site screenshots) fails with `Executable doesn't exist at …/chromium_headless_shell-NNNN/…` | The Playwright copy in the npx cache wants a browser build that isn't downloaded. Pass `executablePath` to a build that is, under `~/Library/Caches/ms-playwright/`, or run `npx playwright install chromium-headless-shell`. |
| A `chrome --headless --screenshot --window-size=390,N` shot of a page looks cut off on the right, as if the page overflowed | It is the screenshot, not the page: Chrome lays the page out wider than the canvas it captures. Both `--headless` and `--headless=new` do it, with or without `--hide-scrollbars`. A page with no table at all (`/terms`) clips the same way, so don't read it as content overflow. Use Playwright with a real viewport when checking phone layout. Wide tables can't widen a page anyway: the default theme gives `.vp-doc table` `display: block; overflow-x: auto`, so they scroll inside themselves. |

## Open follow-ups

As of 2026-09-22:

- Run `make deploy-tf-cloudflare-plan` once after the first apply, to see the real drift, and note anything beyond #7099 here.
- The CI token and the GitHub mirror token will expire. Set reminders. When the mirror token expires, GitHub quietly stops getting updates.
- Gitea 1.26 or later would make `concurrency:` work.
- VitePress 2 is still alpha. Upgrade when it's stable.
- Course format: lesson fields `duration` and `outcomes`, and exercise, solution and checkpoint blocks, are still reserved. Define them when a lesson needs them.
- `course/index.md` says workshop info is at https://aijutsu.dev/ai-in-the-heartlands, which returns 404. aijutsu.dev doesn't mention AI in the Heartlands anywhere. Add the page there, or change the link. The site build can't catch this: it only checks links between its own pages.
- `course/courses.md` links to `./index.md#course-overview`, but the home page heading is now "Courses Overview" (anchor `#courses-overview`). The link lands at the top of the home page. VitePress doesn't check anchors.
- `course/about.md` is written from https://aijutsu.dev (read on 2026-09-22). Check it again when Aijutsu's services or website change.
- The site calls the materials "open source", but the root `LICENSE.md` (added 2026-09-23) says they are public and not open source. Two learner-facing places still need rewording, by Aijutsu: the home page intro in `course/index.md` ("All materials are open-source"), and `themeConfig.footer.message` in `.vitepress/config.mts` ("Open-source course materials by Aijutsu, free for self-learning"). "Free to learn from" or "source-available" are more exact. `README.md` and `AGENTS.md` were already changed. Changing `course/index.md` needs `make validate site-build`; changing the footer message does not touch the terms' "last changed" date, as the copyright line itself is unchanged.
