// Show what a glossary word means without leaving the page. glossary-link-plugin.ts puts the
// term, its type and its definition on the link; this shows them in a small bubble.
//
// Hovering a glossary word opens it, and so does tabbing to it; Escape or moving away closes it.
// Clicking still goes to the glossary, which is what a link is for.
//
// A tap can't open it: VitePress registers its router on `window` with `{capture: true}`, so it
// routes before any listener the theme can add, and a tap would both open the bubble and leave
// the page. Touch readers get the glossary page itself, which has the same words in full.
// See docs/system/site.md#theme.

import { onMounted, onUnmounted } from 'vue'

const LINK = 'a[data-glossary]'
// Space between the bubble and the link, and the least it keeps from the edge of the screen.
const GAP = 8
const MARGIN = 16
// Long enough to cross the gap into the bubble without it closing under the pointer.
const CLOSE_DELAY = 120

let bubble: HTMLDivElement | null = null
let openFor: HTMLAnchorElement | null = null
let closeTimer: ReturnType<typeof setTimeout> | undefined

// A screen that can't hover never opens the bubble: there would be no way to dismiss it, and the
// link's own page says the same thing.
const touchOnly = () => window.matchMedia('(hover: none)').matches

function place(link: HTMLAnchorElement): void {
  if (!bubble) return
  const word = link.getBoundingClientRect()
  const box = bubble.getBoundingClientRect()

  // Under the word, or above it when there isn't room. Fixed position, so these are viewport
  // coordinates and the page behind can be left alone.
  const below = word.bottom + GAP
  const above = word.top - box.height - GAP
  const top = below + box.height + MARGIN <= window.innerHeight || above < MARGIN ? below : above

  // Centred on the word, then pulled back inside the screen.
  const centred = word.left + word.width / 2 - box.width / 2
  const left = Math.min(Math.max(centred, MARGIN), window.innerWidth - box.width - MARGIN)

  bubble.style.top = `${Math.round(top)}px`
  bubble.style.left = `${Math.round(Math.max(left, MARGIN))}px`
}

function close(): void {
  clearTimeout(closeTimer)
  if (!bubble) return

  openFor?.removeAttribute('aria-describedby')
  bubble.remove()
  bubble = null
  openFor = null
}

function open(link: HTMLAnchorElement): void {
  if (openFor === link) return
  close()

  const term = link.dataset.glossary ?? link.textContent ?? ''
  const type = link.dataset.glossaryType ?? ''
  const body = link.dataset.glossaryBody ?? ''

  bubble = document.createElement('div')
  bubble.className = 'aith-glossary'
  bubble.id = 'aith-glossary-bubble'
  bubble.setAttribute('role', 'tooltip')

  const heading = document.createElement('p')
  heading.className = 'aith-glossary-term'
  heading.textContent = term
  if (type) {
    const badge = document.createElement('span')
    badge.className = 'aith-glossary-type'
    badge.textContent = type
    heading.append(badge)
  }

  const text = document.createElement('div')
  text.className = 'aith-glossary-body'
  // The one place this sets HTML: the definition, which glossary-link-plugin.ts rendered from
  // course/glossary.yaml at build time, so it carries the <code> and <em> the YAML wrote. It is
  // repository content baked into a static page — there is no path for a reader to set it.
  text.innerHTML = body

  bubble.append(heading, text)

  document.body.append(bubble)
  link.setAttribute('aria-describedby', bubble.id)
  openFor = link

  // Keeping the pointer on the bubble keeps it open; leaving it closes it like leaving the word.
  bubble.addEventListener('pointerenter', () => clearTimeout(closeTimer))
  bubble.addEventListener('pointerleave', scheduleClose)

  place(link)
}

function scheduleClose(): void {
  clearTimeout(closeTimer)
  closeTimer = setTimeout(close, CLOSE_DELAY)
}

function linkFrom(event: Event): HTMLAnchorElement | null {
  const target = event.target as Element | null
  return (target?.closest?.(LINK) as HTMLAnchorElement | null) ?? null
}

function onPointerOver(event: PointerEvent): void {
  // A touch fires pointerover just before click; that screen is handled by onClick instead.
  if (event.pointerType === 'touch' || touchOnly()) return

  const link = linkFrom(event)
  if (link) {
    clearTimeout(closeTimer)
    open(link)
  } else if (!(event.target as Element | null)?.closest?.('.aith-glossary')) {
    scheduleClose()
  }
}

function onFocusIn(event: FocusEvent): void {
  const link = linkFrom(event)
  if (link) open(link)
  else if (openFor && !(event.target as Element | null)?.closest?.('.aith-glossary')) close()
}

function onClick(event: MouseEvent): void {
  const link = linkFrom(event)

  // Anywhere else closes what's open, but a click inside the bubble is left alone.
  if (!link) {
    if (!(event.target as Element | null)?.closest?.('.aith-glossary')) close()
    return
  }

  // A click on a link goes where the link goes. The bubble is on its way out with the page.
  close()
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && bubble) {
    event.preventDefault()
    openFor?.focus({ preventScroll: true })
    close()
  }
}

// The bubble is positioned against the viewport, so anything that moves the page under it drops
// it rather than leaving it pointing at the wrong word.
const onScroll = () => close()

export function useGlossaryTooltip(): void {
  onMounted(() => {
    document.addEventListener('pointerover', onPointerOver)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
  })

  onUnmounted(() => {
    close()
    document.removeEventListener('pointerover', onPointerOver)
    document.removeEventListener('focusin', onFocusIn)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  })
}
