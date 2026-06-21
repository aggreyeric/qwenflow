# Qwen Cloud Hackathon Submission Form Fields — QwenFlow

> Copy-paste-ready text for each field of the Qwen Cloud AI Hackathon submission form.
> **Status: DRAFT — not submitted anywhere. Awaits Eric's approval.**

---

## 1. Project Name

```
QwenFlow
```

---

## 2. One-line tagline (max 255 chars)

```
Build, orchestrate, and monitor multi-step AI agent workflows on Qwen Cloud
```

*(71 chars)*

---

## 3. Description (≈720 words)

```
QwenFlow turns Qwen Cloud's model family into composable building blocks.

THE PROBLEM
Qwen Cloud ships one of the richest model families on the market — Qwen3 for reasoning, Qwen-VL for vision, Qwen-Audio for speech. But actually using more than one of them in a single product still means writing one-off, hand-rolled API calls: glue code for every prompt, bespoke retry logic for every endpoint, and zero visibility into how tokens and cost flow across steps. The moment a second model joins the pipeline, "just call the API" stops scaling. Most orchestration tools paper over this by being aggressively model-agnostic, which is precisely why none of them exploit what makes Qwen special: a single coherent family that spans text, vision, and audio.

THE SOLUTION
QwenFlow goes the other way. It is opinionated about Qwen's multi-model strengths and lets you declare a workflow — a directed graph of model steps — instead of writing integration code. Each step names a Qwen model and a prompt template; QwenFlow handles scheduling, variable resolution between steps, retries, automatic fallback to a cheaper or different model, and live per-step observability.

WHAT IT DOES
At its core QwenFlow is a pipeline-oriented orchestrator. You describe a workflow as plain JSON: a set of inputs, a list of steps (each pinning a model and a prompt, optionally a retry policy or a fallback model), and a final output expression. QwenFlow parses that graph, resolves cross-step references like ${steps.analyze-text.output}, executes independent steps in parallel, waits at join points, and aggregates every step's output, token usage, latency, and cost into a single replayable trace.

A representative pipeline might run Qwen3 to classify text sentiment, Qwen-VL in parallel to read the emotional tone of an attached image, and then Qwen3 again to fuse both signals into a brand-safety verdict. QwenFlow executes the first two concurrently and only the third waits. The trace shows per-step latency, token counts, and which (if any) fallback model was actually invoked.

TECH STACK
QwenFlow is TypeScript-first, end to end. The server is Express, exposing REST endpoints for creating workflows (/api/workflows), running them (/api/workflows/:id/run), and inspecting the model registry (/api/models). Workflow definitions, inputs, and outputs are validated with Zod schemas, so a malformed workflow fails fast with a clear error instead of crashing mid-execution. Internally, five clean layers keep concerns separated: the Qwen Cloud API (DashScope-compatible endpoints), a Model Router that maps each step to the right endpoint and payload (text, image, or audio), the Orchestrator that schedules steps and resolves variables, a Step Executor that owns retry-with-backoff and fallback, and a Response Aggregator that produces the trace. The layering is deliberate — you can swap the Router for a local model or replace the Aggregator with an OpenTelemetry exporter without touching the scheduler. A drag-and-drop UI renders and serializes the graph, and a CLI (`npx qwenflow run`) drives workflows headlessly. Tests run on Vitest, the Model Router is mocked in CI so no live Qwen Cloud calls are made there, and the whole thing runs locally via `docker compose up` with zero external dependencies beyond an API key.

WHY QWEN CLOUD
QwenFlow was built specifically for Qwen Cloud rather than retrofitted onto it. The framework is designed around Qwen's actual shape: a single family that coherently covers text (Qwen3), vision (Qwen-VL), and audio (Qwen-Audio), each exposed through DashScope-compatible endpoints with a consistent request shape. That consistency is what makes clean multi-model orchestration possible at all — and it is exactly what generic, model-agnostic orchestrators leave on the table. QwenFlow's Model Router knows the difference between a text step, a vision step, and an audio step and serializes the right payload for each, so a multimodal pipeline is just another workflow, not a special case.

FOR JUDGES
The repository runs out of the box: `npm install`, `export DASHSCOPE_API_KEY=...`, `npm run dev`, open http://localhost:3000. `bash scripts/demo.sh` exercises the full HTTP API end to end — create a two-step Qwen3 workflow, run it, print the results, and list available models. The test suite (`npm test`) covers the orchestrator's scheduler, the retry/fallback executor, variable resolution, and the response aggregator, all offline-deterministic. No real funds are involved and no secrets beyond a single Qwen Cloud API key are required.

QwenFlow is the orchestration layer Qwen Cloud's model family deserves.
```

*(~718 words — within the 500–800 target)*

---

## 4. Demo video URL

```
[Eric: add YouTube/Drive link]
```

> The end-to-end demo can be run locally with `bash scripts/demo.sh`. Placeholder until Eric uploads the recording.

---

## 5. GitHub repo URL

```
https://github.com/aggreyeric/qwenflow
```

---

## 6. Category / Track selection

**Recommendation: `[TBD — needs verification against the official Qwen Cloud hackathon track list]`**

```
[TBD]
```

> **Why this needs a check:** the README notes the hackathon is "a $70K prize pool across 5 tracks" and that QwenFlow "targets the multi-model orchestration and developer-tooling tracks" — but the exact, official track names have not been confirmed yet. Two plausible landing tracks, pending confirmation:
>
> - **Developer Tooling / Infrastructure** — QwenFlow is fundamentally a developer tool: a workflow engine, a typed SDK, a REST API, and a CLI for composing Qwen models. This is the most natural home.
> - **Multi-Model / Multimodal App** — the README emphasizes Qwen3 + Qwen-VL + Qwen-Audio composition, which would fit a multimodal-application track if one exists.
>
> Action for Eric: pull the official track names from the hackathon site, paste the best match into field 6, and delete this note.

---

## 7. Built with

```
TypeScript, Express, Qwen Cloud, Vitest, Docker
```

---

## ✅ Submission checklist (for Eric before submitting)

- [ ] Confirm Project Name / tagline read well to you
- [ ] Approve the ~720-word description (or trim to taste)
- [ ] **Verify the official track list and fill in field 6** (currently TBD)
- [ ] Upload demo video → paste real URL into field 4
- [ ] Confirm GitHub repo (https://github.com/aggreyeric/qwenflow) is **public** and the README renders
- [ ] Run `bash scripts/demo.sh` once against a live `DASHSCOPE_API_KEY` and confirm clean output
- [ ] Confirm `npm test` passes green on the submitted commit
- [ ] Only then hit Submit

---

_Prepared by hack_3. Not submitted. Awaits operator approval._
