# The one entry point for working on this repository: local preview, checks, CI and deploys.
# Run `make` or `make help` to list the targets. See docs/system/publishing.md.

ENV ?= production
TF_ARGS ?=
TF_DIR := deploy/infra/cloudflare
TF_CONFIG := $(CURDIR)/deploy/config
TF := terraform -chdir=$(TF_DIR)
R2_ENDPOINT = https://$(CLOUDFLARE_ACCOUNT_ID).r2.cloudflarestorage.com

.DEFAULT_GOAL := help
.PHONY: help install site site-build site-preview validate deploy \
	infra-init infra-plan infra-apply infra-validate check-account

help: ## List the targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "} {printf "  %-16s %s\n", $$1, $$2}'

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

deploy: site-build ## Upload the built site to the Cloudflare Worker (needs CLOUDFLARE_* env)
	npx wrangler deploy

## ---- Infrastructure (Terraform, deploy/infra/cloudflare) ----

# Terraform's account ID and R2 state endpoint both come from CLOUDFLARE_ACCOUNT_ID.
infra-init infra-plan infra-apply: export TF_VAR_account_id := $(CLOUDFLARE_ACCOUNT_ID)
infra-init infra-plan infra-apply: export AWS_ENDPOINT_URL_S3 = $(R2_ENDPOINT)

check-account:
	@test -n "$(CLOUDFLARE_ACCOUNT_ID)" || { echo "CLOUDFLARE_ACCOUNT_ID is not set. See .envrc.example."; exit 1; }

infra-init: check-account ## Initialise Terraform with the R2 state backend
	$(TF) init -backend-config=$(TF_CONFIG)/$(ENV).tfbackend

infra-plan: check-account ## Show planned infrastructure changes (ENV=production)
	$(TF) plan -var-file=$(TF_CONFIG)/$(ENV).tfvars $(TF_ARGS)

infra-apply: check-account ## Apply infrastructure changes (ENV=production)
	$(TF) apply -var-file=$(TF_CONFIG)/$(ENV).tfvars $(TF_ARGS)

infra-validate: ## Check Terraform formatting and validity (no credentials needed)
	terraform fmt -check -recursive deploy
	$(TF) init -backend=false -input=false >/dev/null
	$(TF) validate
