# Analytics (Plausible, through the site's own Worker)

The site counts visits with **Plausible**, self-hosted by Aijutsu at `https://ponzu.aijutsu.dev` (deployed from zworker: `deploy/charts/plausible`). It is cookieless: it stores no cookies and no IP addresses, so there is no cookie banner. The Terms of Use say so, under "Your privacy" (`course/terms.md`).

The browser never talks to ponzu. The tracker script and its events go through the site's own Worker (`aith`), on `aith.aijutsu.dev`, which forwards them to ponzu. It's the same pattern as aijutsu/website (its `docs/analytics.md`), with one difference: there, the proxy is a separate Worker on `anya.aijutsu.dev`; here, it's the Worker that already serves the site.

Why proxy at all:

- **First-party.** Everything is on `aith.aijutsu.dev`, so the browser doesn't treat it as third-party tracking.
- **Ad-blockers.** The public paths are disguised (`/js/p.js`, `/api/e`), so the tell-tale `plausible`, `script.js` and `/api/event` never appear in the page or on the wire. Blocklists match those.

## Data flow

```
browser (aith.aijutsu.dev)
  │  GET  /js/p.js   → tracker script (edge- and browser-cached for 6 hours)
  │  POST /api/e     → pageviews, outbound-link clicks, file downloads
  ▼
Worker "aith"  (worker/, runs first only for these two paths)
  ├─ /js/p.js → GET  ponzu + PLAUSIBLE_SCRIPT   (the site's pa-….js tracker)
  └─ /api/e   → POST ponzu/api/event            (+ X-Forwarded-For, + User-Agent)
  ▼
self-hosted Plausible  https://ponzu.aijutsu.dev
```

Every other request is served straight from the static assets, without running the Worker (`assets.run_worker_first` in `wrangler.jsonc` lists only the two paths).

## Files

