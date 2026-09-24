// Click a picture in a page to see it big. Pictures are capped at 400px wide on desktop
// (custom.css), which is right for a phone screenshot taken at 2x, but unreadable for a wide
// screenshot of a terminal. Clicking one lays it over the page at its own size. Clicking the
// dimmed area around it, pressing Escape, or the close button puts it back.
// See docs/system/site.md#theme.

import { onMounted, onUnmounted } from 'vue'

// What is on screen while the lightbox is open. Only one can be open, so one set of state.
let overlay: HTMLDivElement | null = null
// Where the keyboard was before the lightbox took focus, so it can go back there. Pictures in a
// page can't hold focus themselves, so this is usually nothing, and focus returns to the page.
let previousFocus: HTMLElement | null = null
let unlockScroll: (() => void) | null = null

// Hide the page's scrollbar while the lightbox is open, so the wheel doesn't scroll the page
// behind it. Taking the scrollbar away makes the page jump left by its width, so pad by the same
// amount. Fixed bars (the nav) measure against the window, not this padding, so they don't move.
function lockScroll(): () => void {
  const html = document.documentElement
  const { overflow, paddingRight } = html.style
  const barWidth = window.innerWidth - html.clientWidth

  html.style.overflow = 'hidden'
  if (barWidth > 0) html.style.paddingRight = `${barWidth}px`

  return () => {
    html.style.overflow = overflow
    html.style.paddingRight = paddingRight
  }
}

function close(): void {
  if (!overlay) return

  document.removeEventListener('keydown', onKeydown, true)
  window.removeEventListener('popstate', close)
  overlay.remove()
  overlay = null

  unlockScroll?.()
  unlockScroll = null

  // preventScroll: the page never moved, so there is nothing to scroll back to.
  previousFocus?.focus({ preventScroll: true })
  previousFocus = null
}

// While the lightbox is open it is the only thing the reader can use: Escape closes it, and Tab
// stays on the close button rather than walking the page behind the dimmed layer.
function onKeydown(event: KeyboardEvent): void {
  if (!overlay) return

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key === 'Tab') {
    event.preventDefault()
    overlay.querySelector('button')?.focus()
  }
}

function open(source: HTMLImageElement): void {
  close() // Never two at once.
  const focused = document.activeElement
  previousFocus = focused instanceof HTMLElement && focused !== document.body ? focused : null

  overlay = document.createElement('div')
  overlay.className = 'aith-lightbox'
  overlay.setAttribute('role', 'dialog')
  overlay.setAttribute('aria-modal', 'true')
  overlay.setAttribute('aria-label', source.alt ? `Picture: ${source.alt}` : 'Picture')

  const picture = document.createElement('img')
  // currentSrc, not src: it is the file the browser actually chose and already has.
  picture.src = source.currentSrc || source.src
  picture.alt = source.alt
  // Its real width, which custom.css uses as the size to show it at. The picture is on screen
  // already, so it has loaded and naturalWidth is set.
  if (source.naturalWidth && source.naturalHeight) {
    picture.style.setProperty('--aith-lightbox-width', `${source.naturalWidth}px`)
    // How much wider than tall it is, so custom.css can work out the widest it may be before it
    // runs off the top and bottom of the screen.
    picture.style.setProperty(
      '--aith-lightbox-ratio',
      `${source.naturalWidth / source.naturalHeight}`,
    )
    // A fresh <img> has no size until its bytes are decoded, even from the cache, so without
    // these the overlay opens empty for a frame and then jumps. With them the space is right
    // from the start, and the CSS scales it down to fit the screen.
    picture.width = source.naturalWidth
    picture.height = source.naturalHeight
  }

  const closeButton = document.createElement('button')
  closeButton.type = 'button'
  closeButton.className = 'aith-lightbox-close'
  closeButton.setAttribute('aria-label', 'Close the picture')
  closeButton.textContent = '×'

  // A click anywhere but on the picture itself closes: the dimmed area, and the close button.
  // Staying open on the picture means a reader can't shut it by accident while reading it.
  overlay.addEventListener('click', (event) => {
    if (event.target !== picture) close()
  })

  overlay.append(picture, closeButton)
  document.body.append(overlay)

  unlockScroll = lockScroll()
  document.addEventListener('keydown', onKeydown, true)
  // A back gesture with the lightbox open would otherwise leave it over the new page.
  window.addEventListener('popstate', close)

  closeButton.focus({ preventScroll: true })
}

// One delegated listener covers every page: the router swaps the content under it.
function onClick(event: MouseEvent): void {
  // Leave alone: a modified click (open in a new tab), a middle click, and anything already
  // handled, such as a collapsible section opening.
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const target = event.target as Element | null
  const picture = target?.closest?.('.vp-doc img') as HTMLImageElement | null
  if (!picture) return
  // A picture inside a link follows the link; one in a section's header opens the section.
  if (picture.closest('a, summary')) return

  event.preventDefault()
  open(picture)
}

export function useImageLightbox(): void {
  onMounted(() => document.addEventListener('click', onClick))
  onUnmounted(() => {
    close()
    document.removeEventListener('click', onClick)
  })
}
