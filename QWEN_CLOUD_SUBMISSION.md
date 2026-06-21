# QwenFlow — Qwen Cloud Hackathon Submission

> **Status: DRAFT — not submitted anywhere. Awaits Eric's approval.**

---

## Project Name

```
QwenFlow — AI Agent Orchestration for Qwen Cloud
```

## One-Liner

```
Build, chain, and deploy multi-step AI agent workflows on Qwen Cloud — with visual UI and Gemini support
```

## Description

QwenFlow is an orchestration framework that turns Qwen Cloud's model family into composable, reusable building blocks. Instead of writing one-off API glue code for every prompt, you declare a workflow — a directed graph of model steps — in plain JSON or via the drag-and-drop editor. QwenFlow parses that graph, resolves cross-step variables like `${steps.analyze.output}`, runs independent steps in parallel, and aggregates each step's output, token usage, latency, and cost into a single replayable trace.

Qwen Cloud is the ideal backend for this. Its model family coherently spans text (Qwen3), vision (Qwen-VL), and audio (Qwen-Audio), each exposed through DashScope-compatible endpoints with a consistent request shape. That consistency is what makes clean multi-model orchestration possible at all — and exactly what generic, model-agnostic tools leave on the table. QwenFlow's Model Router knows the difference between a text, vision, and audio step and serializes the right payload for each, so a multimodal pipeline is just another workflow.

The multi-model advantage is real: a single pipeline might run Qwen3 to classify text, Qwen-VL in parallel to read an attached image, and then Qwen3 again to fuse both signals into a verdict. QwenFlow executes the first two concurrently and only the third waits. Optional Gemini routing lets you compare or blend providers per step when it improves a result.

For judges: `npm install`, `export DASHSCOPE_API_KEY=...`, `npm run dev`, open http://localhost:3000. `bash scripts/demo.sh` exercises the full HTTP API end to end. `npm test` is green (78/78). No secrets beyond a single Qwen Cloud API key are required.

## Key Features

- **Visual workflow editor** — drag-and-drop node graph in the browser
- **REST API** — create, run, and inspect workflows via HTTP
- **CLI** — `npx qwenflow run` drives workflows headlessly
- **Docker** — `docker compose up`, zero external dependencies
- **Multi-model routing** — Qwen (Qwen3 / Qwen-VL / Qwen-Audio) + optional Gemini fallback per step

## Tech Stack

```
TypeScript, Express, Zod, Vitest, Qwen Cloud API / DashScope
```

## Test Results

```
78/78 passing across 8 suites (workflow engine, model routing, agent
orchestration, REST API, adapter registry, execution tracer, node graph
parser, utils) — all green, offline-deterministic.
```

## Screenshot

```
docs/screenshot-ui.png
```

## Links

- **GitHub:** https://github.com/aggreyeric/qwenflow
- **Devpost (Qwen Cloud Hackathon):** https://qwencloud-hackathon.devpost.com/

---

_Prepared by hack_2. NOT submitted. Awaits operator (Eric) approval._
