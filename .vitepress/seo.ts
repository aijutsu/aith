// Search and answer-engine metadata (SEO and AEO), worked out from the course format's own
// data: page frontmatter, course.yaml and glossary.yaml. course/ holds no renderer keys.
//
// - seoHead(): per page, from transformHead: the canonical URL, Open Graph and Twitter cards,
//   and schema.org JSON-LD (one @graph per page).
// - writeSeoFiles(): after the build: robots.txt, llms.txt, and the social card image.
//
// VitePress writes sitemap.xml itself (`sitemap` in config.mts). See docs/system/site.md.

import { copyFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { HeadConfig, PageData, SiteConfig } from 'vitepress'
import { CONTENT_DIR, ROOT, discoverCourses, readPage, readYaml, slugify } from '../format/courses.mjs'

export const SITE_URL = 'https://aith.aijutsu.dev'
export const SITE_NAME = 'AI in the Heartlands'

// The @id that aijutsu.dev gives Aijutsu in its own JSON-LD (src/lib/seo.ts in
// aijutsu/website), so search and answer engines see one organisation across both sites.
const ORG_ID = 'https://aijutsu.dev/#organization'
const WEBSITE_ID = `${SITE_URL}/#website`

// .vitepress/og-image.jpg, copied to the site root by writeSeoFiles(). A 1200x630 crop of
// the light-mode hero picture, keeping the people and the robot.
const OG_IMAGE = {
  url: `${SITE_URL}/og-image.jpg`,
  width: '1200',
  height: '630',
  alt: 'Four friends and a friendly robot in a Singapore heartland park at sunset, building things with AI on their phones.',
}

/** A page's public URL: the same string VitePress writes into sitemap.xml (cleanUrls). */
export function pageUrl(relativePath: string): string {
  return `${SITE_URL}/${relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')}`
}

// Aijutsu in full: on the home page and the About page (course/about.md says the same).
const aijutsu = {
  '@type': 'Organization',
  '@id': ORG_ID,
  name: 'Aijutsu',
  legalName: 'Aijutsu Pte. Ltd.',
  url: 'https://aijutsu.dev',
  email: 'hello@aijutsu.dev',
  description:
    'Aijutsu is a founder-led, coaching-informed, AI-leveraged technology practice in Singapore. It provides senior technical advisory, transformation journey facilitation, and bespoke app and web app development, across the AI, cloud, and compliance domains. Aijutsu created AI in the Heartlands.',
  address: { '@type': 'PostalAddress', addressLocality: 'Singapore', addressCountry: 'SG' },
  identifier: { '@type': 'PropertyValue', propertyID: 'UEN', value: '202610279E' },
  founder: {
    '@type': 'Person',
    name: 'Joseph Matthias Goh',
    jobTitle: 'Founder',
    description:
      'Joseph Matthias Goh founded Aijutsu. He is a builder and a coach with over a decade of hands-on delivery across government, cybersecurity, fintech, cloud, and compliance, and a formally trained ontological coach.',
    sameAs: ['https://sg.linkedin.com/in/joeir'],
    // Past roles, as the About page lists them. schema.org allows a plain Organization here.
    alumniOf: [
      { '@type': 'Organization', name: 'watchTowr' },
      { '@type': 'Organization', name: 'StashAway' },
      { '@type': 'Organization', name: 'GovTech' },
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: 'Newfield Ontological Coaching Certification',
      credentialCategory: 'certification',
    },
  },
  knowsAbout: ['Artificial intelligence', 'Cloud computing', 'Cloud migration', 'ISO 27001', 'SOC 2', 'Compliance automation', 'Software development', 'Technical advisory'],
  makesOffer: [
    ['Senior technical advisory', 'Senior technical opinion on a needs basis, or on retainer, across AI, cloud, and compliance.'],
    ['Transformation journey facilitation', 'Organisation-wide technology change: AI integration, cloud migration and cloud-native operation, and ISO 27001 and SOC 2 compliance, with a coaching-informed methodology.'],
    ['Bespoke app and web app development', 'AI-leveraged delivery of websites, web applications, internal tools, and platforms.'],
  ].map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description } })),
}

// Aijutsu by reference, where another node names it (provider, publisher).
const aijutsuRef = { '@type': 'Organization', '@id': ORG_ID, name: 'Aijutsu', url: 'https://aijutsu.dev' }

