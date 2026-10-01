---
id: homebrew # never change this, even if the folder or title changes
title: Install Homebrew
description: Install Homebrew, the app store for the terminal, which installs most of the other tools in this course.
---

# Install Homebrew

[Homebrew](../../../glossary.md#homebrew) is an app store for the [terminal](../../../glossary.md#terminal). You ask for a program by name, and Homebrew downloads and installs it for you. Most of the pages after this one are one short `brew` command.

> [!NOTE]
> **On Windows, this page is for you too.** Your [Ubuntu](../../../glossary.md#ubuntu) terminal is Linux, and that is where Homebrew goes. Use the **Windows** section below. Don't install Homebrew on Windows itself.

## Install it

Click the name of your computer's system to open its section.

<details name="homebrew">
<summary>macOS</summary>

**Check if it's already installed.** In [Terminal](../02-terminal/index.md), run:

```bash
brew --version
```

- If you see a line like `Homebrew 7.0.2`, you already have Homebrew, and there is nothing to install: skip the rest of this section.
- If you see `command not found: brew`, do the steps below.

**Install it.**

1. Copy this command into the terminal and press Return:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Type your Mac password when it asks, and press Return. Nothing shows while you type. That is normal.
3. Press Return again to start. Homebrew also installs Apple's Command Line Tools, which the [Make](../06-make/index.md) page needs later. This can take 5 to 10 minutes.
4. At the end, Homebrew may show **Next steps** with a few commands. Copy those commands into the terminal and press Return. They tell your terminal where to find `brew`.

**Check that it works.** In the terminal, run:

```bash
brew --version
```

You should see a line like `Homebrew 7.0.2`. Your number may be different.

If you still see `command not found: brew`, you missed the **Next steps** commands in step 4. Close the terminal, open a new one, and run them.

</details>

<details name="homebrew">
<summary>Windows</summary>

Homebrew goes **inside Ubuntu**, not on Windows itself. Everything you install with `brew` in this course lives in Ubuntu too.

**First, make sure [WSL](../../../glossary.md#wsl) is in place.** Ubuntu runs inside WSL, which you installed on [Install WSL](../01-wsl/index.md). Its last check must show `Ubuntu` with `2` in the **VERSION** column: Homebrew does not work properly on version 1. If you skipped that page, do it now.

**Then open Ubuntu.** Click Start, type `Ubuntu`, and open it. A black window opens with a line ending in `$`. That is the Ubuntu terminal, and every `brew` command in this course goes there, never into PowerShell.

**Check if it's already installed.** In the [Ubuntu terminal](../02-terminal/index.md), run:

```bash
brew --version
```

- If you see a line like `Homebrew 7.0.2`, you already have Homebrew, and there is nothing to install: skip the rest of this section.
- If you see `command not found: brew`, do the steps below.

**Install it.**

1. In the Ubuntu terminal, install the pieces Homebrew needs:

   ```bash
   sudo apt update && sudo apt install -y build-essential procps curl file git
   ```

   Type your Ubuntu password if it asks. This also installs [Git](../04-git/index.md) and Make, so two later pages have less to do.
2. Copy this command into the Ubuntu terminal and press Enter:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   Press Enter again to start. This takes a few minutes.
3. At the end, Homebrew shows **Next steps** with two or three commands that start with `echo` and `eval`. Copy them into the terminal and press Enter. They tell your terminal where to find `brew`, and they keep working after you close it.

**Check that it works.** In the Ubuntu terminal, run:

```bash
brew --version
```

You should see a line like `Homebrew 7.0.2`. Your number may be different.

If you still see `command not found: brew`, you missed the **Next steps** commands in step 3. Run them, then close the terminal and open a new one.

</details>

<details name="homebrew">
<summary>Linux</summary>

**Check if it's already installed.** In the [terminal](../02-terminal/index.md), run:

```bash
brew --version
```

- If you see a line like `Homebrew 7.0.2`, you already have Homebrew, and there is nothing to install: skip the rest of this section.
- If you see `command not found: brew`, do the steps below.

**Install it.**

1. In the terminal, install the pieces Homebrew needs. On Ubuntu or Debian:

   ```bash
   sudo apt update && sudo apt install -y build-essential procps curl file git
   ```

   On Fedora, run this instead:

   ```bash
   sudo dnf install -y @development-tools procps-ng curl file git
   ```

   Type your password if it asks. This also installs [Git](../04-git/index.md) and Make, so two later pages have less to do.
2. Copy this command into the terminal and press Enter:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

   Press Enter again to start. This takes a few minutes.
3. At the end, Homebrew shows **Next steps** with two or three commands that start with `echo` and `eval`. Copy them into the terminal and press Enter. They tell your terminal where to find `brew`, and they keep working after you close it.

**Check that it works.** In the terminal, run:

```bash
brew --version
```

You should see a line like `Homebrew 7.0.2`. Your number may be different.

If you still see `command not found: brew`, you missed the **Next steps** commands in step 3. Run them, then close the terminal and open a new one.

</details>

## Next

Homebrew is ready. Next, [install Git](../04-git/index.md).
