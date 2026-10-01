---
id: nanoclaw-internals # never change this, even if the folder or title changes
title: Inside NanoClaw
description: Open the files where your personality change and your scheduled tasks were saved, and follow them into NanoClaw's code.
---

# Inside NanoClaw

Alright, this is where it gets technical.

When you asked Louis to talk like Phua Chu Kang, or to say hello every 5 minutes, something had to be written down somewhere. Otherwise they would have forgotten it the moment they went to sleep. This page shows you where.

You don't need to understand the code. The point is to see that every instruction you gave became an ordinary file, or an ordinary row in a list, that you can open and read.

> [!TIP]
> You don't have to do this by hand. In the `nanoclaw` folder, start `codex` and ask it in plain words, for example: *"Show me where Louis's personality is stored, and how it reaches them when they wake up."* [Codex](../../../glossary.md#codex) reads the same files and code this page points to, and explains them. Use this page to check what it tells you.

## Louis's folder

Every agent has one folder of its own, inside the `nanoclaw` folder. Louis's is `groups/louis`. [NanoClaw](../../../glossary.md#nanoclaw) puts this folder inside their [Docker](../../../glossary.md#docker) container. Apart from a few of NanoClaw's own files, it is the only part of your computer they can see.

In your [terminal](../../01-installations/02-terminal/index.md), go there and list what is in it:

```bash
cd ~/nanoclaw/groups/louis
ls
```

You see a list of names. These are the ones that matter:

| Name | What it is | Who writes it |
| --- | --- | --- |
| `instructions.prepend.md` | Their **persona**: who they are, their job, and their ground rules. It was copied from the template when Louis was made. | The template, then you. Louis doesn't change this one for style requests. |
| `personality.md` | Their **personality notes**: their voice, tone and language. It only appears once you ask them to change how they talk. | Louis |
| `memory/` | Their **notes to themselves**, like the link to your [Notion](../../../glossary.md#notion) page. | Louis |
| `tasks/` | A **diary for each scheduled task**: one file per task, with a line for every time it ran. | NanoClaw |
| `plugins/` | A copy of the **`community-assistant` template**: their [skills](../../../glossary.md#skills) and their three starting tasks. | Setup, when Louis was made |
| `AGENTS.md` | The **instruction file** Codex hands to the [model](../../../glossary.md#model): the instruction half of Louis's [harness](../../../glossary.md#harness). NanoClaw writes it fresh every time Louis wakes up. | NanoClaw. Never edit it: your change would be gone the next time they wake up. |

## Where your personality change went

Read Louis's personality notes:

```bash
cat personality.md
```

You see what Louis wrote when you asked for Phua Chu Kang: a few lines about their voice, written in their own words. Compare these words with your coursemates, everyone's should be different depending on the model in use and/or how you phrased the request.

`cat` shows a file's contents in the terminal. If it says `No such file or directory`, Louis hasn't written any personality notes yet.

Now see how those notes reach them. Look at the top of the instruction file:

```bash
head -40 AGENTS.md
```

It starts with the line `Composed at spawn - do not edit`. Under it is a heading `# Persona`, with your `instructions.prepend.md`, and then `# Personality`, with your `personality.md`. After those come NanoClaw's own rules for every agent.

That is the whole trick. The model doesn't remember being told to talk like Phua Chu Kang. Every time Louis wakes up, NanoClaw glues the files together into `AGENTS.md`, and the model reads it again from the top. This is also why you ran `make reload-community-agent`: a running Louis has already read their file, and only a fresh start makes them read it again.

**In the code**, if you want to follow it:

- [`src/project-doc-compose.ts`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/src/project-doc-compose.ts) builds `AGENTS.md`. Search it for `Persona` and `Personality` to find where each file goes in.
- [`src/group-personality.ts`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/src/group-personality.ts) reads `personality.md`. It skips the file if it grows past 4 KB, so a runaway personality can't push the ground rules out.
- [`container/CLAUDE.md`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/container/CLAUDE.md) is NanoClaw's rulebook for every agent. It is what tells Louis that "talk like…" requests go in `personality.md`, and never in their ground rules.

## Where your scheduled tasks went

Scheduled tasks aren't kept in Louis's folder. NanoClaw keeps them itself, because NanoClaw is the one with the clock: it has to wake Louis up, and a sleeping Louis can't watch the time.

List them, from the `nanoclaw` folder:

```bash
cd ~/nanoclaw
pnpm ncl tasks list
```

You have seen this table before, in [Schedule a message](../../04-agent-customisations/05-schedule-a-message/index.md). To see one task in detail, put a name from the `SERIES` column in place of `<name>`:

```bash
pnpm ncl tasks get <name>
```

It shows the task's schedule, how many times it has run or failed, and the last few lines of its diary. The full diary is the file with the same name in `groups/louis/tasks/`.

### The three tasks Louis started with

The daily brief, the week ahead and the memory clean-up came from the template. Each one is a small file: a schedule at the top, and the instructions under it. Open them on [GitHub](../../../glossary.md#github):

| Task | Schedule | File |
| --- | --- | --- |
| Daily brief | `0 7 * * *`, every day at 7am | [`daily-brief.md`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/templates/community/community-assistant/ai.nanoco.nanoclaw/tasks/daily-brief.md) |
| Week ahead | `0 18 * * 0`, Sundays at 6pm | [`weekly-week-ahead.md`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/templates/community/community-assistant/ai.nanoco.nanoclaw/tasks/weekly-week-ahead.md) |
| Memory clean-up | `0 10 * * 0`, Sundays at 10am | [`weekly-memory-hygiene.md`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/templates/community/community-assistant/ai.nanoco.nanoclaw/tasks/weekly-memory-hygiene.md) |

The schedules are [cron](../../../glossary.md#cron) codes. Their life has three steps:

1. **When Louis was made**, NanoClaw read the three files and created a task for each one, all **paused**. That way nothing posts into a community Louis doesn't know yet. The code is [`src/templates/tasks.ts`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/src/templates/tasks.ts).
2. **The first time you talked to Louis**, their welcome instructions told them to turn the tasks on. Read them in the template's [`welcome` skill](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/templates/community/community-assistant/skills/welcome/SKILL.md). Until you sent them your Notion link, each run checked, found nothing to report on, and posted nothing.
3. **When you answered their questions** about when you want summaries, they changed the tasks' times to match.

### Your 5-minute hello

Your hello went through the same door. Louis turned "every 5 minutes" into `*/5 * * * *` and ran NanoClaw's `ncl tasks create` command themselves. They know how, because NanoClaw puts the instructions for it in their `AGENTS.md`. Search that file for `ncl tasks`. The source is [`scheduling.instructions.md`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/container/agent-runner/src/mcp-tools/scheduling.instructions.md).

The limit that made Louis check with you first is in [`src/modules/scheduling/create.ts`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/src/modules/scheduling/create.ts). Search for `MAX_DAILY_FIRES = 4`. Right under it is the warning NanoClaw gave Louis, word for word.

### How a task wakes Louis up

Once a minute, NanoClaw looks for tasks that are due ([`src/host-sweep.ts`](https://github.com/aijutsu/aith-nanoclaw-codex-telegram/blob/ecc4b18ab7e44d106339e72d9e3a366fdf689e25/src/host-sweep.ts)). When one is, it starts a fresh Louis just for that task, and hands them the task's instructions instead of a message from a person. Louis does the job, posts in the group through a message tool, and goes back to sleep. Then NanoClaw writes a line in the task's diary, and works out when to run it next.

That is why your hellos could come a minute or two late. NanoClaw only looks once a minute, and Louis needs a few seconds to wake up.

## Next

You know where everything lives. Some of it, like `personality.md`, exists only because we customised NanoClaw for this course. See what we changed: [Our modified NanoClaw](../04-our-modified-nanoclaw/index.md).
