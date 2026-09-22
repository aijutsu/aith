# AI in the Heartlands

> AI in the Heartlands is a hands-on course brought to you by [Aijutsu](https://aijutsu.dev) with the objective of empowering the everyday man-on-the-street to use AI to build things for themselves and their communities.

**To follow the course, go to https://aith.aijutsu.dev.** The same pages are in [`course/`](./course/index.md) if you prefer to read them on GitHub. Workshop info is at https://aijutsu.dev/ai-in-the-heartlands.

This README is for people who contribute to the course materials. All materials are open source, and pull requests are welcome.

## How this repository works

- Everything learners read lives in `course/`. Each folder's `index.md` is its published page. `README.md` files, like this one, are notes for contributors and are never published.
- The layout follows a small set of rules, the [course format](./docs/system/course-format.md), so that tools can read it reliably. A validator checks those rules.
- The site is built with [VitePress](https://vitepress.dev/) and served by Cloudflare. Every push to `main` publishes it. See [publishing](./docs/system/publishing.md).
- Every Git repository the course uses is included as a Git submodule, pinned to a specific version, so the course steps always match the software. Raise a pull request if you're able to update any of the versions and do a smoke check to ensure that the course material still matches the technology. Every version change is logged in [docs/updates.md](./docs/updates.md).
- Rules for AI agents (and a good summary for humans) are in [AGENTS.md](./AGENTS.md).

## Getting started

You need Git, Node.js 22 or newer, and `make`.

```bash
git clone --recurse-submodules git@github.com:aijutsu/aith.git
cd aith
make install     # install the site's tools
make site        # preview the site at http://localhost:5173 while you edit
```

Before you open a pull request, run:

```bash
make validate    # checks course/ against the course format
make site-build  # builds the site; fails if any link is broken
```

Run `make help` to see every command.

## Documentation

| Doc | What it covers |
| --- | --- |
| [docs/system/course-format.md](./docs/system/course-format.md) | Where course files go, `course.yaml`, the glossary, and which Markdown you can use. |
| [docs/system/publishing.md](./docs/system/publishing.md) | How the site is built and deployed, and the Cloudflare and Terraform setup. |
| [docs/updates.md](./docs/updates.md) | Log of every submodule version change. |
| [AGENTS.md](./AGENTS.md) | Writing rules and maintenance rules. |
