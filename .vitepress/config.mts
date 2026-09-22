// VitePress renderer for course format v1 (docs/system/course-format.md).
// Content lives in course/ and stays renderer-neutral: everything VitePress-specific
// (layout, hero, navigation) is decided here, from the course format's own data.

import { defineConfig, type DefaultTheme } from 'vitepress'
import { CONTENT_DIR, contentExcludes, contentSubmodulePaths, discoverCourses } from '../format/courses.mjs'
import { glossaryPlugin } from './glossary-plugin'

const REPO = 'https://github.com/aijutsu/aith'
const courses = discoverCourses()
const courseLink = (dir: string) => `/${dir}/`

const sidebar: DefaultTheme.SidebarItem[] = [
  {
    text: 'Courses',
    items: courses.map((course) => ({
      text: course.manifest?.title ?? course.dir,
      link: courseLink(course.dir),
      ...(course.lessons.length && {
        collapsed: false,
        items: course.lessons.map((lesson) => ({
          text: lesson.frontmatter.title ?? lesson.dir,
          link: `/${course.dir}/${lesson.dir}/`,
        })),
      }),
    })),
  },
  { text: 'Reference', items: [{ text: 'Glossary', link: '/glossary' }] },
]

export default defineConfig({
  title: 'AI in the Heartlands',
  description: 'Hands-on course materials by Aijutsu for building things with AI.',
  lang: 'en',
  srcDir: CONTENT_DIR,
  srcExclude: contentExcludes(),
  cleanUrls: true,
  lastUpdated: true,

  markdown: {
    config: (md) => md.use(glossaryPlugin),
  },

  vite: {
    // The Vite root is course/, so pinned submodules sit inside it. Don't watch them.
    server: { watch: { ignored: contentSubmodulePaths().map((p) => `**/${CONTENT_DIR}/${p}/**`) } },
  },

  // The home page gets the hero layout here, so course/index.md holds only content.
  // Mutate in place: a returned object is shallow-merged and would replace frontmatter.
  transformPageData(pageData) {
    if (pageData.relativePath !== 'index.md') return
    const { title, description } = pageData.frontmatter
    Object.assign(pageData.frontmatter, {
      layout: 'home',
      hero: {
        name: title,
        tagline: description,
        actions: [
          ...(courses[0] ? [{ theme: 'brand', text: 'Start the first course', link: courseLink(courses[0].dir) }] : []),
          { theme: 'alt', text: 'Glossary', link: '/glossary' },
        ],
      },
    })
  },

  themeConfig: {
    nav: [
      ...(courses[0] ? [{ text: 'Courses', link: courseLink(courses[0].dir) }] : []),
      { text: 'Glossary', link: '/glossary' },
    ],
    sidebar,
    search: { provider: 'local' },
    outline: 'deep',
    editLink: {
      pattern: `${REPO}/edit/main/${CONTENT_DIR}/:path`,
      text: 'Suggest a change on GitHub',
    },
    socialLinks: [{ icon: 'github', link: REPO }],
    footer: {
      message: 'Open-source course materials by <a href="https://aijutsu.dev">Aijutsu</a>.',
    },
  },
})
