// Entry point of the "aith" Worker (wrangler.jsonc "main"). The Workers runtime treats every
// named export of this module as an entry point, and refuses to start on anything else (a
// string constant fails with "Incorrect type for map entry"). So it exports only the
// handler: the code, its constants and its tests are in analytics.ts.

import { handleRequest } from './analytics.ts'

export default { fetch: handleRequest }
