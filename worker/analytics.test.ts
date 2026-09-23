// Tests for the Worker's analytics proxy. Run with `make worker-test` (Node's built-in test
// runner; Node 24 runs TypeScript directly). No network: fetch is replaced per test.

import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { EVENT_PATH, SCRIPT_PATH, buildEventRequest, clientIp, handleRequest, scriptPath, type Env } from './analytics.ts'

const SITE = 'https://aith.aijutsu.dev'
const realFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = realFetch
})

function env(overrides: Partial<Env> = {}): Env & { assetRequests: string[] } {
  const assetRequests: string[] = []
  return {
    assetRequests,
    ASSETS: {
      fetch: async (request: Request) => {
        assetRequests.push(new URL(request.url).pathname)
        return new Response('asset')
      },
    },
    PLAUSIBLE_UPSTREAM: 'https://plausible.example',
    PLAUSIBLE_SCRIPT: '/js/pa-test.js',
    ...overrides,
  }
}

/** Replace fetch; record what the Worker asked the upstream for. */
function mockUpstream(response: () => Response): Request[] {
  const calls: Request[] = []
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push(input instanceof Request ? input : new Request(input, init))
    return response()
  }) as typeof fetch
  return calls
}

test('the event request forwards the visitor IP and User-Agent, and does not follow redirects', () => {
  const request = new Request(`${SITE}${EVENT_PATH}`, {
    method: 'POST',
    headers: { 'CF-Connecting-IP': '203.0.113.7', 'User-Agent': 'TestBrowser/1.0', 'Content-Type': 'text/plain' },
  })
  const upstream = buildEventRequest(request, 'https://plausible.example', '{}')
  assert.equal(upstream.url, 'https://plausible.example/api/event')
  assert.equal(upstream.method, 'POST')
  assert.equal(upstream.headers.get('X-Forwarded-For'), '203.0.113.7')
  assert.equal(upstream.headers.get('User-Agent'), 'TestBrowser/1.0')
  assert.equal(upstream.headers.get('Content-Type'), 'text/plain')
  assert.equal(upstream.redirect, 'manual')
})

test('clientIp prefers CF-Connecting-IP, then the first X-Forwarded-For address', () => {
  assert.equal(clientIp(new Headers({ 'CF-Connecting-IP': '198.51.100.1', 'X-Forwarded-For': '10.0.0.1' })), '198.51.100.1')
  assert.equal(clientIp(new Headers({ 'X-Forwarded-For': '192.0.2.5, 10.0.0.1' })), '192.0.2.5')
  assert.equal(clientIp(new Headers()), '')
})

test('an accepted event passes through as 202', async () => {
  const calls = mockUpstream(() => new Response('ok', { status: 202 }))
  const response = await handleRequest(new Request(`${SITE}${EVENT_PATH}`, { method: 'POST', body: '{"n":"pageview"}' }), env())
  assert.equal(response.status, 202)
  assert.equal(calls[0].url, 'https://plausible.example/api/event')
  assert.equal(await calls[0].text(), '{"n":"pageview"}')
})

test('an upstream redirect (Cloudflare Access login) becomes a 502, not a fake success', async () => {
  mockUpstream(() => new Response('login page', { status: 302, headers: { Location: 'https://example.cloudflareaccess.com/' } }))
  const response = await handleRequest(new Request(`${SITE}${EVENT_PATH}`, { method: 'POST', body: '{}' }), env())
  assert.equal(response.status, 502)
  assert.equal(await response.text(), '')
})

test('the tracker script comes from the configured Plausible script, as JavaScript', async () => {
  const calls = mockUpstream(() => new Response('/* tracker */'))
  const response = await handleRequest(new Request(`${SITE}${SCRIPT_PATH}`), env())
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Content-Type'), 'application/javascript')
  assert.equal(calls[0].url, 'https://plausible.example/js/pa-test.js')
})

test('PLAUSIBLE_SCRIPT takes a path or a bare id from the Plausible snippet', () => {
  assert.equal(scriptPath('/js/pa-abc123.js'), '/js/pa-abc123.js')
  assert.equal(scriptPath('pa-abc123.js'), '/js/pa-abc123.js')
  assert.equal(scriptPath('abc123'), '/js/pa-abc123.js')
  assert.equal(scriptPath(' abc123 '), '/js/pa-abc123.js')
  assert.equal(scriptPath(''), '')
  assert.equal(scriptPath(undefined), '')
})

test('with no PLAUSIBLE_SCRIPT, the tracker answers 404 without calling Plausible', async () => {
  const calls = mockUpstream(() => new Response('should not be called'))
  const response = await handleRequest(new Request(`${SITE}${SCRIPT_PATH}`), env({ PLAUSIBLE_SCRIPT: '' }))
  assert.equal(response.status, 404)
  assert.equal(calls.length, 0)
})

test('wrong methods get 405', async () => {
  assert.equal((await handleRequest(new Request(`${SITE}${EVENT_PATH}`), env())).status, 405)
  assert.equal((await handleRequest(new Request(`${SITE}${SCRIPT_PATH}`, { method: 'POST' }), env())).status, 405)
})

test('every other path is served from the static assets', async () => {
  const e = env()
  const response = await handleRequest(new Request(`${SITE}/courses`), e)
  assert.equal(await response.text(), 'asset')
  assert.deepEqual(e.assetRequests, ['/courses'])
})
