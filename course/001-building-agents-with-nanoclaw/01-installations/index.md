---
id: installations # never change this, even if the folder or title changes
title: Getting started
description: Get your computer ready for the course, with a terminal, Git, Docker, Make, Node.js and Codex.
---

# Getting started

In this lesson, you get your computer ready. Your agent is not one big program. It is a few small tools working together, and you install them one at a time. Each tool has its own page. In the next lesson, you use them to set up [NanoClaw](../../glossary.md#nanoclaw).

## Pre-requisites

1. A free [Telegram](../../glossary.md#telegram) account. If you don't have one, sign up at <https://telegram.org/>.
1. A free [Notion](../../glossary.md#notion) account. If you don't have one, sign up at <https://www.notion.so/>.
1. Administrator access to your computer.
1. At least a [ChatGPT](../../glossary.md#chatgpt) Plus subscription (~$30/month version).
1. Optional: a [Claude](../../glossary.md#claude) Pro plan or higher, if you want to use [Claude Code](./09-claude-code/index.md) as your helper instead of [Codex](../../glossary.md#codex).
1. A computer that can run [Docker](../../glossary.md#docker), with at least 8 GB of memory:
   - **Mac:** macOS 14 (Sonoma) or newer.
   - **Windows:** Windows 11, or Windows 10 version 22H2. Microsoft stopped supporting Windows 10 in October 2025, so Windows 11 is best.
   - **Linux:** [Ubuntu](../../glossary.md#ubuntu) 22.04, 24.04 or 26.04.

## The tools you install

Do them in this order. The last one is optional:

| Tool | What it is | What you use it for |
| --- | --- | --- |
| [WSL](./01-wsl/index.md) **(Windows only)** | A part of Windows that runs Linux (Ubuntu) inside it. | Running NanoClaw and every tool after it, because NanoClaw can't run on Windows by itself. Skip this page on macOS and Linux. |
| [Terminal](./02-terminal/index.md) | A window where you type commands, instead of clicking. On Windows, it is Ubuntu's. | Installing and running everything else. |
| [Homebrew](./03-homebrew/index.md) | An app store for the terminal. On Windows it goes inside Ubuntu. | Installing most of the tools below with one short command each. |
| [Git](./04-git/index.md) | A tool that copies a project's files and keeps their history. | Downloading NanoClaw in the next lesson. |
| [Docker](./05-docker/index.md) | A tool that runs a program inside a closed box, called a container. | Running your agent, so it can't touch the rest of your computer. |
| [Make](./06-make/index.md) | A tool that runs a long command when you type a short name. | Running the course's longer commands without typing them out. |
| [Node.js](./07-node/index.md) | A program that runs code written in JavaScript and TypeScript, with [pnpm](../../glossary.md#pnpm), which downloads the code it needs. | Running NanoClaw's short `make` commands, like `make add-notion-connection`. |
| [Codex](./08-codex/index.md) | OpenAI's AI helper for the terminal. | The part of your agent that thinks. It also helps you set NanoClaw up and change it later. |
| [Claude Code](./09-claude-code/index.md) **(optional)** | Anthropic's AI helper for the terminal. | Nothing you must do. Install it only if you have a Claude plan and would rather use Claude than Codex as your helper. |

## How the pages work

- **Do them in order.** Each page builds on the one before it. Homebrew, the app store you install on page 3, is what installs almost everything after it.
- **Some steps are different on macOS, Windows and Linux.** Those steps have one section for each system. Click the name of your computer's system to open its section.
- **Each page has two checks.** Inside your system's section, the first one tells you whether the tool is already on your computer, so you can skip the steps. The last one confirms it works. Run that one before you move on: the next page assumes the tool works.
- **Nothing here is wasted if you already have it.** These are common tools, and you may have some of them already. The first check on each page says what to skip.
- **On Windows, almost everything happens inside Ubuntu.** The first page installs [WSL](../../glossary.md#wsl), which runs Ubuntu inside Windows. After that, "the terminal" means the Ubuntu terminal: click Start, type `Ubuntu`, and open it. Homebrew, Git, Make, Node.js and Codex all go in there, with the same commands as on Linux. The one exception is Docker Desktop, a normal Windows app that you install with its own installer.
- **One page is for Windows only**, and its title says so: Install WSL. On macOS and Linux, skip it.
- **One page is optional**, and its title says so. Claude Code is an alternative to Codex, not an extra thing the course needs. Skipping it changes nothing later.

## Next

On Windows, start with [Install WSL](./01-wsl/index.md). On macOS and Linux, start with [Open a terminal](./02-terminal/index.md).
