variable "account_id" {
  description = "Cloudflare account ID. The Makefile sets it from CLOUDFLARE_ACCOUNT_ID (TF_VAR_account_id)."
  type        = string
}

variable "zone_name" {
  description = "Cloudflare zone that holds the site's hostname."
  type        = string
}

variable "hostname" {
  description = "Public hostname of the course site."
  type        = string
}

variable "worker_name" {
  description = "Worker name. Must match `name` in wrangler.jsonc at the repo root."
  type        = string
}
