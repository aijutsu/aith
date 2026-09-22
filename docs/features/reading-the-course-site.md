# Reading the course site

The course materials are published at **https://aith.aijutsu.dev**. Anyone can read them for free, with no account.

## What learners get

- **A home page** with what the course is for, what you need before you start, and the list of courses in order, shown as cards. You can click the card of a course that's ready. Courses that aren't written yet have a "Coming soon" badge and no link.
- **A Courses page** at https://aith.aijutsu.dev/courses, which lists every course you can take now, in order, each with a one-line summary. The "Courses Overview" link at the top of every page goes there.
- **A page for each course**, e.g. https://aith.aijutsu.dev/001-building-agents-with-nanoclaw/, with what it teaches, its lessons, and links to the software it uses.
- **Lessons**: each course is split into short pages, e.g. https://aith.aijutsu.dev/001-building-agents-with-nanoclaw/01-installations/. The sidebar lists them, and "Next page" at the bottom of each one leads to the next.
- **A glossary** at https://aith.aijutsu.dev/glossary, with plain-English meanings of every technical word. Each word has its own link, for example https://aith.aijutsu.dev/glossary#mcp, so pages can point straight at it. It's in the sidebar under "Reference", and the home page has a button for it.
- **An About Aijutsu page** at https://aith.aijutsu.dev/about: who makes the courses, what else Aijutsu does, and how to contact them. It's in the sidebar under "Reference".
- **Search** (top of every page). It works in the browser, with no outside search service, and it covers the glossary too.
- **Light and dark mode.** The site starts in light mode. The switch at the top of every page changes it, and the site remembers the choice. The home page's picture changes too: day in light mode, night in dark mode. On phones the switch is in the ☰ menu.
- **A layout that works on phones.**
- **"Last updated"** at the bottom of each page, so learners can see how fresh it is.
- **A footer on every page** with the copyright notice (Aijutsu Pte. Ltd.) and a link to the **Terms of Use** at https://aith.aijutsu.dev/terms. The sidebar links to them too, under "Reference". The terms say what learners may do with the materials for free, and what needs written approval: teaching them, or reusing them in other course materials. They also say how to ask Aijutsu for a licence, or to run a course.

## Suggesting a change

Every page has a **"Suggest a change on GitHub"** link. It opens the page's source on https://github.com/aijutsu/aith, where anyone with a GitHub account can propose an edit as a pull request. The "Suggesting a change" section of the Terms of Use covers what Aijutsu may do with it.

GitHub is a public copy. The team works on Aijutsu's own Git server, brings accepted suggestions across, and closes the pull request with a link to the change. The site updates a minute or two after that. See [github-mirror.md](../system/github-mirror.md).

## For the team

- The site is rebuilt and published automatically every time `main` changes on Gitea. There is nothing to do by hand. See [publishing.md](../system/publishing.md).
- Everything on the site comes from the `course/` folder. READMEs and the copies of other projects' code (submodules) are never published.
