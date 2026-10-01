---
id: what-next # never change this, even if the folder or title changes
title: Where to go next
description: How to keep an agent running for a real community, and what to learn after this course.
---

# Where to go next

Louis runs on your computer. That is the right place to learn, and the wrong place to leave a community's agent. This page covers where an agent can live, and what to learn next.

## Where an agent can live

An agent only answers while the computer it runs on is switched on, awake and online. Close your laptop, and Louis stops answering until you open it again. [Telegram](../../../glossary.md#telegram) holds new messages for the bot for up to a day, so a short break loses nothing, but nobody gets an answer in the meantime. A scheduled task that was due while the computer slept runs late, once it wakes.

[NanoClaw](../../../glossary.md#nanoclaw) already does part of the job. Setup installed it as a **background service**, a program the system starts by itself and restarts if it crashes. On a Mac, it starts when you log in. On Linux, it starts when the computer starts, even before anyone logs in. On Windows, inside [Ubuntu](../../../glossary.md#ubuntu), it may need starting again after a restart.

So the real question is which computer to run it on. There are three common answers:

| Where | Good for | Watch out for |
| --- | --- | --- |
| **Your own laptop** | Learning, and trying ideas out. It costs nothing extra. | It sleeps, travels and runs out of battery. Louis goes quiet whenever it does. |
| **A small computer that stays on at home** — a spare Mac mini, or a small, low-cost PC like a [Beelink](../../../glossary.md#beelink) (we use this ourselves) | A real community, at a low cost. Your data stays in your home. | Power cuts and internet outages at home. You look after it yourself. |
| **A rented computer in the cloud**, called a server, from a company like [DigitalOcean](../../../glossary.md#digitalocean), [AWS](../../../glossary.md#aws) or [GCP](../../../glossary.md#gcp) | Always on, and always online. | A monthly bill. Your community's data now sits on someone else's computer, so read their terms, and Singapore's [PDPA](../../../glossary.md#pdpa) if you keep people's details. |

A rented server usually runs Ubuntu, so you would follow this course's Linux steps on it, typing into its [terminal](../../../glossary.md#terminal) from yours over the internet.

Wherever it runs, three things stay true:

- **The agent is only as safe as the computer.** Anyone who can log in to that computer can read Louis's folder, their notes and your settings.
- **Keep the `nanoclaw` folder backed up.** Louis's folder, `groups/louis`, holds their persona, personality and notes. Lose it, and you start again with a stranger.
- **Every run uses your [ChatGPT](../../../glossary.md#chatgpt) plan.** A busy group and many scheduled tasks use more of it. Keep scheduled tasks to what a person would actually want to read.

## What to learn next

You now know the four ideas behind every agent — a [model](../../../glossary.md#model), a [harness](../../../glossary.md#harness), [tool calls](../../../glossary.md#tool-call) and data — and the [orchestrator](../../../glossary.md#orchestrator) that runs them. Each one is a direction to grow in.

**More places to talk.** Telegram is one channel. NanoClaw adds others the same way it added Telegram, with a [skill](../../../glossary.md#skills): [WhatsApp](../../../glossary.md#whatsapp), [Discord](../../../glossary.md#discord), Slack, Signal, Microsoft Teams and more. A community that lives on WhatsApp can have its agent there.

**More tools.** [Notion](../../../glossary.md#notion) is one [data source](../../../glossary.md#data-source). NanoClaw has skills that connect agents to [GitHub](../../../glossary.md#github), Linear, email and web search, and any service with an [MCP](../../../glossary.md#mcp) server can become a new tool. Each one is a new kind of tool call, and a new thing the agent can do.

**Smarter schedules.** A scheduled task can first run a small check, and only wake the agent when there is something to say, for example only when a new event was added. A check that finds nothing costs nothing. It is also how a task may run more often than 4 times a day without asking.

**Your own skills.** Everything Louis knows about running a community is written down as [skills](../../../glossary.md#skills): plain instructions, in files. You can write your own, for your own community's habits.

**A different model.** NanoClaw can run an agent on [Claude](../../../glossary.md#claude) instead of [Codex](../../../glossary.md#codex), or on a model that runs on your own computer with [Ollama](../../../glossary.md#ollama), so your messages never leave it.

**Checking that it behaves.** As an agent does more, you want to know it still does the right thing after every change. Tests for AI behaviour are called [evals](../../../glossary.md#evals), and they are the next step after "I tried it and it seemed fine".

If you would rather learn the next steps with someone, [Aijutsu](../../../about.md) runs instructor-led classes for individuals and companies.

## Next

That is the end of the course. You built a working community agent, and you know how it works.

When you no longer want NanoClaw on your computer, the [Cleaning up](../../06-cleaning-up/index.md) lesson removes it.