/** Glossary descriptions and summaries are Markdown: keep the words, drop the syntax. */
const plainText = (markdown: string) =>
  markdown.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/`/g, '').replace(/\*\*?/g, '')

interface GlossaryTerm {
  term: string
  description: string
  url: string
}

interface Lesson {
  dir: string
  path: string
  order: number
  frontmatter: { title?: string; description?: string }
  lessons: Lesson[]
}

/** A lesson's public URL. `lesson.path` already starts with the course folder. */
const lessonUrl = (lesson: Lesson) => pageUrl(`${lesson.path}/index.md`)

/** A lesson by reference, for the isPartOf / hasPart links between the pages of a course. */
const lessonRef = (lesson: Lesson) => ({
  '@type': 'LearningResource',
  '@id': `${lessonUrl(lesson)}#lesson`,
  name: lesson.frontmatter.title,
  url: lessonUrl(lesson),
})

/**
 * The lesson at `dirs` (folder names under the course), with every lesson above it, so a
 * sub-lesson can name its parent. Null when the path is not a lesson.
 */
function lessonChain(lessons: Lesson[], dirs: string[]): Lesson[] | null {
  const chain: Lesson[] = []
  let level = lessons
  for (const dir of dirs) {
    const found = level.find((lesson) => lesson.dir === dir)
    if (!found) return null
    chain.push(found)
    level = found.lessons
  }
  return chain
}

/** The JSON-LD nodes for one page, by its place in the course format. */
function pageGraph(relativePath: string, url: string, title: string, description: string): object[] {
  const parts = relativePath.split('/')
  const [first, second] = parts

  if (relativePath === 'index.md') {
    const website = {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_NAME,
      url,
      description,
      inLanguage: 'en',
      publisher: aijutsuRef,
    }
    return [website, aijutsu]
  }

  if (relativePath === 'about.md') {
    return [{ '@type': 'AboutPage', name: title, url, description, isPartOf: { '@id': WEBSITE_ID }, mainEntity: { '@id': ORG_ID } }, aijutsu]
  }

  if (relativePath === 'courses.md') {
    const courses = discoverCourses().filter((course) => course.manifest)
    return [
      {
        '@type': 'ItemList',
        name: title,
        url,
        itemListElement: courses.map((course, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: course.manifest.title,
          url: pageUrl(`${course.dir}/index.md`),
        })),
      },
    ]
  }

  if (relativePath === 'glossary.md') {
    const { terms } = readYaml(join(ROOT, CONTENT_DIR, 'glossary.yaml')) as { terms: GlossaryTerm[] }
    const setId = `${url}#terms`
    return [
      {
        '@type': 'DefinedTermSet',
        '@id': setId,
        name: `${SITE_NAME} glossary`,
        url,
        description,
        hasDefinedTerm: terms.map((t) => ({
          '@type': 'DefinedTerm',
          name: t.term,
          description: plainText(t.description),
          url: `${url}#${slugify(t.term)}`,
          sameAs: t.url,
          inDefinedTermSet: { '@id': setId },
        })),
      },
    ]
  }

  // A course (NNN-slug/index.md), or a lesson at any depth (NNN-slug/NN-slug/[NN-slug/]index.md).
  const course = discoverCourses().find((c) => c.dir === first && c.manifest)
  if (!course) return []
  const courseUrl = pageUrl(`${course.dir}/index.md`)
  const courseRef = { '@type': 'Course', '@id': `${courseUrl}#course`, name: course.manifest.title, url: courseUrl }

  if (second === 'index.md') {
    const { title: name, summary, outcomes, prerequisites } = course.manifest
    return [
      {
        ...courseRef,
        name,
        description: plainText(summary),
        inLanguage: 'en',
        isAccessibleForFree: true,
        provider: aijutsuRef,
        ...(outcomes?.length && { teaches: outcomes }),
        ...(prerequisites?.length && { coursePrerequisites: prerequisites }),
        // Only the course's own lessons. Each lesson page names its sub-lessons itself.
        ...(course.lessons.length && { hasPart: course.lessons.map(lessonRef) }),
      },
    ]
  }

  // The lesson folders between the course and index.md: one for a lesson, two for a sub-lesson.
  const chain = lessonChain(course.lessons as Lesson[], parts.slice(1, -1))
  if (!chain?.length) return []
  const lesson = chain[chain.length - 1]
  const parent = chain[chain.length - 2]
  return [
    {
      '@type': 'LearningResource',
      '@id': `${url}#lesson`,
      learningResourceType: 'Lesson',
      name: title,
      description,
      url,
      position: lesson.order,
      inLanguage: 'en',
      isAccessibleForFree: true,
      // A sub-lesson belongs to its lesson; a lesson belongs to its course.
      isPartOf: parent ? lessonRef(parent) : courseRef,
      ...(lesson.lessons.length && { hasPart: lesson.lessons.map(lessonRef) }),
      publisher: aijutsuRef,
    },
  ]
}

