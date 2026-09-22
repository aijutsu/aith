// Course format v1: how a repository's content is discovered.
// Shared by the VitePress site (.vitepress/config.mts) and the validator
// (format/validate.mjs), so both read the same layout the same way.
// See docs/system/course-format.md.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { parse as parseYaml } from 'yaml'

export const ROOT = fileURLToPath(new URL('..', import.meta.url))
export const CONTENT_DIR = 'course'
export const COURSE_DIR = /^(\d{3})-[a-z0-9]+(?:-[a-z0-9]+)*$/
export const LESSON_DIR = /^(\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/
export const ALLOWED_BLOCKS = ['glossary']

/** Submodules from .gitmodules, as { path, url } with repo-relative paths. */
export function submodules(root = ROOT) {
  const file = join(root, '.gitmodules')
  if (!existsSync(file)) return []
  const found = []
  let current
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    if (/^\s*\[submodule /.test(line)) found.push((current = {}))
    const kv = line.match(/^\s*(path|url)\s*=\s*(.+?)\s*$/)
    if (kv && current) current[kv[1]] = kv[2]
  }
  return found.filter((s) => s.path)
}

/** Submodule paths inside the content root, relative to it. */
export function contentSubmodulePaths(root = ROOT) {
  const prefix = `${CONTENT_DIR}/`
  return submodules(root)
    .map((s) => s.path)
    .filter((p) => p.startsWith(prefix))
    .map((p) => p.slice(prefix.length))
}

/** Globs (relative to the content root) that are never published. */
export function contentExcludes(root = ROOT) {
  return ['**/README.md', ...contentSubmodulePaths(root).map((p) => `${p}/**`)]
}

/** Every published Markdown page, relative to the content root. */
export function publishedPages(root = ROOT) {
  const contentRoot = join(root, CONTENT_DIR)
  const skip = new Set(contentSubmodulePaths(root))
  const pages = []
  const walk = (rel) => {
    for (const entry of readdirSync(join(contentRoot, rel), { withFileTypes: true })) {
      const path = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || skip.has(path)) continue
      if (entry.isDirectory()) walk(path)
      else if (entry.name.endsWith('.md') && entry.name !== 'README.md') pages.push(path)
    }
  }
  walk('')
  return pages.sort()
}

export function readPage(root, relPath) {
  const { data, content } = matter(readFileSync(join(root, CONTENT_DIR, relPath), 'utf8'))
  return { frontmatter: data, body: content }
}

export function readYaml(file) {
  return parseYaml(readFileSync(file, 'utf8'))
}

/**
 * Courses in content order. Each course is a `NNN-slug/` folder; its lessons
 * (reserved in v1) are `NN-slug/index.md` folders inside it.
 */
export function discoverCourses(root = ROOT) {
  const contentRoot = join(root, CONTENT_DIR)
  const dirs = (base) =>
    readdirSync(base, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()

  return dirs(contentRoot)
    .filter((dir) => COURSE_DIR.test(dir))
    .map((dir) => {
      const courseRoot = join(contentRoot, dir)
      const manifestFile = join(courseRoot, 'course.yaml')
      const lessons = dirs(courseRoot)
        .filter((l) => LESSON_DIR.test(l) && existsSync(join(courseRoot, l, 'index.md')))
        .map((l) => ({
          dir: l,
          order: Number(l.slice(0, 2)),
          frontmatter: readPage(root, `${dir}/${l}/index.md`).frontmatter,
        }))
      return {
        dir,
        order: Number(dir.slice(0, 3)),
        manifest: existsSync(manifestFile) ? readYaml(manifestFile) : null,
        hasIndex: existsSync(join(courseRoot, 'index.md')),
        lessons,
      }
    })
}

/** Anchor id for a glossary term, e.g. "Node.js" -> "node-js". */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
