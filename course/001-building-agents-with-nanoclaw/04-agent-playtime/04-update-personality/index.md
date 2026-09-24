---
id: update-personality # never change this, even if the folder or title changes
title: Update your agent's personality
description: Change how your agent writes and behaves, either by asking him or by editing his instructions with Codex.
---

# Update your agent's personality

Louis arrived with a personality he got from the template. It is a starting point, not a decision. Your community has its own way of talking, and he should sound like it.

There are two ways to change him. Start with the easy one.

## Just ask him

In your private chat with the bot, tell him what to change:

```
From now on, keep your messages to three lines or fewer, and don't use exclamation marks.
```

Louis writes that into his own standing instructions and follows it from then on. He doesn't need permission for this, and you don't need the terminal: changing how he writes is his own business, and he keeps those notes in his workspace on your computer.

Try a few:

- `Greet people in Malay when they greet you in Malay.`
- `When you report an estate issue, always say which block it's on first.`
- `Stop asking me to confirm every event. Just add them.`

Then ask him to summarise what you have told him, and he will read his instructions back to you.

## Change it with Codex

Asking works for how he writes. For bigger changes — a new habit, a different job, a rewritten introduction — it helps to see the file.

1. In your [terminal](../../01-installations/01-terminal/index.md), go to the NanoClaw folder and start Codex:

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

3. Type `/quit` to leave Codex, then send Louis a message in Telegram. He picks up the new instructions the next time he wakes up.

> [!IMPORTANT]
> Don't edit the file called `CLAUDE.md` or `AGENTS.md` in your agent's folder. NanoClaw rebuilds that file from scratch every time the agent starts, so your changes would disappear. The standing instructions are a different file, and Codex knows which one.

## Changing the template instead

The template you copied — `community-assistant`, the one that made Louis — lives in the NanoClaw folder too. Editing it changes **the next agent you make from it**, not the one you already have. That is the right place for a change you want every future agent to start with, and the wrong place for "make Louis quieter".

## Check that it worked

Send Louis a message in the group and read how he answers. If he still sounds the same:

- ask him directly what his standing instructions say — if your change isn't in there, tell him again;
- if you edited a file with Codex, send another message and wait a few seconds. He reads his instructions when he starts, not mid-sentence.

## Next

You have an agent that lives in a real group, knows who everyone is, writes what it learns into Notion, and sounds like your community. That is the end of this lesson, and the end of what this course sets out to build.

When you no longer want NanoClaw on your computer, the [Cleaning Up](../../05-cleaning-up/index.md) lesson removes it.
