# Adding a course

How to add a new course so it appears on https://aith.aijutsu.dev. The rules behind each step are in [course-format.md](../system/course-format.md), and the writing rules are in `AGENTS.md`.

1. **Make the folder.** Use the next three-digit number and a short lowercase slug, e.g. `course/002-building-personal-websites/`. The number only sets the order.
2. **Add `course.yaml`** (the manifest):

   ```yaml
   # Course manifest (course format v1). See docs/system/course-format.md.
   format: 1
   id: building-personal-websites # never change this, even if the folder or title changes
   title: Building personal websites
   summary: One or two plain-English sentences about the course.
   ```

   The `id` is permanent. A future course platform will track learners' progress by it.
3. **Add `index.md`** (the course page). Start it with `title` and `description` frontmatter and a `# Title` heading. Then write the topic index for the course, and a References table for the software it uses.
4. **Link it from the home page.** In `course/index.md`, turn the course's entry under Course Overview into a link: `[Building personal websites](./002-building-personal-websites/index.md)`. The validator checks that every course is linked. On the site, the link also makes the course's card on the home page clickable, and removes its "Coming soon" badge.
5. **Split a long course into lessons (optional).** Put each part in its own folder with an `index.md`, numbered in order: `course/002-building-personal-websites/01-getting-started/index.md`, `02-…/index.md`. Give each `title` and `description` frontmatter, plus an `id`: the folder name without the number (`id: getting-started`). Like the course `id`, it never changes. List the lessons, with links, on the course's `index.md`. The folder name is part of the lesson's web address, so choose it carefully. Images sit next to the lesson that uses them.
6. **Add new words to the glossary.** Put them in `course/glossary.yaml`, in alphabetical order, and link to them from pages with `../glossary.md#<term>` (from a lesson, `../../glossary.md#<term>`).
7. **Add the software it uses as submodules.** Every Git repository the course uses is pinned as a submodule inside the course folder, and listed under `software` in `course.yaml`. See "Referenced repositories" in `AGENTS.md`. For a customised copy (a fork), also see [github-mirror.md](../system/github-mirror.md#rules): forks live on GitHub and are pushed directly.
8. **Optional: add a `README.md`** with notes for maintainers. It's never published.
9. **Check it.**

   ```bash
   make validate     # course format rules
   make site-build   # fails on any broken link
   make site         # look at it at http://localhost:5173
   ```

   The new course shows up in the sidebar and on the Courses page (https://aith.aijutsu.dev/courses) by itself. There is no menu or list to edit, apart from the Course Overview link in step 4.
10. **Push to `main` on Gitea.** CI checks it, publishes the site, and the push mirror updates GitHub.
