---
id: terminal # never change this, even if the folder or title changes
title: Open a terminal
description: Open the window where you type the commands for this course.
---

# Open a terminal

A [terminal](../../../glossary.md#terminal) is a window where you type commands for your computer, instead of clicking on things. You use it for every other tool in this lesson, and for most of this course.

## Open it

Steps are different on macOS, Windows and Linux. Click the name of your computer's system to open its section.

<details name="terminal">
<summary>macOS</summary>

**Check if it's already installed.** Every Mac comes with Terminal. There is nothing to install: you only need to open it.

**Open it.**

1. Press Command (⌘) and Space together. This opens Spotlight search.
2. Type `Terminal` and press Return.

A window opens. This is where you type commands.

**Check that it works.** In the Terminal window that just opened, type this and press Return:

```bash
echo "hello"
```

You should see `hello` on the next line. That means the terminal is taking your commands.

</details>

<details name="terminal">
<summary>Windows</summary>

**Check if it's already installed.** On Windows, the terminal for this course is [Ubuntu](../../../glossary.md#ubuntu)'s, which you installed on [Install WSL](../01-wsl/index.md). If you skipped that page, do it first.

**Open it.**

1. Click Start.
2. Type `Ubuntu` and press Enter.

A window opens, with a line ending in `$`. This is where you type commands. Use it for every command in this course, not PowerShell.

**Check that it works.** In the Ubuntu window that just opened, type this and press Enter:

```bash
echo "hello"
```

You should see `hello` on the next line. That means the terminal is taking your commands.

</details>

<details name="terminal">
<summary>Linux</summary>

**Check if it's already installed.** Every Linux desktop comes with a terminal. There is nothing to install: you only need to open it.

**Open it.** Press Ctrl, Alt and T together. A terminal window opens.

If nothing happens, open your list of apps and search for `Terminal`.

**Check that it works.** In the terminal window that just opened, type this and press Enter:

```bash
echo "hello"
```

You should see `hello` on the next line. That means the terminal is taking your commands.

</details>

## Next

Your terminal is open. Next, install [Homebrew](../03-homebrew/index.md).
