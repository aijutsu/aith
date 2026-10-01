// Shows a course page's learning outcomes as cards, like the Course Overview on the home page.
// The course's index.md keeps them a plain Markdown list (it reads well on GitHub), with each
// item opening on a bold header: `1. **Install NanoClaw.** Install NanoClaw with …`. This rule
// only tags that list for custom.css, which puts the header on its own line.
//
// The list is found by its shape, not by its heading: on a course's own index.md, a top-level
// numbered list in which every item opens with bold text. The Lessons list opens with links,
// so it stays a list.

import type MarkdownIt from 'markdown-it'

type Token = ReturnType<MarkdownIt['parse']>[number]

// A course's main page, e.g. 001-building-agents-with-nanoclaw/index.md.
const COURSE_INDEX = /^\d{3}-[a-z0-9-]+\/index\.md$/

export function outcomeCardsPlugin(md: MarkdownIt) {
  md.core.ruler.push('outcome_cards', (state) => {
    if (!COURSE_INDEX.test(state.env?.relativePath ?? '')) return

    let list: Token | undefined
    let firsts: (Token | undefined)[] = []

    for (const token of state.tokens) {
      if (!list) {
        if (token.type === 'ordered_list_open' && token.level === 0) [list, firsts] = [token, []]
        continue
      }
      if (token.type === 'ordered_list_close' && token.level === 0) {
        // markdown-it puts an empty text token before a leading `**`, so skip empty text.
        const bold = (inline?: Token) =>
          inline?.children?.find((t) => !(t.type === 'text' && t.content === ''))?.type === 'strong_open'
        if (firsts.length > 1 && firsts.every(bold)) {
          list.attrJoin('class', 'outcome-cards')
          // list-style: none makes Safari drop the list from VoiceOver. Put it back.
          list.attrSet('role', 'list')
        }
        list = undefined
        continue
      }
      // Top-level items only: an item is level 1, and its first line (inside a paragraph, hidden
      // in a tight list) is level 3.
      if (token.type === 'list_item_open' && token.level === 1) firsts.push(undefined)
      else if (token.type === 'inline' && token.level === 3 && firsts.length && firsts.at(-1) === undefined)
        firsts[firsts.length - 1] = token
    }
  })
}
