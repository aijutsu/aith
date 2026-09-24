// The default VitePress theme, with the site's colours and nav tweaks (custom.css), and two
// behaviours: collapsible sections scroll their header to the top when opened or closed
// (details-scroll.ts), and clicking a picture in a page shows it big (lightbox.ts).
// See docs/system/site.md#theme.

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { useDetailsScroll } from './details-scroll'
import { useImageLightbox } from './lightbox'

export default {
  extends: DefaultTheme,
  setup() {
    useDetailsScroll()
    useImageLightbox()
  }
} satisfies Theme
