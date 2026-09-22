# The one entry point for working on this repository: local preview, checks, CI and deploys.
# Run `make` or `make help` to list the targets. See docs/system/publishing.md.

ENV ?= production
TF_ARGS ?=
TF_CONFIG := $(CURDIR)/deploy/config
# R2 endpoint for the Terraform state bucket. Built from the account ID so it isn't committed;
# an AWS_ENDPOINT_URL_S3 already in your environment wins.
AWS_ENDPOINT_URL_S3 ?= https://$(CLOUDFLARE_ACCOUNT_ID).r2.cloudflarestorage.com

.DEFAULT_GOAL := help
.PHONY: help install site site-build site-preview validate worker-test worker-dev deploy check-env .tf-init .tf \
	deploy-tf-reconfigure deploy-tf-validate \
	deploy-tf-cloudflare-init deploy-tf-cloudflare-plan deploy-tf-cloudflare-apply

help: ## List the targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  %-28s %s\n", $$1, $$2}'

## ---- Course site ----

install: ## Install the site's Node dependencies
	npm ci

site: ## Preview the site locally with live reload (http://localhost:5173)
	npx vitepress dev

site-build: ## Build the site into .vitepress/dist (fails on dead links)
	npx vitepress build

site-preview: site-build ## Serve the built site locally
	npx vitepress preview

validate: ## Check course/ against course format v1
	node format/validate.mjs

worker-test: ## Test the Worker's analytics proxy (worker/, no network)
	node --test worker/analytics.test.ts

# Behind Cloudflare WARP, calls to Plausible fail with "internal error": run with
# NODE_EXTRA_CA_CERTS pointing at the Gateway CA (docs/system/analytics.md, "Testing locally").
worker-dev: site-build ## Run the built site and the Worker locally (http://localhost:8787)
	npx wrangler dev --port 8787

deploy: site-build ## Upload the built site to the Cloudflare Worker (needs CLOUDFLARE_* env)
	npx wrangler deploy

## ---- Infrastructure (Terraform, deploy/infra/<module>) ----

# Every module gets deploy-tf-<module>-init/-plan/-apply, all going through .tf with
# INFRA=<module> ENV=<env> CMD=<command> (the same pattern as zworker). Settings come from
# deploy/config/<env>.tfvars. State goes in the shared aijutsu-terraform-state R2 bucket,
# with the key from deploy/config/<env>.tfbackend.
#
# init needs AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (the R2 state key pair) because it READS
# the state, so check-env stops early with a clear message instead of a backend error.
# Terraform's account ID and the bucket's endpoint both come from CLOUDFLARE_ACCOUNT_ID.
.tf-init .tf deploy-tf-reconfigure: export TF_VAR_account_id := $(CLOUDFLARE_ACCOUNT_ID)
.tf-init .tf deploy-tf-reconfigure: export AWS_ENDPOINT_URL_S3 := $(AWS_ENDPOINT_URL_S3)

check-env:
	@test -n "$(INFRA)" || { echo "INFRA is not set: use a deploy-tf-<module>-* target, or pass INFRA=<folder in deploy/infra>."; exit 1; }
	@test -n "$(CLOUDFLARE_ACCOUNT_ID)" || { echo "CLOUDFLARE_ACCOUNT_ID is not set. See .envrc.example."; exit 1; }
	@test -n "$$AWS_ACCESS_KEY_ID" -a -n "$$AWS_SECRET_ACCESS_KEY" || { echo "AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (R2 state credentials) are not set. See .envrc.example."; exit 1; }

# -input=false is on init ONLY, deliberately. It makes a changed backend, or state that needs
# migrating, fail instead of prompting (see deploy-tf-reconfigure). CMD runs with input enabled,
# which is what lets apply ask for confirmation: there is no -auto-approve anywhere.
.tf-init: check-env
	cd ./deploy/infra/$(INFRA) && terraform init -input=false -backend-config=$(TF_CONFIG)/$(ENV).tfbackend

.tf: .tf-init
	cd ./deploy/infra/$(INFRA) && terraform $(CMD) -var-file=$(TF_CONFIG)/$(ENV).tfvars $(TF_ARGS)

# Re-initialise a module after its backend settings (bucket or key) change. .tf fails in that
# case rather than guessing between moving the state (-migrate-state) and adopting what is at
# the new location (-reconfigure). Picking the wrong one loses state, so a human chooses:
#   make deploy-tf-reconfigure INFRA=cloudflare
deploy-tf-reconfigure: check-env
	cd ./deploy/infra/$(INFRA) && terraform init -input=false -reconfigure -backend-config=$(TF_CONFIG)/$(ENV).tfbackend

deploy-tf-validate: ## Check formatting and validity of every Terraform module (no credentials)
	terraform fmt -check -recursive deploy
	@for d in deploy/infra/*/; do \
	  echo "terraform validate $$d"; \
	  terraform -chdir=$$d init -backend=false -input=false >/dev/null && terraform -chdir=$$d validate || exit 1; \
	done

# cloudflare: the Worker and custom domain that serve https://aith.aijutsu.dev.
deploy-tf-cloudflare-init: ## Initialise the cloudflare module with its R2 state backend
	@$(MAKE) .tf-init INFRA=cloudflare ENV=production

deploy-tf-cloudflare-plan: ## Show planned changes to the cloudflare module
	@$(MAKE) .tf INFRA=cloudflare ENV=production CMD=plan

deploy-tf-cloudflare-apply: ## Apply the cloudflare module (asks for confirmation)
	@$(MAKE) .tf INFRA=cloudflare ENV=production CMD=apply
