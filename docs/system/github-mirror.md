# Gitea and the GitHub mirror

| Where | What | Who can see it |
| --- | --- | --- |
| https://gohan.aijutsu.dev/aijutsu/aith (`git@gohans.aijutsu.dev:aijutsu/aith.git`) | **The source of truth.** All work lands here, and CI runs here (`.gitea/workflows/`). | The Aijutsu team, behind Cloudflare Access |
| https://github.com/aijutsu/aith | A **read-only public mirror**. The site's "Suggest a change on GitHub" and source links, and the README's clone command, point here. | Everyone |

Gitea's built-in **push mirror** copies the repository to GitHub (Gitea › aijutsu/aith › Settings › Repository › Mirror Settings › Push Mirror). There is no workflow or Actions secret for it: the GitHub token is saved in the push mirror's own settings.

## Rules

- **Never merge a pull request on GitHub, and never push to GitHub by hand.** The push mirror force-pushes every branch and tag, and deletes GitHub branches that Gitea doesn't have. Anything that lands only on GitHub is silently erased at the next sync, with no error. So take a GitHub pull request into Gitea instead:

  ```bash
  git fetch github pull/<number>/head:pr-<number>   # the `github` remote is github.com/aijutsu/aith
  git switch main && git merge --no-ff pr-<number>  # or cherry-pick; review as usual
  git push origin main                              # Gitea; the push mirror carries it to GitHub
  ```

  Then close the GitHub pull request with a link to the merged commit. (GitHub keeps `pull/<number>/head` refs even though the mirror prunes branches.)
- **CI lives in `.gitea/workflows/` only.** Gitea reads `.gitea/workflows/` *or* `.github/workflows/`: whichever exists first wins, and the other is ignored. A `.github/workflows/` directory would not run on Gitea. It would also make the mirror's token need the Workflows permission (see below).

## Setting it up

1. **Create `github.com/aijutsu/aith`** and keep it public, since learners and the site link to it. The first sync overwrites whatever is in it.
2. **Create a GitHub token** for the mirror:
   - Fine-grained (recommended): repository `aijutsu/aith` only, **Contents: Read and write**. An org repo may need the org to approve the token.
   - Classic: `repo`.
   - Only if this repo ever gains `.github/workflows/`: add **Workflows: Read and write** (classic: `workflow`). Without it, GitHub rejects the whole push.
3. **Add the push mirror** in Gitea (Settings › Repository › Mirror Settings):
   - Git remote URL: `https://github.com/aijutsu/aith.git`
   - Username: your GitHub username. Password: the token.
   - Turn on **Sync when commits are pushed**, so GitHub updates right after each push instead of only on the timer.
4. **Set a reminder for the token's expiry.** When it expires, syncs fail and GitHub quietly stops getting updates. The error shows next to the mirror in Mirror Settings.
5. **Sync once by hand** (Mirror Settings › Synchronize Now), then check that both sides match:

   ```bash
   git rev-parse origin/main
   git ls-remote https://github.com/aijutsu/aith.git refs/heads/main   # same SHA
   ```

## When it fails

Gitea shows the last sync time and any error next to the push mirror in Mirror Settings.

| Symptom | Cause |
| --- | --- |
| 403, `Write access ... not granted`, or `Repository not found` | The token lacks Contents write, has expired, or isn't approved for the org. Paste a new token into the mirror settings. |
| `refusing to allow a Personal Access Token to create or update workflow ...` | Someone added `.github/workflows/`; the token needs the Workflows permission. |
| A commit or branch on GitHub vanished | Working as designed: it existed only on GitHub, and the mirror overwrote it. Recover it from the GitHub pull request, if there was one, and bring it into Gitea. |
