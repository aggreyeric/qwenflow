# Contributing to QwenFlow 🌊

Thanks for your interest in making QwenFlow better! This project is built in the
open and contributions of all kinds — bug reports, feature ideas, docs, and code —
are welcome.

This document explains how to get a local copy running, how to verify your
changes, and how to submit them.

---

## Welcome

Whether you're fixing a typo in the README or wiring up a new Qwen model in the
Model Router, we're glad you're here. A few things to keep in mind:

- **Be kind.** QwenFlow is a small project maintained on limited time. Assume good
  intent, and be patient with reviews.
- **Small is beautiful.** Focused, well-scoped PRs land faster than mega-PRs.
- **Show your work.** If a change affects behavior, include a test or a clear
  example so reviewers can see what changed and why.

---

## Project setup

Full setup details live in the [README](./README.md) — this is the short version.

**Prerequisites:** Node.js 18+ and a [Qwen Cloud / DashScope API key](https://dashscope.console.aliyun.com/).

```bash
# 1. Fork & clone the repo, then install dependencies
git clone https://github.com/<your-username>/qwencloud-agent.git
cd qwencloud-agent
npm install

# 2. Provide your Qwen Cloud key (only needed for live API runs)
export DASHSCOPE_API_KEY=sk-your-key-here

# 3. Start the dev server (hot reload via tsx watch)
npm run dev
#    → http://localhost:3000
```

> You do **not** need a real API key to run the test suite — the tests use mocked
> Qwen Cloud responses. Only the live dev server and integration runs need
> `DASHSCOPE_API_KEY`.

---

## Running the tests

Tests are written with [Vitest](https://vitest.dev/). Before you open a PR,
please make sure these all pass:

```bash
# Run the full test suite once
npm test

# Watch mode while you iterate
npm run test:watch

# Type-check without emitting files
npm run typecheck
```

The CI pipeline (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml))
runs exactly these three checks across Node 18, 20, and 22, so running them
locally first saves you a round-trip.

### When you add new code

- **New feature → add a test.** If you add a step type, a retry policy, or a
  router branch, cover it in `tests/`.
- **Bug fix → add a regression test.** Demonstrate the bug first, then the fix.
- **Keep types tight.** QwenFlow is TypeScript-first with Zod schemas; prefer a
  schema over `any`.

---

## Coding conventions

- **TypeScript everywhere.** `strict` mode is on (see `tsconfig.json`) — don't
  weaken it to make a red squiggle go away.
- **ESM.** The project is `"type": "module"`. Use `import`/`export`, and remember
  file extensions when importing local modules if tooling requires it.
- **Dependency discipline.** Add new runtime deps only when justified. Anything
  Qwen-Cloud-specific or Qwen-model-specific belongs in the Model Router; keep
  the orchestrator model-agnostic.
- **No secrets.** Never commit API keys, tokens, or `.env` files. See
  [SECURITY.md](./SECURITY.md).

---

## Submitting a pull request

1. **Open an issue first for big changes.** New step types, model integrations, or
   anything that changes the public workflow JSON schema — file an issue so we can
   align on the design before you write 500 lines.
2. **Branch from `main`.** Use a descriptive branch name, e.g.
   `feat/qwen-vl-audio-step` or `fix/retry-backoff-jitter`.
3. **Write a clear PR description.** What changed, why, and how to test it. Link
   any related issue (`Closes #123`).
4. **Make sure the checks are green.** `npm test`, `npm run typecheck`, and (if
   applicable) `npm run build` should all pass.
5. **Keep commits readable.** Squash noisy WIP commits before requesting review.

A maintainer will review as time allows. Reviews may ask for changes — that's
normal, not a rejection.

---

## Reporting bugs

Use [GitHub Issues](../../issues). Include:

- QwenFlow version (`git rev-parse --short HEAD` or the release tag)
- Node.js version and OS
- A minimal reproduction (a workflow JSON + the command you ran)
- Expected vs. actual behavior
- Relevant logs (redact any API keys first!)

---

## Code of conduct

Be respectful and constructive. Harassment, personal attacks, and
discrimination are not tolerated. If a contribution or comment crosses a line,
reach out to a maintainer privately.

---

## License

By contributing, you agree that your contributions will be licensed under the
**MIT License** that covers this project (see [LICENSE](./LICENSE)).

Thanks again for helping QwenFlow grow. 🌊
