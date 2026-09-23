// Auto-scroll for collapsible sections (<details>, course format v1). Sections of one group share
// a `name`, so opening one closes the others: the header the reader just clicked slides up by the
// height of the section that closed. This puts that header back at the top of the screen, just
// under the bars the theme keeps stuck there. See docs/system/site.md#theme.

import { onMounted, onUnmounted } from 'vue'

// Space left between the stuck bars and the header.
const GAP = 16

// The bottom edge of whatever the default theme keeps stuck at the top of the screen right now.
// Measured, not written in, because it differs by width: the nav bar is fixed only from 960px, and
// the local nav bar (the "On this page" strip) sits under it from 960px, at the very top below
// that, and is hidden from 1280px. Measuring also survives a VitePress bump that changes a height,
// and covers a layout-top banner, which the local nav bar carries as padding.
function stickyBottom(): number {
  let bottom = 0

  for (const el of document.querySelectorAll<HTMLElement>('.VPNav, .VPLocalNav')) {
    const style = getComputedStyle(el)
    // Below 960px the nav bar is `position: relative`: it scrolls away, so it covers nothing.
    if (style.position !== 'fixed' && style.position !== 'sticky') continue

    const { height } = el.getBoundingClientRect()
    if (!height) continue // The local nav bar is `display: none` from 1280px.

    const top = parseFloat(style.top) // 0, or the nav bar's height for the local nav bar.
    bottom = Math.max(bottom, (Number.isFinite(top) ? top : 0) + height)
  }

  return bottom
}

function scrollSummaryIntoPlace(summary: Element): void {
  const top = window.scrollY + summary.getBoundingClientRect().top - stickyBottom() - GAP

  // Animate a short hop, snap a long one, as the default theme does for heading anchors. A
  // `behavior` of 'smooth' beats the `scroll-behavior: auto !important` the theme sets under
  // `prefers-reduced-motion`, so that has to be checked here.
  const smooth =
    Math.abs(top - window.scrollY) <= window.innerHeight &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches

  window.scrollTo({ left: 0, top, behavior: smooth ? 'smooth' : 'auto' })
}

// Listen for `click`, not `toggle`. `toggle` doesn't bubble, and a named group fires two of them
// for one click (one section closing, one opening), which would race. A click on the summary fires
// once, and covers the keyboard too: Enter or Space on a focused summary dispatches one.
function onClick(event: MouseEvent): void {
  if (event.defaultPrevented) return

  const target = event.target as Element | null
  const summary = target?.closest?.('.vp-doc details > summary')
  // A link or button inside a summary is followed instead of opening the section.
  if (!summary || target?.closest('a, button')) return

  // The section is still in its old state here: a <details> opens or closes after the click event,
  // and a named group closes its open sibling at the same time. So read the layout a frame later.
  requestAnimationFrame(() => scrollSummaryIntoPlace(summary))
}

// One delegated listener covers every page: the router swaps the content under it.
export function useDetailsScroll(): void {
  onMounted(() => document.addEventListener('click', onClick))
  onUnmounted(() => document.removeEventListener('click', onClick))
}
