// Turns a ```mermaid code block into a diagram placeholder, which theme/mermaid.ts draws in the
// browser. Pages keep a plain fenced block (course format v1): GitHub draws the same block as a
// diagram, and any other tool shows its text, which is written to read on its own.
//
// The block's text is kept, escaped, inside the placeholder. Until the script runs (or with
// JavaScript off), the reader sees the diagram's source, the same as on a plain code block.

import type MarkdownIt from 'markdown-it'

export function mermaidPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    if (token.info.trim().split(/\s+/)[0] !== 'mermaid') return fence(tokens, idx, options, env, self)
    return `<pre class="aith-mermaid">${md.utils.escapeHtml(token.content)}</pre>\n`
  }
}
