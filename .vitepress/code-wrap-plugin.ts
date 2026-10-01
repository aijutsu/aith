// Lets a page ask for a code block whose long lines wrap instead of scrolling sideways:
//
//   ```text wrap
//
// The flag is a word after the language on the fence line. CommonMark tools, GitHub included,
// read only the first word as the language and ignore the rest, so the page stays portable;
// only the site reads the flag. It is meant for prompts and output. Commands keep scrolling, so
// a reader never mistakes the wrapped half of one command for a second command.
//
// VitePress's own fence rule (preWrapperPlugin) builds the `<div class="language-…">` around the
// block. This wraps that rule, so it must be registered through `markdown.config`, which
// VitePress runs after its own plugins.

import type MarkdownIt from 'markdown-it'

const WRAP_FLAG = /(^|\s)wrap(?=\s|$)/

export function codeWrapPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const [lang = '', ...rest] = token.info.trim().split(/\s+/)
    const meta = rest.join(' ')
    if (!WRAP_FLAG.test(meta)) return fence(tokens, idx, options, env, self)

    // Take the flag out before VitePress reads the rest (title, line numbers, highlighting).
    token.info = [lang, meta.replace(WRAP_FLAG, ' ').trim()].filter(Boolean).join(' ')
    return fence(tokens, idx, options, env, self).replace('<div class="language-', '<div class="wrap language-')
  }
}
