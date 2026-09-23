---
id: codex # never change this, even if the folder or title changes
title: Install Codex
description: Install Codex, OpenAI's AI helper for the terminal, and sign it in to your ChatGPT account.
---

# Install Codex

[Codex](../../../glossary.md#codex) is OpenAI's AI helper for the terminal. It is the part that thinks: your agent uses it to understand messages and write answers. NanoClaw's setup needs it to connect your agent to your ChatGPT account. You also use Codex later in this course, to change your agent.

Codex needs at least a ChatGPT Plus subscription.

The steps are the same on macOS, Windows (in Ubuntu) and Linux, so this page has no sections per system.

## Check if it's already installed

In your [terminal](../01-terminal/index.md), run:

```bash
codex --version
```

- If you see a line like `codex-cli 0.154.0`, you already have Codex. Skip to [Sign in](#sign-in).
- If you see `command not found: codex`, install it below.

## Install it

In your terminal, run:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

At the end, it says `Codex CLI … installed successfully`. Close the terminal and open a new one, so that it finds Codex.

## Sign in

In your terminal, start Codex:

```bash
codex
```

1. Choose **Sign in with ChatGPT**. Your browser opens.
2. Sign in to your ChatGPT account, then go back to the terminal. If no browser opens, copy the link that Codex shows into your browser.
3. Type `/quit` and press Enter to leave Codex.

## Check that it works

In your terminal, run:

```bash
codex login status
```

You should see `Logged in using ChatGPT`.

If you see anything else, run `codex` again and sign in. If you see `command not found: codex`, close the terminal, open a new one, and try again.

## Next

Your computer is ready.

One page is left, and it is optional: [Install Claude Code](../06-claude-code/index.md), if you would rather use Claude than Codex as your helper. Otherwise, go straight to [Setting up NanoClaw](../../02-setting-up-nanoclaw/index.md).
