---
id: setting-up-nanoclaw # never change this, even if the folder or title changes
title: Setting up NanoClaw
description: Create a Telegram bot, install NanoClaw, and say hi to your first agent.
---

# Setting up NanoClaw

In this lesson, you install NanoClaw and connect it to Telegram. At the end, you have your own AI agent, and you can chat with it on Telegram.

Before you start, finish the [Getting Started](../01-installations/index.md) lesson. You need Git, Docker and Codex.

## Important notes

1. This course uses our own copy of NanoClaw. It is a [fork](../../glossary.md#fork): a copy of a project that you can change without changing the original. We changed it with NanoClaw's own skills, so that it works with Telegram and Codex. Our version of Nanoclaw can be found at the [aith-nanoclaw-codex-telegram](https://github.com/aijutsu/aith-nanoclaw-codex-telegram) project on GitHub and can be used independently of this course

## The steps

Do them in this order. Each step has its own page:

| Step | What you do | Why |
| --- | --- | --- |
| [Create your Telegram bot](./01-telegram-bot/index.md) | Make a bot with BotFather, and copy its token. | The bot is the Telegram account your agent chats from. |
| [Download NanoClaw](./02-download-nanoclaw/index.md) | Copy NanoClaw onto your computer with Git. | NanoClaw is the program your agent runs in. |
| [Run NanoClaw's setup](./03-run-setup/index.md) | Run the setup program, and answer its questions. | This builds your agent and connects it to your bot. |
| [Say hi to your agent](./04-say-hi/index.md) | Send your agent its first message. | This shows that everything works. |

## How the pages work

- **Do them in order.** Each page needs what the page before it made. Setup asks for the bot token from the first page, so keep it somewhere safe.
- **Some steps have more than one way to do them.** Those steps have one section for each way. Click the name of the way you want to use.
- **You only do this once.** After setup, your agent stays on your computer. Later lessons change what it can do, not how it is installed.

## Next

Start with [Create your Telegram bot](./01-telegram-bot/index.md).
