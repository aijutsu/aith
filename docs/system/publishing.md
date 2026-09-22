# Publishing the course site

The course site at https://aith.aijutsu.dev is built from `course/` and served by Cloudflare.

```
course/**  ──make validate──▶  checked content
           ──make site-build─▶  .vitepress/dist/   (VitePress; fails on dead links)
           ──make deploy─────▶  Worker "aith" (static assets, uploaded by wrangler)
                                   ▲
Terraform (deploy/infra/cloudflare) owns the Worker and its custom domain aith.aijutsu.dev
```

## Who owns what

| Thing | Owner | Where |
| --- | --- | --- |
| Content and its rules | Course authors | `course/`, [course-format.md](./course-format.md) |
| How the site looks and navigates | VitePress config | `.vitepress/config.mts`, `.vitepress/glossary-plugin.ts` |
| The Worker `aith`, and `aith.aijutsu.dev` (DNS record and certificate) | Terraform | `deploy/infra/cloudflare/`, settings in `deploy/config/<env>.tfvars` |
| The site's files on the Worker (versions and deployments) | wrangler | `wrangler.jsonc`, run by `make deploy` |
| Terraform state | R2 bucket `aith-tfstate` | `deploy/config/<env>.tfbackend` |

Keep that split. **Don't add `routes` to `wrangler.jsonc`**: Terraform owns the domain, and wrangler only touches domains it lists. Keep `workers_dev` and `preview_urls` `false` in `wrangler.jsonc`, matching `subdomain` in Terraform. Otherwise each tool undoes the other.

We use Workers static assets, not Cloudflare Pages. Cloudflare recommends Workers for new projects, and `cloudflare_pages_project` has open drift bugs in provider v5.

## Working on the site

```bash
make install        # once, and after package changes
make site           # live preview at http://localhost:5173
make validate       # course format checks
make site-build     # production build into .vitepress/dist
make site-preview   # serve the production build
```

Editing `course/glossary.yaml` while `make site` is running needs a restart of `make site`, because pages are cached by their Markdown source.

`npm audit` reports advisories in the Vite and esbuild versions that VitePress 1.6.4 bundles. They affect only the local dev server, not the published static files. They go away when VitePress 2 is stable and we upgrade.

## CI and deploys

`.github/workflows/site.yml` runs on every pull request and every push to `main`:

1. `make install validate site-build infra-validate`
2. On `main` only: `make deploy`, which rebuilds and runs `wrangler deploy`.

It needs two repository secrets: `CLOUDFLARE_API_TOKEN` (the CI token below) and `CLOUDFLARE_ACCOUNT_ID`.

CI does not run `terraform plan` or `apply`. Infrastructure changes are rare, and a maintainer applies them by hand (see below).

## Tokens

| Token | Used by | Permissions |
| --- | --- | --- |
| Terraform token | a maintainer's `.envrc` (`CLOUDFLARE_API_TOKEN`) | Account › Workers Scripts › Edit; Zone `aijutsu.dev` › Zone › Read |
| CI token | GitHub secret `CLOUDFLARE_API_TOKEN` | Account › Workers Scripts › Edit |
| R2 state token | a maintainer's `.envrc` (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) | R2 Object Read & Write, scoped to the `aith-tfstate` bucket |

These scopes come from the Cloudflare API reference. If `make infra-apply` returns a 403 on the custom domain, add Zone › DNS › Edit to the Terraform token.

Copy `.envrc.example` to `.envrc` (gitignored), fill it in, and run `direnv allow`. The Makefile derives Terraform's `account_id` and the R2 endpoint from `CLOUDFLARE_ACCOUNT_ID`.

## First-time setup

Do this once per Cloudflare account.

1. **State bucket.** Create the R2 bucket `aith-tfstate` (dashboard: R2 › Create bucket; or `npx wrangler r2 bucket create aith-tfstate`). Then create an R2 API token with Object Read & Write on that bucket (R2 › Manage API tokens). Its Access Key ID and Secret Access Key go in `.envrc`.
2. **API tokens.** Create the Terraform and CI tokens from the table above (My Profile › API Tokens › Create Custom Token).
3. **Hostname is free.** In the `aijutsu.dev` DNS settings, check that there is no existing record for `aith`. Cloudflare can't create a custom domain on a hostname that already has a CNAME.
4. **Create the infrastructure.**

   ```bash
   make infra-init
   make infra-apply
   ```

   The plan should create 2 resources: `cloudflare_worker.site` and `cloudflare_workers_custom_domain.site`. If the custom domain fails because the Worker has no deployed version yet, create the Worker alone, deploy once, then apply again:

   ```bash
   make infra-apply TF_ARGS=-target=cloudflare_worker.site
   make deploy
   make infra-apply
   ```

5. **First deploy.** Run `make deploy`, or push to `main`.
6. **CI secrets.** In GitHub › aijutsu/aith › Settings › Secrets and variables › Actions, add `CLOUDFLARE_API_TOKEN` (the CI token) and `CLOUDFLARE_ACCOUNT_ID`.
7. **Check.** `curl -sI https://aith.aijutsu.dev/` returns 200. `/001-building-agents-with-nanoclaw/` returns 200. `/does-not-exist` returns 404 with the site's 404 page.

## Changing infrastructure

```bash
make infra-plan                 # review
make infra-apply                # apply
make infra-plan ENV=staging     # another environment: add deploy/config/staging.tfvars and .tfbackend
```

Known provider quirks (cloudflare provider 5.25):

- A plan after apply may show changes to `updated_on` or the custom domain's certificate ID that never settle (provider issue #7099). They are harmless. This is also why CI doesn't gate on `terraform plan`.
- `wrangler deploy` may set Worker settings (such as observability) that Terraform then shows as changes. Read the plan before applying. Add the setting to `cloudflare_worker.site` if we want to keep it.

To upgrade the provider, change the version in `versions.tf`, then run:

```bash
terraform -chdir=deploy/infra/cloudflare init -backend=false -upgrade
terraform -chdir=deploy/infra/cloudflare providers lock -platform=linux_amd64 -platform=darwin_arm64 -platform=darwin_amd64
```

Commit `.terraform.lock.hcl`.
