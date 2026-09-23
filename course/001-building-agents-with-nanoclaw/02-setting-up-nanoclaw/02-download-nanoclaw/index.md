---
id: download-nanoclaw # never change this, even if the folder or title changes
title: Download NanoClaw
description: Copy NanoClaw onto your computer with Git, into a folder called nanoclaw.
---

# Download NanoClaw

Now you copy NanoClaw onto your computer. You use [Git](../../../glossary.md#git) for this, which you installed in [Install Git](../../01-installations/02-git/index.md).

This downloads [our copy of NanoClaw](https://github.com/aijutsu/aith-nanoclaw-codex-telegram), the one that works with Telegram and Codex.

## Download it

In your [terminal](../../01-installations/01-terminal/index.md), run these three commands, one after the other:

```bash
cd ~
git clone https://github.com/aijutsu/aith-nanoclaw-codex-telegram.git nanoclaw
cd nanoclaw
```

- `cd ~` goes to your home folder. On Windows, this keeps NanoClaw inside Ubuntu, where it runs faster than on your C: drive.
- `git clone` downloads our copy of NanoClaw into a new folder called `nanoclaw`. You see `Cloning into 'nanoclaw'...`.
- `cd nanoclaw` moves you into that folder.

> [!IMPORTANT]
> Don't move or rename the `nanoclaw` folder after setup. NanoClaw names its background service after the folder, and moving it breaks the link.

## Check that it works

Still in the terminal, run:

```bash
ls
```

You should see NanoClaw's files, including `nanoclaw.sh`. That is the setup program you run on the next page.

## Next

NanoClaw is on your computer. Next, [run NanoClaw's setup](../03-run-setup/index.md).
