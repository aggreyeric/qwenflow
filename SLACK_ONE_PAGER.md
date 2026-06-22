# QwenFlow for Slack — One-Pager

**What it does:** QwenFlow for Slack brings multi-model AI orchestration into your workspace via a single `/qwenflow` slash command. It runs workflows across Qwen + Gemini models, reports live progress, and lists available models — all inline in any channel. The same shared store powers the web UI and Slack, with no changes to the core orchestrator.

## Slash Commands

| Command | Action |
|---|---|
| `/qwenflow run <prompt>` | Execute a multi-model workflow |
| `/qwenflow status <id>` | Report live run progress |
| `/qwenflow models` | List all available models + capabilities |

## Files Added

| File | Purpose |
|---|---|
| `src/store.ts` | Shared workflow store (web + Slack) |
| `src/slack.ts` | Slack app setup (`@slack/bolt`) |
| `src/slack-commands.ts` | Slash command handlers |
| `slack/app.ts` | Entry point / receiver wiring |
| `tests/slack.test.ts` | Slack integration tests |

## Tests

**94 total** — 78 core + 10 Slack + 6 store

## Hackathon

**Slack Agent Builder — $42K prize pool · Deadline: Jul 13, 2026**
Submit at: https://slackhack.devpost.com

## What Eric Needs To Do

1. **Create a Slack App** at https://api.slack.com/apps (enable Socket Mode, add slash command `/qwenflow`)
2. **Set 3 env vars:** `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `SLACK_SIGNING_SECRET`
3. **Run:** `npm run start:slack`

---
_Draft for internal reference — do not submit without Eric's approval._
