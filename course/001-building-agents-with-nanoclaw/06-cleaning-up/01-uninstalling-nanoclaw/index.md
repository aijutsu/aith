---
id: uninstalling-nanoclaw # never change this, even if the folder or title changes
title: Uninstalling NanoClaw
description: Remove NanoClaw with its own uninstaller, and delete the folder it left behind.
---

# Uninstalling NanoClaw

[NanoClaw](../../../glossary.md#nanoclaw) comes with its own uninstaller: `uninstall.sh`. It removes the copy of NanoClaw in the folder you run it from, and nothing else. If you have another copy somewhere, that one is left alone.

It asks before it deletes anything, one question per group of things. The answer it suggests is always **no**, so you cannot lose something by pressing Enter too fast.

## See what would be removed

Start with a preview. It changes nothing.

In your [terminal](../../01-installations/02-terminal/index.md), run:

```bash
cd ~/nanoclaw
./uninstall.sh -n
```

`-n` means "no changes". The uninstaller lists what it found for this copy, then ends with `Preview complete. Nothing was changed.`

## Run the uninstaller

When you are ready, in the same terminal, run:

```bash
./uninstall.sh
```

It scans your computer first, and says `Scanned copy … at ~/nanoclaw.` Then it asks about each group of things it found:

| It asks about | What is in it |
| --- | --- |
| 1) App & background service | The service that runs NanoClaw in the background, the box [Docker](../../../glossary.md#docker) runs your agent in (its container), the build that box was made from (its image), and the `ncl` command. Removing these stops your agent. None of your data is here. |
| 2) App data, logs & secrets | Your messages and conversations, the logs, the build files, and your `.env` file, which holds your bot [token](../../../glossary.md#token) and other keys. |
| 3) Your agents' memory & files | The notes and memory your agents wrote. This is content you made, and it cannot be recovered. |
| 4) [OneCLI](../../../glossary.md#onecli) gateway & vault | The credential keeper that setup installed, and every key it holds: your [ChatGPT](../../../glossary.md#chatgpt) sign-in, your [Notion](../../../glossary.md#notion) token, and any others. Delete it if you want a truly fresh start. If you keep it, a new install picks up the same keys again. Other copies of NanoClaw on this computer share it, and stop working until you set it up again. |

For each group, it shows a table of exactly what it found, then asks. Answer like this:

- **Press Enter to keep the group.** That is the suggested answer.
- **Type `y` and press Enter to delete it.**

Nothing is deleted until you have answered every question. If you change your mind while it is still asking, press `Ctrl` and `C` together. It says `Uninstall cancelled. Nothing was deleted.`

When it finishes, it says `✓ Done. NanoClaw copy … has been uninstalled.`

> [!TIP]
> If you delete group 2, the uninstaller copies your `.env` to `.env.bak` in the same folder first. That copy holds your bot token and your keys, so move it somewhere safe if you still need them. It is deleted with the folder in the next step.

## Delete the folder

The uninstaller leaves the `nanoclaw` folder itself, so you decide when it goes. Delete it the way you delete any other folder, or, in your terminal, run:

```bash
cd ~
rm -rf ~/nanoclaw
```

> [!WARNING]
> `rm -rf` deletes a folder and everything in it, with no question and no Trash to get it back from. Type the path exactly as it is written above, and check it before you press Enter.

## What is left on your computer

The uninstaller only removes things that belong to this copy. It leaves:

- **Your [Telegram](../../../glossary.md#telegram) bot.** It lives on Telegram's servers. To delete it, open `@BotFather` in Telegram, send `/deletebot`, and pick your bot. Without this, the bot stays, and it simply has nothing answering for it.
- **Other copies of NanoClaw** on the same computer.
- **OneCLI**, the credential keeper, if you answered no to group 4.
- **Settings shared by every copy**, in `~/.config/nanoclaw/`.
- **The line NanoClaw added to your `~/.bashrc` and `~/.zshrc`**, which tells your terminal where to find commands.
- **The tools from [Getting started](../../01-installations/index.md)**: [Git](../../../glossary.md#git), Docker, [Make](../../../glossary.md#make), [Node.js](../../../glossary.md#node-js), [Codex](../../../glossary.md#codex), and [Claude Code](../../../glossary.md#claude-code). [Uninstalling the tools](../02-uninstalling-tools/index.md) removes them, if you want to.

## If it doesn't run

- **`Can't run the uninstaller: dependencies are missing (node_modules/).`** NanoClaw needs a few of its own files to uninstall itself, and they are gone. Run `bash nanoclaw.sh` once in the `nanoclaw` folder to bring them back, then run `./uninstall.sh` again. The message also prints a list of commands you can run by hand instead.
- **`permission denied`** Run it as `bash uninstall.sh` instead.
- **`✓ Nothing to uninstall — this copy … is already clean.`** There is nothing left to remove. Delete the folder, and you are done.

## Next

NanoClaw is gone. If you also want to remove the tools you installed for it, see [Uninstalling the tools](../02-uninstalling-tools/index.md). Otherwise, you are done.
