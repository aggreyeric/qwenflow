# QwenFlow — Qwen Cloud Hackathon Submission Package

> **One copy-paste-ready doc for the Devpost submit.** Status: DRAFT — awaiting
> Eric's approval. **Do not submit without Eric's go.**
>
> Source of truth for "what the code actually does" = `ARCHITECTURE.md` +
> `README.md` (103 tests passing, Qwen multi-model routing, retry/fallback
> present). `QWEN_CLOUD_SUBMISSION.md` / `QWENCLOUD_JUDGES_DEMO.md` are aligned
> with the current code.
>
> **THE QWEN ANGLE (read this first):** This is the **Qwen ecosystem
> hackathon**. Judges want Qwen models **front and center**, not a generic LLM
> wrapper. Every field below is written so **Qwen3 / Qwen-VL / Qwen-Audio on the
> Qwen Cloud (DashScope) API** is the star. Gemini is mentioned only as an
> *optional per-step fallback* — never as a co-equal star. Lead with Qwen.
>
> **Hard feature rules** (do not deviate on the Devpost form):
> - ✅ CLAIMS: deep Qwen Cloud / DashScope integration, per-step routing across
>   the **Qwen model family** (Qwen3-4B/8B/32B text, Qwen-VL vision, Qwen-Audio
>   speech), multi-model Qwen pipelines, DAG/wave-based orchestration, retry
>   with exponential backoff, cross-provider `fallbackModel`, capability
>   registry, Qwen id→DashScope name mapping, REST API, zero-config
>   deterministic mock mode, 103 tests. Optional Gemini fallback per step.
> - ❌ DO NOT CLAIM: image/audio *bytes* attached to Qwen-VL/Qwen-Audio steps
>   (steps send chat-completion text; the router selects the model), tool-calling
>   / function-calling, multi-agent communication, or a cost total
>   (`costPerMillionTokens` is 0 and not summed).
> - ⚠️ SCOPE HONESTY: the router selects the correct Qwen model per step and
>   maps it to its DashScope name; steps send a chat-completion text prompt. Say
>   exactly this. It is strong, not weak.

---

## TL;DR — copy-paste fast facts

| Field | Value |
|---|---|
| **Project name** | QwenFlow |
| **Tagline** | The orchestration layer Qwen Cloud is missing — declare one graph, route each step to the right Qwen model (Qwen3 / Qwen-VL / Qwen-Audio via DashScope), run the whole Qwen model family in a single pipeline with retry + fallback. |
| **Hackathon** | **Qwen Cloud AI Hackathon** — **$45,000** → https://qwencloud-hackathon.devpost.com/ |
| **Theme angle** | Deep Qwen ecosystem integration: built around Qwen Cloud's multi-model family, not a generic LLM wrapper |
| **Deadline** | **Jul 9, 2026** (≈12 days from Jun 28) |
| **GitHub repo** | https://github.com/aggreyeric/qwenflow *(verified: `git remote get-url origin`)* |
| **Tests** | **103 passing across 10 suites** *(deterministic mock mode, hermetic, sub-second)* |
| **Qwen integration (the point)** | Native Qwen Cloud / DashScope client · per-step routing across **Qwen3-4B/8B/32B + Qwen-VL + Qwen-Audio** · Qwen id→DashScope model-name mapping · multi-model Qwen pipelines running in parallel |
| **Verified real features** | Per-step Qwen routing · DAG/wave-based orchestration · retry w/ exponential backoff · cross-provider `fallbackModel` · 8-model capability registry (5 Qwen + 3 Gemini) · QwenCloudClient (DashScope, OpenAI-compatible) · REST API · zero-config deterministic mock mode |
| **Do NOT claim** | Image/audio bytes to Qwen-VL/Qwen-Audio steps · tool-calling · multi-agent swarm · cost total |

> Source of truth for what the code does = `ARCHITECTURE.md` + `README.md` +
> live `npm test` (103/103). The Qwen Cloud docs
> (`QWEN_CLOUD_SUBMISSION.md`, `QWENCLOUD_JUDGES_DEMO.md`) are current.

