---
id: setting-up-data-sources # never change this, even if the folder or title changes
title: Setting up data sources
description: Give your agent a place to keep what it learns, using a page in Notion.
---

# Setting up data sources

Your agent can chat, but it has nowhere to keep anything. A **data source** is that place: where it writes down what it learns, and where it looks things up later. Without one, every conversation starts from nothing.

This course uses [Notion](../../glossary.md#notion) as the data source. Notion is a website where you keep pages and tables. Your agent writes to it, and so can you: you can open the same pages in your browser, read what it recorded, and change anything by hand.

Your agent is called **Louis**, and he comes with a ready-made Notion template: sixteen databases for a neighbourhood community. You copy that template into your own workspace, let Louis in, and point him at your copy.

Before you start, finish [Setting up NanoClaw](../02-setting-up-nanoclaw/index.md). Your agent must be running and answering you on Telegram.

## What you need

- **A free Notion account.** If you don't have one, sign up at <https://www.notion.so/>.
- **To be the owner of your Notion workspace.** When you make your own account, you are. If you are using a workspace that belongs to a company or a group, someone else may have to do the connection step for you.

## The steps

Each step has its own page:

| Step | What you do | Why |
| --- | --- | --- |
| [Create the Notion page](./01-notion-page/index.md) | Duplicate one ready-made page into your own workspace. | It holds the sixteen databases Louis works with. He never builds them himself. |
| [Create a Notion connection](./02-notion-connection/index.md) | Make a connection and hand NanoClaw its token. | A connection is how a program signs in to Notion. Without it, Louis can't get in at all. |
| [Connect your Notion page](./03-connect-notion-page/index.md) | Give the connection access to your copy. | A new connection can see nothing until you do. This is the step most people miss. |
| [Connect your agent to Notion](./04-watch-it-fill/index.md) | Send him the link to your copy, and answer a few questions. | Several copies can look alike, so he uses the one you give him — then he starts recording. |

## What Louis keeps there

You don't build any of this, and neither does Louis: the sixteen databases arrive with the template you copy. A few of them, so you know what you are looking at:

| Database | What goes in it |
| --- | --- |
| Members | Who is in your community, how to reach them, and what they can help with. |
| Events | Anything people gather for, and who said they are coming. |
| Items for Loan, Loans | What neighbours have offered to lend, and one row each time something is borrowed. |
| Help Requests, Lost and Found | Things people have asked for or mislaid, so they don't scroll away unanswered. |
| Estate Issues | Broken lifts, dead lights, and what was reported to whom. |
| Admin Log | What Louis did and why, so anyone can check his work. |

The full list is on the first page.

## Next

Start with [Create the Notion page](./01-notion-page/index.md).
