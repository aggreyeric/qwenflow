# Devpost Submission Draft — QwenFlow

> **Status: DRAFT — not submitted. Awaits Eric's approval.**
> Devpost-ready copy for each field. Paste per-field into the form.

---

## Project Name

```
QwenFlow — Visual AI Agent Orchestration
```

## Tagline / Short Description

```
Design, run, and monitor multi-model AI workflows — Qwen + Gemini, visual UI, 78 tests
```

---

## Long Description

**What it does.**
QwenFlow is a visual orchestration layer for multi-model AI agent workflows. Instead of hand-rolling API calls and glue code for every prompt, you declare a workflow as a directed graph of model steps — each step names a model, a prompt, and optional fallback — and QwenFlow handles scheduling, cross-step variable resolution, retries, fallbacks, and live per-step observability. It's the fastest path from "I have two models I like" to "I have a running, monitored pipeline."

**Visual workflow editor + REST API.**
The drag-and-drop UI lets you design a pipeline on a canvas: drop nodes, wire them up, pin a model and prompt to each, then hit Run. The same graph is exposed as a clean REST API (`POST /api/workflows`, `POST /api/workflows/:id/run`, `GET /api/models`), so what you draw in the browser is exactly what runs in CI or production. All inputs and outputs are validated with Zod schemas, so a malformed workflow fails fast with a clear error instead of crashing mid-execution. See `docs/screenshot-ui.png` for the editor in action.

**Multi-model routing — Qwen Cloud AND Google Gemini.**
QwenFlow is the only framework that routes between **Qwen Cloud and Google Gemini in a single workflow**. The Model Router maps each step to the right backend — Qwen3 for reasoning here, Gemini for a different capability there — and serializes the correct payload for each. A typical pipeline might use Qwen3 to classify input, Gemini in parallel to enrich it, then Qwen3 again to fuse both signals into a final answer. The first two run concurrently; only the third waits. Every step's latency, token usage, and which (if any) fallback model fired is captured in a replayable trace. That cross-provider routing — not "works with any one model" — is what makes QwenFlow different.

**Runs anywhere, tested hard.**
The whole stack is TypeScript (Express, Zod, Vitest, Docker). It runs out of the box with a mock fallback, so **no API key is needed to explore it**: `npm install && npm start` boots a fully working server with simulated model responses. Drop in real keys to run live. The suite is **78/78 tests passing across 8 suites**, covering the orchestrator scheduler, retry/fallback executor, variable resolution, model routing, and response aggregation — all deterministic and offline.

---

## How to Run

```
npm install && npm start
```

Works immediately with mock fallback — **no API key required** to explore. Add real Qwen Cloud + Gemini keys to run live multi-model workflows.

## Test Results

```
78/78 tests passing — 8 suites
```

Covers orchestrator scheduling, retry + fallback execution, variable resolution, Qwen↔Gemini model routing, and response aggregation. Fully offline-deterministic.

## Built With

```
TypeScript, Express, Zod, Vitest, Docker
```

## GitHub

```
https://github.com/aggreyeric/qwenflow
```

## Key Differentiator

> QwenFlow is the **only framework that routes between Qwen Cloud AND Google Gemini in a single workflow.**

## Screenshot

```
docs/screenshot-ui.png
```

---

_Prepared by hack_2. Not submitted anywhere. Awaits Eric's approval before any portal upload._
