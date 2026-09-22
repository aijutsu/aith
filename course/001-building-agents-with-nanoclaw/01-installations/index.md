---
id: installations # never change this, even if the folder or title changes
title: Installations
description: Get your computer ready for the course, with a terminal, Git, Docker and Codex.
---

# Installations

In this lesson, you get your computer ready. You install the tools that NanoClaw needs: Git, Docker and Codex. In the next lesson, you use them to set up NanoClaw.

## Pre-requisites

1. A free Telegram account. If you don't have one, sign up at <https://telegram.org/>.
1. A free Notion account. If you don't have one, sign up at <https://www.notion.so/>.
1. Administrator access to your computer.
1. At least a ChatGPT Plus subscription (~$30/month version).
1. Optional: a Claude Pro plan or higher, if you want to use Claude Code as your helper when you [set up NanoClaw](../02-setting-up-nanoclaw/index.md#step-3-set-up-nanoclaw).
1. A computer that can run Docker, with at least 8 GB of memory:
   - **Mac:** macOS 14 (Sonoma) or newer.
   - **Windows:** Windows 11, or Windows 10 version 22H2. Microsoft stopped supporting Windows 10 in October 2025, so Windows 11 is best.
   - **Linux:** Ubuntu 22.04, 24.04 or 26.04.
1. Git and Docker. You install them in [Step 2](#step-2-install-git) and [Step 3](#step-3-install-docker) below.

## Installation steps

Some steps are different on macOS, Windows and Linux. Those steps have one section for each. Click the name of your computer's system to open its section.

### Step 1: Open a terminal

A [terminal](../../glossary.md#terminal) is a window where you type commands for your computer. You use it for most of this course.

<details name="terminal">
<summary>macOS</summary>

1. Press Command (⌘) and Space together. This opens Spotlight search.
2. Type `Terminal` and press Return.

A window opens. This is where you type commands.

</details>

<details name="terminal">
<summary>Windows</summary>

NanoClaw can't run on Windows by itself. It runs inside [WSL](../../glossary.md#wsl), a part of Windows that runs Linux. You install WSL once. After that, you type every command in this course into its Ubuntu terminal.

1. Click Start and type `PowerShell`. Right-click **Windows PowerShell** and choose **Run as administrator**. Click **Yes**.
2. Type this command and press Enter:

   ```powershell
   wsl --install
   ```

   Windows downloads WSL and [Ubuntu](../../glossary.md#ubuntu). This takes a few minutes.

   If the command only shows a help text, WSL is already on your computer. Run `wsl --install -d Ubuntu` instead.
3. Restart your computer.
4. Click Start, type `Ubuntu`, and open it.
5. Ubuntu asks you to make a username and a password. They don't need to match your Windows ones. While you type the password, nothing shows on the screen. That is normal. Remember this password: Ubuntu asks for it when you install things.
6. Update Ubuntu with this command:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

   `sudo` means "run this as an administrator", so Ubuntu asks for the password you just made.

From now on, "open a terminal" means: click Start, type `Ubuntu`, and open it. Type the commands in this course there, not in PowerShell.

</details>

<details name="terminal">
<summary>Linux</summary>

Press Ctrl, Alt and T together. A terminal window opens.

If nothing happens, open your list of apps and search for `Terminal`.

</details>

### Step 2: Install Git

[Git](../../glossary.md#git) keeps the history of a project's files. You use it to download NanoClaw in the next lesson.

The same command also installs jq, a small tool that NanoClaw's setup uses to check your Telegram bot.

<details name="git">
<summary>macOS</summary>

On a Mac, you install Git with [Homebrew](../../glossary.md#homebrew). NanoClaw's setup uses Homebrew too.

1. Copy this command into the terminal and press Return:

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Type your Mac password when it asks, and press Return. Nothing shows while you type. That is normal.
3. Press Return again to start. Homebrew also installs Apple's Command Line Tools. This can take 5 to 10 minutes.
4. At the end, Homebrew may show **Next steps** with a few commands. Copy those commands into the terminal and press Return.
5. Install Git and jq:

   ```bash
   brew install git jq
   ```

</details>

<details name="git">
<summary>Windows</summary>

Git goes inside Ubuntu, not on Windows itself. You don't need "Git for Windows".

In the Ubuntu terminal, run:

```bash
sudo apt update && sudo apt install -y git curl jq
```

Type your Ubuntu password if it asks. Ubuntu usually has Git already. The command then just makes sure it's up to date.

</details>

<details name="git">
<summary>Linux</summary>

On Ubuntu or Debian, run:

```bash
sudo apt update && sudo apt install -y git curl jq
```

On Fedora, run:

```bash
sudo dnf install -y git curl jq
```

Type your password if it asks.

</details>

To check that Git works, run:

```bash
git --version
```

You should see a line like `git version 2.55.0`. Your number may be different.

### Step 3: Install Docker

NanoClaw runs your agent inside [Docker](../../glossary.md#docker). Docker puts the agent in a closed box, called a container, so the agent can't touch the rest of your computer.

<details name="docker">
<summary>macOS</summary>

On a Mac, you can use OrbStack or Docker Desktop. Both give you the `docker` command that NanoClaw needs. You only need one of them.

**Recommended: OrbStack.** [OrbStack](../../glossary.md#orbstack) is smaller and lighter than Docker Desktop, so your Mac stays fast. It is free for personal use. If you use it for work, your company needs a paid licence.

1. Install OrbStack with Homebrew:

   ```bash
   brew install orbstack
   ```

2. Open **OrbStack** from your Applications folder.
3. If OrbStack asks what you want to use it for, choose **Docker**. If it asks for your Mac password, type it. OrbStack needs it to set up the `docker` command.

NanoClaw needs OrbStack to be running. Open OrbStack before you use NanoClaw.

**Or: Docker Desktop.** Docker Desktop is free for personal use, education, and small businesses.

1. Install Docker Desktop with Homebrew:

   ```bash
   brew install --cask docker-desktop
   ```

   Type your Mac password if it asks.
2. Open **Docker** from your Applications folder.
3. Read the Docker Subscription Service Agreement and click **Accept**.
4. Choose **Use recommended settings** and click **Finish**. Type your Mac password if it asks.
5. You don't need a Docker account. If Docker asks you to sign in, you can skip it.
6. Wait until Docker Desktop says that Docker is running. A whale icon appears in the menu bar at the top of the screen.

NanoClaw needs Docker Desktop to be running. To start it every time you turn on your Mac, open Docker Desktop's **Settings**, then **General**, and turn on **Start Docker Desktop when you sign in to your computer**.

</details>

<details name="docker">
<summary>Windows</summary>

On Windows, you install Docker Desktop on Windows itself. It then gives Ubuntu a `docker` command. Don't install Docker inside Ubuntu.

1. Go to <https://docs.docker.com/desktop/setup/install/windows-install/> and download Docker Desktop for Windows. Most computers need the x86_64 version.
2. Open the file you downloaded, `Docker Desktop Installer.exe`.
3. Keep **Use WSL 2 instead of Hyper-V** ticked. Follow the steps, then click **Close**.
4. Click Start, type `Docker Desktop`, and open it. Read the Docker Subscription Service Agreement and click **Accept**. Docker Desktop is free for personal use, education, and small businesses.
5. You don't need a Docker account. If Docker asks you to sign in, you can skip it.
6. In Docker Desktop, open **Settings** (the gear icon), then **Resources**, then **WSL integration**. Turn on **Ubuntu** and click **Apply**.
7. Close the Ubuntu terminal and open it again, so that it finds Docker.

NanoClaw needs Docker Desktop to be running. To start it every time you turn on your computer, open Docker Desktop's **Settings**, then **General**, and turn on **Start Docker Desktop when you sign in to your computer**.

</details>

<details name="docker">
<summary>Linux</summary>

1. Download and run Docker's install script:

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

   This installs Docker Engine and starts it. It takes a few minutes.
2. Let your user run Docker without typing `sudo` every time:

   ```bash
   sudo usermod -aG docker $USER
   ```

   This gives your user full control of Docker, like an administrator. Only do this on your own computer.
3. Log out of your computer and log in again, so that the change takes effect. Then open a new terminal.

</details>

To check that Docker works, run:

```bash
docker run hello-world
```

Docker downloads a tiny test program and runs it. You should see `Hello from Docker!`.

If you see `Cannot connect to the Docker daemon`, Docker isn't running. On a Mac, open OrbStack or Docker Desktop. On Windows, open Docker Desktop and wait until it's running. On Linux, log out and log in again.

### Step 4: Install Codex

[Codex](../../glossary.md#codex) is OpenAI's AI helper. NanoClaw's setup needs it to connect your agent to your ChatGPT account. You also use Codex later in this course, to change your agent.

The command is the same on macOS, Windows (in Ubuntu) and Linux:

```bash
curl -fsSL https://chatgpt.com/codex/install.sh | sh
```

At the end, it says `Codex CLI … installed successfully`. Close the terminal and open a new one, so that it finds Codex.

Then start Codex and sign in:

```bash
codex
```

1. Choose **Sign in with ChatGPT**. Your browser opens.
2. Sign in to your ChatGPT account, then go back to the terminal. If no browser opens, copy the link that Codex shows into your browser.
3. Type `/quit` and press Enter to leave Codex.

## Next

Your computer is ready. Next, set up NanoClaw in [Setting up NanoClaw](../02-setting-up-nanoclaw/index.md).
