---
id: terminal # never change this, even if the folder or title changes
title: Open a terminal
description: Open the window where you type the commands for this course. On Windows, you install Linux first.
---

# Open a terminal

A [terminal](../../../glossary.md#terminal) is a window where you type commands for your computer, instead of clicking on things. You use it for every other tool in this lesson, and for most of this course.

## Open it

Steps are different on macOS, Windows and Linux. Click the name of your computer's system to open its section.

<details name="terminal">
<summary>macOS</summary>

**Check if it's already installed.** Every Mac comes with Terminal. There is nothing to install: you only need to open it.

**Open it.**

1. Press Command (⌘) and Space together. This opens Spotlight search.
2. Type `Terminal` and press Return.

A window opens. This is where you type commands.

**Check that it works.** In the Terminal window that just opened, type this and press Return:

```bash
echo "hello"
```

You should see `hello` on the next line. That means the terminal is taking your commands.

</details>

<details name="terminal">
<summary>Windows</summary>

NanoClaw can't run on Windows by itself. It runs inside [WSL](../../../glossary.md#wsl), a part of Windows that runs Linux. You install WSL once. After that, you type every command in this course into its Ubuntu terminal.

**Check if it's already installed.** Click Start and type `PowerShell`. Right-click **Windows PowerShell** and choose **Run as administrator**. Click **Yes**. Then run:

```powershell
wsl -l -v
```

- If you see a list with `Ubuntu` in it, WSL and Ubuntu are already installed. Check the **VERSION** column next to `Ubuntu`: it must say `2`. Then skip to step 3.
- If it says `1`, run `wsl --set-version Ubuntu 2` and wait. Version 1 is an older way of running Linux, and some of the programs in this course don't work properly on it.
- If you see an error, or a list without `Ubuntu`, start at step 1.

**Install it.**

1. In the same PowerShell window, type this command and press Enter:

   ```powershell
   wsl --install
   ```

   Windows downloads WSL and [Ubuntu](../../../glossary.md#ubuntu). This takes a few minutes.

   If the command only shows a help text, WSL is already on your computer. Run `wsl --install -d Ubuntu` instead.
2. Restart your computer.
3. Click Start, type `Ubuntu`, and open it.
4. Ubuntu asks you to make a username and a password. They don't need to match your Windows ones. While you type the password, nothing shows on the screen. That is normal. Remember this password: Ubuntu asks for it when you install things.

   If Ubuntu doesn't ask, you already made them earlier. Use those.
5. In the Ubuntu terminal, update Ubuntu with this command:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

   `sudo` means "run this as an administrator", so Ubuntu asks for the password you just made.

From now on, "open a terminal" means: click Start, type `Ubuntu`, and open it. Type the commands in this course there, not in PowerShell.

**Check that it works.** In the Ubuntu terminal, type this and press Enter:

```bash
echo "hello"
```

You should see `hello` on the next line. That means the terminal is taking your commands.

</details>

<details name="terminal">
<summary>Linux</summary>

**Check if it's already installed.** Every Linux desktop comes with a terminal. There is nothing to install: you only need to open it.

**Open it.** Press Ctrl, Alt and T together. A terminal window opens.

If nothing happens, open your list of apps and search for `Terminal`.

**Check that it works.** In the terminal window that just opened, type this and press Enter:

```bash
echo "hello"
```

You should see `hello` on the next line. That means the terminal is taking your commands.

</details>

## Next

Your terminal is open. Next, install [Homebrew](../02-homebrew/index.md).
