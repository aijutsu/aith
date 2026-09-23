---
id: git # never change this, even if the folder or title changes
title: Install Git
description: Install Git, the tool that downloads NanoClaw and keeps the history of its files.
---

# Install Git

[Git](../../../glossary.md#git) keeps the history of a project's files, and copies a project onto your computer. You use it in the next lesson to download NanoClaw.

The same command also installs jq, a small tool that reads the answers that websites send back. NanoClaw's setup uses it to check your Telegram bot.

## Install it

Click the name of your computer's system to open its section.

<details name="git">
<summary>macOS</summary>

**Check if it's already installed.** On a Mac, you install Git with [Homebrew](../../../glossary.md#homebrew). Homebrew is an app store for the terminal: you ask for a program by name, and Homebrew downloads and installs it. NanoClaw's setup uses Homebrew too, and so does the next page in this lesson. So check for Homebrew first. In [Terminal](../01-terminal/index.md), run:

```bash
brew --version
```

- If you see a line like `Homebrew 7.0.2`, you already have Homebrew. Go straight to step 5.
- If you see `command not found: brew`, start at step 1.

Don't use `git --version` to check for Git on a Mac yet. On a new Mac it opens a pop-up window asking to install Apple's Command Line Tools. Homebrew installs those for you in step 3.

**Install it.**

1. Copy this command into the terminal and press Return:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Type your Mac password when it asks, and press Return. Nothing shows while you type. That is normal.
3. Press Return again to start. Homebrew also installs Apple's Command Line Tools. This can take 5 to 10 minutes.
4. At the end, Homebrew may show **Next steps** with a few commands. Copy those commands into the terminal and press Return.
5. In the terminal, install Git and jq:

   ```bash
   brew install git jq
   ```

   If you already have them, Homebrew says so and does nothing. That is safe to run.

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

If you see two version numbers, you already have Git and jq, and there is nothing to install: skip the rest of this section. Ubuntu usually has Git already, but it rarely has jq, so you probably still need the next step.

**Install it.** In the Ubuntu terminal, run:

```bash
sudo apt update && sudo apt install -y git curl jq
```

Type your Ubuntu password if it asks. If Git is already there, the command just makes sure it's up to date.

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

If you see two version numbers, you already have Git and jq, and there is nothing to install: skip the rest of this section. Most systems have Git already, but few have jq, so you probably still need the next step.

**Install it.** In the terminal, run this on Ubuntu or Debian:

```bash
sudo apt update && sudo apt install -y git curl jq
```

On Fedora, run this in the terminal instead:

```bash
sudo dnf install -y git curl jq
```

Type your password if it asks.

**Check that it works.** In the terminal, run:

```bash
git --version
jq --version
```

You should see two lines, like `git version 2.55.0` and `jq-1.7.1`. Your numbers may be different.

</details>

## Next

Git is ready. Next, install [Docker](../03-docker/index.md).
