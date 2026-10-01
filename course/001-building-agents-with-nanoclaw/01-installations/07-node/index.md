---
id: node # never change this, even if the folder or title changes
title: Install Node
description: Install Node.js and pnpm, which run NanoClaw's own short commands, like make add-notion-connection.
---

# Install Node

[Node.js](../../../glossary.md#node-js) runs programs written in JavaScript and TypeScript. TypeScript is JavaScript with extra checks, so mistakes are caught before the program runs.

[NanoClaw](../../../glossary.md#nanoclaw) is written in TypeScript. Later in this course, you run some of its short commands with [Make](../06-make/index.md), like `make add-notion-connection`. Each of those is a small TypeScript program, and Node.js is what runs it.

You also install [pnpm](../../../glossary.md#pnpm) here. It downloads the pieces those programs are built from. Think of it like a delivery service for code: NanoClaw lists the parts it needs, and pnpm fetches the right version of each one.

NanoClaw needs **Node.js 22 or newer**. This page installs Node.js 24, which is supported until April 2028.

## Install it

Click the name of your computer's system to open its section.

<details name="node">
<summary>macOS</summary>

**Check if it's already installed.** In [Terminal](../02-terminal/index.md), run:

```bash
node --version
pnpm --version
```

- If the first line starts with `v22`, `v24` or a higher number, and the second line is a number, like `10.34.5`, you already have both. Skip the rest of this section.
- If the first line starts with `v22` or higher, but the second says `command not found: pnpm`, skip to **Install pnpm** below.
- If you see `command not found: node`, or a number lower than `v22`, do all the steps below.

**Install Node.js.** In the terminal, run:

```bash
brew install node@24
brew link --force node@24
```

The first command downloads Node.js 24. The second makes `node` the command your terminal finds. It ends with a line like `Linking /opt/homebrew/Cellar/node@24/24.21.0...` and a number of `symlinks created`.

If the second command says `Could not symlink` and `Target ... already exists`, an older Node.js from [Homebrew](../../../glossary.md#homebrew) is in the way. Run `brew unlink node`, then run `brew link --force node@24` again.

**Install pnpm.** In the same terminal, run:

```bash
corepack enable --install-directory "$(brew --prefix)/bin" pnpm
```

Corepack comes with Node.js. It sets up pnpm for you, and later picks the exact pnpm version NanoClaw asks for. It prints nothing when it works.

**Check that it works.** Close the terminal, open a new one, and run:

```bash
node --version
pnpm --version
```

The first line starts with `v24`, like `v24.21.0`. The first time you run `pnpm`, it may ask `Do you want to continue? [Y/n]`. Type `Y` and press Enter. Then it shows a number, like `10.34.5`. Your numbers may be different.

</details>

<details name="node">
<summary>Windows</summary>

Node.js goes inside [Ubuntu](../../../glossary.md#ubuntu), like [Git](../../../glossary.md#git) and Make.

**Check if it's already installed.** In the [Ubuntu terminal](../02-terminal/index.md), run:

```bash
node --version
pnpm --version
```

- If the first line starts with `v22`, `v24` or a higher number, and the second line is a number, like `10.34.5`, you already have both. Skip the rest of this section.
- If the first line starts with `v22` or higher, but the second says `command not found: pnpm`, skip to **Install pnpm** below.
- If you see `command not found: node`, or a number lower than `v22`, do all the steps below.

**Install Node.js.** In the Ubuntu terminal, run:

```bash
brew install node@24
brew link --force node@24
```

The first command downloads Node.js 24, using the Homebrew you installed inside Ubuntu. The second makes `node` the command your terminal finds. It ends with a line like `Linking /home/linuxbrew/.linuxbrew/Cellar/node@24/24.21.0...` and a number of `symlinks created`.

If the second command says `Could not symlink` and `Target ... already exists`, an older Node.js from Homebrew is in the way. Run `brew unlink node`, then run `brew link --force node@24` again.

**Install pnpm.** In the same Ubuntu terminal, run:

```bash
corepack enable --install-directory "$(brew --prefix)/bin" pnpm
```

Corepack comes with Node.js. It sets up pnpm for you, and later picks the exact pnpm version NanoClaw asks for. It prints nothing when it works.

**Check that it works.** Close the Ubuntu terminal, open a new one, and run:

```bash
node --version
pnpm --version
```

The first line starts with `v24`, like `v24.21.0`. The first time you run `pnpm`, it may ask `Do you want to continue? [Y/n]`. Type `Y` and press Enter. Then it shows a number, like `10.34.5`. Your numbers may be different.

</details>

<details name="node">
<summary>Linux</summary>

**Check if it's already installed.** In the [terminal](../02-terminal/index.md), run:

```bash
node --version
pnpm --version
```

- If the first line starts with `v22`, `v24` or a higher number, and the second line is a number, like `10.34.5`, you already have both. Skip the rest of this section.
- If the first line starts with `v22` or higher, but the second says `command not found: pnpm`, skip to **Install pnpm** below.
- If you see `command not found: node`, or a number lower than `v22`, do all the steps below.

Don't use `sudo apt install nodejs`: on older Ubuntu versions, its Node.js is too old for NanoClaw, and Homebrew keeps it the same on every system.

**Install Node.js.** In the terminal, run:

```bash
brew install node@24
brew link --force node@24
```

The first command downloads Node.js 24. The second makes `node` the command your terminal finds. It ends with a line like `Linking /home/linuxbrew/.linuxbrew/Cellar/node@24/24.21.0...` and a number of `symlinks created`.

If the second command says `Could not symlink` and `Target ... already exists`, an older Node.js from Homebrew is in the way. Run `brew unlink node`, then run `brew link --force node@24` again.

**Install pnpm.** In the same terminal, run:

```bash
corepack enable --install-directory "$(brew --prefix)/bin" pnpm
```

Corepack comes with Node.js. It sets up pnpm for you, and later picks the exact pnpm version NanoClaw asks for. It prints nothing when it works.

**Check that it works.** Close the terminal, open a new one, and run:

```bash
node --version
pnpm --version
```

The first line starts with `v24`, like `v24.21.0`. The first time you run `pnpm`, it may ask `Do you want to continue? [Y/n]`. Type `Y` and press Enter. Then it shows a number, like `10.34.5`. Your numbers may be different.

</details>

> [!NOTE]
> If you already have Node.js 25 or newer, `corepack` may say `command not found`. Newer Node.js stopped including it. Install pnpm with `npm install -g pnpm@10` instead, in the same terminal.

## What you don't install here

NanoClaw's commands also need their own pieces of code, like `tsx`, the tool that runs a TypeScript file. You don't install those by hand. NanoClaw's setup downloads them with pnpm, into the `nanoclaw` folder, in the [next lesson](../../02-setting-up-nanoclaw/index.md). That is why `make` commands only work inside that folder, after setup has run.

## Next

Node.js is ready. Next, install [Codex](../08-codex/index.md).
