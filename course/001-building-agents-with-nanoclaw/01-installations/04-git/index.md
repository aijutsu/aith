---
id: git # never change this, even if the folder or title changes
title: Install Git
description: Install Git, the tool that downloads NanoClaw and keeps the history of its files.
---

# Install Git

[Git](../../../glossary.md#git) keeps the history of a project's files, and copies a project onto your computer. You use it in the next lesson to download NanoClaw.

You also install jq here, a small tool that reads the answers that websites send back. NanoClaw's setup uses it to check your Telegram bot.

## Install it

Click the name of your computer's system to open its section.

<details name="git">
<summary>macOS</summary>

**Check if it's already installed.** In [Terminal](../01-terminal/index.md), run:

```bash
git --version
jq --version
```

- If you see two version numbers, you already have both, and there is nothing to install: skip the rest of this section.
- If either one says `command not found`, do the step below.

**Install it.** In the terminal, install Git and jq with [Homebrew](../02-homebrew/index.md):

```bash
brew install git jq
```

If you already have one of them, Homebrew says so and does nothing. That is safe to run.

**Check that it works.** In the terminal, run:

```bash
git --version
jq --version
```

You should see two lines, like `git version 2.55.0` and `jq-1.7.1`. Your numbers may be different.

</details>

<details name="git">
<summary>Windows</summary>

Git goes inside Ubuntu, not on Windows itself. You don't need "Git for Windows".

**Check if it's already installed.** In the [Ubuntu terminal](../01-terminal/index.md), run:

```bash
git --version
jq --version
```

- If you see two version numbers, you already have both, and there is nothing to install: skip the rest of this section.
- Git is usually there already, because the [Homebrew](../02-homebrew/index.md) page installed it. jq is usually missing, so you probably still need the step below.

**Install it.** In the Ubuntu terminal, run:

```bash
sudo apt install -y jq
```

Type your Ubuntu password if it asks. Ubuntu keeps its own copy of Git up to date, so this is the one place the course uses `apt` instead of Homebrew.

**Check that it works.** In the Ubuntu terminal, run:

```bash
git --version
jq --version
```

You should see two lines, like `git version 2.55.0` and `jq-1.7.1`. Your numbers may be different.

</details>

<details name="git">
<summary>Linux</summary>

**Check if it's already installed.** In the [terminal](../01-terminal/index.md), run:

```bash
git --version
jq --version
```

- If you see two version numbers, you already have both, and there is nothing to install: skip the rest of this section.
- Git is usually there already, because the [Homebrew](../02-homebrew/index.md) page installed it. jq is usually missing, so you probably still need the step below.

**Install it.** In the terminal, run this on Ubuntu or Debian:

```bash
sudo apt install -y jq
```

On Fedora, run this instead:

```bash
sudo dnf install -y jq
```

Type your password if it asks. Your system keeps its own copy of Git up to date, so this is the one place the course uses the system's own installer instead of Homebrew.

**Check that it works.** In the terminal, run:

```bash
git --version
jq --version
```

You should see two lines, like `git version 2.55.0` and `jq-1.7.1`. Your numbers may be different.

</details>

## Next

Git is ready. Next, install [Docker](../05-docker/index.md).
