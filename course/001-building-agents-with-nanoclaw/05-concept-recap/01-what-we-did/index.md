---
id: what-we-did # never change this, even if the folder or title changes
title: What we did
description: Every lesson of the course in one page, and what each one added to Louis.
---

# What we did

You started with an empty computer and finished with an agent that lives in a group chat, knows your neighbours, keeps a record in [Notion](../../../glossary.md#notion), has a voice of its own, and speaks up on a schedule. Here is how you got there, one lesson at a time.

## 1. Getting started: the tools

In [Getting started](../../01-installations/index.md), you installed the tools everything else stands on:

- a **[terminal](../../../glossary.md#terminal)**, to type commands;
- an **app store** for that terminal: [Homebrew](../../../glossary.md#homebrew), inside [Ubuntu](../../../glossary.md#ubuntu) on Windows;
- **[Git](../../../glossary.md#git)**, to download [NanoClaw](../../../glossary.md#nanoclaw);
- **[Docker](../../../glossary.md#docker)**, to run Louis inside a closed box, so they can only see what you allow;
- **[Make](../../../glossary.md#make)** and **[Node.js](../../../glossary.md#node-js)**, to run NanoClaw's short commands, like `make add-notion-connection`;
- **[Codex](../../../glossary.md#codex)**, the AI helper that both thinks for Louis and helps you change them.

**What it added:** nothing you could talk to yet. Only the ground to build on.

## 2. Setting up NanoClaw: a phone line and someone to answer it

In [Setting up NanoClaw](../../02-setting-up-nanoclaw/index.md), you made a [Telegram](../../../glossary.md#telegram) bot, downloaded NanoClaw, and ran its setup. Setup connected your [ChatGPT](../../../glossary.md#chatgpt) plan, installed the credential keeper ([OneCLI](../../../glossary.md#onecli)), made Louis from the `community-assistant` template, and started NanoClaw in the background.

**What it added:** Louis, answering you in a private chat. The bot is the phone line. Louis is who picks up.

## 3. Setting up data sources: a memory you can read

In [Setting up data sources](../../03-setting-up-data-sources/index.md), you copied the Louis Notion template, made a Notion connection, gave it access to your copy, and sent Louis the link. Then you told them about yourself, and they wrote it down.

**What it added:** a [data source](../../../glossary.md#data-source). Louis now keeps what they learn in your Notion page, where you can read it, and fix it by hand.

## 4. Customising your agent: a community, not a chat

In [Customising your agent](../../04-agent-customisations/index.md), you:

1. made a Telegram group, and added the bot;
2. connected Louis to that group, and watched a Notion round trip;
3. invited a neighbour, and saw that Louis treats a new member, a verified neighbour and an admin differently;
4. changed their personality, and restarted them with `make reload-community-agent`;
5. scheduled a message every 5 minutes, watched it arrive, and switched it off.

**What it added:** everything that makes Louis yours: a place to work, rules about who may ask for what, a voice, and a clock.

## The pattern behind all of it

Look back at how you changed Louis. Almost every time, you didn't edit a setting. You **asked them in plain words**, and they changed themselves: they wrote their personality notes, they created their own schedule, they added rows to Notion.

That is the big idea of an agent. The next page shows how it works.

## Next

See how the parts work together: [How it fits together](../02-system-architecture/index.md).
