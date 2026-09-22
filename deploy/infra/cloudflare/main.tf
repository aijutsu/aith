data "cloudflare_zone" "this" {
  filter = {
    name    = var.zone_name
    account = { id = var.account_id }
  }
}

# The Worker that serves the course site. Terraform owns the Worker and its domain.
# Its content (the built site as static assets) is uploaded by `wrangler deploy`
# (`make deploy`, using wrangler.jsonc), so versions and deployments are not managed here.
resource "cloudflare_worker" "site" {
  account_id = var.account_id
  name       = var.worker_name

  # Serve only on the custom domain: no *.workers.dev or preview URLs.
  # wrangler.jsonc sets workers_dev and preview_urls to false to match.
  subdomain = {
    enabled          = false
    previews_enabled = false
  }
}

# Attaches the hostname to the Worker. Cloudflare creates the DNS record and
# certificate itself, and refuses if the hostname already has a CNAME record.
# It also refuses (code 100124) while the Worker has no deployment. So on the very first
# setup, apply the Worker alone, run `make deploy`, then apply again
# (docs/system/publishing.md, "First-time setup").
resource "cloudflare_workers_custom_domain" "site" {
  account_id = var.account_id
  zone_id    = data.cloudflare_zone.this.id
  hostname   = var.hostname
  service    = cloudflare_worker.site.name
}
