// Carries each glossary term's definition on the link that points at it, so the reader can see
// what a word means without leaving the page (theme/glossary-tooltip.ts shows it).
//
// Pages keep writing a plain relative link (`[token](../../../glossary.md#token)`, course format
// v1): this only adds attributes to what they already write, so `course/` stays renderer-neutral
// and the link still works on GitHub and with JavaScript off.
//
// The definition is inlined on the link rather than fetched, because the whole glossary is 12KB
// and a page carries only the terms it links to — a tooltip that has to wait for a request is a
// tooltip that flickers.
//
// Restart `make site` after editing the YAML: it is read once per build, and pages are cached by
// their Markdown source anyway (see glossary-plugin.ts).

import { join } from 'node:path'
import type MarkdownIt from 'markdown-it'
import { CONTENT_DIR, ROOT, readYaml, slugify } from '../format/courses.mjs'

interface Glossary {
  terms: { term: string; type: string; description: string; url: string }[]
}

interface Entry {
  term: string
  type: string
  html: string
}

// Matches the link as the page wrote it (`../../glossary.md#fork`, `./glossary.md#fork`) and as
// VitePress may have rewritten it by the time this runs (`/glossary#fork`). A bare `#fork`, which
// is what the glossary page's own table uses, is deliberately not matched.
const GLOSSARY_LINK = /(?:^|\/)glossary(?:\.md)?#([a-z0-9-]+)$/

export function glossaryLinkPlugin(md: MarkdownIt) {
  // Built on the first glossary link, not at setup: renderInline has to run after every other
  // plugin has registered its rules.
  let entries: Map<string, Entry> | undefined
  const byAnchor = () => {
    if (!entries) {
      const { terms } = readYaml(join(ROOT, CONTENT_DIR, 'glossary.yaml')) as Glossary
      entries = new Map(
        terms.map(({ term, type, description }) => [
          slugify(term),
          { term, type, html: md.renderInline(description) },
        ]),
      )
    }
    return entries
  }

  const renderLink =
    md.renderer.rules.link_open ??
    ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options))

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const anchor = GLOSSARY_LINK.exec(tokens[idx].attrGet('href') ?? '')?.[1]
    const entry = anchor ? byAnchor().get(anchor) : undefined

    if (entry) {
      // markdown-it escapes attribute values, so the HTML arrives at the browser intact and
      // getAttribute gives it back unescaped. It comes from our own YAML, never from a reader.
      tokens[idx].attrSet('data-glossary', entry.term)
      tokens[idx].attrSet('data-glossary-type', entry.type)
      tokens[idx].attrSet('data-glossary-body', entry.html)
    }

    return renderLink(tokens, idx, options, env, self)
  }
}
