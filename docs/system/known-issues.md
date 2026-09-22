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
| Setup exits with "The Codex CLI is not installed on this machine" | Install Codex before running setup. ChatGPT sign-in needs the `codex` command. | Course step 4 |
| Setup offers "Echo's hardened agent image" before asking which runtime to use | That image is for Claude only. Run setup with `--agent-provider codex`, which skips the offer and the picker. | [decisions.md](./decisions.md) |
| The Telegram step fails right after you paste a valid token | The token check needs `jq`, and setup doesn't install it. The course installs it in the Git step. | `course/001-building-agents-with-nanoclaw/README.md` |
| `$setup` in Codex doesn't set anything up | Expected. The skill only says to run `bash nanoclaw.sh`. Setup needs a real terminal, so it can't run inside Codex. | Course step 7 |
| On Windows, setup installs Docker inside Ubuntu | `docker` wasn't found in WSL, so setup ran Docker's install script. Turn on Docker Desktop's WSL integration for Ubuntu, and check `docker run hello-world` before setup. | Course step 3 |
| On a Mac with OrbStack, setup says Docker isn't available | OrbStack wasn't running. Setup can only start Docker Desktop (`open -a Docker`). Open OrbStack, then run setup again. | Course step 7 |
| Setup fails, and doesn't offer "Want to debug this with Codex?" | Codex help only appears after setup has connected Codex, and only if `~/.codex/auth.json` exists (sign in to Codex first, Step 4). Earlier failures go to Claude. Without a Claude plan, answer **No** and ask Codex to read `logs/setup.log`. | `course/001-building-agents-with-nanoclaw/README.md` |
| NanoClaw's `CLAUDE.md` says the service is `com.nanoclaw` / `nanoclaw` | Out of date. The name is made from the folder path (`src/install-slug.ts`). Use `bash setup/lib/restart.sh` to restart. | — |

## Site and content

| Issue | What to do | Details |
| --- | --- | --- |
| The build fails with `dead link` | Fix the link. Links to README files and into submodules are dead on purpose, because they aren't published. | [site.md](./site.md#gotchas) |
| The Markdown inside a `<details>` shows as raw text | Leave a blank line after `</summary>`. `make validate` checks this. | [course-format.md](./course-format.md#markdown) |
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

## Local tooling (macOS)

| Issue | What to do |
| --- | --- |
| GNU Make 3.81 (the macOS default) broke a target-specific `export VAR := https://…`: the `:` in the value confused it | Assign the value to a plain variable first, then export that variable, as the Makefile does for `AWS_ENDPOINT_URL_S3`. |
| `printenv A B` prints only `A` on macOS | BSD `printenv` takes one name. Use `env \| grep` when checking several variables. |
| `.envrc` isn't loaded in non-interactive shells (agents, scripts) | Run `direnv exec . <command>` to load it for one command. |
| Playwright (for site screenshots) fails with `Executable doesn't exist at …/chromium_headless_shell-NNNN/…` | The Playwright copy in the npx cache wants a browser build that isn't downloaded. Pass `executablePath` to a build that is, under `~/Library/Caches/ms-playwright/`, or run `npx playwright install chromium-headless-shell`. |

## Open follow-ups

As of 2026-09-22:

- Run `make deploy-tf-cloudflare-plan` once after the first apply, to see the real drift, and note anything beyond #7099 here.
- The CI token and the GitHub mirror token will expire. Set reminders. When the mirror token expires, GitHub quietly stops getting updates.
- Gitea 1.26 or later would make `concurrency:` work.
- VitePress 2 is still alpha. Upgrade when it's stable.
- Course format: lesson fields and exercise, solution and checkpoint blocks are reserved. Define them when the first lesson is written.
