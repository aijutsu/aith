---
id: make # never change this, even if the folder or title changes
title: Install Make
description: Install Make, the tool that runs a long command for you when you type a short name.
---

# Install Make

[Make](../../../glossary.md#make) runs a long command for you when you type a short name. Think of it like the speed-dial buttons on a phone: you press one button instead of typing the whole number.

Later in this course, you run the same few commands again and again. Some of them are long and easy to get wrong. Make lets you run them with one short word instead.

## How it works

A project keeps a file called a `Makefile`. In it, each short name has the real commands written under it. For example, a `Makefile` might say:

```makefile
start:
	docker compose up --detach --wait
```

`start` is the short name. The line under it is the real command. To run it, you type this in the [terminal](../01-terminal/index.md):

```bash
make start
```

Make looks in the `Makefile`, finds `start`, and runs the command for you. You don't have to remember the long line.

You don't write a `Makefile` in this course. You only use the short names that a project already has.

## Install it

Click the name of your computer's system to open its section.

<details name="make">
<summary>macOS</summary>

**Check if it's already installed.** In [Terminal](../01-terminal/index.md), run:

```bash
make --version
```

- If the first line starts with `GNU Make`, you already have Make, and there is nothing to install: skip the rest of this section. Most Macs are in this group, because Apple's Command Line Tools include Make, and Homebrew installed those for you on the [Git](../02-git/index.md) page.
- If you see `command not found: make`, do the step below.

**Install it.** In the terminal, run:

```bash
xcode-select --install
```

A window opens. Click **Install** and wait for it to finish. This can take a few minutes.

**Check that it works.** In the terminal, run:

```bash
make --version
```

The first line starts with `GNU Make`, followed by a number, like `GNU Make 3.81`. Your number may be different. Macs come with an older version of Make than Linux does, which is normal.

</details>

<details name="make">
<summary>Windows</summary>

Make goes inside Ubuntu, like Git.

**Check if it's already installed.** In the [Ubuntu terminal](../01-terminal/index.md), run:

```bash
make --version
```

- If the first line starts with `GNU Make`, you already have Make, and there is nothing to install: skip the rest of this section.
- If you see `command not found: make`, do the step below.

**Install it.** In the Ubuntu terminal, run:

```bash
sudo apt update && sudo apt install -y make
```

Type your Ubuntu password if it asks.

**Check that it works.** In the Ubuntu terminal, run:

```bash
make --version
```

The first line starts with `GNU Make`, followed by a number, like `GNU Make 4.3`. Your number may be different.

</details>

<details name="make">
<summary>Linux</summary>

**Check if it's already installed.** In the [terminal](../01-terminal/index.md), run:

```bash
make --version
```

- If the first line starts with `GNU Make`, you already have Make, and there is nothing to install: skip the rest of this section.
- If you see `command not found: make`, do the step below.

**Install it.** In the terminal, run this on Ubuntu or Debian:

```bash
sudo apt update && sudo apt install -y make
```

On Fedora, run this in the terminal instead:

```bash
sudo dnf install -y make
```

Type your password if it asks.

**Check that it works.** In the terminal, run:

```bash
make --version
```

The first line starts with `GNU Make`, followed by a number, like `GNU Make 4.3`. Your number may be different.

</details>

## Next

Make is ready. Next, install [Codex](../05-codex/index.md).
