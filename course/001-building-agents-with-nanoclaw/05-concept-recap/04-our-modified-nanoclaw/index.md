---
id: our-modified-nanoclaw # never change this, even if the folder or title changes
title: Our modified NanoClaw
description: The NanoClaw in this course is our own customised copy. See what we changed, and how we changed it using skills, without editing the code by hand.
---

# Our modified NanoClaw

> [!IMPORTANT]
> **The [NanoClaw](../../../glossary.md#nanoclaw) you installed is not the standard one.** It is our [fork](../../../glossary.md#fork): a copy of [NanoClaw](https://github.com/nanocoai/nanoclaw) that we changed for this course, at <https://github.com/aijutsu/aith-nanoclaw-codex-telegram>. Much of what Louis did in this course comes from those changes. A standard NanoClaw, downloaded from the original project, would not behave this way. Out of the box, it doesn't come with [Codex](../../../glossary.md#codex) or [Telegram](../../../glossary.md#telegram) set up, and it doesn't know how to behave in a group chat.

This page explains what we changed, and the more surprising part: how we changed it. **We didn't edit NanoClaw's code by hand.** We asked [Claude](../../../glossary.md#claude) to make every change, and Claude did it using NanoClaw's [skills](../../../glossary.md#skills).

## What skills are

A [skill](../../../glossary.md#skills) is a set of written instructions, saved as a file, that teaches a [harness](../../../glossary.md#harness) how to do one kind of job. Each skill is a folder with a file called `SKILL.md` in it. At the top of that file is a short description of when to use it. Below it are the steps.

A harness that knows about skills looks for them by itself. [Claude Code](../../../glossary.md#claude-code), for example, checks the `.claude/skills` folder of the project it is working in, and reads just the description of each skill. When you ask for something that matches a description, it opens that skill and follows its steps. Until then, it ignores the rest, so a project can carry many skills without confusing the harness.

NanoClaw ships with dozens of them. Each one makes one change to NanoClaw, the way NanoClaw's makers intend it to be made:

- `/add-telegram` connects NanoClaw to Telegram.
- `/add-codex` lets an agent think with Codex instead of Claude.
- `/customize` asks what you want to change, then uses the right skill for it, or makes the change carefully if no skill exists yet.

The `/` in front is how you ask for a skill by name, by typing it into Claude Code. You can also just describe what you want in plain words.

>[!NOTE]
> If the thought has come to you, yes, this also means that code from two different installations of NanoClaw can look completely different yet achieve the same outcome depending on the effort/intelligence level of the [model](../../../glossary.md#model) you used to generate the custom behaviour. For this course, we used exclusively Opus and Fable because we needed to ensure as-deterministic-as-possible behaviour (which surprise surprise, is very difficult in the world of AI)

## How we customised NanoClaw

We started Claude Code inside the `nanoclaw` folder and asked for what the course needed, in plain words. For example: "Use Codex for the agent, and connect Telegram." Claude found the matching skills and followed them.

When there was no skill for what we wanted, we asked Claude for the change anyway. Claude made the change, tested it, and then **wrote a new skill for it**, so the change is recorded as steps that can be followed again. That matters later. When the original NanoClaw releases a new version, our fork takes it in with NanoClaw's own `/update-nanoclaw` skill. If the update breaks one of our changes, Claude applies that change again from its skill, instead of untangling it by hand.

That is the same idea you used with Louis, one level down. You asked Louis in plain words, and Louis changed their own notes. We asked Claude in plain words, and Claude changed NanoClaw, following the instructions NanoClaw ships with.

## What we changed

These are the most important changes. Each name links to its skill in our fork, so you can read the exact steps Claude followed.

| Change | What it does for you | Skill |
| --- | --- | --- |
| **Codex as the agent's brain** | Louis thinks with Codex, on your [ChatGPT](../../../glossary.md#chatgpt) plan, instead of Claude. | [`add-codex`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/add-codex) |
| **Telegram** | Louis can talk to you on Telegram at all. | [`add-telegram`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/add-telegram) |
| **Replying properly in a group** | Louis's answers quote the message they answer, and open the asker's reply box (Telegram's "force reply"). Replies to Louis reach Louis without an @mention. Approved announcements are posted on their own and pinned. | [`telegram-reply-threading`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/telegram-reply-threading) |
| **Knowing who is talking** | Louis sees each sender's Telegram account ID, which is how they tell a new member from an admin. | [`sender-id-in-prompt`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/sender-id-in-prompt) |
| **The community assistant** | Louis's persona, ground rules, [Notion](../../../glossary.md#notion) know-how and three scheduled tasks. This is a template, not a skill: setup offers it under **From local templates**. | [`templates/community`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/templates/community) |
| **The Notion connection** | `make add-notion-connection` stores your Notion [token](../../../glossary.md#token) in the credential keeper, with the settings exactly right. | [`add-notion-credentials`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/add-notion-credentials) |
| **Personality kept apart** | "Talk like…" requests go into `personality.md`, never into Louis's ground rules. | [`group-personality`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/group-personality) |
| **Restarting Louis** | `make reload-community-agent` restarts Louis, so new instructions take effect. | [`reload-community-agent`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/reload-community-agent) |
| **Keys stay in the keeper** | Codex's own app and plugin connections are kept off, so every credential goes through the credential keeper. | [`codex-credential-lockdown`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/codex-credential-lockdown) |
| **A complete uninstall** | The uninstaller can also remove the credential keeper and every key in it, so a fresh install really is fresh. | [`onecli-full-uninstall`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/tree/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/.claude/skills/onecli-full-uninstall) |

Two things you met earlier in this lesson come from this list. `personality.md`, on [Inside NanoClaw](../03-nanoclaw-internals/index.md), is the "Personality kept apart" change. `make reload-community-agent` is "Restarting Louis". A standard NanoClaw has neither.

### Why personality is kept apart

In a standard NanoClaw, "talk like Phua Chu Kang" goes into the same file as the agent's ground rules: who may see members' details, who may verify a neighbour, what never gets deleted. Asking Louis to change their voice would mean Louis editing the file that keeps your community's information safe. We changed that, for three reasons.

**The rules come in an order, and the ground rules come first.** Louis's instruction file, `AGENTS.md`, is put together in a fixed order: their persona and ground rules first, then their personality, then NanoClaw's own rules. The ground rules are written by you and the template. The personality is written by Louis, and anyone chatting with Louis can ask for a change to it. Keeping them in two files means a chat can change how Louis sounds, but never what Louis is allowed to do.

**The main instructions must stay whole.** Codex can only read so much instruction text. If the file is longer than that, Codex quietly cuts off the end. The personality sits in the middle of the file, before NanoClaw's own rules for every agent: how to send a message, how to use their tools, how to handle credentials. If the personality grew without limit, it would push those rules past the cut, and Louis would lose them without anyone noticing. So `personality.md` has a limit of its own, 4 KB, about a page of text. A longer one is left out completely, and Louis goes back to the template's voice, with every rule still in place.

**Long instructions are followed less reliably.** A model doesn't read its instructions like a contract. The more text it has to keep in mind, the more likely it is to lose track of a rule, or to make up one that isn't there. That is called **hallucinating**. A short, separate personality keeps the instructions that matter most short and clear. A long, rambling one makes it more likely that, one day, Louis shares a member's details with someone who shouldn't see them.

## Rules that are followed, and rules that are enforced

Everything Louis does with your community's information is decided by rules: Louis doesn't tell anyone another member's status, only an admin can verify someone, the Admin Log is never edited. Deciding those rules, and writing them down, is called **data governance**. Louis's ground rules are data governance, and they are good ones.

But a rule written down is only a rule that someone is asked to follow. Making sure it **can't** be broken is a different thing, called **data control**. Look at which of Louis's rules are which:

| Rule | Followed, or enforced? |
| --- | --- |
| Louis never sees your Notion token | **Enforced.** [OneCLI](../../../glossary.md#onecli) holds the token and adds it on the way out. There is nothing for Louis to leak. |
| Louis can only see the files NanoClaw gives them | **Enforced.** [Docker](../../../glossary.md#docker) keeps Louis in a box. |
| Louis doesn't tell a member anyone else's membership status | **Followed.** It is written in Louis's ground rules. Louis's Notion connection can read every row. Only the model's judgement stands between a clever message and the answer. |
| Nobody edits the Admin Log | **Followed.** Louis won't, because the ground rules say so. Anyone with edit access to your Notion page still can. |

The followed rules are the hard part. A model can be talked around, confused by a long conversation, or tricked by a message written to look like an instruction. The usual way to enforce rules, in the data itself, doesn't fit agents well either. Notion, like most tools, decides access per connection, not per person. Louis's connection has to be able to read everyone's details to help anyone at all.

Writing good rules for an agent is now fairly well understood. **Enforcing them, so that the agent can't break them even when it is tricked, is a problem that few organisations have solved.** For a neighbourhood group chat, followed rules are a sensible trade. For a company's customer records, staff data or anything covered by the [PDPA](../../../glossary.md#pdpa), they usually aren't enough.

**A small plug.** This is the kind of problem Aijutsu helps companies with. Our senior technical advisory covers AI and compliance together: deciding which rules an agent must follow, and which ones the system around it must enforce, so the agent can't break them. If your company is starting to think about what an agent could do with its data, drop an email to [hello@aijutsu.dev](mailto:hello@aijutsu.dev) for a free chat, or read more [about Aijutsu](../../../about.md).

## Why this matters to you

- **If you use a standard NanoClaw**, expect it to behave differently from this course. Louis's group manners, the Notion template and the `make` commands won't be there until you add them.
- **You can customise NanoClaw the same way.** Start Claude Code (or Codex) in the `nanoclaw` folder, and ask in plain words. Ask it to use a skill if one fits, and to write a new skill for anything it changes by hand.
- **Read a skill before you run it.** A skill is plain text. Opening the `SKILL.md` tells you exactly what it will change on your computer.

## Next

Last, see what you could do with all of this: [Where to go next](../05-what-next/index.md).
