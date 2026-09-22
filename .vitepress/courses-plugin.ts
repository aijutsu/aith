// Renders the `:::courses` block (course format v1): one card per course, in course order,
// from each course's course.yaml. Restart `make site` after editing a course.yaml: pages are
// cached by their Markdown source.

import type MarkdownIt from 'markdown-it'
import container from 'markdown-it-container'
import { discoverCourses } from '../format/courses.mjs'

export function coursesPlugin(md: MarkdownIt) {
  const esc = md.utils.escapeHtml

  md.use(container, 'courses', {
    render(tokens: { nesting: number }[], idx: number) {
      if (tokens[idx].nesting === -1) return '</div>\n'

      const cards = discoverCourses()
        .filter((course) => course.manifest)
        .map(({ dir, manifest, lessons }, i) => {
          const { id, title, summary } = manifest
          // Folder numbers only set the order and may have gaps, so number the cards 1, 2, 3.
          const meta = [`Course ${i + 1}`, ...(lessons.length ? [`${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`] : [])]
          return [
            `<div class="course-card">`,
            `<p class="course-card-meta">${meta.join(' · ')}</p>`,
            // The course id is the anchor: it never changes, so courses#<id> links keep working.
            `<h2 id="${esc(id)}"><a href="/${dir}/">${esc(title)}</a></h2>`,
            `<p>${md.renderInline(summary)}</p>`,
            `</div>`,
          ].join('\n')
        })
        .join('\n')

      // v-pre: VitePress compiles Markdown output as a Vue template.
      return `<div v-pre class="course-list">\n${cards}\n`
    },
  })
}
