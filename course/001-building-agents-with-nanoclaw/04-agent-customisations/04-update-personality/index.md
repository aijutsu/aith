---
id: update-personality # never change this, even if the folder or title changes
title: Update your agent's personality
description: Change how your agent writes and behaves, either by asking them or by editing their instructions with Codex.
---

# Update your agent's personality

Louis arrived with a personality they got from the template. It is a starting point, not a decision. Your community has its own way of talking, and they should sound like it.

There are two ways to change them. Let's start with the easy one.

## Option 1: just ask Louis

In your **private chat** with the bot, tell them what to change. Let's go with something drastic so that we know it has taken effect:

```text wrap
From now on in Angel View, adopt the personality of Phua Chu Kang from the hit sitcom of the 1990s in Singapore.
```

Louis writes that into their personality notes, a file called `personality.md`, and follows it from then on. They don't need permission for this since you are the administrator, and you don't need to change the file yourself: changing how they write is their own business, and they keep those notes in their workspace on your computer.

Their personality notes are kept apart from their ground rules, the rules about who may do what. So asking them to talk like someone else never touches the rules that keep your community's information safe.

For such instructions, the Louis already running in Angel View needs a restart to take up these instructions as their new personality. In your [terminal](../../01-installations/02-terminal/index.md), go to the [NanoClaw](../../../glossary.md#nanoclaw) folder and restart Louis:

```bash
cd ~/nanoclaw
make reload-community-agent
```

It says how many copies of Louis it stopped, and ends with `Updated instructions will load on the next message.` Your next message starts them again, with their new personality.

Try talking in Angel View after that:

```text wrap
@...bot hello hello! what's the weather today like?
```

Then ask them to summarise what you have told them, and they will read their instructions back to you.

## Option 2: change Louis with Codex

Asking works for how they write. For bigger changes — a new habit, a different job, a rewritten introduction — it helps to see the file.

1. In your [terminal](../../01-installations/02-terminal/index.md), go to the NanoClaw folder and start [Codex](../../../glossary.md#codex):

   ```bash
   cd ~/nanoclaw
   codex
   ```

2. Ask Codex, in your own words, to find and change your agent's standing instructions. For example:

   ```
   Find the standing instructions for my Louis agent and rewrite the greeting
   so it sounds like a neighbourhood WhatsApp group, not a company.
   Show me the file before you change it.
   ```

   Codex finds the agent's folder, shows you the file, and edits it when you agree. [Claude Code](../../../glossary.md#claude-code) does the same job if you installed it.

3. Type `/quit` to leave Codex, then restart Louis so that they pick up the change, in the same terminal:

   ```bash
   make reload-community-agent
   ```

   Then send Louis a message in [Telegram](../../../glossary.md#telegram).

> [!IMPORTANT]
> Don't edit the file called `CLAUDE.md` or `AGENTS.md` in your agent's folder. NanoClaw rebuilds that file from scratch every time the agent starts, so your changes would disappear. The standing instructions are a different file, and Codex/Claude will know which one.

## Changing the template instead

The template you copied — `community-assistant`, the one that made Louis — lives in the NanoClaw folder too. Editing it changes **the next agent you make from it**, not the one you already have. That is the right place for a change you want every future agent to start with, and the wrong place for "make Louis quieter".

## Check that it worked

Send Louis a message in the group and read how they answer. If they still sound the same:

- ask them directly what their personality notes say — if your change isn't in there, tell them again;
- run `make reload-community-agent` in the NanoClaw folder, then send another message and wait a few seconds. They read their instructions when they start, not mid-sentence.

## Next

You have an agent that lives in a real group, knows who people are, writes what it learns into [Notion](../../../glossary.md#notion), and has a customised voice for your community. Last, have them speak up without being asked: [Schedule a message](../05-schedule-a-message/index.md).
