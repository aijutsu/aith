// Marks the numbered lists that custom.css may number 1.1., 1.1.1. and so on: the ones inside
// another numbered list. Pages stay plain Markdown (`1.` at every level); this only adds an
// attribute to what they already write.
//
// Marking them here, rather than styling every `ol ol` in CSS, keeps three kinds of list out of
// it — a list whose numbers the browser should keep (one that starts at 4), a list another rule
// already owns (the Course Overview cards), and a list under a bullet, which has no parent
// number to carry. A list this rule doesn't mark keeps its own marker, so a list it fails to
// see degrades to plain numbering rather than to no numbering at all.
//
// Registered last in config.mts, after the rules that put their own classes on lists.

import type MarkdownIt from 'markdown-it'

export function orderedListPlugin(md: MarkdownIt) {
  md.core.ruler.push('nested_numbered_lists', (state) => {
    // The lists open around the token being read, outermost first. `false` means "leave this
    // one to the browser", and everything inside it is left alone too.
    const open: boolean[] = []

    for (const token of state.tokens) {
      if (token.type === 'bullet_list_open') {
        open.push(false)
      } else if (token.type === 'ordered_list_open') {
        const ours =
          open.every(Boolean) && // a bullet in between breaks the chain of numbers
          !token.attrGet('start') && // `4.` first: CSS counters can't read start, so the browser's numbers are the right ones
          !token.attrGet('class') // another rule owns how this list looks
        if (ours && open.length) {
          token.attrJoin('class', 'sub-numbers')
          // list-style: none makes Safari drop the list from VoiceOver. Put it back.
          token.attrSet('role', 'list')
        }
        open.push(ours)
      } else if (token.type === 'ordered_list_close' || token.type === 'bullet_list_close') {
        open.pop()
      }
    }
  })
}
