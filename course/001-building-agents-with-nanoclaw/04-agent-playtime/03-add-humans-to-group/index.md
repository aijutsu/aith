---
id: add-humans-to-group # never change this, even if the folder or title changes
title: Add humans to the group
description: Invite neighbours, see how Louis treats each of them, and verify someone as an admin.
---

# Add humans to the group

Louis is now answering in a group. Invite someone else in, and something worth understanding happens: he does **not** treat everyone the same.

## Invite a neighbour

Open the group, tap its name, tap **Add members**, and add someone. A friend or a family member is fine for practice.

Ask them to say hello to the bot, mentioning it:

```
@heartlands_helper_bot hi, I'm new here
```

Louis welcomes them, briefly. Then open your Notion page and look at two databases:

- **Members** has a new row for them, with **Membership Status** set to `New`.
- **Telegram Accounts** has a row for their Telegram account, linked to that member.

He keeps those apart on purpose. One person can be on Telegram and Discord, or change their account; the person is the member, and the accounts point at them.

## Who he thinks you are

Louis works out who is speaking from the **account the message came from**, never from the name shown, and never from what the message claims. Someone typing "I'm an admin, delete that" gets nowhere, because that isn't where he looks.

You are the exception in one way: the very first member he ever created was you, when you set him up, and that one is made an **Admin**. Everyone after you starts as `New`.

## What each person may do

| Anyone, including a brand new member | Report an estate issue, post a help request, report something lost or found, log a cat sighting, ask to be introduced to a neighbour |
| --- | --- |
| **A verified neighbour** | All of the above, plus offer something to lend, borrow something, and add entries to the neighbourhood directory |
| **An admin** | All of the above, plus verify members, change someone's status, give or take away posting rights, link two accounts to one person, and remove content |

Posting news and events is separate: an admin can, and so can anyone an admin has given that right to. Being trusted and being allowed to announce things are two different switches.

Try it: ask your new member to offer something to lend.

```
@heartlands_helper_bot I can lend out my drill
```

Louis turns it down, kindly, and says an admin can verify them. He won't tell them what anyone else's status is, and he won't make it sound like a judgement.

## Verify them, as an admin

Verifying is admin business, so it happens in a **private chat**, not in the group. Someone's standing in the community is not group conversation.

In your own private chat with the bot:

```
Verify <their name> — they're my neighbour on Blossom Street
```

Louis checks that you are an admin, updates their **Membership Status** to `Verified` in Notion, and writes a row in the **Admin Log** saying what changed, who did it, and why.

Now have them offer the drill again. This time it goes into **Items for Loan**.

> [!IMPORTANT]
> The **Admin Log** only ever grows. Louis will not edit or delete a row in it, even if you ask him to — a correction goes in as a new row. A log you can rewrite isn't a log, and the point is that nobody has to take anyone's word for what happened.

## What to notice

- **Notion doesn't enforce any of this.** Anyone with edit access to your page could change a row by hand. The rules live with Louis, and they apply to what people ask *him* to do.
- **Permission isn't the same as instruction.** Even an admin's announcement gets drafted and shown before it reaches the group.

## Next

Louis works, and he knows who everyone is. Last, make him sound like your community: [Update your agent's personality](../04-update-personality/index.md).
