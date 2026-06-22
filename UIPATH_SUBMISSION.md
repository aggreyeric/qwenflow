# QwenFlow — UiPath AgentHack Submission

> **Status: DRAFT — not submitted anywhere. Awaits Eric's approval.**

---

## Project Name

```
QwenFlow — Multi-Model AI Agent Orchestrator
```

## One-Liner

```
Route, execute, and monitor AI tasks across Qwen and Gemini with a unified
workflow engine — built and continuously verified by coding agents.
```

## Description

QwenFlow is an AI agent orchestration platform that turns multiple large language models into composable, reliable building blocks. Instead of hand-writing one-off API glue for every prompt, you declare a workflow — a directed graph of model steps — and QwenFlow schedules, executes, retries, and observes the whole run.

It fits the "building AI agents using coding agents" theme directly: QwenFlow is both *an agent platform* and *a product of coding agents*. Internally, coding agents generate workflow scaffolds, wire new model adapters (Qwen3 / Qwen-VL / Qwen-Audio via DashScope, plus Gemini 2.0 Flash / 1.5 Pro), and — crucially — run the automated quality gate that protects every change. Every commit passes a 94-case, 10-suite test suite that exercises the scheduler, retry/fallback executor, variable resolution, response aggregator, REST API, and Slack command layer, all in deterministic mock mode. The coding agent loop is: generate → typecheck → test → deploy. That loop is what makes autonomous, multi-model agent orchestration safe enough to ship.

The platform's Model Router dispatches each step to the right provider, so a single pipeline can fan out — Qwen3 for reasoning, Qwen-VL for vision, Gemini for fast multimodal calls — with cross-provider fallback when a step exceeds budget or rate limits. Teams trigger and monitor these runs from Slack via `/qwenflow` slash commands (`run`, `status`, `models`), giving a human-in-the-loop surface over fully autonomous execution.

In short: QwenFlow shows a complete coding-agent-powered pipeline — an agent platform, built by agents, tested by agents, and operated through chat — which is exactly the autonomous, multi-model future UiPath AgentHack is asking builders to demonstrate.

## What Makes It Unique

- **Multi-model routing** — Qwen (Qwen3 / Qwen-VL / Qwen-Audio) and Gemini (2.0 Flash / 1.5 Pro) in one workflow, with per-step fallback that can cross providers
- **Built and gated by coding agents** — generate → typecheck → test → deploy loop with a real, green quality gate
- **Slack-native operation** — `/qwenflow run | status | models` slash commands, Socket Mode, human-in-the-loop over autonomous runs
- **Fully tested** — 94 tests across 10 suites, all green in deterministic mock mode
- **Zero-config** — `docker compose up`, no external deps; optional keys fall back to mock responses

## Tech Stack

```
TypeScript, Express, Zod, Vitest, Qwen Cloud API (DashScope), Google Gemini API,
@slack/bolt (Socket Mode), Docker
```

## Test Results

```
94/94 passing across 10 suites (api, cli, gemini, orchestrator, qwencloud,
routes, schemas, slack, store, types) — all green, deterministic mock mode,
no live model calls in CI.
```

## Screenshots

```
docs/screenshot-slack-ui.png   — /qwenflow slash-command interaction in Slack
docs/screenshot-ui.png         — dark-theme workflow editor
```

## Demo Link

```
https://github.com/aggreyeric/qwenflow
```

## Hackathon

```
UiPath AgentHack — $50K — deadline Jun 29
Theme: "Building AI agents using coding agents"
```

---

_Notes for Eric: this draft describes Qwen + Gemini routing, which is what the code actually supports today (a route test even rejects `claude-3`). If you want the copy to claim Claude too, say the word and I'll add a Claude/Anthropic adapter so the claim is true before we submit. — hack_1_
