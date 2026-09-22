# Gitea and the GitHub mirror

| Where | What | Who can see it |
| --- | --- | --- |
| https://gohan.aijutsu.dev/aijutsu/aith (`git@gohans.aijutsu.dev:aijutsu/aith.git`) | **The source of truth.** All work lands here, and CI runs here (`.gitea/workflows/`). | The Aijutsu team, behind Cloudflare Access |
| https://github.com/aijutsu/aith | A **read-only public mirror** of `main`. The site's "Suggest a change on GitHub" and source links, and the README's clone command, point here. | Everyone |

`.gitea/workflows/mirror-to-github.yml` pushes `main` to GitHub after every push to Gitea's `main`.

## Rules

- **Never merge a pull request on GitHub, and never push to GitHub by hand.** The mirror is fast-forward only: it never force-pushes, so it can't rewrite GitHub's history. If GitHub's `main` gets a commit Gitea doesn't have, the next mirror run fails with `non-fast-forward`. Adding `--force` to fix that would throw the GitHub commit away. So take a GitHub pull request into Gitea instead:

  ```bash
  git fetch github pull/<number>/head:pr-<number>   # the `github` remote is github.com/aijutsu/aith
  git switch main && git merge --no-ff pr-<number>  # or cherry-pick; review as usual
  git push origin main                              # Gitea; the mirror carries it to GitHub
  ```

  Then close the GitHub pull request with a link to the merged commit.
- **CI lives in `.gitea/workflows/` only.** Gitea reads `.gitea/workflows/` *or* `.github/workflows/`: whichever exists first wins, and the other is ignored. A `.github/workflows/` directory would not run on Gitea. It would also make every mirror push need a token with the Workflows permission (see below).

## Setting it up

1. **Create `github.com/aijutsu/aith` empty.** No README, license, or .gitignore. Otherwise the first push is `non-fast-forward`, and the only fix without force is to recreate the repo. Keep it public, since learners and the site link to it.
2. **Create a GitHub token** for the mirror:
   - Fine-grained (recommended): repository `aijutsu/aith` only, **Contents: Read and write**. An org repo may need the org to approve the token.
   - Classic: `repo`.
   - Only if this repo ever gains `.github/workflows/`: add **Workflows: Read and write** (classic: `workflow`). Without it, GitHub rejects the whole push.
3. **Add it to Gitea** as the repository secret **`MIRROR_GITHUB_TOKEN`** (Settings › Actions › Secrets). Gitea rejects secret names starting with `GITHUB_` or `GITEA_`.
4. **Set a reminder for the token's expiry.** When it expires, the mirror fails with 403 errors and GitHub quietly stops getting updates.
5. **Run it once by hand** (Actions › Mirror to GitHub › Run workflow), then check that both sides match:

   ```bash
   git rev-parse origin/main
   git ls-remote https://github.com/aijutsu/aith.git refs/heads/main   # same SHA
   ```

   In the run log, the push URL must show as `https://x-access-token:***@github.com/...`. If the raw token is visible, stop and rotate it.

## When it fails

| Symptom | Cause |
| --- | --- |
| Job waits forever, with no error | `runs-on: ubuntu-latest` matches no online runner, or Actions is off for the repo |
| `MIRROR_GITHUB_TOKEN is not set` | The secret is missing or misnamed |
| 403, `Write access ... not granted`, or `Repository not found` | The token lacks Contents write, has expired, or isn't approved for the org |
| `refusing to allow a Personal Access Token to create or update workflow ...` | Someone added `.github/workflows/`; the token needs the Workflows permission |
| `non-fast-forward` or `fetch first` | GitHub has a commit Gitea lacks (a PR merged on GitHub, or a hand push). Bring that commit into Gitea (see Rules), or recreate the GitHub repo. **Never add `--force`.** |
| `shallow update not allowed` | `fetch-depth: 0` was removed from the checkout step |

Gitea also has a built-in **push mirror** (Settings › Mirror Settings), which needs no workflow. It runs on a timer and force-pushes and prunes. That would silently undo any mistake on GitHub rather than flag it, so we use the workflow instead.
