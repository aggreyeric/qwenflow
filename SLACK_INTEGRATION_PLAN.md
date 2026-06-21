# Slack Integration Plan — QwenFlow

> Author: hack_1. **PLAN only** — no code written, nothing pushed.

## Goal
Let Slack users invoke QwenFlow workflows via `/qwenflow` so teams can run, monitor, and inspect models from chat.

## 1. SDK
- `@slack/bolt` (latest, v3.x). ESM-compatible; fits existing Express 4 + tsx + Node 18+ toolchain.
- Optional helper: `@slack/types` (typed payloads) — nice-to-have, not required.

## 2. Slash Commands
Register ONE Slack command `/qwenflow`; parse subcommand from `command.text`:
- `/qwenflow run <name|id>` — look up workflow, `new Orchestrator(wf)` → `.run()`, post truncated result + token/latency summary. Long runs → `ack()` immediately, post final via `respond()`/`say()`.
- `/qwenflow status <name|id>` — return `{status, step, total, percent}` from `getProgress()`.
- `/qwenflow models` — list `QWEN_MODELS` from `src/types.ts` (id, name, capabilities).

## 3. Wiring Orchestrator → Slack
- **Do first:** workflow store is a private `Map` *inside* `routes/workflows.ts`. Lift to `src/store.ts` so HTTP + Slack paths share it.
- Handler flow: parse → `store.get(id)` → `new Orchestrator(wf)` → `await run()` → format `WorkflowRun` → `say()`.
- **No changes to `orchestrator.ts`** — already a clean class with `run()/getProgress()/getRun()`.

## 4. Env Vars (add to `.env.example`)
- `SLACK_BOT_TOKEN` (`xoxb-…`) — app auth
- `SLACK_SIGNING_SECRET` — HTTP request verification (HTTP mode only)
- `SLACK_APP_TOKEN` (`xapp-…`) — required for Socket Mode

## 5. New Files
- `src/slack.ts` — Bolt `App` / `ExpressReceiver` factory; reads tokens; exports `slackApp`.
- `slack/app.ts` — registers `/qwenflow` command handlers; imports `slackApp` + `Orchestrator` + shared store.
- Edit `src/index.ts` — mount Slack receiver (Express middleware, OR start Socket-Mode listener) alongside existing routes.

## 6. package.json
- Add dep: `@slack/bolt`, `@slack/types`
- Add script: `"slack:socket": "SLACK_MODE=socket tsx src/index.ts"`
- No new devDeps beyond existing `tsx`/`vitest`.

## 7. Local Testing
- **Recommended: Socket Mode** — set `SLACK_APP_TOKEN`, no public URL, no ngrok.
- **Alt: ngrok** — `ngrok http 3000`, set Request URL in Slack app config, HTTP receiver + `SLACK_SIGNING_SECRET`.
- New `slack.test.ts`: unit-test subcommand parser + ack/respond formatting with mocked `ack`/`say`. No Slack network calls.

## 8. Effort Estimate — ~8h (range 6–10h)
- Store refactor + Slack factory: 1.5h
- 3 slash-command handlers: 3h
- `index.ts` integration + env wiring: 1h
- Socket Mode + local smoke test: 1h
- Tests + `.env.example` + README section: 1.5h

## Risks / Notes
- In-memory store lost on restart — acceptable for hackathon; flag Redis/SQLite for prod.
- Slack's **3s ack deadline** → long workflows MUST ack early and respond asynchronously.
- `/qwenflow` scope must be installed per Slack workspace.
