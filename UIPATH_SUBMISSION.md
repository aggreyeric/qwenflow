# QwenFlow — UiPath AgentHack Submission

> **Status: DRAFT — not submitted anywhere. Awaits Eric's approval.**

---

## Project Name

```
QwenFlow — Multi-Model AI Agent Orchestrator
```

## One-Liner

```
A workflow engine that turns multiple LLMs into composable agents: it plans a
task as ordered steps, routes each step to the best model (Qwen vs Gemini),
chains reasoning across steps, and runs the whole thing from Slack — built and
continuously verified by coding agents.
```

## Why It's an *Agent*, Not a Wrapper

A thin LLM wrapper sends one prompt to one model and returns text. QwenFlow is
an **orchestrator of agents**: given a goal, it operates autonomously through a
structured loop. Concretely, every workflow run does four things a wrapper
cannot:

1. **Plans** — the goal is expressed as an ordered, multi-step workflow (a
   directed graph of steps), each step declaring which model it needs.
2. **Routes** — a Model Router dispatches each step to the right provider by
   model id (`gemini-*` → Google Gemini; `qwen*` → Qwen / DashScope), so a
   single pipeline can mix Qwen3 for reasoning, Qwen-VL for vision, and Gemini
   for fast multimodal calls in one run.
3. **Chains reasoning** — the **output of each step becomes context for the
   next**. Step *n* receives step *n-1*'s result appended to its prompt, so the
   agent accumulates state and reasons across steps rather than answering in
   isolation. This is the multi-step reasoning judges look for.
4. **Observes & reports** — the run tracks status (`pending → running →
   completed/failed`), current step, progress %, per-step token usage and
   latency, then posts a structured summary back to Slack — giving a
   human-in-the-loop surface over fully autonomous execution.

In short, QwenFlow decomposes a goal, selects tools (models) per sub-task,
carries state between them, and reports results — the defining behaviour of an
agent system.

## How It Orchestrates Agents (the architecture judges care about)

| Layer | What it does | Code |
|------|--------------|------|
| **Workflow (the plan)** | A typed DAG: `steps[]` (id, model, prompt, temperature, maxTokens) + `edges[]`. This is the agent's plan. | `src/types.ts` |
| **Orchestrator (the agent loop)** | Executes steps in order, **injects each step's output as context into the next**, tracks run state + progress, and marks the run completed/failed. | `src/orchestrator.ts` |
| **Model Router (tool selection)** | `callModel()` inspects the model id and dispatches to the correct provider adapter — Qwen (DashScope) or Gemini — per step, within one pipeline. | `src/models.ts` |
| **Capability registry** | Each model advertises capabilities (vision / audio / tools / context window). The right model is picked for the right sub-task. | `src/models.ts` |
| **Adapters (the tools)** | `QwenCloudClient` (DashScope OpenAI-compatible API) and `callGemini` (Google AI). Both fall back to deterministic **mock mode** with zero config, so the agent runs end-to-end with no API keys. | `src/qwencloud.ts`, `src/gemini.ts` |
| **Slack control plane** | `/qwenflow run | status | models` slash commands (Bolt, Socket Mode) trigger runs and stream back token/duration/output summaries — human-in-the-loop over autonomous runs. | `src/slack-commands.ts` |
| **REST API** | Create workflows, list models, execute runs, check status — the programmatic agent surface. | `src/routes/workflows.ts`, `src/routes/models.ts` |

**Example multi-step, multi-model run** (what a judge sees execute):

```
Step 1  qwen3-32b   "Extract the key claims from this report"     → claims
Step 2  qwen-vl     "Read the attached chart and describe trends" → (vision) chart notes
Step 3  gemini-2.0-flash "Synthesize steps 1+2 into an exec summary" → summary
```

Each step's output is threaded forward as context; the Model Router switches
providers mid-pipeline; the run reports total tokens, duration, and the final
output to Slack. That end-to-end, multi-step, multi-model behaviour is the
agent story.

## Built and Gated by Coding Agents (the hackathon theme)

QwenFlow is both *an agent platform* and *a product of coding agents*, fitting
the "Building AI agents using coding agents" theme directly. Coding agents
generate workflow scaffolds, wire new model adapters, and — crucially — run the
automated quality gate that protects every change. The loop is
**generate → typecheck → test → deploy**, and the gate is real: **94 tests
across 10 suites**, all green in deterministic mock mode with no live model
calls. That gate is what makes autonomous, multi-model orchestration safe
enough to ship.

## Description

QwenFlow is an AI agent orchestration platform that turns multiple large
language models into composable, reliable building blocks. Instead of
hand-writing one-off API glue for every prompt, you declare a workflow — an
ordered graph of model steps — and QwenFlow schedules, executes, and observes
the whole run. The Model Router dispatches each step to the right provider, so
a single pipeline can mix Qwen (Qwen3 / Qwen-VL / Qwen-Audio via DashScope)
and Gemini (2.0 Flash / 1.5 Pro / 1.5 Flash), with the output of each step
chained forward as reasoning context. Teams trigger and monitor these runs from
Slack via `/qwenflow` slash commands (`run`, `status`, `models`), giving a
human-in-the-loop surface over fully autonomous execution.

## What Makes It Unique

- **True multi-model routing per step** — Qwen (Qwen3 / Qwen-VL / Qwen-Audio)
  and Gemini (2.0 Flash / 1.5 Pro / 1.5 Flash) coexist in one workflow; the
  router switches providers mid-pipeline by model id.
- **Multi-step reasoning with state** — each step's output is threaded into the
  next step's prompt, so the agent accumulates context and reasons across steps.
- **Capability-aware model selection** — a registry of 8 models advertises
  vision / audio / tools / context-window so the right model handles each sub-task.
- **Zero-config, fully runnable** — adapters fall back to deterministic mock
  mode with no API keys; `docker compose up` runs end-to-end. Great for demos
  and CI.
- **Slack-native operation** — `/qwenflow run | status | models`, Socket Mode,
  human-in-the-loop over autonomous runs.
- **Built and gated by coding agents** — generate → typecheck → test → deploy
  loop with a real, green 94-test quality gate.

## Tech Stack

```
TypeScript, Express, Zod, Vitest, Qwen Cloud API (DashScope), Google Gemini API,
@slack/bolt (Socket Mode), Docker
```

## Test Results

```
94/94 passing across 10 suites
(api, cli, gemini, orchestrator, qwencloud, routes, schemas, slack, store, types)
— all green, deterministic mock mode, no live model calls in CI.
Run it: `npm test`
```

## Screenshots

```
docs/screenshot-slack-ui.png   — /qwenflow slash-command interaction in Slack
docs/screenshot-ui.png         — dark-theme workflow editor
docs/uipath-screenshot.png     — UiPath AgentHack demo dashboard
docs/uipath-demo.html          — live, self-contained demo dashboard (open in browser)
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

_Notes for Eric: this draft describes exactly what the code supports today —
Qwen + Gemini routing, multi-step output→context chaining, capability
registry, Slack control plane, deterministic mock mode. It does NOT claim
Claude, retries, or a quality-gate/similarity score (those appear in the older
demo HTML and are not backed by code; if you want them, I'll add a real
adapter/retry before we submit rather than claim them). — hack_2_
