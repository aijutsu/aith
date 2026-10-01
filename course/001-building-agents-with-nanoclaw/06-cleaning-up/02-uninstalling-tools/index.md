---
id: uninstalling-tools # never change this, even if the folder or title changes
title: Uninstalling the tools
description: Remove the tools you installed in Getting started, in the right order, if you no longer want them.
---

# Uninstalling the tools

This page removes the tools you installed in [Getting started](../../01-installations/index.md): [Claude Code](../../../glossary.md#claude-code), [Codex](../../../glossary.md#codex), [Node.js](../../../glossary.md#node-js), [Make](../../../glossary.md#make), [Docker](../../../glossary.md#docker), [Git](../../../glossary.md#git), [Homebrew](../../../glossary.md#homebrew), and on Windows, [WSL](../../../glossary.md#wsl).

You don't have to. These are common tools, and other programs on your computer may use them. Skip this page if you are not sure, or if you might build something else soon. Removing one only takes away that tool. None of these steps touch your own files.

> [!IMPORTANT]
> **Uninstall [NanoClaw](../../../glossary.md#nanoclaw) first**, on [Uninstalling NanoClaw](../01-uninstalling-nanoclaw/index.md). NanoClaw's uninstaller needs Node.js and Docker to run, so it has to go before them.

The steps go in the opposite order to Getting started: the last tool you installed comes off first, and Homebrew, which installed most of the others, comes off last.

## Remove them

Click the name of your computer's system to open its section.

<details name="uninstall-tools">
<summary>macOS</summary>

Type each command into [Terminal](../../01-installations/02-terminal/index.md). If a command says that something is not installed, you never had it, or it is already gone: carry on with the next step.

1. **Claude Code**, if you installed it. Run:

   ```bash
   brew uninstall --cask claude-code@latest
   rm -rf ~/.claude ~/.claude.json
   ```

   The first line removes Claude Code. The second removes its settings and your sign-in.
2. **Codex.** Run:

   ```bash
   brew uninstall --cask codex
   rm -rf ~/.codex
   ```

   The first line removes Codex. The second removes its settings and your [ChatGPT](../../../glossary.md#chatgpt) sign-in.
3. **Node.js and [pnpm](../../../glossary.md#pnpm).** Run:

   ```bash
   corepack disable --install-directory "$(brew --prefix)/bin" pnpm
   brew uninstall node@24
   ```

   The first line removes the `pnpm` command. The second removes Node.js.
4. **Make.** Leave it. On a Mac, Make comes with Apple's Command Line Tools, which other programs need too. You didn't install anything extra for it.
5. **Docker.** Remove the one you chose on the Docker page. If you used [OrbStack](../../../glossary.md#orbstack), run:

   ```bash
   brew uninstall --zap --cask orbstack
   ```

   If you used Docker Desktop, run:

   ```bash
   brew uninstall --zap --cask docker-desktop
   ```

   `--zap` also removes the program's settings and everything it stored, including any containers left behind. Type your Mac password if it asks.
6. **Git and [jq](../../../glossary.md#jq).** Run:

   ```bash
   brew uninstall git jq
   ```

   `git --version` may still answer afterwards. That is Apple's own copy of Git, which comes with the Command Line Tools. Leave it.
7. **Homebrew.** Run:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
   ```

   It lists what it will remove, and asks you to type `y` to go ahead. Type your Mac password if it asks.

   Homebrew's uninstaller leaves behind the line you pasted from its **Next steps**, which tells Terminal where `brew` was. Remove it with:

   ```bash
   sed -i '' '/brew shellenv/d' ~/.zprofile
   ```

   This deletes every line in the file `~/.zprofile` that mentions `brew shellenv`, and nothing else.

**Check that it worked.** Close Terminal, open a new one, and run:

```bash
brew --version
```

You should see `command not found: brew`.

</details>

<details name="uninstall-tools">
<summary>Windows</summary>

On Windows, there is a shortcut. Every tool except Docker Desktop lives inside [Ubuntu](../../../glossary.md#ubuntu). Delete Ubuntu, and Homebrew, Git, Make, Node.js, Codex and Claude Code go with it.

> [!WARNING]
> Deleting Ubuntu deletes **every file inside it**, not only the course's tools. If you saved anything of your own in Ubuntu, copy it to Windows first. In the Ubuntu terminal, `explorer.exe .` opens the current Ubuntu folder in File Explorer, so you can drag files out.

1. **Docker Desktop.** Quit Docker Desktop: right-click the whale icon near the clock, and choose **Quit Docker Desktop**. Then click Start, open **Settings**, then **Apps**, then **Installed apps**. Find **Docker Desktop**, click the three dots next to it, and choose **Uninstall**.
2. **Ubuntu.** Click Start and type `PowerShell`. Right-click **Windows PowerShell** and choose **Run as administrator**. Click **Yes**. Then run:

   ```powershell
   wsl --unregister Ubuntu
   ```

   This deletes Ubuntu and everything in it. It finishes in a few seconds.
3. **WSL itself**, only if nothing else on your computer uses it. In the same PowerShell window, run:

   ```powershell
   wsl --uninstall
   ```

   Then restart your computer.

**Check that it worked.** In PowerShell, run:

```powershell
wsl -l -v
```

`Ubuntu` is no longer in the list. If you also removed WSL, you see a message that WSL is not installed.

</details>

<details name="uninstall-tools">
<summary>Linux</summary>

Type each command into the [terminal](../../01-installations/02-terminal/index.md). If a command says that something is not installed, you never had it, or it is already gone: carry on with the next step.

1. **Claude Code**, if you installed it. Run:

   ```bash
   brew uninstall --cask claude-code@latest
   rm -rf ~/.claude ~/.claude.json
   ```

   The first line removes Claude Code. The second removes its settings and your sign-in.
2. **Codex.** Run:

   ```bash
   brew uninstall --cask codex
   rm -rf ~/.codex
   ```

   The first line removes Codex. The second removes its settings and your ChatGPT sign-in.
3. **Node.js and pnpm.** Run:

   ```bash
   corepack disable --install-directory "$(brew --prefix)/bin" pnpm
   brew uninstall node@24
   ```

   The first line removes the `pnpm` command. The second removes Node.js.
4. **Make.** Leave it. Your system's build tools include Make, and other programs on Linux use it.
5. **Docker.** Docker's own install script added several packages. On Ubuntu or Debian, remove them with:

   ```bash
   sudo apt purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
   ```

   On Fedora, run this instead:

   ```bash
   sudo dnf remove -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin docker-ce-rootless-extras
   ```

   Then delete what Docker stored, including any containers left behind:

   ```bash
   sudo rm -rf /var/lib/docker /var/lib/containerd
   ```

   Type your password if it asks.
6. **jq.** On Ubuntu or Debian, run `sudo apt remove -y jq`. On Fedora, run `sudo dnf remove -y jq`. Leave Git: many Linux systems come with it, and other programs use it.
7. **Homebrew.** Run:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/uninstall.sh)"
   ```

   It lists what it will remove, and asks you to type `y` to go ahead. Type your password if it asks.

   Homebrew's uninstaller leaves behind the line you pasted from its **Next steps**, which tells the terminal where `brew` was. Remove it with:

   ```bash
   sed -i '/brew shellenv/d' ~/.bashrc
   ```

   This deletes every line in the file `~/.bashrc` that mentions `brew shellenv`, and nothing else.

**Check that it worked.** Close the terminal, open a new one, and run:

```bash
brew --version
```

You should see `command not found: brew`.

</details>

## Accounts and services

Some of what the course set up isn't on your computer at all. It stays until you remove it where it lives:

- **Your [Telegram](../../../glossary.md#telegram) bot.** Open `@BotFather` in Telegram, send `/deletebot`, and pick your bot. Leave or delete the test group you made, like any other Telegram group.
- **Your [Notion](../../../glossary.md#notion) connection.** Go to [the Developer Connection portal on Notion](https://app.notion.com/developers/connections), where you made it on [Create a Notion connection](../../03-setting-up-data-sources/02-notion-connection/index.md). Open the connection you made for Louis, and delete it. This also cuts off its access to your pages.
- **Your copy of the Louis template.** In Notion, open the page's **•••** menu and choose **Move to Trash**. Everything Louis wrote goes with it.
- **Your ChatGPT plan, and your [Claude](../../../glossary.md#claude) plan if you have one.** Removing Codex or Claude Code doesn't cancel them. Cancel them in your account settings on chatgpt.com and claude.ai, if you no longer want them.

## Next

That is everything the course put on your computer, and everything it set up elsewhere. Thank you for building with us.
