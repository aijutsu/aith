---
title: Building community agents with NanoClaw
description: Learn the basics of AI agents by building your own with NanoClaw.
---

# Building community agents with NanoClaw

## Course overview

This course introduces:

1. What a basic development setup looks like.
2. The basic parts of an agent [harness](../glossary.md#harness): the model, the tools, and the data.
3. A basic integration that uses Notion to store data.

By the end of this course, you should:

1. Be able to describe software you'd install in order to start working on building a community agent
2. Understand how Codex and ChatGPT are related to each other
3. Be familiar with NanoClaw installation using Codex by OpenAI for the model, and Telegram as the chat interface
4. Know how to use Codex to setup an agent in NanoClaw based on a personality template
5. Know how to create a Notion integration and assign a Notion page as an agent's knowledge base

## Lessons

1. [Getting Started](./01-installations/index.md): get your computer ready. One page per tool:
   1. [Open a terminal](./01-installations/01-terminal/index.md)
   2. [Install Homebrew (macOS and Linux)](./01-installations/02-homebrew/index.md)
   3. [Install Chocolatey (Windows)](./01-installations/03-chocolatey/index.md)
   4. [Install Git](./01-installations/04-git/index.md)
   5. [Install Docker](./01-installations/05-docker/index.md)
   6. [Install Make](./01-installations/06-make/index.md)
   7. [Install Codex](./01-installations/07-codex/index.md)
   8. [Install Claude Code (optional)](./01-installations/08-claude-code/index.md)
2. [Setting up NanoClaw](./02-setting-up-nanoclaw/index.md): create a Telegram bot, install NanoClaw, and say hi to your first agent. One page per step:
   1. [Create your Telegram bot](./02-setting-up-nanoclaw/01-telegram-bot/index.md)
   2. [Download NanoClaw](./02-setting-up-nanoclaw/02-download-nanoclaw/index.md)
   3. [Run NanoClaw's setup](./02-setting-up-nanoclaw/03-run-setup/index.md)
3. [Setting up data sources](./03-setting-up-data-sources/index.md): give Louis, your agent, a place to keep what he learns, using a ready-made Notion template. One page per step:
   1. [Copy the Louis template into Notion](./03-setting-up-data-sources/01-notion-page/index.md)
   2. [Create a Notion connection](./03-setting-up-data-sources/02-notion-connection/index.md)
   3. [Point Louis at your copy](./03-setting-up-data-sources/03-watch-it-fill/index.md)
4. [Cleaning Up](./04-cleaning-up/index.md): remove what the course put on your computer, when you no longer need it.
   1. [Uninstalling NanoClaw](./04-cleaning-up/01-uninstalling-nanoclaw/index.md)

## References

| Title | Description | URL |
| --- | --- | --- |
| NanoClaw GitHub | GitHub repository for NanoClaw | <https://github.com/nanocoai/nanoclaw> |
| NanoClaw for this course | Our fork of NanoClaw, changed to work with Telegram and Codex | <https://github.com/aijutsu/aith-nanoclaw-codex-telegram> |
| NanoClaw Website | Website for NanoClaw | <https://nanoclaw.dev/> |
| Install WSL | Microsoft's guide to installing WSL on Windows | <https://learn.microsoft.com/en-us/windows/wsl/install> |
| Install Git | Git's download page, with steps for every system | <https://git-scm.com/install/> |
| Homebrew | The app store for the terminal on a Mac | <https://brew.sh/> |
| OrbStack | A lighter way to run Docker on a Mac | <https://docs.orbstack.dev/> |
| Docker Desktop | Docker's guide to installing Docker Desktop | <https://docs.docker.com/desktop/> |
| Docker Engine on Ubuntu | Docker's guide to installing Docker on Ubuntu | <https://docs.docker.com/engine/install/ubuntu/> |
| GNU Make | The manual for Make, the tool that runs a long command from a short name | <https://www.gnu.org/software/make/manual/> |
| jq | The tool NanoClaw's setup uses to read the answers that services send back | <https://jqlang.org/> |
| Codex CLI | OpenAI's guide to installing and using Codex in the terminal | <https://learn.chatgpt.com/docs/codex/cli> |
| Claude Code | Anthropic's guide to installing Claude Code | <https://code.claude.com/docs/en/setup> |
| Telegram bots | Telegram's guide to bots and BotFather | <https://core.telegram.org/bots/features#botfather> |
