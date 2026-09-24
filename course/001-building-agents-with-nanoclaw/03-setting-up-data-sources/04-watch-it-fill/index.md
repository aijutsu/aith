---
id: watch-it-fill # never change this, even if the folder or title changes
title: Connect your agent to Notion
description: Give Louis the link to your copy of the template, then watch him record what you tell him.
---

# Connect your agent to Notion

Louis can reach Notion now, but he doesn't know which page is yours. A workspace can hold several copies of the template, all with the same name, so he never goes looking for it: he uses the link you give him, and remembers it.

This is the last step. After it, Louis works.

## Give him the link

1. Open your copy of the Louis template in Notion.
2. Copy its link: click **Share** at the top right, then **Copy link**. You can also copy the web address from your browser.
3. In your Telegram chat with the bot, send the link, and say it is your copy. For example:

   ```
   Here's our community page: <paste the link>
   ```

Louis opens it and checks it over. He confirms that all sixteen databases are there, and that they point at each other inside your copy rather than back at the original. Then he remembers the page, and doesn't ask again.

If something is wrong with the copy, he says which database is missing and stops. Copy the template again, from [the last page but one](../01-notion-page/index.md), and send him the new link.

## Answer a few questions

Louis now asks you a short set of questions, one message at a time: what your community is called, where it is, which group chats he should post into, and when you want his daily and weekly summaries. Answer in your own words. You can skip anything.

You become the community's first **admin**, so Louis adds you to the Members database as he goes.

## Put something in it

Tell Louis something worth keeping. For example:

```
Add me as a member. I'm on Blossom Street and I can lend a pressure washer.
```

Then open your copy in Notion and look at **Members**. There you are, with what you said about yourself. **Items for Loan** has your pressure washer.

That loop — you say it in chat, Louis writes it into Notion — is the whole point of a data source. From here you can tell him about an event, ask who is coming, report a broken lift, or ask what the neighbours have lent out.

## If something doesn't work

Louis explains problems in plain words, but he may quote one of these:

| What Louis says | What it means | What to do |
| --- | --- | --- |
| `401`, `unauthorized`, or "API token is invalid" | NanoClaw doesn't have your token, or it is the wrong one. | Run `make add-notion-connection` again, from [Create a Notion connection](../02-notion-connection/index.md). |
| `object_not_found`, on a page you can see | The token is fine. The connection has no access to your copy. | Give it access: [Connect your Notion page](../03-connect-notion-page/index.md). |
| `restricted_resource` | The connection can read, but not write. | On the connection's **Capabilities**, turn on updating and inserting content. |
| A database is missing | The copy didn't come through whole. | Copy the template again and send Louis the new link. |
| The rows look like somebody else's community | Louis is pointed at the original template, or another copy. | Send him the link to your own copy, and check the **Share** menu says your workspace. |

If Louis doesn't answer at all, it isn't a Notion problem: check that your computer is on and Docker is running.

## Next

Louis has a memory you can read. Now put him in front of people: [Agent playtime](../../04-agent-playtime/index.md).
