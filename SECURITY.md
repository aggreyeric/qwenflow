# Security Policy 🛡️

QwenFlow is an open-source project and we take security seriously. This document
explains how to report vulnerabilities and how we keep the project safe.

---

## Supported versions

QwenFlow is early-stage (`0.x`). Security fixes target the latest `main` and the
most recent release tag. We do not backport fixes to older releases at this time.

| Version | Supported |
|---------|-----------|
| latest `main` | ✅ |
| latest release tag | ✅ |
| older tags | ❌ |

Please upgrade to the latest version before reporting a possible vulnerability.

---

## Reporting a vulnerability

**If you believe you've found a security vulnerability in QwenFlow, please report
it responsibly.** Do **not** open a public issue that discloses exploit details.

1. **Open a private GitHub issue.** The simplest path is to file a regular
   [GitHub Issue](../../issues) but mark the title clearly with
   `[SECURITY]` and keep exploit / reproduction details out of the public
   description. A maintainer will follow up to coordinate disclosure of the
   sensitive parts.
2. **Include enough to reproduce.** QwenFlow version, Node version, the relevant
   workflow JSON or code path, and the impact you observed. Redact any API keys
   or personal data first.
3. **Give us a heads-up before publishing.** Please allow a reasonable window
   (we aim for 14–30 days) to investigate and ship a fix before any public
   disclosure or write-up. We'll keep you in the loop on progress.

We will acknowledge receipt within a few days and do our best to keep the
reporter informed through to resolution.

> Note: because this is a small, volunteer-maintained project, we cannot offer
> monetary bug bounties or formal SLAs. What we *can* offer is transparent
> communication and a credit line in the release notes if you'd like one.

---

## What counts as a security issue

We want to hear about things that could let an attacker:

- Execute arbitrary code (e.g. via unsafe workflow JSON parsing, prompt-template
  injection into `eval`, or prototype pollution).
- Access another user's Qwen Cloud API key or tokens.
- Bypass the workflow's retry / fallback budget in a way that leaks cost or data.
- Crash or exhaust resources on a QwenFlow instance (untrusted-workflow DoS).

For general "how do I use this feature?" or non-security bugs, please use a
normal [GitHub Issue](../../issues) instead — it doesn't need the `[SECURITY]`
treatment.

---

## Secrets are never committed

QwenFlow reads its Qwen Cloud credentials from the environment variable
`DASHSCOPE_API_KEY`. **Never** hard-code keys, tokens, or passwords into source
files, test fixtures, workflow JSON examples, commit messages, or screenshots.

Before submitting a PR or filing an issue, double-check that you have redacted:

- Any real `DASHSCOPE_API_KEY` or DashScope tokens.
- Any real endpoint URLs or account IDs from a private deployment.
- Anything in `.env`, logs, or error stack traces.

The repo's [`.gitignore`](./.gitignore) is set up to keep local `.env` files and
build artifacts out of version control — rely on the environment, not on
committed config.

If a secret *does* get committed by accident, **rotate it immediately** on the
[DashScope console](https://dashscope.console.aliyun.com/) and notify a
maintainer so the offending commit can be force-pushed off the history where
feasible.

---

## Dependency auditing

QwenFlow's dependencies are kept in `package.json` and locked via
`package-lock.json`. We monitor them for known vulnerabilities:

- **`npm audit`** — run locally and in review to surface advisories in the
  dependency tree. Contributors are asked to resolve high/critical findings
  before a PR is merged.
- **GitHub's Dependabot / advisory checks** — surface security advisories on
  dependencies. Dependency bumps that fix advisories are prioritized.
- **Minimal, well-scoped deps.** We keep the dependency list intentionally small
  (Express, Zod, CORS) to reduce the attack surface. New runtime dependencies
  are added only when the value clearly outweighs the maintenance and security
  cost.

You can run a local audit at any time:

```bash
npm audit
npm audit --omit=dev   # production dependencies only
```

---

## Safe usage of workflows

If you build QwenFlow workflows that accept untrusted input (for example, a
public UI that lets users edit workflow JSON), keep in mind:

- **Validate every step.** Use the Zod schemas in `src/` to reject malformed
  workflow definitions before execution.
- **Budget your cost.** Configure per-step retry/fallback limits so a malicious
  or runaway workflow can't rack up unbounded Qwen Cloud spend.
- **Don't pipe raw user input straight into prompt templates** without
  sanitization — that's prompt-injection territory.

---

Thanks for helping keep QwenFlow and its users safe. 🛡️
