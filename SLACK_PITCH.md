# QwenFlow for Slack — Elevator Pitch

## Why Slack?

Teams don't need another tab. Slack is where decisions get made, threads get referenced, and context lives. Putting AI agents where the team already works means zero adoption friction — the workflow runs in the channel the conversation is already happening in.

## What QwenFlow Does in Slack

One command, three superpowers:

- **`/qwenflow run <name|id>`** — execute a workflow across models; results and token/latency summaries land inline
- **`/qwenflow status <name|id>`** — live progress, step/total/percent, for long-running jobs
- **`/qwenflow models`** — list every available model with its capabilities

Multi-model out of the box: **Qwen + Gemini**, same workflow, side-by-side. Same shared store as the web UI.

## Differentiator

QwenFlow isn't a chatbot — it's an **orchestration surface**.

- **Model-agnostic** — Qwen today, Gemini today, more tomorrow; the `Orchestrator` fans work across whatever's configured
- **Shared workflow store** — HTTP and Slack hit one source of truth, not two silos
- **Async-safe** — 3-second ack + async respond keeps Slack responsive on long runs

## Impact

- Teams run, monitor, and compare AI workflows **without leaving Slack**
- Compare models **side-by-side from chat** — Qwen vs Gemini in one channel
- **84 tests, production-grade** — clean additive integration, zero changes to the orchestrator

One command. Multi-model. One source of truth. That's QwenFlow in Slack.