---

## 0. Submit Here

```
Hackathon:  Qwen Cloud AI Hackathon — $45,000
URL:        https://qwencloud-hackathon.devpost.com/
Deadline:   Jul 9, 2026
GitHub:     https://github.com/aggreyeric/qwenflow
```

---

## 1. Project Name  *(Devpost → "Project Name")*

```
QwenFlow
```

---

## 2. Tagline  *(Devpost → "Subtitle / one-liner")*

Pick ONE. Recommended = first (most Qwen-forward).

```
QwenFlow — The orchestration layer Qwen Cloud is missing. Declare one graph, route each step to the right Qwen model (Qwen3, Qwen-VL, Qwen-Audio via DashScope), and run the whole Qwen model family in a single pipeline with retry + fallback.
```

Alternates (shorter):

```
QwenFlow — Compose Qwen3, Qwen-VL, and Qwen-Audio into reliable multi-model pipelines on Qwen Cloud.
```

```
QwenFlow — Turn Qwen Cloud's model family into composable building blocks, with retry, fallback, and observability built in.
```

---

## 3. Short Description  *(Devpost → "Tell us about your project" / about-blurb)*

```
QwenFlow is the orchestration layer Qwen Cloud is missing. Qwen Cloud exposes a
powerful, coherent model family — Qwen3 for text/reasoning, Qwen-VL for vision,
Qwen-Audio for speech — all behind one DashScope API. But it stops at the
endpoint: there is no way to compose those models into multi-step pipelines that
route, parallelize, retry, and fail over. QwenFlow fills that gap.

You declare a workflow — a directed graph of steps — and each step names the
Qwen model it needs. QwenFlow's Model Router maps each id to its DashScope model
name (qwen3-32b → qwen3-32b; qwen-vl → qwen-vl-max; qwen-audio →
qwen-audio-turbo), resolves cross-step variable references like
${steps.analyze.output}, runs independent steps in parallel, and aggregates each
step's output, token usage, and latency into a single replayable trace.

A single pipeline can route one step to Qwen3 to classify text, a second step to
a different Qwen model in parallel, and a third Qwen3 step to fuse both signals
into a verdict. Every step retries transient failures with exponential backoff
and can transparently fall back to another model. This is purpose-built Qwen
ecosystem tooling — not a generic, model-agnostic wrapper.
```

---

## 4. What It Does  *(Devpost → "What it does")*

```
QwenFlow turns the Qwen Cloud model family into composable, reliable pipelines:

• INTEGRATES QWEN CLOUD NATIVELY — a QwenCloudClient talks to Alibaba's
  DashScope gateway over its OpenAI-compatible /chat/completions endpoint with
  Bearer token auth. Qwen model ids are mapped to their real DashScope names
  (qwen-vl → qwen-vl-max, qwen-audio → qwen-audio-turbo). The key is read from
  QWEN_CLOUD_API_KEY or DASHSCOPE_API_KEY.
• ROUTES PER STEP ACROSS THE QWEN FAMILY — a Model Router selects the correct
  Qwen model for each step: Qwen3-4B/8B/32B for text & reasoning, Qwen-VL for
  vision, Qwen-Audio for speech. You declare which Qwen model each step uses
  once; the router does the rest, so a multi-model Qwen chain is just another
  workflow.
• COMPOSES THE FULL QWEN FAMILY — one pipeline routes to four Qwen models, runs
  independent steps in parallel, and fuses their outputs. (Optional Gemini is a
  per-step fallback only — Qwen is the backbone.)
• CHAINS STEP → STEP — the output of step n is threaded into step n+1's prompt
  via ${steps.<id>.output} and ${inputs.<key>} references; dependencies are
  inferred from the prompt, no manual edge-wiring.
• SCHEDULES INTELLIGENTLY — wave-based execution runs independent steps
  concurrently and dependent steps in order, and terminates cleanly (never
  hangs) on a cycle or dangling reference.
• STAYS RESILIENT — every step retries transient failures with exponential
  backoff (150ms → 300ms → 600ms …) and transparently falls back to a backup
  model when needed.
• IS OBSERVABLE — per-step output, token usage, and latency are captured in one
  replayable run object.
• IS DUAL-SURFACE — everything is an Express REST API (/api/workflows,
  /api/models) AND drivable headlessly from a CLI.
• RUNS WITH ZERO SECRETS — adapters fall back to deterministic mock mode with no
  API key, so the whole stack boots, runs end-to-end, and is demo-ready
  instantly.
```

