---
id: run-setup # never change this, even if the folder or title changes
title: Run NanoClaw's setup
description: Run NanoClaw's setup program, answer its questions, and connect your bot.
---

# Run NanoClaw's setup

NanoClaw comes with a setup program. It installs the rest of what NanoClaw needs, builds your agent, and connects it to Telegram. You answer its questions as it runs.

Your agent runs on Codex. For setup itself, you can use Codex or [Claude Code](../../../glossary.md#claude-code) as your helper. The helper shows you NanoClaw's setup skill, and helps you fix things if setup stops with an error.

## Meet your helper

NanoClaw comes with [skills](../../../glossary.md#skills): instructions that Codex and Claude Code can read. First, see one of them in action. Click the helper you use.

<details name="setup-helper">
<summary>Codex</summary>

You installed Codex in the [Install Codex](../../01-installations/05-codex/index.md) lesson.

1. In your [terminal](../../01-installations/01-terminal/index.md), still in the `nanoclaw` folder, start Codex:

   ```bash
   codex
   ```

   If Codex asks whether you trust this folder, say yes.
2. Type `$setup` and press Enter. Codex reads NanoClaw's setup skill. It tells you to run `bash nanoclaw.sh`.
3. Type `/quit` and press Enter to leave Codex. Setup asks you questions as it runs, so you run it yourself, in the terminal.

If setup stops with an error:

- **After setup has connected Codex,** it asks **Want to debug this with Codex?** Choose **Yes**. Codex opens. It already knows what went wrong, and helps you fix it. Type `/quit` to go back to setup.
- **Before that,** it asks **Claude CLI is needed to diagnose this. Install it now?** Claude needs a Claude plan. If you don't have one, choose **No**. Then start Codex in the `nanoclaw` folder and ask it: "Setup failed. Read logs/setup.log and help me fix it."

</details>

<details name="setup-helper">
<summary>Claude Code</summary>

Claude Code needs a Claude plan: Pro or higher. The free plan doesn't include it. Your agent still runs on Codex, so you also need Codex (from [Install Codex](../../01-installations/05-codex/index.md)) and your ChatGPT plan.

You install Claude Code and sign in on the optional [Install Claude Code](../../01-installations/06-claude-code/index.md) page. If you skipped it, use the **Codex** section instead.

1. In your [terminal](../../01-installations/01-terminal/index.md), go to the `nanoclaw` folder and start Claude Code:

   ```bash
   cd ~/nanoclaw
   claude
   ```

   If Claude Code asks whether you trust this folder, say yes.
2. Type `/setup` and press Enter. Claude Code reads NanoClaw's setup skill. It tells you to run `bash nanoclaw.sh`.
3. Type `/exit` and press Enter to leave Claude Code. Setup asks you questions as it runs, so you run it yourself, in the terminal.

If setup stops with an error:

- **Before setup has connected Codex,** it asks **Want to debug this with Claude?** Choose **Yes**. Claude Code opens. It already knows what went wrong, and helps you fix it. Type `/exit` to go back to setup.
- **After that,** it offers Codex first: **Want to debug this with Codex?** Choose **Yes** to use Codex, and type `/quit` to go back to setup.

</details>

## Before you run setup

- **On a Mac:** make sure OrbStack or Docker Desktop is running.
- **On Windows:** make sure Docker Desktop is running.
- **On Windows or Linux:** run `sudo -v` in your [terminal](../../01-installations/01-terminal/index.md) and type your password. Setup installs some programs, and this lets it do that without stopping to ask.

Have the bot token from [Create your Telegram bot](../01-telegram-bot/index.md) ready. Setup asks for it.

## Run it

In your terminal, in the `nanoclaw` folder, run:

```bash
bash nanoclaw.sh --agent-provider codex
```

`--agent-provider codex` tells setup to run your agent on Codex. Without it, setup uses Claude.

Setup installs the rest of what NanoClaw needs, and builds your agent's container. The first build usually takes 3 to 10 minutes.

## Answer its questions

Use the arrow keys to pick an answer, then press Enter. Answer the questions like this:

| Setup asks | Your answer |
| --- | --- |
| How would you like to begin? | **Standard setup** |
| How should we create your first agent? | **Fresh agent** |
| How would you like to connect Codex? | **Sign in with my ChatGPT subscription**. Sign in in the browser, then go back to the terminal. On Windows, if no browser opens, copy the link into your browser. |
| What should your assistant call you? | Your name |
| What next? | **Continue with setup** |
| I detected … from your computer settings. Is that right? | **Yes**, if it shows your time zone |
| Want to chat with your assistant from your phone? | **Yes, connect Telegram** |
| Connect Telegram? | **Yes, connect Telegram** |
| What should your assistant be called? | A name for your agent. The default is `Nano`. |
| How should this telegram account be registered? | **Owner** |
| Paste the bot token from BotFather | The token from the first page. It stays hidden while you paste. That is normal. |
| Your pairing code is ready | Open your bot in Telegram and send it the 6 digits, as a private message. |

If setup asks something that isn't in this table, such as an offer of a free NanoClaw account, you can skip it.

When setup is done, it says **You're set.**

## If setup stops

Setup offers your helper, as described above. You can also run `bash nanoclaw.sh --agent-provider codex` again: it continues from where it stopped. Setup keeps a record of every step in `logs/setup.log`.

## Next

Your agent is running. Next, [say hi to your agent](../04-say-hi/index.md).
