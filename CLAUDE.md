# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

All agent instructions for this repository live in `AGENTS.md`, so every AI agent follows the same rules.

## Docs first, docs after

- **Before implementing anything**, read the relevant docs in `docs/`. Start at `docs/README.md`: it lists every doc and what it covers. Past decisions (`docs/system/decisions.md`) and known gotchas (`docs/system/known-issues.md`) are there so you don't repeat old mistakes or reopen settled questions.
- **After implementing**, write back to the docs in the same change:
  - update what your change made out of date;
  - add new decisions, with the reasons, to `docs/system/decisions.md`;
  - add anything that cost you time to `docs/system/known-issues.md`.

This rule is also in `AGENTS.md`, so agents that don't read this file follow it too.

## Everything else

@AGENTS.md
