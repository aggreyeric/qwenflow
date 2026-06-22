# QwenFlow — UiPath AgentHack Submission

> **Status: DRAFT — not submitted anywhere. Awaits Eric's approval.**
> **Prize pool: $50K · Deadline: Jun 29, 2026**

---

## Project Name

```
QwenFlow — Multi-Model AI Agent Orchestrator
```

## One-Liner

```
QwenFlow lets you build AI agents that route tasks to the best model, integrate
with enterprise tools (Slack), and maintain audit trails — all from a single
workflow engine.
```

## Description

UiPath proved that deterministic workflows could run an enterprise. The next
frontier is **agentic**: workflows where each step is a model call, where the
"bot" picks the right brain for the job, and where every decision leaves a
trace an auditor can replay. QwenFlow is that engine.

QwenFlow is a workflow engine for AI agents. You declare an agent as a
directed graph of model steps — in plain JSON, via REST, or from a Slack
channel — and QwenFlow takes over execution: it parses the graph, resolves
cross-step variables like `${steps.classify.output}`, runs independent steps
in parallel, and aggregates every step's output, token usage, latency, and
cost into a single replayable run record.

The core differentiator is **multi-model agent orchestration**. A single
agent does not have to commit to one model. QwenFlow's Model Router knows
the difference between a text step (Qwen3), a vision step (Qwen-VL), and an
audio step (Qwen-Audio), serializes the right payload for each, and can fall
back to Gemini per step when it improves a result. So one pipeline can route
a classification task to Qwen3, a document-vision task to Qwen-VL, and a
synthesis task back to Qwen3 — concurrently where the DAG allows, sequenced
where dependencies demand. The orchestrator fans work across whatever is
configured; models are pluggable, agents are not.

That orchestration surface extends to **enterprise workflow automation**
through a first-class Slack integration. The same shared workflow store that
the web UI and REST API hit is exposed in Slack via a single `/qwenflow`
slash command — run a workflow, poll live status on long-running jobs, and
list available models, all inline in any channel where the work is already
being discussed. Three-second acks and async responses keep Slack responsive
on runs that take minutes. There is no second data silo: one source of
truth, surfaced where the team works.

Underneath, every run is observable. Each step records its inputs, outputs,
model, token usage, and latency into an audit trace that can be inspected
and replayed — the kind of trail an enterprise automation platform is
measured on. Put a QwenFlow agent behind a Slack command and you get an AI
worker that is multi-model, integrated, and auditable by default.

For judges: `npm install`, `export DASHSCOPE_API_KEY=...`, `npm run dev`,
open http://localhost:3000. `bash scripts/demo.sh` exercises the full HTTP
API end to end. `npm run start:slack` brings up the Slack app.
`npm test` is green (94/94, 0 failures). No secrets beyond a single Qwen
API key are required to evaluate.

## Why It Fits UiPath AgentHack

- **Agentic by design** — agents are DAGs of model steps, not single prompts;
  the engine handles orchestration, parallelism, and dependency resolution
- **Model routing as agent capability** — each step picks the best model
  (text / vision / audio / Gemini fallback) the way a UiPath activity picks
  the right tool
- **Enterprise integration** — Slack Bolt integration surfaces agents where
  teams already work, with a shared store across web, API, and chat
- **Audit trails** — every run records inputs, outputs, tokens, and latency
  into a replayable trace for governance and observability

## Key Features

- **Agent orchestration** — multi-step, multi-model workflow execution with
  parallel branches and variable passing between steps
- **Multi-model routing** — Qwen (Qwen3 / Qwen-VL / Qwen-Audio) + optional
  Gemini fallback, selected per step
- **Enterprise workflow automation** — Slack `/qwenflow` slash command for
  run / status / models, sharing one store with the REST API and web UI
- **Audit trails** — per-step output, token usage, latency, and cost
  aggregated into a replayable run record
- **REST API + CLI** — drive agents via HTTP or `npx qwenflow run` headlessly
- **Docker** — `docker compose up`, zero external dependencies

## Tech Stack

```
TypeScript, Qwen API (Qwen3 / Qwen-VL / Qwen-Audio),
Gemini API, Slack Bolt, Express, Zod, Vitest
```

## Test Results

```
94/94 passing across 10 suites (agent orchestration, multi-model routing,
Slack integration, shared store, REST API, Qwen client, DAG validation,
config, runner, end-to-end) — 0 failures, offline-deterministic.
```

## Screenshot

```
docs/screenshot-ui.png
```

## Links

- **GitHub:** https://github.com/aggreyeric/qwenflow
- **UiPath AgentHack:** https://agenthack.uipath.com/

---

_Prepared by hack_2. NOT submitted. Awaits operator (Eric) approval._