| Path | What it does |
| --- | --- |
| `worker/index.ts` | The Worker's entry point (`main` in `wrangler.jsonc`). It exports only the handler: see [known-issues.md](./known-issues.md). |
| `worker/analytics.ts` | The routing and the proxy: `handleRequest`, `buildEventRequest`, `clientIp`, and the public paths (`SCRIPT_PATH`, `EVENT_PATH`). |
| `worker/analytics.test.ts` | Tests, run by `make worker-test` (Node's test runner, no network). CI runs them. |
| `.vitepress/analytics.ts` | The snippet in every page's `<head>`. It imports the public paths from `worker/analytics.ts`, so the two can't drift apart. |
| `wrangler.jsonc` | `main`, the `ASSETS` binding, `run_worker_first`, and the `vars` below. |

## Settings (`vars` in `wrangler.jsonc`)

| Var | Value | What it is |
| --- | --- | --- |
| `PLAUSIBLE_UPSTREAM` | `https://ponzu.aijutsu.dev` | The Plausible instance. |
| `PLAUSIBLE_SCRIPT` | `/js/pa-XXXXXXXX.js`, or just `XXXXXXXX` | The tracker of the Plausible site these visits go to, from Site Settings → Installation. Either the path, the file name, or the bare id (`scriptPath()` fills in the rest). The tracker has its site's domain built in, which is why this site loads **aijutsu.dev's** tracker (see below). **Empty means analytics is off:** `/js/p.js` answers 404 and nothing is sent. If the snippet is ever regenerated in Plausible, the id changes: update it here. |

Neither is a secret. The tracker itself names ponzu (its default endpoint), and every visitor downloads it.

## Which Plausible site the visits go to

They go to the **`aijutsu.dev`** site in Plausible, not a site of their own. That site covers every `aijutsu.dev` subdomain, which is how Plausible says to handle subdomains: load the same tracker everywhere, and split the reports with the **Hostname** filter (URL → Hostname). The course site is `aith.aijutsu.dev` there.

What that means when reading the numbers:

- **Totals include aijutsu.dev**: filter by Hostname to see the course site alone.
- **Pages are grouped by path, without the hostname.** `/about` exists on both sites, so their views add up in the Pages report until a Hostname filter is set.
- **Goals are shared** by both sites.

To split them later, add `aith.aijutsu.dev` as its own site in Plausible and set its own tracker as `PLAUSIBLE_SCRIPT`. Nothing else changes. Past visits stay in the `aijutsu.dev` site.

## The Worker (`worker/analytics.ts`)

- **`/js/p.js`** fetches `PLAUSIBLE_UPSTREAM + PLAUSIBLE_SCRIPT` with a 6-hour edge cache, and returns it as `application/javascript`. A failed upstream becomes a 502.
- **`/api/e`** forwards the event body to `/api/event`. Two things matter, both from the website's experience:
  - **The visitor's IP and browser.** Plausible counts unique visitors from a daily hash of IP address and User-Agent. A Worker's request comes from Cloudflare's IP, which would make every visitor look like one. So `buildEventRequest` sets `X-Forwarded-For` (from `CF-Connecting-IP`) and passes the `User-Agent` on.
  - **No silent failures.** ponzu is behind Cloudflare Access. If `/api/*` ever loses its Access bypass, ponzu answers with a 302 to the Access login page. The Worker fetches with `redirect: 'manual'` and turns anything other than 2xx into a **502**, with a `console.warn` in the Worker logs. Following the redirect would have returned the login page's 200, and every event would have been lost without a sign.
- **Other methods** get 405. Other paths go to the static assets.
- It's same-origin, so there are no CORS headers.

## The page (`.vitepress/analytics.ts`)

The site config's `head` adds one inline script to every page. On `aith.aijutsu.dev` only, it:

1. sets up Plausible's queue stub (`window.plausible` and `plausible.init`), as on aijutsu.dev;
2. calls `plausible.init({ endpoint: '/api/e', outboundLinks: true, fileDownloads: true })`. The tracker's default endpoint is ponzu itself, so the `endpoint` is what sends events through the proxy;
3. adds `<script src="/js/p.js" defer>`.

`autoCapturePageviews` (on by default) counts VitePress's client-side page changes, so there's no per-page code. On any other host (`make site`, `make site-preview`, `make worker-dev`), the script does nothing.

## Turning it on

It is on: `PLAUSIBLE_SCRIPT` holds the `aijutsu.dev` site's tracker, and a push to `main` deploys it. Nothing had to be created in Plausible, and its Cloudflare Access bypass for `/js/*` and `/api/*` was already in place for aijutsu.dev.

If the tracker's id ever changes (regenerating the snippet in Plausible), update `PLAUSIBLE_SCRIPT`. To turn analytics off, set it to `""`.

**Plausible's "Verify installation" step won't find this site.** It looks for a tracker on a known URL in the page's HTML, and here the tracker is proxied (`/js/p.js`) and added by an inline script. Check the live dashboard instead: open the site, then look for a current visitor with the Hostname filter set to `aith.aijutsu.dev`.

## Checking it

Unit tests: `make worker-test`.

Locally, with the real Worker and the built site:

```sh
make worker-dev          # http://localhost:8787; add --var PLAUSIBLE_SCRIPT:/js/pa-….js to test the tracker
curl -sI http://localhost:8787/js/p.js                        # 200, application/javascript
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:8787/api/e \
  -H 'Content-Type: text/plain' \
  --data '{"n":"pageview","d":"aith.aijutsu.dev","u":"https://aith.aijutsu.dev/"}'   # 202
```

**Testing locally behind Cloudflare WARP:** WARP inspects encrypted traffic, so ponzu's certificate is signed by "Gateway CA - Cloudflare Managed G1". The local Workers runtime doesn't trust it, and every call to ponzu fails with `Error: internal error; reference = …` (a 500). Export the CA and point wrangler at it:

```sh
security find-certificate -a -c "Gateway CA - Cloudflare Managed G1" -p /Library/Keychains/System.keychain > /tmp/warp-ca.pem
NODE_EXTRA_CA_CERTS=/tmp/warp-ca.pem make worker-dev
```

After a deploy: open the site, and check DevTools → Network: `/js/p.js` (200) and `/api/e` (202) on `aith.aijutsu.dev`, never on ponzu. The visit should show in Plausible with a real country.

## If events stop

- `/api/e` returns **502**: read the Worker logs. `returned 302` means ponzu's Access bypass for `/api/*` is gone: restore it in Zero Trust → Access → Applications (see the website's `docs/analytics.md`, "Access must bypass the ingest path").
- `/js/p.js` returns **404**: `PLAUSIBLE_SCRIPT` is empty. **502**: the id is wrong (regenerated in Plausible?) or ponzu is down.
- Events arrive, but nothing shows under the course site: check the **Hostname** filter (`aith.aijutsu.dev`). Without it, the dashboard shows aijutsu.dev and the course site together.
- No `/js/p.js` request at all: the page isn't on `aith.aijutsu.dev`, or an extension blocks inline scripts.
- If a Content-Security-Policy is ever added, it must allow the inline snippet, and `'self'` for `script-src` and `connect-src`.
