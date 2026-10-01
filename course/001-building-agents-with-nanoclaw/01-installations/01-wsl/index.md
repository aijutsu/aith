---
id: wsl # never change this, even if the folder or title changes
title: Install WSL (Windows only)
description: On Windows, install WSL and Ubuntu, the Linux that NanoClaw and every tool in this course run inside.
---

# Install WSL (Windows only)

> [!NOTE]
> **On macOS and Linux, skip this page.** Your computer can already run everything in this course. Go to [Open a terminal](../02-terminal/index.md).

[NanoClaw](../../../glossary.md#nanoclaw) can't run on Windows by itself. It runs inside [WSL](../../../glossary.md#wsl), a part of Windows that runs Linux. With WSL you get [Ubuntu](../../../glossary.md#ubuntu), a popular version of Linux, running inside Windows like any other app.

You install WSL once. After that, almost everything in this course happens inside Ubuntu: you type your commands into Ubuntu's [terminal](../../../glossary.md#terminal), and the tools on the next pages are installed in there. The one exception is [Docker](../../../glossary.md#docker) Desktop, a normal Windows app with its own installer.

This page uses **PowerShell**, a command window that comes with Windows. It is the only page in the course where you need it.

## Check if it's already installed

Click Start and type `PowerShell`. Right-click **Windows PowerShell** and choose **Run as administrator**. Click **Yes**. Then run:

```powershell
wsl -l -v
```

- If you see a list with `Ubuntu` in it, WSL and Ubuntu are already installed. Check the **VERSION** column next to `Ubuntu`: it must say `2`. Then skip to step 3 below.
- If it says `1`, run `wsl --set-version Ubuntu 2` and wait. Version 1 is an older way of running Linux, and some of the programs in this course don't work properly on it. Then skip to step 3 below.
- If you see an error, or a list without `Ubuntu`, start at step 1.

## Install it

1. In the same PowerShell window, type this command and press Enter:

   ```powershell
   wsl --install
   ```

   Windows downloads WSL and Ubuntu. This takes a few minutes.

   If the command only shows a help text, WSL is already on your computer. Run `wsl --install -d Ubuntu` instead.
2. Restart your computer.
3. Click Start, type `Ubuntu`, and open it. The first time, it takes a minute to finish setting itself up.
4. Ubuntu asks you to make a username and a password. They don't need to match your Windows ones. While you type the password, nothing shows on the screen. That is normal. Remember this password: Ubuntu asks for it when you install things.

   If Ubuntu doesn't ask, you already made them earlier. Use those.
5. In the Ubuntu window, update Ubuntu with this command:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

   `sudo` means "run this as an administrator", so Ubuntu asks for the password you just made.

## Check that it works

Open PowerShell again, the same way as before, and run:

```powershell
wsl -l -v
```

You should see `Ubuntu` in the list, with `2` in the **VERSION** column. Close PowerShell: you won't need it again.

## Next

WSL is ready. Next, [open a terminal](../02-terminal/index.md) — on Windows, that means opening Ubuntu.
