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
    'Aijutsu is a founder-led, coaching-informed, AI-leveraged technology practice in Singapore. It provides senior technical advisory, transformation journeys across AI, cloud, and compliance, and bespoke software development. Aijutsu created AI in the Heartlands.',
  address: { '@type': 'PostalAddress', addressLocality: 'Singapore', addressCountry: 'SG' },
  identifier: { '@type': 'PropertyValue', propertyID: 'UEN', value: '202610279E' },
  founder: {
    '@type': 'Person',
    name: 'Joseph Matthias Goh',
    jobTitle: 'Founder',
    sameAs: ['https://sg.linkedin.com/in/joeir'],
  },
  knowsAbout: ['Artificial intelligence', 'Cloud computing', 'ISO 27001', 'SOC 2', 'Software development', 'Technical advisory'],
  makesOffer: [
    ['Technical advisory', 'Senior technical opinion on a needs basis, or on retainer.'],
    ['Transformation journeys', 'Cloud migration, ISO 27001 and SOC 2 compliance, and AI adoption, with a coaching-informed methodology.'],
    ['Bespoke development', 'AI-leveraged delivery of websites, e-commerce sites, internal tools, and platforms.'],
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

/** The JSON-LD nodes for one page, by its place in the course format. */
function pageGraph(relativePath: string, url: string, title: string, description: string): object[] {
  const [first, second] = relativePath.split('/')

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

  // A course (NNN-slug/index.md) or a lesson (NNN-slug/NN-slug/index.md).
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
        ...(course.lessons.length && {
          hasPart: course.lessons.map((lesson) => ({
            '@type': 'LearningResource',
            name: lesson.frontmatter.title,
            url: pageUrl(`${course.dir}/${lesson.dir}/index.md`),
          })),
        }),
      },
    ]
  }

  const lesson = course.lessons.find((l) => l.dir === second)
  if (!lesson) return []
  return [
    {
      '@type': 'LearningResource',
      learningResourceType: 'Lesson',
      name: title,
      description,
      url,
      position: lesson.order,
      inLanguage: 'en',
      isAccessibleForFree: true,
      isPartOf: courseRef,
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
  for (const course of discoverCourses().filter((c) => c.manifest)) {
    lines.push(`- [${course.manifest.title}](${pageUrl(`${course.dir}/index.md`)}): ${plainText(course.manifest.summary)}`)
    for (const lesson of course.lessons) {
      lines.push(entry(`${course.dir}/${lesson.dir}/index.md`, `${course.manifest.title}: ${lesson.frontmatter.title}`))
    }
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
