// Validate this repository against course format v1 (docs/system/course-format.md).
// Usage: node format/validate.mjs   (or: make validate)
// Dead links are checked by the site build (make site-build), not here.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import {
  ALLOWED_BLOCKS,
  CONTENT_DIR,
  COURSE_DIR,
  LESSON_DIR,
  ROOT,
  discoverCourses,
  publishedPages,
  readPage,
  readYaml,
  slugify,
  submodules,
} from './courses.mjs'

const errors = []
const fail = (where, message) => errors.push(`${where}: ${message}`)

const ajv = new Ajv2020({ allErrors: true })
const schema = (name) =>
  ajv.compile(JSON.parse(readFileSync(new URL(`./schema/${name}.schema.json`, import.meta.url), 'utf8')))
const validators = { course: schema('course'), page: schema('page'), lesson: schema('lesson'), glossary: schema('glossary') }

function check(kind, data, where) {
  const validate = validators[kind]
  if (validate(data)) return true
  for (const e of validate.errors) {
    const field = e.instancePath || '(top level)'
    const extra = e.params?.additionalProperty ? ` "${e.params.additionalProperty}"` : ''
    fail(where, `${field} ${e.message}${extra}`)
  }
  return false
}

// Code blocks and inline code may show any syntax, so strip them before checking prose.
function prose(body) {
  return body
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
    .replace(/`[^`\n]*`/g, '')
}

// ---- Pages ---------------------------------------------------------------

const pages = publishedPages(ROOT)
const knownPage = (p) => {
  const parts = p.split('/')
  if (parts.length === 1) return ['index.md', 'courses.md', 'glossary.md', 'terms.md', 'about.md'].includes(p)
  if (parts.length === 2) return COURSE_DIR.test(parts[0]) && parts[1] === 'index.md'
  if (parts.length === 3) return COURSE_DIR.test(parts[0]) && LESSON_DIR.test(parts[1]) && parts[2] === 'index.md'
  return false
}

for (const page of pages) {
  const where = `${CONTENT_DIR}/${page}`
  if (!knownPage(page)) {
    fail(where, 'not a known page location (see docs/system/course-format.md, "Layout")')
    continue
  }
  const { frontmatter, body } = readPage(ROOT, page)
  // Lessons (NNN-slug/NN-slug/index.md) also need a stable id.
  check(page.split('/').length === 3 ? 'lesson' : 'page', frontmatter, `${where} frontmatter`)

  const text = prose(body)
  // [ \t], not \s: \s crosses lines, so a closing ::: would read the next paragraph as a block name.
  for (const m of text.matchAll(/^[ \t]*:{3,}[ \t]*([A-Za-z][\w-]*)/gm)) {
    if (!ALLOWED_BLOCKS.includes(m[1])) fail(where, `":::${m[1]}" is not an allowed block (allowed: ${ALLOWED_BLOCKS.join(', ')})`)
  }
  for (const m of text.matchAll(/<([A-Z][A-Za-z0-9]*)[\s/>]/g)) fail(where, `component tag <${m[1]}> is not allowed`)
  if (/<(script|style)[\s>]/i.test(text)) fail(where, '<script> and <style> are not allowed')
  if (/\{\{/.test(text)) fail(where, '"{{" is not allowed outside code (renderer template syntax)')

  // Collapsible sections. Without a blank line after </summary>, the Markdown inside is shown as raw text.
  const opened = text.match(/<details[\s>]/g)?.length ?? 0
  const closed = text.match(/<\/details>/g)?.length ?? 0
  if (opened !== closed) fail(where, `${opened} <details> but ${closed} </details>`)
  for (const m of text.matchAll(/<\/summary>[ \t]*\n(?![ \t]*\n)/g)) {
    const line = text.slice(0, m.index).split('\n').length
    fail(where, `line ${line} of the body: leave a blank line after </summary>, or the Markdown inside the <details> is not rendered`)
  }
}

// ---- Courses -------------------------------------------------------------

const home = existsSync(join(ROOT, CONTENT_DIR, 'index.md')) ? readPage(ROOT, 'index.md').body : ''
if (!home) fail(`${CONTENT_DIR}/index.md`, 'missing (the home page)')

const courseIds = new Map()
const gitSubmodules = submodules(ROOT)
const normalise = (url) => url.replace(/\.git$/, '').replace(/\/$/, '')

const courses = discoverCourses(ROOT)
for (const course of courses) {
  const where = `${CONTENT_DIR}/${course.dir}`
  if (!course.hasIndex) fail(where, 'missing index.md')
  if (!course.manifest) {
    fail(where, 'missing course.yaml')
    continue
  }
  if (!check('course', course.manifest, `${where}/course.yaml`)) continue

  const { id, software = [] } = course.manifest
  if (courseIds.has(id)) fail(`${where}/course.yaml`, `id "${id}" is also used by ${courseIds.get(id)}`)
  courseIds.set(id, where)

  // Lesson ids are unique within their course. (Their shape is checked with the page frontmatter.)
  const lessonIds = new Map()
  for (const lesson of course.lessons) {
    const lessonId = lesson.frontmatter.id
    if (lessonId === undefined) continue
    if (lessonIds.has(lessonId)) fail(`${where}/${lesson.dir}/index.md`, `lesson id "${lessonId}" is also used by ${lessonIds.get(lessonId)}`)
    else lessonIds.set(lessonId, lesson.dir)
  }

  const escaped = course.dir.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')
  if (!new RegExp(`\\]\\((\\./)?${escaped}/(index\\.md)?(#[^)]*)?\\)`).test(home)) {
    fail(where, `not linked from ${CONTENT_DIR}/index.md (link to ./${course.dir}/index.md)`)
  }

  // software[] must list exactly this course's submodules.
  const inCourse = gitSubmodules.filter((s) => s.path.startsWith(`${where}/`))
  for (const s of inCourse) {
    const rel = s.path.slice(where.length + 1)
    const entry = software.find((e) => e.path === rel)
    if (!entry) fail(`${where}/course.yaml`, `software[] is missing submodule "${rel}"`)
    else if (normalise(entry.url) !== normalise(s.url)) {
      fail(`${where}/course.yaml`, `software "${rel}" url ${entry.url} does not match .gitmodules (${s.url})`)
    }
  }
  for (const e of software) {
    if (!inCourse.some((s) => s.path === `${where}/${e.path}`)) {
      fail(`${where}/course.yaml`, `software "${e.path}" is not a submodule in .gitmodules`)
    }
  }
}

