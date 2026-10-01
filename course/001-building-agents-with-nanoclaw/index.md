---
title: Building community agents with NanoClaw
description: Learn the basics of AI agents by building your own with NanoClaw.
---

# Building community agents with NanoClaw

## Course overview

This course introduces:

1. What a basic development setup looks like, and what each tool in it is for.
2. The parts of an AI agent: the [model](../glossary.md#model), the [harness](../glossary.md#harness), [tool calls](../glossary.md#tool-call) and data, and the [orchestrator](../glossary.md#orchestrator) that runs them.
3. A [data source](../glossary.md#data-source): [Notion](../glossary.md#notion), as the place an agent keeps what it learns.
4. Customising an agent by asking in plain words, and customising [NanoClaw](../glossary.md#nanoclaw) itself with [skills](../glossary.md#skills).
5. Rules for an agent: who may ask it for what, and the difference between rules an agent follows and rules the system enforces.

By the end of this course, you should be able to:

1. **Know your tools.** Describe the software you install to build a community agent, and what each piece is for.
2. **[Codex](../glossary.md#codex) and [ChatGPT](../glossary.md#chatgpt).** Explain how they are related: your ChatGPT plan pays for OpenAI's model, and Codex is the program that puts it to work.
3. **Install NanoClaw.** Set it up with [Telegram](../glossary.md#telegram) as the chat app and Codex as the harness, and make an agent from the `community-assistant` template.
4. **Connect a data source.** Create a Notion connection, and give an agent a Notion page to read and write.
5. **Run an agent in a group.** Put an agent in a group chat, and see how it treats a new member, a verified neighbour and an admin differently.
6. **Customise in plain words.** Change an agent's personality, and schedule a message, just by asking.
7. **See how it works inside.** Find where those changes are stored on your computer, and describe how this course's NanoClaw was customised with skills.
8. **Govern the data, and go further.** Explain the difference between data governance and data control, and the options for running an agent somewhere other than your laptop.

## Lessons

1. [Getting started](./01-installations/index.md): get your computer ready. One page per tool:
   1. [Install WSL (Windows only)](./01-installations/01-wsl/index.md)
   2. [Open a terminal](./01-installations/02-terminal/index.md)
   3. [Install Homebrew](./01-installations/03-homebrew/index.md)
   4. [Install Git](./01-installations/04-git/index.md)
   5. [Install Docker](./01-installations/05-docker/index.md)
   6. [Install Make](./01-installations/06-make/index.md)
   7. [Install Node](./01-installations/07-node/index.md)
   8. [Install Codex](./01-installations/08-codex/index.md)
   9. [Install Claude Code (optional)](./01-installations/09-claude-code/index.md)
2. [Setting up NanoClaw](./02-setting-up-nanoclaw/index.md): create a Telegram bot, install NanoClaw, and say hi to your first agent. One page per step:
   1. [Create your Telegram bot](./02-setting-up-nanoclaw/01-telegram-bot/index.md)
   2. [Download NanoClaw](./02-setting-up-nanoclaw/02-download-nanoclaw/index.md)
   3. [Run NanoClaw's setup](./02-setting-up-nanoclaw/03-run-setup/index.md)
3. [Setting up data sources](./03-setting-up-data-sources/index.md): give Louis, your agent, a place to keep what they learn, using a ready-made Notion template. One page per step:
   1. [Create the Notion page](./03-setting-up-data-sources/01-notion-page/index.md)
   2. [Create a Notion connection](./03-setting-up-data-sources/02-notion-connection/index.md)
   3. [Connect your Notion page](./03-setting-up-data-sources/03-connect-notion-page/index.md)
   4. [Connect your agent to Notion](./03-setting-up-data-sources/04-watch-it-fill/index.md)
4. [Customising your agent](./04-agent-customisations/index.md): put Louis in front of real people, and make them your own. One page per step:
   1. [Create a Telegram group](./04-agent-customisations/01-create-telegram-group/index.md)
   2. [Add your agent to the group](./04-agent-customisations/02-add-agent-to-group/index.md)
   3. [Add humans to the group](./04-agent-customisations/03-add-humans-to-group/index.md)
   4. [Update your agent's personality](./04-agent-customisations/04-update-personality/index.md)
   5. [Schedule a message](./04-agent-customisations/05-schedule-a-message/index.md)
5. [Concept recap](./05-concept-recap/index.md): step back and see what you built, how it fits together, and where to go next. One page per topic:
   1. [What we did](./05-concept-recap/01-what-we-did/index.md)
   2. [How it fits together](./05-concept-recap/02-system-architecture/index.md)
   3. [Inside NanoClaw](./05-concept-recap/03-nanoclaw-internals/index.md)
   4. [Our modified NanoClaw](./05-concept-recap/04-our-modified-nanoclaw/index.md)
   5. [Where to go next](./05-concept-recap/05-what-next/index.md)
6. [Cleaning up](./06-cleaning-up/index.md): remove what the course put on your computer, when you no longer need it.
   1. [Uninstalling NanoClaw](./06-cleaning-up/01-uninstalling-nanoclaw/index.md)
   2. [Uninstalling the tools](./06-cleaning-up/02-uninstalling-tools/index.md)

## References

| Title | Description | URL |
| --- | --- | --- |
| NanoClaw GitHub | GitHub repository for NanoClaw | <https://github.com/nanocoai/nanoclaw> |
| NanoClaw for this course | Our [fork](../glossary.md#fork) of NanoClaw, changed to work with Telegram and Codex | <https://github.com/aijutsu/aith-nanoclaw-codex-telegram> |
| NanoClaw Website | Website for NanoClaw | <https://nanoclaw.dev/> |
| Install [WSL](../glossary.md#wsl) | Microsoft's guide to installing WSL on Windows | <https://learn.microsoft.com/en-us/windows/wsl/install> |
| Install [Git](../glossary.md#git) | Git's download page, with steps for every system | <https://git-scm.com/install/> |
| [Homebrew](../glossary.md#homebrew) | The app store for the [terminal](../glossary.md#terminal) on a Mac | <https://brew.sh/> |
| [OrbStack](../glossary.md#orbstack) | A lighter way to run [Docker](../glossary.md#docker) on a Mac | <https://docs.orbstack.dev/> |
| Docker Desktop | Docker's guide to installing Docker Desktop | <https://docs.docker.com/desktop/> |
| Docker Engine on [Ubuntu](../glossary.md#ubuntu) | Docker's guide to installing Docker on Ubuntu | <https://docs.docker.com/engine/install/ubuntu/> |
| GNU Make | The manual for [Make](../glossary.md#make), the tool that runs a long command from a short name | <https://www.gnu.org/software/make/manual/> |
| [jq](../glossary.md#jq) | The tool NanoClaw's setup uses to read the answers that services send back | <https://jqlang.org/> |
| Codex CLI | OpenAI's guide to installing and using Codex in the terminal | <https://learn.chatgpt.com/docs/codex/cli> |
| [Claude Code](../glossary.md#claude-code) | Anthropic's guide to installing Claude Code | <https://code.claude.com/docs/en/setup> |
| Telegram bots | Telegram's guide to bots and BotFather | <https://core.telegram.org/bots/features#botfather> |
