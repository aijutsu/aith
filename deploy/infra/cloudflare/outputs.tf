output "url" {
  description = "Public URL of the course site."
  value       = "https://${cloudflare_workers_custom_domain.site.hostname}"
}

output "worker_name" {
  description = "Name of the Worker that wrangler deploys to."
  value       = cloudflare_worker.site.name
}