// ---- Glossary ------------------------------------------------------------

const glossaryFile = join(ROOT, CONTENT_DIR, 'glossary.yaml')
let termCount = 0
if (!existsSync(glossaryFile)) {
  fail(`${CONTENT_DIR}/glossary.yaml`, 'missing')
} else {
  const glossary = readYaml(glossaryFile)
  if (check('glossary', glossary, `${CONTENT_DIR}/glossary.yaml`)) {
    const seen = new Set()
    let previous
    termCount = glossary.terms.length
    for (const { term, type } of glossary.terms) {
      const where = `${CONTENT_DIR}/glossary.yaml "${term}"`
      if (!(type in glossary.types)) fail(where, `type "${type}" is not listed under types`)
      const slug = slugify(term)
      if (seen.has(slug)) fail(where, 'duplicate term')
      seen.add(slug)
      if (previous !== undefined && term.toLowerCase() < previous.toLowerCase()) {
        fail(where, `out of order: must come before "${previous}" (sort ignoring case)`)
      }
      previous = term
    }
  }
}

// ---- Report --------------------------------------------------------------

if (errors.length) {
  console.error(`Course format v1: ${errors.length} problem(s)\n`)
  for (const e of errors) console.error(`  ✗ ${e}`)
  process.exit(1)
}
console.log(`✓ Course format v1: ${pages.length} pages, ${courses.length} course(s), ${termCount} glossary terms`)
