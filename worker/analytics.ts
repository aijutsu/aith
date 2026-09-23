// The "aith" Worker's request handling (the entry point, index.ts, only exports it). It
// proxies Plausible analytics so that ad-blockers don't block it: the browser only ever
// talks to aith.aijutsu.dev, on disguised paths, and the Worker forwards them to the
// self-hosted Plausible. The same pattern as aijutsu/website's contact-api Worker (its
// docs/analytics.md). See docs/system/analytics.md.
//
// wrangler.jsonc runs the Worker first only for the two analytics paths
// (assets.run_worker_first). Every other request is served straight from the assets.

export interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  /** The Plausible instance, e.g. https://ponzu.aijutsu.dev. */
  PLAUSIBLE_UPSTREAM?: string
  /**
   * The site's tracker script on Plausible, e.g. /js/pa-XXXXXXXX.js (Site Settings →
   * Installation). The file name identifies the site, so the page needs no data-domain.
   * Empty means analytics is off: /js/p.js answers 404, and the page sends nothing.
   */
  PLAUSIBLE_SCRIPT?: string
}

// Public paths, on aith.aijutsu.dev. Disguised, so the tell-tale "plausible", "script.js"
// and "/api/event" never appear in the page or on the wire. .vitepress/analytics.ts uses them.
export const SCRIPT_PATH = '/js/p.js'
export const EVENT_PATH = '/api/e'

const UPSTREAM_EVENT_PATH = '/api/event'
const SCRIPT_CACHE_TTL = 21600 // 6 hours, at the edge and in the browser

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const { pathname } = new URL(request.url)
  if (pathname === SCRIPT_PATH) {
    return request.method === 'GET' || request.method === 'HEAD'
      ? proxyScript(env)
      : new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  if (pathname === EVENT_PATH) {
    return request.method === 'POST'
      ? proxyEvent(request, env)
      : new Response(null, { status: 405, headers: { Allow: 'POST' } })
  }
  return env.ASSETS.fetch(request)
}

const upstreamOf = (env: Env) => (env.PLAUSIBLE_UPSTREAM ?? 'https://ponzu.aijutsu.dev').replace(/\/$/, '')

/**
 * PLAUSIBLE_SCRIPT may be the whole path (/js/pa-XXXX.js) or just the id from Plausible's
 * snippet (pa-XXXX, or XXXX). A bare id without this would be pasted straight onto the
 * upstream host, making a URL with no "/" in it.
 */
export function scriptPath(value: string | undefined): string {
  const script = value?.trim() ?? ''
  if (!script || script.startsWith('/')) return script
  return `/js/pa-${script.replace(/^pa-/, '').replace(/\.js$/, '')}.js`
}

async function proxyScript(env: Env): Promise<Response> {
  const script = scriptPath(env.PLAUSIBLE_SCRIPT)
  if (!script) return new Response(null, { status: 404 })
  // `cf` cache options apply on Cloudflare and are ignored elsewhere (tests).
  const upstream = await fetch(`${upstreamOf(env)}${script}`, {
    cf: { cacheEverything: true, cacheTtl: SCRIPT_CACHE_TTL },
  } as RequestInit)
  if (!upstream.ok) return new Response(null, { status: 502 })
  return new Response(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': `public, max-age=${SCRIPT_CACHE_TTL}`,
    },
  })
}

/**
 * The upstream /api/event request. Plausible counts unique visitors from a daily hash of
 * the client IP and User-Agent. A Worker subrequest comes from Cloudflare's IP, which would
 * make every visitor look like one, so forward the real IP (X-Forwarded-For) and the
 * User-Agent.
 *
 * redirect: 'manual', because ponzu is behind Cloudflare Access. If the ingest path ever
 * loses its Access bypass, the upstream answers with a 302 to the login page. Following it
 * would return the login page's 200 and drop every event silently.
 */
export function buildEventRequest(request: Request, upstream: string, body: string): Request {
  const headers = new Headers()
  const userAgent = request.headers.get('User-Agent')
  if (userAgent) headers.set('User-Agent', userAgent)
  const ip = clientIp(request.headers)
  if (ip) headers.set('X-Forwarded-For', ip)
  const contentType = request.headers.get('Content-Type')
  if (contentType) headers.set('Content-Type', contentType)
  return new Request(`${upstream}${UPSTREAM_EVENT_PATH}`, { method: 'POST', headers, body, redirect: 'manual' })
}

async function proxyEvent(request: Request, env: Env): Promise<Response> {
  const upstream = await fetch(buildEventRequest(request, upstreamOf(env), await request.text()))
  // Plausible answers 202. Anything else means the event was lost: make it a loud 502,
  // and never pass on the upstream's body or redirect.
  if (!upstream.ok) {
    console.warn(`plausible ${UPSTREAM_EVENT_PATH} returned ${upstream.status} (expected 202): event dropped. Does Access still bypass /api/*?`)
    return new Response(null, { status: 502 })
  }
  return new Response(upstream.body, { status: upstream.status })
}

export function clientIp(headers: Headers): string {
  const cf = headers.get('CF-Connecting-IP')?.trim()
  if (cf) return cf
  return headers.get('X-Forwarded-For')?.split(',')[0].trim() ?? ''
}
