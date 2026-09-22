terraform {
  required_version = ">= 1.11"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.25"
    }
  }

  # State lives in a Cloudflare R2 bucket through R2's S3-compatible API.
  # Bucket and key come from deploy/config/<env>.tfbackend. The endpoint comes from
  # AWS_ENDPOINT_URL_S3 and the R2 token from AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY,
  # all set by the Makefile and .envrc (see docs/system/publishing.md).
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