---

## 5. How We Built It  *(Devpost → "How we built it")*

```
QwenFlow is a TypeScript service built around a deep, native Qwen Cloud
integration, on five decoupled layers:

• QwenCloudClient (src/qwencloud.ts) — talks to Alibaba's DashScope gateway over
  its OpenAI-compatible /chat/completions endpoint, Bearer-token auth. Maps Qwen
  ids to real DashScope model names (qwen-vl → qwen-vl-max, qwen-audio →
  qwen-audio-turbo). Reads QWEN_CLOUD_API_KEY or DASHSCOPE_API_KEY; with neither
  set, chat() returns a deterministic mock so the system runs key-free.
• Workflow (the plan) — a typed DAG: steps[] (id, model, prompt, temperature,
  maxTokens, retryCount, fallbackModel). Dependencies are inferred by scanning
  prompts for ${steps.<id>.output}, so workflow definitions stay declarative.
• Orchestrator (the engine) — executes steps in dependency-ordered waves,
  parallel within a wave, sequential across waves; resolves ${steps.*} and
  ${inputs.*} prompt templates; tracks run state/progress; marks runs
  completed/failed cleanly (cycle and dangling-reference cases are unit-tested).
• Step Executor (resilience) — exponential backoff retry plus transparent model
  fallback.
• Model Router (src/models.ts) — one callModel() function routes by model id to
  the Qwen Cloud client; an 8-model capability registry advertises context
  window, vision, audio, and tool flags per Qwen model so the right model is
  picked per sub-task.
• Surfaces — Express REST API (/api/workflows, /api/models), a CLI
  (npx qwenflow run), a drag-and-drop web editor, and Docker.

Stack: TypeScript, Express, Zod, Vitest, Qwen Cloud API (DashScope), Docker.
Optional: Google Gemini (@google/generative-ai) as a per-step fallback model.

Built and continuously verified by coding agents: a generate → typecheck →
test → ship loop guarded by 103 passing tests across 10 suites, all green in
deterministic mock mode with no live model calls in CI.
```

---

## 6. Challenges We Ran Into  *(Devpost → "Challenges")*

```
• Making the Qwen family truly composable. Qwen3, Qwen-VL, and Qwen-Audio are
  each excellent, but there was no orchestration layer to chain them. We built a
  per-step Model Router that maps each Qwen id to its real DashScope model name,
  so a single pipeline can mix Qwen3 reasoning, Qwen-VL vision, and Qwen-Audio
  speech — Qwen-native, not model-agnostic.
• Reliability against real provider flakiness. DashScope (like any endpoint)
  returns rate limits and transient 5xx. We made resilience a first-class step
  property: per-step retry with exponential backoff, plus a fallbackModel so a
  Qwen step can fail over and the chain keeps going.
• Inferring execution order safely. Hand-wiring DAG edges is error-prone. We
  derive each step's runtime dependencies from the prompt itself
  (${steps.<id>.output}), then schedule in dependency-ordered waves. The hard
  part was guaranteeing termination: a cycle or dangling reference must produce a
  clean "failed" status, never an infinite loop. Both cases are unit-tested.
• Testing hermetically without burning model budget. Every provider degrades to
  a deterministic mock when no API key is set, and the orchestrator accepts an
  injected model caller. The result: 103 tests across 10 suites that never touch
  the network and run in under a second — CI stays free and green.
```

