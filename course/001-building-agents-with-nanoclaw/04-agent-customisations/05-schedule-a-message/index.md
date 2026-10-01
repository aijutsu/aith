---
id: schedule-a-message # never change this, even if the folder or title changes
title: Schedule a message
description: Ask Louis to post in the group on a schedule, watch it arrive by itself, then switch it off.
---

# Schedule a message

So far, Louis only speaks when someone speaks to them. A community agent is more useful when they also speak up on their own: a morning summary, a reminder before an event, a weekly look ahead.

These are called **scheduled tasks**. A scheduled task is a job with a clock attached. When the time comes, Louis wakes up, does the job, and posts the result, with nobody asking.

Louis already has three of them, from the template:

| Task | When it runs | What it does |
| --- | --- | --- |
| Daily brief | Every day at 7am | Posts what is on today to the group. |
| Week ahead | Sundays at 6pm | Posts what is coming up in the next week. |
| Memory clean-up | Sundays at 10am | Checks their notes against your [Notion](../../../glossary.md#notion) page, and tells the admins about anything that looks wrong. |

Louis turned these on the first time you talked. You'll see where they live in [NanoClaw's insides](../../05-concept-recap/03-nanoclaw-internals/index.md).

Waiting until 7am tomorrow is a slow way to learn, so in this step you make one that runs **every 5 minutes**. In real life you would choose "every morning" or "every Sunday". Every 5 minutes is only so that you can see it happen in class.

## Ask Louis to schedule it

In your **private chat** with the bot, send:

```text wrap
Every 5 minutes, post a Singaporean joke to Angel View with the current time. This is a classroom demo, so I want it more often than usual.
```

**Louis will push back**. [NanoClaw](../../../glossary.md#nanoclaw) doesn't let a task run more than 4 times a day unless you insist, and every 5 minutes is 288 times a day. Each run wakes Louis up, and every time they wake up, they use part of your [ChatGPT](../../../glossary.md#chatgpt) plan. The limit stops a mistake from quietly using it all up.

So they explain the limit and ask if you are sure. Answer Louis clearly:

```text wrap
Yes, I understand that it uses up my ChatGPT plan. Go ahead for the demo. I'll ask you to stop it in a few minutes.
```

Louis creates the task and tells you when it first runs.

> [!WARNING]
> Don't forget about this task. Left on, it posts 288 messages a day and uses up your plan. The last section on this page switches it off.

## Watch it arrive

Open Angel View in [Telegram](../../../glossary.md#telegram) and wait. Within about 5 minutes, Louis posts a hello with the time, and nobody asked them to. They keep doing it every 5 minutes.

It can be a minute or two late. NanoClaw checks for tasks that are due once a minute, and Louis needs a few seconds to wake up.

## See it from the terminal

Louis keeps track of their tasks on your computer, and you can read the list yourself. In your [terminal](../../01-installations/02-terminal/index.md), go to the NanoClaw folder and list them:

```bash
cd ~/nanoclaw
pnpm ncl tasks list
```

`ncl` is NanoClaw's own command for looking inside it. You see a table with one row per task. The `SCHEDULE` column shows when each one runs, in a short code, `NEXT RUN` shows when it runs next, and `RUNS` counts how many times it has run so far. You should find four rows: your hello, and the three from the template.

The schedule code for your task looks like `*/5 * * * *`. It is called a [cron](../../../glossary.md#cron) expression, and it means "every 5 minutes". The daily brief's is `0 7 * * *`: minute 0 of hour 7, every day.

## Switch it off

In your private chat with the bot, send:

```text wrap
Please delete the 5-minute hello task. Leave the other tasks alone.
```

Louis deletes it and tells you. Check Angel View for 10 minutes: no more hellos.

If they can't, or you want to be sure, stop it from the terminal instead. Run `pnpm ncl tasks list` again, find your task's name in the `SERIES` column, and cancel it, putting that name in place of `<name>`:

```bash
pnpm ncl tasks cancel <name>
```

Don't use `cancel --all`. It stops the three tasks from the template as well.

## What to notice

- **You asked in plain words, and Louis wrote the schedule.** You never typed `*/5 * * * *`. They turned "every 5 minutes" into the code, then used their own `ncl` command to create the task.
- **The limit is there to protect you.** Louis didn't simply do what you asked. They checked first, because the cost lands on you.
- **A real schedule is just a different sentence.** "Every weekday at 8am, remind the group about anything due that day" is the same step, with a time that won't use up your plan.

## Next

You have an agent that lives in a real group, knows who people are, writes what it learns into Notion, sounds like your community, and speaks up on a schedule. Next, step back and see how it all fits together: [Concept recap](../../05-concept-recap/index.md).
