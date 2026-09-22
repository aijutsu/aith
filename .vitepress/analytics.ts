// Plausible analytics in the page (docs/system/analytics.md). The tracker loads from this
// site's own Worker (worker/index.ts) on disguised, first-party paths, so ad-blockers don't
// block it. It runs only on the live site: `make site` and `make site-preview` send nothing.

import type { HeadConfig } from 'vitepress'
import { EVENT_PATH, SCRIPT_PATH } from '../worker/analytics.ts'

const LIVE_HOST = 'aith.aijutsu.dev'

// Plausible's "new script" bootstrap, as on aijutsu.dev: a queue stub, then init() with the
// proxy as the endpoint (the tracker's default endpoint is Plausible itself). The tracker
// file name identifies the site, so there's no data-domain. autoCapturePageviews (on by
// default) follows VitePress's client-side page changes.
const bootstrap =
  `if(location.hostname===${JSON.stringify(LIVE_HOST)}){` +
  'window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)};' +
  'window.plausible.init=window.plausible.init||function(i){window.plausible.o=i||{}};' +
  `window.plausible.init({endpoint:${JSON.stringify(EVENT_PATH)},outboundLinks:true,fileDownloads:true});` +
  `document.head.appendChild(Object.assign(document.createElement("script"),{src:${JSON.stringify(SCRIPT_PATH)},defer:true}))}`

export const analyticsHead: HeadConfig[] = [['script', {}, bootstrap]]
