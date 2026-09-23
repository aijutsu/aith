---
id: claude-code # never change this, even if the folder or title changes
title: Install Claude Code (optional)
description: Optional. Install Claude Code, Anthropic's AI helper for the terminal, if you would rather use Claude than Codex as your helper.
---

# Install Claude Code (optional)

This page is optional. You can finish the whole course without it.

[Claude Code](../../../glossary.md#claude-code) is Anthropic's AI helper for the terminal. It does the same job for you as [Codex](../05-codex/index.md): it reads NanoClaw's instructions, and helps you when a step goes wrong. In the next lesson you pick one of the two as your helper.

Your agent always runs on Codex, whichever helper you pick. Claude Code is a helper for you, not a brain for your agent, so it does not replace Codex or your ChatGPT plan.

## Should you install it?

**Install it** if you already pay for Claude Pro or higher, and you would rather work with Claude than with Codex.

**Skip it** if:

- you don't have a Claude plan. Claude Code is not in the free plan, and a paid plan costs money on top of your ChatGPT plan; or
- you are happy to use Codex. Codex does everything this course needs.

If you skip it, use the **Codex** section when you [run NanoClaw's setup](../../02-setting-up-nanoclaw/03-run-setup/index.md).

The steps below are the same on macOS, Windows (in Ubuntu) and Linux, so this page has no sections per system.

## Check if it's already installed

In your [terminal](../01-terminal/index.md), run:

```bash
claude --version
```

- If you see a line like `2.1.272 (Claude Code)`, you already have Claude Code. Skip to [Sign in](#sign-in).
- If you see `command not found: claude`, install it below.

## Install it

In your terminal, run:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

When it finishes, close the terminal and open a new one, so that it finds Claude Code.

## Sign in

In your terminal, start Claude Code:

```bash
claude
```

1. Your browser opens. Sign in to your Claude account, then go back to the terminal. If no browser opens, copy the link that Claude Code shows into your browser.
2. If Claude Code asks whether you trust this folder, say yes.
3. Type `/exit` and press Enter to leave Claude Code.

## Check that it works

In your terminal, run:

```bash
claude auth status --text
```

You should see a few lines. The first starts with `Login method:` and names your Claude plan.

If you see `command not found: claude`, close the terminal, open a new one, and try again. If it says you are not signed in, run `claude` again and sign in.

## Next

Your computer is ready. Next, set up NanoClaw in [Setting up NanoClaw](../../02-setting-up-nanoclaw/index.md).
