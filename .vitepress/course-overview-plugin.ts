// Shows the home page's Course Overview as cards, like the default theme's home features.
// course/index.md keeps it a plain Markdown list (it reads well on GitHub): this rule only
// tags it for custom.css. The list is found by what it holds, a link to a course folder,
// not by its heading, so renaming the heading doesn't break the cards. Items without a
// link are courses not yet written: they get a "Coming soon" badge.

import type MarkdownIt from 'markdown-it'

type Token = ReturnType<MarkdownIt['parse']>[number]

// A course folder link as written in course/index.md: ./001-building-agents-with-nanoclaw/index.md
const COURSE_LINK = /^(\.\/)?\d{3}-[a-z0-9-]+\/(index\.md)?$/

const links = (inline?: Token) => inline?.children?.filter((t) => t.type === 'link_open') ?? []

export function courseOverviewPlugin(md: MarkdownIt) {
  md.core.ruler.push('course_overview', (state) => {
    if (state.env?.relativePath !== 'index.md') return

    let list: Token | undefined
    let items: { li: Token; title?: Token }[] = []

    for (const token of state.tokens) {
      if (!list) {
        if (token.type === 'ordered_list_open' && token.level === 0) [list, items] = [token, []]
        continue
      }
      if (token.type === 'ordered_list_close' && token.level === 0) {
        if (items.some(({ title }) => links(title).some((a) => COURSE_LINK.test(a.attrGet('href') ?? '')))) {
          list.attrJoin('class', 'course-overview')
          // list-style: none makes Safari drop the list from VoiceOver. Put it back.
          list.attrSet('role', 'list')
          for (const { li, title } of items) {
            if (links(title).length) continue
            li.attrJoin('class', 'planned')
            const badge = new state.Token('html_inline', '', 0)
            // The space keeps screen readers from running the title into the badge.
            badge.content = ' <span class="course-overview-badge">Coming soon</span>'
            title?.children?.push(badge)
          }
        }
        list = undefined
        continue
      }
      // Top-level items only: an item is level 1, and its first line (the title) is level 3.
      if (token.type === 'list_item_open' && token.level === 1) items.push({ li: token })
      else if (token.type === 'inline' && token.level === 3) items.at(-1)!.title ??= token
    }
  })
}