/** JSON-LD as a script body. `<` is escaped so no text can close the <script> early. */
const jsonLd = (graph: object[]) =>
  JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')

/** The <head> tags for one page. Called from transformHead, so only at build time. */
export function seoHead(pageData: PageData, siteDescription: string): HeadConfig[] {
  if (pageData.isNotFound) return []
  const url = pageUrl(pageData.relativePath)
  const home = pageData.relativePath === 'index.md'
  const title = home ? SITE_NAME : pageData.title
  const description = pageData.description || siteDescription
  const property = (key: string, content: string): HeadConfig => ['meta', { property: key, content }]
  const named = (key: string, content: string): HeadConfig => ['meta', { name: key, content }]

  const head: HeadConfig[] = [
    ['link', { rel: 'canonical', href: url }],
    property('og:type', home ? 'website' : 'article'),
    property('og:title', title),
    property('og:description', description),
    property('og:url', url),
    property('og:image', OG_IMAGE.url),
    property('og:image:width', OG_IMAGE.width),
    property('og:image:height', OG_IMAGE.height),
    property('og:image:alt', OG_IMAGE.alt),
    named('twitter:card', 'summary_large_image'),
    named('twitter:title', title),
    named('twitter:description', description),
    named('twitter:image', OG_IMAGE.url),
    named('twitter:image:alt', OG_IMAGE.alt),
  ]
  if (!home && pageData.lastUpdated) {
    head.push(property('article:modified_time', new Date(pageData.lastUpdated).toISOString()))
  }
  const graph = pageGraph(pageData.relativePath, url, title, description)
  if (graph.length) head.push(['script', { type: 'application/ld+json' }, jsonLd(graph)])
  return head
}

const ROBOTS_TXT = `# ${SITE_NAME}: free course materials by Aijutsu. Search engines, AI crawlers and
# answer engines may all read them. Reusing them is covered by ${SITE_URL}/terms.
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`

/** llms.txt (https://llmstxt.org): a Markdown map of the site for LLMs and answer engines. */
function llmsTxt(): string {
  const page = (rel: string) => readPage(ROOT, rel).frontmatter as { title: string; description?: string }
  const entry = (rel: string, label = page(rel).title) => {
    const { description } = page(rel)
    return `- [${label}](${pageUrl(rel)})${description ? `: ${description}` : ''}`
  }
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${page('index.md').description}`,
    '',
    `Free, hands-on course materials that teach non-technical people to build things with AI, made by [Aijutsu](${pageUrl('about.md')}), a technology practice in Singapore. Anyone may read and learn from them for free. Teaching them, or reusing them in other course materials, needs written approval ([Terms of Use](${pageUrl('terms.md')})).`,
    '',
    '## Courses',
    '',
  ]
  // Lessons nest, so each line's label carries the path down from the course title:
  // "Course: Lesson" for a lesson, "Course: Lesson: Sub-lesson" for a sub-lesson.
  const lessonLines = (lessons: Lesson[], prefix: string) => {
    for (const lesson of lessons) {
      const label = `${prefix}: ${lesson.frontmatter.title}`
      lines.push(entry(`${lesson.path}/index.md`, label))
      lessonLines(lesson.lessons, label)
    }
  }
  for (const course of discoverCourses().filter((c) => c.manifest)) {
    lines.push(`- [${course.manifest.title}](${pageUrl(`${course.dir}/index.md`)}): ${plainText(course.manifest.summary)}`)
    lessonLines(course.lessons as Lesson[], course.manifest.title)
  }
  lines.push('', '## Reference', '', entry('glossary.md'), entry('about.md'), entry('terms.md'), '', '## Optional', '', entry('courses.md'), '')
  return lines.join('\n')
}

/** Files that sit next to the built pages. Called from buildEnd. */
export function writeSeoFiles(siteConfig: SiteConfig): void {
  copyFileSync(join(ROOT, '.vitepress', 'og-image.jpg'), join(siteConfig.outDir, 'og-image.jpg'))
  writeFileSync(join(siteConfig.outDir, 'robots.txt'), ROBOTS_TXT)
  writeFileSync(join(siteConfig.outDir, 'llms.txt'), llmsTxt())
}
