// Draws the diagrams that mermaid-plugin.ts marks (`pre.aith-mermaid`, holding the diagram's
// source). Mermaid is loaded only on a page that has one, so every other page stays as light as
// it was. It draws again when the reader switches between light and dark, because a diagram's
// colours are fixed when it is drawn.
// See docs/system/site.md#theme.

import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vitepress'

const BLOCK = 'pre.aith-mermaid'
let counter = 0

async function draw(): Promise<void> {
  const blocks = [...document.querySelectorAll<HTMLPreElement>(BLOCK)]
  if (!blocks.length) return

  // Mermaid measures text to size its boxes. Measured before the page's font has loaded, the
  // words come out wider than their boxes and get cut off.
  await document.fonts.ready
  const { default: mermaid } = await import('mermaid')
  const dark = document.documentElement.classList.contains('dark')
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: dark ? 'dark' : 'neutral',
    fontFamily: getComputedStyle(document.body).fontFamily,
    // Drawn at its natural size, so the words stay readable. A diagram wider than the page
    // scrolls sideways instead of shrinking (custom.css).
    sequence: { useMaxWidth: false, mirrorActors: false, wrap: true, width: 100, actorMargin: 16, messageMargin: 28, diagramMarginX: 8 },
    flowchart: { useMaxWidth: false },
  })

  for (const block of blocks) {
    // Keep the source on the element, so a redraw (light/dark) starts from it, not from the SVG.
    block.dataset.source ??= block.textContent ?? ''
    try {
      const { svg } = await mermaid.render(`aith-mermaid-${++counter}`, block.dataset.source)
      block.innerHTML = svg
      block.classList.add('drawn')
    } catch {
      // A diagram that doesn't parse stays readable as text, rather than vanishing.
      block.textContent = block.dataset.source
      block.classList.remove('drawn')
    }
  }
}

export function useMermaid(): void {
  const route = useRoute()
  let observer: MutationObserver | undefined

  onMounted(() => {
    draw()
    // The light/dark switch toggles `dark` on <html>.
    observer = new MutationObserver(() => draw())
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })
  watch(
    () => route.path,
    () => nextTick(draw),
  )
  onUnmounted(() => observer?.disconnect())
}