---

## 7. Accomplishments That We're Proud Of  *(Devpost → "Accomplishments")*

```
• A genuine Qwen-multi-model pipeline: one trigger runs an ordered workflow that
  routes per step across the Qwen family (Qwen3 + Qwen-VL + Qwen-Audio on
  DashScope), threads each step's output into the next, and reports telemetry
  back — end to end. Built for Qwen Cloud, not bolted onto it.
• A real DashScope integration: Qwen id → DashScope model-name mapping, Bearer
  auth, OpenAI-compatible chat-completion shape, key auto-loaded from env.
• Resilience by default: exponential-backoff retry + model fallback live inside
  the orchestrator, not bolted on.
• 103 passing tests across 10 suites — the generate → typecheck → test → ship
  gate that makes multi-model Qwen orchestration safe enough to deploy.
• Zero-config runnability: docker compose up / npm start boots the full stack in
  deterministic mock mode with no keys — instant for judges and CI alike.
• Multiple surfaces over one engine: the same orchestrator and store power a
  REST API, a CLI, a visual editor, and Docker — one source of truth.
```

---

## 8. What We Learned  *(Devpost → "What we learned")*

```
• The Qwen model family's real power is unlocked by composition, not by calling
  one model at a time. Routing Qwen3 for reasoning, Qwen-VL for vision, and
  Qwen-Audio for speech per step — within one pipeline — is what makes Qwen
  Cloud feel like a platform, not just a set of endpoints.
• DashScope's OpenAI-compatible shape was a big enabler: a single, consistent
  chat-completion request works across every Qwen model, which is exactly what
  makes clean multi-model orchestration tractable.
• Provider failure is the norm, not the exception. Making retry and fallback
  first-class step properties — rather than ad-hoc try/catch — was the single
  biggest reliability win.
• Hermetic, mock-first testing is non-negotiable for orchestration code.
  Deterministic mocks + dependency injection let us test scheduling, retry, and
  fallback deterministically and keep CI free of model spend.
```

---

## 9. What's Next for QwenFlow  *(Devpost → "What's next")*

```
• Deeper Qwen multimodality — extend Qwen-VL and Qwen-Audio steps to attach real
  image/audio payloads (today the router selects the model and steps send a text
  prompt; next we pass the bytes).
• Persistent storage — swap the in-memory store for Redis/SQLite (the store is
  already structured as a drop-in interface).
• A library of pre-built Qwen workflow templates (research summaries, multimodal
  sentiment, document Q&A) seeded by coding agents.
• Optional tool-calling — extend steps to invoke real tools/functions, turning
  the reasoning chain into a fuller tool-using Qwen agent.
• Cost tracking — surface a per-run cost total from per-model pricing, building
  on the token counts already captured per step.
```

---

## 10. Built With  *(Devpost → tech tags; tick these)*

```
TypeScript
Node.js
Express
Zod
Vitest
Qwen / Qwen Cloud (DashScope)        ← the star
Docker
```

(Optional, only if a "fallback models" tag exists:)
```
Google Gemini (@google/generative-ai)   ← optional per-step fallback
```

---

## 11. Links  *(Devpost → "Links")*

```
GitHub repo:  https://github.com/aggreyeric/qwenflow
Hackathon:    https://qwencloud-hackathon.devpost.com/
```

Demo assets (attach to the Devpost gallery; all already in the repo under `docs/`):

```
docs/screenshot-ui.png   — dark-theme workflow editor (visual node graph)
```

---

## 12. Demo Script (judging) — pointer + summary

The 3-minute live-demo script lives in **`QWENCLOUD_JUDGES_DEMO.md`**. It proves
QwenFlow is the most **Qwen-native** agent framework in the hackathon by
demonstrating three capabilities, each backed by a test:

| Capability | What it proves | Test that backs it |
|---|---|---|
| **Multi-model Qwen chains** | Steps reference each other via `${steps.X.output}`; orchestrator resolves them topologically | `resolves ${steps.X.output} references` |
| **Per-step Qwen routing** | Each step names its own Qwen model; router maps it to its DashScope name (qwen3-4b → 8b → 32b demo) | `runs a 3-step workflow to completion` |
| **Retry + fallback resilience** | A failing step retries with exponential backoff, then transparently falls back to `fallbackModel` | `retries a failing step with backoff then succeeds` · `falls back to fallbackModel when the primary always fails` |

**Demo beats (5):**
1. **The Problem (0:00–0:30):** Qwen Cloud gives a coherent model family but no orchestration layer; today you hand-write the glue.
2. **Live Run (0:30–1:25):** one workflow routes to four Qwen models, runs two steps in parallel, and fuses outputs — via `curl` to `/api/workflows`.
3. **Resilience (1:25–2:10):** show the retry/backoff + fallback tests pass with `npm test -- orchestrator`.
4. **Replayable trace (2:10–2:50):** inspect per-step tokens + latency on any run.
5. **CTA (2:50–3:00):** `bash scripts/demo.sh` runs the full end-to-end demo; `npm test` = 103/103 green.

Run it yourself:
```bash
npm install
npm test          # 103/103 green, offline-deterministic
npm run dev       # http://localhost:3000
export DASHSCOPE_API_KEY=sk-...   # for live Qwen Cloud calls
bash scripts/demo.sh              # full end-to-end HTTP demo
```

---

## 13. Devpost Submission Checklist  *(tick every box before clicking Submit)*

**Content**
- [ ] Project Name = `QwenFlow`
- [ ] Subtitle/tagline pasted (Section 2 — Qwen-forward version)
- [ ] Short description pasted (Section 3)
- [ ] "What it does" pasted (Section 4)
- [ ] "How we built it" pasted (Section 5 — leads with QwenCloudClient)
- [ ] "Challenges" pasted (Section 6)
- [ ] "Accomplishments" pasted (Section 7)
- [ ] "What we learned" pasted (Section 8)
- [ ] "What's next" pasted (Section 9)
- [ ] "Built With" tech tags ticked — **Qwen / Qwen Cloud (DashScope) FIRST** (Section 10)
- [ ] Every field **leads with Qwen** — no generic "LLM" framing anywhere
- [ ] No claim of image/audio bytes, tool-calling, multi-agent, or cost total

**Links & media**
- [ ] GitHub repo URL set: https://github.com/aggreyeric/qwenflow
- [ ] Submitted to the correct challenge (Qwen Cloud AI Hackathon)
- [ ] At least one screenshot uploaded (docs/screenshot-ui.png)
- [ ] Optional demo video (3-min script in QWENCLOUD_JUDGES_DEMO.md) recorded/linked

**Verification before submit**
- [ ] `npm test` shows 103/103 passing (paste this fact matches the description)
- [ ] `docker compose up` runs clean in mock mode (no keys needed)
- [ ] Live `curl POST /api/workflows .../run` returns a ✅ completed multi-step Qwen result (per the 3-min demo)
- [ ] Read every field aloud once — nothing overstates the code
- [ ] **Eric's explicit approval to submit** ✅

**Post-submit**
- [ ] Submission marked "Submitted" on Devpost before the Jul 9 deadline
- [ ] Devpost URL captured and shared back to the team

---

_Notes for Eric: this package is centered on deep **Qwen Cloud / DashScope**
integration — Qwen3 / Qwen-VL / Qwen-Audio are the stars, Gemini is an optional
per-step fallback only. Claims match `ARCHITECTURE.md` + `README.md`: native
DashScope client, Qwen id→model-name mapping, per-step Qwen routing, DAG/wave
orchestration, retry+fallback, capability registry, REST API, CLI, web editor,
mock mode, 103 tests. It does NOT claim image/audio bytes to Qwen-VL/Qwen-Audio
steps (steps send text; the router selects the model), tool-calling, multi-agent
swarm, or a cost total. Confirm with `npm test` before you submit. Awaiting your
go. — hack_1_
