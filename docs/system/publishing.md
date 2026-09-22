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
| Terraform state | The shared aijutsu R2 bucket `aijutsu-terraform-state`, key `aith/cloudflare/terraform.tfstate`. zworker provisions the bucket (`deploy/infra/cloudflare-r2-tfstate`). | `deploy/config/<env>.tfbackend` |

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

CI runs on Gitea Actions (`.gitea/workflows/site.yml`) at https://gohan.aijutsu.dev/aijutsu/aith, on every pull request and every push to `main`. A second workflow mirrors `main` to the public GitHub copy (see [github-mirror.md](./github-mirror.md)). The CI workflow runs these steps:

1. Install pinned Node.js and Terraform (versions in the workflow's `env:`), then `make install validate site-build deploy-tf-validate`.
2. On `main` only: `make deploy`, which rebuilds and runs `wrangler deploy`.

It needs two repository secrets: `CLOUDFLARE_API_TOKEN` (the CI token below) and `CLOUDFLARE_ACCOUNT_ID`.

The workflow follows the same runner rules as the other aijutsu Gitea repos, such as observatory. The header of `.gitea/workflows/site.yml` explains them:

- no `container:` image, because `actions/checkout` needs the default image's Node;
- `actions/checkout@v4` is the only action. Gitea fetches it from github.com;
- Node and Terraform are installed with `curl` at pinned versions, not with `setup-*` actions;
- there is no npm cache, because the runner's job cache is off;
- `concurrency:` only takes effect from Gitea 1.26. On 1.24.6, two quick pushes to `main` can deploy out of order. Push again if the site looks stale.

Bump `NODE_VERSION` and `TERRAFORM_VERSION` together with `.nvmrc` and the Terraform you use locally.

CI does not run `terraform plan` or `apply`. Infrastructure changes are rare, and a maintainer applies them by hand (see below).

## Tokens

| Token | Used by | Permissions |
| --- | --- | --- |
| Terraform token | a maintainer's `.envrc` (`CLOUDFLARE_API_TOKEN`) | Account › Workers Scripts › Edit; Zone `aijutsu.dev` › Zone › Read |
| CI token | Gitea repository secret `CLOUDFLARE_API_TOKEN` | Account › Workers Scripts › Edit |
| R2 state key pair | a maintainer's `.envrc` (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`) | R2 S3-API pair with Object Read & Write on `aijutsu-terraform-state`: the same pair zworker uses |

These scopes come from the Cloudflare API reference. If `make deploy-tf-cloudflare-apply` returns a 403 on the custom domain, add Zone › DNS › Edit to the Terraform token.

Copy `.envrc.example` to `.envrc` (gitignored), fill it in, and run `direnv allow`. The Makefile passes `CLOUDFLARE_ACCOUNT_ID` to Terraform as `account_id`, and builds the state bucket's endpoint from it (`AWS_ENDPOINT_URL_S3`). So the account ID never has to be written in the repo. Keep it that way: it's public. The state key pair is needed for `make deploy-tf-cloudflare-init` too, not only for plan and apply, because init reads the state. If it is missing, the Makefile stops with a message, not a confusing backend error.

## First-time setup

Do this once per Cloudflare account.

1. **State credentials.** There is no bucket to create: state goes in the shared `aijutsu-terraform-state` bucket, under the key `aith/cloudflare/terraform.tfstate`. Put the shared R2 S3-API key pair for that bucket in `.envrc`. It's the same pair as in zworker's `.envrc`. To mint a new one, go to R2 › Manage API tokens › Object Read & Write, scoped to `aijutsu-terraform-state`.
2. **API tokens.** Create the Terraform and CI tokens from the table above (My Profile › API Tokens › Create Custom Token).
3. **Hostname is free.** In the `aijutsu.dev` DNS settings, check that there is no existing record for `aith`. Cloudflare can't create a custom domain on a hostname that already has a CNAME.
4. **Create the infrastructure, in three steps.** Cloudflare refuses to attach a custom domain to a Worker that has never been deployed (`code 100124: Worker 'aith' has no deployments`). So create the Worker first, deploy the site to it once, and then attach the domain:

   ```bash
   make deploy-tf-cloudflare-init
   make deploy-tf-cloudflare-apply TF_ARGS=-target=cloudflare_worker.site   # 1. the Worker only
   make deploy                                                              # 2. first deployment (wrangler)
   make deploy-tf-cloudflare-apply                                          # 3. the custom domain
   ```

   Step 1 creates `cloudflare_worker.site`, and step 3 creates `cloudflare_workers_custom_domain.site`. If you ran a plain apply first, it created the Worker and then failed on the domain with the error above. In that case, just carry on from step 2.

   This is only needed once. Afterwards the Worker always has a deployment, and a plain `make deploy-tf-cloudflare-apply` works.
5. **Check the deploy.** Later deploys happen by pushing to `main`. `make deploy` by hand still works.
6. **CI secrets.** In Gitea › aijutsu/aith › Settings › Actions › Secrets (https://gohan.aijutsu.dev/aijutsu/aith/settings/actions/secrets), add `CLOUDFLARE_API_TOKEN` (the CI token) and `CLOUDFLARE_ACCOUNT_ID`. Also check that Actions is enabled for the repository (Settings › Repository › Enable Repository Actions).
7. **Check.** `curl -sI https://aith.aijutsu.dev/` returns 200. `/001-building-agents-with-nanoclaw/` returns 200. `/does-not-exist` returns 404 with the site's 404 page.

## Changing infrastructure

```bash
make deploy-tf-cloudflare-plan     # review
make deploy-tf-cloudflare-apply    # apply (asks for confirmation)
```

Infrastructure targets follow one pattern, the same as zworker's. Each module in `deploy/infra/<module>/` gets `make deploy-tf-<module>-init`, `-plan` and `-apply`. They all run through the generic `.tf` target (`make .tf INFRA=<module> ENV=<env> CMD=<command>`), which reads `deploy/config/<env>.tfvars` and `deploy/config/<env>.tfbackend`. To add a module, add its folder and three targets that copy the `deploy-tf-cloudflare-*` ones. `make deploy-tf-validate` checks every module and needs no credentials.

If a module's backend settings (bucket or key) change, `init` fails on purpose. Terraform can't know whether to move the existing state or adopt what's at the new location, and the wrong choice loses state. Decide which one you want. To adopt what's there, run `make deploy-tf-reconfigure INFRA=<module>`. To move it, run the `.tf-init` command from the Makefile by hand with `-migrate-state` added, after exporting `AWS_ENDPOINT_URL_S3` and `TF_VAR_account_id` the way the Makefile does.

Known provider quirks (cloudflare provider 5.25):

- A plan after apply may show changes to `updated_on` or the custom domain's certificate ID that never settle (provider issue #7099). They are harmless. This is also why CI doesn't gate on `terraform plan`.
- `wrangler deploy` may set Worker settings (such as observability) that Terraform then shows as changes. Read the plan before applying. Add the setting to `cloudflare_worker.site` if we want to keep it.

About the shared state bucket (from zworker's `tfstate-bucket` skill):

- R2 can't limit a credential to one key prefix. Anyone with the state key pair can read and overwrite every aijutsu project's state. So **never add a resource whose state holds a secret** (for example `cloudflare_api_token`) to this module.
- Another environment needs its own `key` in its `.tfbackend` (for example `aith/cloudflare-staging/terraform.tfstate`), or it would overwrite production's state.
- Locking (`use_lockfile`) works on R2. zworker tested it on Terraform 1.15.8. Re-test after a Terraform upgrade: start `make deploy-tf-cloudflare-apply`, stop at the approval prompt, and run `make deploy-tf-cloudflare-plan` in another terminal. The plan must fail to get the lock. A hard-killed run can leave a lock behind. Remove it with `terraform -chdir=deploy/infra/cloudflare force-unlock <ID>`, using the ID printed in the error.

### If you lose the state

R2 has no bucket versioning, so a lost or corrupted state file can't be rolled back. The resources still exist in Cloudflare. Import them into an empty state:

```bash
make deploy-tf-cloudflare-init
# Worker: the ID is shown in the dashboard (Workers & Pages > aith > Settings), or returned by
#   curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
#     "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/workers/aith"
terraform -chdir=deploy/infra/cloudflare import -var-file=$PWD/deploy/config/production.tfvars \
  -var account_id=$CLOUDFLARE_ACCOUNT_ID cloudflare_worker.site "$CLOUDFLARE_ACCOUNT_ID/<worker_id>"
# Custom domain: the ID comes from
#   curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
#     "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/workers/domains?hostname=aith.aijutsu.dev"
terraform -chdir=deploy/infra/cloudflare import -var-file=$PWD/deploy/config/production.tfvars \
  -var account_id=$CLOUDFLARE_ACCOUNT_ID cloudflare_workers_custom_domain.site "$CLOUDFLARE_ACCOUNT_ID/<domain_id>"
make deploy-tf-cloudflare-plan   # should show no changes, apart from the known drift above
```

To upgrade the provider, change the version in `versions.tf`, then run:

```bash
terraform -chdir=deploy/infra/cloudflare init -backend=false -upgrade
terraform -chdir=deploy/infra/cloudflare providers lock -platform=linux_amd64 -platform=darwin_arm64 -platform=darwin_amd64
```

Commit `.terraform.lock.hcl`.
