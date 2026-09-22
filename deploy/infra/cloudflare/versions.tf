terraform {
  required_version = ">= 1.11"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.25"
    }
  }

  # State lives in the shared aijutsu R2 bucket `aijutsu-terraform-state`, through
  # R2's S3-compatible API. Bucket and key come from deploy/config/<env>.tfbackend. The
  # endpoint comes from AWS_ENDPOINT_URL_S3, which the Makefile builds from CLOUDFLARE_ACCOUNT_ID
  # so the account ID stays out of the repo.
  # Credentials come from AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY (an R2 S3-API pair,
  # see .envrc.example). They are needed at `terraform init` too, because init reads the state.
  #
  # The bucket is shared by every aijutsu project, and R2 can't limit a credential to one
  # key prefix. So NO RESOURCE WHOSE STATE HOLDS A SECRET (e.g. cloudflare_api_token) may
  # go in this module: anyone with the state credential could read it.
  #
  # use_lockfile works on R2 (zworker tested it on Terraform 1.15.8: a second concurrent
  # apply got 412 PreconditionFailed). Re-test after Terraform upgrades.
  # No `encrypt`: R2 rejects the server-side-encryption header.
  backend "s3" {
    region                      = "auto"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_s3_checksum            = true
    use_path_style              = true
    use_lockfile                = true
  }
}
