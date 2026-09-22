// Renders the `:::glossary` block (course format v1) from course/glossary.yaml.
// Restart `make site` after editing the YAML: pages are cached by their Markdown source.

import { join } from 'node:path'
import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import { CONTENT_DIR, ROOT, readYaml, slugify } from '../format/courses.mjs'

interface Glossary {
  types: Record<string, string>
  terms: { term: string; type: string; description: string; url: string }[]
}

export function glossaryPlugin(md: MarkdownIt) {
  const esc = md.utils.escapeHtml

  md.use(container, 'glossary', {
    render(tokens: { nesting: number }[], idx: number) {
      if (tokens[idx].nesting === -1) return '</div>\n'
      const { types, terms } = readYaml(join(ROOT, CONTENT_DIR, 'glossary.yaml')) as Glossary

      const typeItems = Object.entries(types)
        .map(([name, text]) => `<li id="type-${slugify(name)}"><strong>${esc(name)}</strong>: ${md.renderInline(text)}</li>`)
        .join('\n')
      const rows = terms
        .map(({ term, type, description, url }) => {
          const id = slugify(term)
          return [
            `<tr id="${id}">`,
            `<td><a href="#${id}">${esc(term)}</a></td>`,
            `<td><a href="#type-${slugify(type)}">${esc(type)}</a></td>`,
            `<td>${md.renderInline(description)}</td>`,
            `<td><a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(new URL(url).hostname)}</a></td>`,
            `</tr>`,
          ].join('')
        })
        .join('\n')

      // v-pre: VitePress compiles Markdown output as a Vue template.
      return `<div v-pre class="glossary">
<h2 id="types">Types</h2>
<ul>
${typeItems}
</ul>
<h2 id="terms">Terms</h2>
<table>
<thead><tr><th>Term</th><th>Type</th><th>Description</th><th>Link</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
`
    },
  })
}
