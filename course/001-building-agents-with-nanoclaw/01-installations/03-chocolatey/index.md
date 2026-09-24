---
id: chocolatey # never change this, even if the folder or title changes
title: Install Chocolatey (Windows)
description: Install Chocolatey, the app store for the terminal on Windows, which installs Docker Desktop later.
---

# Install Chocolatey (Windows)

> [!NOTE]
> **On macOS and Linux, skip this page.** [Homebrew](../02-homebrew/index.md) already does this job for you. Go to [Install Git](../04-git/index.md).

[Chocolatey](../../../glossary.md#chocolatey) is an app store for the terminal on Windows. It does the same job as Homebrew: you ask for a program by name, and Chocolatey installs it.

## Why you need both

A Windows computer running this course has two sides, and each side has its own app store:

| Side | App store | What it installs here |
| --- | --- | --- |
| **Windows itself** | Chocolatey | Docker Desktop, on the [Docker](../05-docker/index.md) page. |
| **Ubuntu**, inside Windows | [Homebrew](../02-homebrew/index.md) and `apt` | Everything else: Git, Make, Codex, Claude Code, and NanoClaw itself. |

Docker Desktop is a Windows program, which is why it needs the Windows side. Your agent runs inside Ubuntu.

## Install it

Chocolatey installs itself from PowerShell, and it needs administrator rights.

1. Click Start and type `PowerShell`. Right-click **Windows PowerShell** and choose **Run as administrator**. Click **Yes**.

   This is the one place in the course where you use PowerShell, not the Ubuntu terminal.
2. Copy this whole line into PowerShell and press Enter:

   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

   It is one command, even though it fills several lines on screen. Paste it in one go.
3. Wait until it finishes and the prompt comes back.
4. Close PowerShell.

## Check that it works

Open PowerShell as administrator again, the same way as step 1, and run:

```powershell
choco --version
```

You should see a version number, like `2.6.0`. Your number may be different.

If you see that `choco` is not recognised, close PowerShell and open a new one as administrator. Chocolatey only appears in windows opened after it was installed.

> [!TIP]
> Open PowerShell as administrator whenever you use `choco`. Installing programs needs those rights, and Chocolatey stops with an access error without them.

## Next

Both app stores are ready. Next, [install Git](../04-git/index.md).
