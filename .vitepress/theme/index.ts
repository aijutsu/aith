// The default VitePress theme, with the site's colours and nav tweaks (custom.css), and one
// behaviour: collapsible sections scroll their header to the top when opened or closed
// (details-scroll.ts). See docs/system/site.md#theme.

import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import { useDetailsScroll } from './details-scroll'

export default {
  extends: DefaultTheme,
  setup() {
    useDetailsScroll()
  }
} satisfies Theme
