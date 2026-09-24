// The default VitePress theme, with the site's colours and nav tweaks (custom.css), and three
// behaviours: collapsible sections scroll their header to the top when opened or closed
// (details-scroll.ts), clicking a picture in a page shows it big (lightbox.ts), and a glossary
// link shows what the word means without leaving the page (glossary-tooltip.ts).
// See docs/system/site.md#theme.

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
// The site's typefaces, self-hosted from @fontsource like the Inter the default theme ships, so
// no request leaves the site for a font (custom.css points VitePress's two font variables at
// them). IBM Plex Sans reads the pages; IBM Plex Mono is kept for code, where a fixed width
// matters. The Sans is the variable build: one file covers every weight the theme asks for
// (400 body, 500 navigation, 600 headings, 700 the hero title) instead of four.
import '@fontsource-variable/ibm-plex-sans/wght.css'
import '@fontsource-variable/ibm-plex-sans/wght-italic.css'
// Mono has no variable build, so take the weights code needs: 400, italics for the comments some
// syntax themes slant, and 600 for the tokens they bold.
import '@fontsource/ibm-plex-mono/latin-400.css'
import '@fontsource/ibm-plex-mono/latin-400-italic.css'
import '@fontsource/ibm-plex-mono/latin-600.css'
import './custom.css'
import { useDetailsScroll } from './details-scroll'
import { useGlossaryTooltip } from './glossary-tooltip'
import { useImageLightbox } from './lightbox'

export default {
  extends: DefaultTheme,
  setup() {
    useDetailsScroll()
    useImageLightbox()
    useGlossaryTooltip()
  }
} satisfies Theme
