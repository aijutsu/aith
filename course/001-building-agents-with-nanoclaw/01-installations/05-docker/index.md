---
id: docker # never change this, even if the folder or title changes
title: Install Docker
description: Install Docker, which runs your agent in a closed box so it can't touch the rest of your computer.
---

# Install Docker

NanoClaw runs your agent inside [Docker](../../../glossary.md#docker). Docker puts the agent in a closed box, called a container, so the agent can't touch the rest of your computer.

## Install it

Click the name of your computer's system to open its section.

<details name="docker">
<summary>macOS</summary>

**Check if it's already installed.** In [Terminal](../01-terminal/index.md), run:

```bash
docker --version
```

- If you see a line like `Docker version 29.4.0, build 9d7ad9f`, you already have Docker. Skip to **Check that it works** at the bottom of this section.
- If you see `command not found: docker`, install one of the two below.

**Install it.** On a Mac, you can use OrbStack or Docker Desktop. Both give you the `docker` command that NanoClaw needs. You only need one of them.

**Recommended: OrbStack.** [OrbStack](../../../glossary.md#orbstack) is smaller and lighter than Docker Desktop, so your Mac stays fast. It is free for personal use. If you use it for work, your company needs a paid licence.

1. In the terminal, install OrbStack with [Homebrew](../02-homebrew/index.md):

   ```bash
   brew install --cask orbstack
   ```

2. Open **OrbStack** from your Applications folder.
3. If OrbStack asks what you want to use it for, choose **Docker**. If it asks for your Mac password, type it. OrbStack needs it to set up the `docker` command.

NanoClaw needs OrbStack to be running. Open OrbStack before you use NanoClaw.

**Or: Docker Desktop.** Docker Desktop is free for personal use, education, and small businesses.

1. In the terminal, install Docker Desktop with [Homebrew](../02-homebrew/index.md):

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

**Check that it works.** In the terminal, run:

```bash
docker run hello-world
```

Docker downloads a tiny test program and runs it. You should see `Hello from Docker!`.

If you see `Cannot connect to the Docker daemon`, Docker is installed but not running. Open OrbStack or Docker Desktop from your Applications folder, wait until it has started, and run the command again.

</details>

<details name="docker">
<summary>Windows</summary>

On Windows, you install Docker Desktop on Windows itself. It then gives Ubuntu a `docker` command. Don't install Docker inside Ubuntu.

**Check if it's already installed.** In the [Ubuntu terminal](../01-terminal/index.md), run:

```bash
docker --version
```

- If you see a line like `Docker version 29.4.0, build 9d7ad9f`, Docker Desktop is installed and Ubuntu can see it. Skip to **Check that it works** at the bottom of this section.
- If you see `command not found: docker`, either Docker Desktop isn't installed, or its WSL integration is off. Do the steps below. If Docker Desktop is already on your computer, you only need steps 6 and 7.

**Install it.** Docker Desktop is a Windows program, so you install it on the Windows side, with [Chocolatey](../03-chocolatey/index.md).

1. Click Start and type `PowerShell`. Right-click **Windows PowerShell** and choose **Run as administrator**. Click **Yes**.
2. In PowerShell, run:

   ```powershell
   choco install docker-desktop -y
   ```

   This downloads and installs Docker Desktop. It takes a few minutes. If Chocolatey says it needs to restart your computer, let it finish first, then restart.
3. Click Start, type `Docker Desktop`, and open it. Read the Docker Subscription Service Agreement and click **Accept**. Docker Desktop is free for personal use, education, and small businesses.
4. You don't need a Docker account. If Docker asks you to sign in, you can skip it.
5. In Docker Desktop, open **Settings** (the gear icon), then **Resources**, then **WSL integration**. Turn on **Ubuntu** and click **Apply**.
6. Close the Ubuntu terminal and open it again, so that it finds Docker.

If Chocolatey can't install it, download Docker Desktop by hand instead, from <https://docs.docker.com/desktop/setup/install/windows-install/>. Most computers need the x86_64 version. Keep **Use WSL 2 instead of Hyper-V** ticked, then carry on from step 3 above.

NanoClaw needs Docker Desktop to be running. To start it every time you turn on your computer, open Docker Desktop's **Settings**, then **General**, and turn on **Start Docker Desktop when you sign in to your computer**.

**Check that it works.** In the Ubuntu terminal, run:

```bash
docker run hello-world
```

Docker downloads a tiny test program and runs it. You should see `Hello from Docker!`.

If you see `Cannot connect to the Docker daemon`, Docker is installed but not running. Open Docker Desktop, wait until it says Docker is running, and run the command again.

</details>

<details name="docker">
<summary>Linux</summary>

**Check if it's already installed.** In the [terminal](../01-terminal/index.md), run:

```bash
docker --version
```

- If you see a line like `Docker version 29.4.0, build 9d7ad9f`, you already have Docker. Skip to **Check that it works** at the bottom of this section.
- If you see `command not found: docker`, do the steps below.

**Install it.**

1. In the terminal, download and run Docker's install script:

   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   ```

   This installs Docker Engine and starts it. It takes a few minutes.
2. In the terminal, let your user run Docker without typing `sudo` every time:

   ```bash
   sudo usermod -aG docker $USER
   ```

   This gives your user full control of Docker, like an administrator. Only do this on your own computer.
3. Log out of your computer and log in again, so that the change takes effect. Then open a new terminal.

**Check that it works.** In the terminal, run:

```bash
docker run hello-world
```

Docker downloads a tiny test program and runs it. You should see `Hello from Docker!`.

If you see `Cannot connect to the Docker daemon` or `permission denied`, log out of your computer and log in again, then try once more. Step 2 only takes effect in a new login.

</details>

## Next

Docker is ready. Next, install [Make](../06-make/index.md).
