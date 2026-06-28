# QwenFlow — UiPath AgentHack Submission Package

> **One copy-paste-ready doc for the Devpost submit.** Status: DRAFT — awaiting
> Eric's approval. **Do not submit without Eric's go.**
>
> Source of truth for "what the code actually does" = `ARCHITECTURE.md` + `README.md`
> (103 tests passing, retry/fallback present). Older drafts `UIPATH_SUBMISSION.md`
> and `UIPATH_JUDGES_DEMO.md` said retry/fallback did **not** exist at 94 tests —
> that is outdated; the code has since gained retry+fallback and now has **103 tests**.
>
> **Hard feature rules** (do not deviate on the Devpost form):
> - ✅ CLAIMS: per-step multi-model routing (Qwen + Gemini), DAG/wave-based
>   orchestration, reasoning chained step→step, retry with exponential backoff,
>   cross-provider model fallback, capability registry, Slack `/qwenflow` control
>   plane, REST API, zero-config deterministic mock mode, 103 tests.
> - ❌ DO NOT CLAIM: tool-calling / function-calling, multi-agent communication,
>   "agents talking to agents". It is **one autonomous multi-model chain**, not a
>   multi-agent swarm. Pitch as *autonomous multi-model agent chain*.

---

## TL;DR — copy-paste fast facts

| Field | Value |
|---|---|
| **Project name** | QwenFlow |
| **Tagline** | Orchestrate many models into one autonomous agent — plan a task as ordered steps, route each step to the best model (Qwen or Gemini), chain reasoning across steps, run autonomously from Slack. |
| **Hackathon** | UiPath AgentHack — **$50,000** → https://uipath-agenthack.devpost.com/ (challenge_id `29624`) |
| **Theme** | "Building AI agents using coding agents" |
| **Deadline** | **Jun 29, 2026** |
| **GitHub repo** | https://github.com/aggreyeric/qwenflow *(verified: `git remote get-url origin`)* |
| **Tests** | **103 passing across 10 suites** *(verified: `npm test` → 103 passed, deterministic mock mode, hermetic)* |
| **Agent angle** | One autonomous **multi-step, multi-model chain** — plans → routes per step → chains reasoning step→step → reports to Slack. *(Pitch as autonomous agent chain. NOT tool-calling / multi-agent swarm.)* |
| **Verified real features** | Per-step Qwen+Gemini routing · DAG/wave-based orchestration · retry w/ exponential backoff · cross-provider `fallbackModel` · 8-model capability registry · Slack `/qwenflow run\|status\|models` · REST API · zero-config deterministic mock mode |
| **Do NOT claim** | Tool-calling / function-calling · "agents talking to agents" · multi-agent communication |

> Source of truth for what the code does = `ARCHITECTURE.md` + `README.md` + live `npm test` (103/103). The two older drafts (`UIPATH_SUBMISSION.md`, `UIPATH_JUDGES_DEMO.md`) said retry/fallback was missing at 94 tests — **outdated**: retry+fallback now exists and the suite is 103.

---

## 0. Submit Here

```
Hackathon:  UiPath AgentHack — $50,000
URL:        https://uipath-agenthack.devpost.com/
challenge_id: 29624
Theme:      "Building AI agents using coding agents"
Deadline:   Jun 29, 2026
GitHub:     https://github.com/aggreyeric/qwenflow
```

---

## 1. Project Name  *(Devpost → "Project Name")*

```
QwenFlow
```

---

## 2. Tagline  *(Devpost → "Subtitle / one-liner")*

Pick ONE. Recommended = first.

```
QwenFlow — Orchestrate many models into one autonomous agent. It plans a task as ordered steps, routes each step to the best model (Qwen or Gemini), chains reasoning across steps, and runs the whole chain autonomously from Slack.
```

Alternates (shorter):

```
QwenFlow — A multi-model agent orchestrator: plan, route per step, chain reasoning, run autonomously.
```

```
QwenFlow — Turn eight LLMs across two providers into one reliable, autonomous agent chain you operate from Slack.
```

---

## 3. Short Description  *(Devpost → "Tell us about your project" / about-blurb)*

```
QwenFlow is an AI agent orchestration platform that turns multiple large language
models into composable, reliable building blocks. Instead of hand-writing one-off
API glue for every prompt, you declare a workflow — an ordered graph of model
steps — and QwenFlow plans, routes, chains, and runs the whole thing
autonomously, with a human-in-the-loop surface over Slack.

A single pipeline can mix Qwen (Qwen3 for reasoning, Qwen-VL for vision,
Qwen-Audio for speech, via DashScope) and Google Gemini (2.0 Flash, 1.5 Pro,
1.5 Flash), because the Model Router dispatches to the right provider per step —
switching providers mid-pipeline. The output of each step becomes reasoning
context for the next, so the agent accumulates state and reasons across steps
rather than answering in isolation. Runs are observable: per-step status,
progress, token usage, and latency are tracked and posted back to Slack, or
served over a REST API any system can call.

Crucially, QwenFlow fits the hackathon theme on both sides: it is an agent
platform, and it is itself built and continuously verified by coding agents —
a real generate → typecheck → test → ship loop guarded by 103 passing tests in
fully deterministic mock mode.
```

---

## 4. What It Does  *(Devpost → "What it does")*

```
QwenFlow turns a goal into an autonomous, multi-step, multi-model agent run:

• PLANS — a goal is expressed as an ordered workflow (a DAG of steps); each step
  declares which model it needs. Dependencies are inferred from the prompt, no
  manual edge-wiring.
• ROUTES PER STEP — a Model Router dispatches each step to the right provider by
  model id (gemini-* → Google Gemini; qwen* → Qwen / DashScope), so one pipeline
  mixes Qwen3 (reasoning), Qwen-VL (vision), Qwen-Audio (speech), and Gemini
  (fast multimodal) in the same run.
• CHAINS REASONING — the output of step n is threaded into step n+1's prompt as
  context, so the agent reasons across steps instead of in isolation.
• RUNS AUTONOMOUSLY — the orchestrator schedules independent steps in parallel
  and dependent steps in order, with wave-based execution that never hangs on a
  cycle or dangling reference.
• STAYS RESILIENT — every step retries transient failures with exponential
  backoff, and can transparently fall back to a backup model — even across
  providers (a Qwen step can fail over to Gemini, or vice versa).
• REPORTS — run status, progress %, per-step token usage and latency are
  captured in one replayable run object.
• OPERATES FROM SLACK — `/qwenflow run | status | models` slash commands trigger
  runs and post structured results back (Socket Mode), giving human-in-the-loop
  control over fully autonomous execution.
• SAME THING VIA REST — everything is also an HTTP API any system can call, so
  QwenFlow works as an external agent layer alongside low-code / UiPath flows.
• RUNS WITH ZERO SECRETS — adapters fall back to deterministic mock mode with no
  API keys, so the whole stack boots, runs end-to-end, and is demo-ready
  instantly.
```

---

## 5. How We Built It  *(Devpost → "How we built it")*

```
QwenFlow is a TypeScript service built on five decoupled layers:

• Workflow (the plan) — a typed DAG: steps[] (id, model, prompt, temperature,
  maxTokens, retryCount, fallbackModel) + edges[]. Dependencies are inferred by
  scanning prompts for ${steps.<id>.output} references, so workflow definitions
  stay declarative.
• Orchestrator (the agent loop) — executes steps in dependency-ordered waves,
  parallel within a wave, sequential across waves; resolves ${steps.*} and
  ${inputs.*} prompt templates; tracks run state and progress; marks runs
  completed/failed cleanly (cycle and dangling-reference cases are unit-tested).
• Step Executor (resilience) — exponential backoff retry (150ms → 300ms →
  600ms …) plus transparent cross-provider model fallback.
• Model Router (tool selection) — one callModel() function routes by model-id
  prefix to the Qwen Cloud client (DashScope, OpenAI-compatible) or the Gemini
  client (@google/generative-ai). An 8-model capability registry advertises
  vision / audio / tools / context window so the right model is picked per
  sub-task.
• Surfaces — an Express REST API (/api/workflows, /api/models), a @slack/bolt
  Slack control plane (/qwenflow run | status | models, Socket Mode), a CLI, and
  a static web UI.

Stack: TypeScript, Express, Zod, Vitest, Qwen Cloud API (DashScope), Google
Gemini API, @slack/bolt, Docker.

Theme fit: QwenFlow is both an agent platform and a product of coding agents.
Coding agents generate workflow scaffolds, wire model adapters, and run the
quality gate — generate → typecheck → test → ship — guarded by 103 passing
tests across 10 suites, all green in deterministic mock mode with no live model
calls in CI.
```

---

## 6. Challenges We Ran Into  *(Devpost → "Challenges")*

```
• Reliable multi-provider routing. Real providers fail in different ways — rate
  limits, transient 5xx, key issues. We solved this by making resilience a
  first-class step property: per-step retry with exponential backoff, plus a
  cross-provider fallbackModel so a Qwen step can fail over to Gemini (or
  vice-versa) and the chain keeps going.
• Inferring execution order safely. Hand-wiring DAG edges is error-prone. We
  derive each step's runtime dependencies from the prompt itself
  (${steps.<id>.output}), then schedule in dependency-ordered waves. The hard
  part was guaranteeing termination: a dependency cycle or a dangling reference
  must produce a clean "failed" status, never an infinite loop. Both cases are
  explicitly unit-tested.
• Testing hermetically without burning model budget. Every provider degrades to
  a deterministic mock when no API key is set, and the orchestrator accepts an
  injected model caller. The result is 103 tests across 10 suites that never
  touch the network and run in under a second — CI stays free and green.
• Treating models as agents, not black boxes. Generic orchestration frameworks
  ignore that Qwen3, Qwen-VL, Qwen-Audio, and Gemini have genuinely different
  strengths. We built a capability registry so each sub-task routes to the model
  actually suited for it.
```

---

## 7. Accomplishments That We're Proud Of  *(Devpost → "Accomplishments")*

```
• A genuine multi-model agent chain: one trigger runs an ordered pipeline that
  routes per step to the right model across two providers, threads each step's
  output into the next, and reports telemetry back to Slack — end to end.
• Resilience by default: exponential-backoff retry + cross-provider fallback
  live inside the orchestrator, not bolted on.
• 103 passing tests across 10 suites — the generate → typecheck → test → ship
  gate that makes autonomous orchestration safe enough to deploy.
• Zero-config runnability: docker compose up / npm start boots the full stack in
  deterministic mock mode with no keys — instant for judges and CI alike.
• Two operation surfaces over one engine: the same orchestrator and store power
  Slack slash commands, a REST API, a CLI, and a web UI.
```

---

## 8. What We Learned  *(Devpost → "What we learned")*

```
• An "agent" earns the name by planning, selecting the right tool per sub-task,
  carrying state between steps, and reporting back — not by wrapping a single
  prompt. Per-step routing and step→step reasoning are what make multi-model
  pipelines feel autonomous.
• Provider failure is the norm, not the exception. Making retry and fallback
  first-class step properties — rather than ad-hoc try/catch — was the single
  biggest reliability win.
• Hermetic, mock-first testing is non-negotiable for agent code. Deterministic
  mocks + dependency injection let us test scheduling, retry, and fallback
  deterministically and keep CI free of model spend.
```

---

## 9. What's Next for QwenFlow  *(Devpost → "What's next")*

```
• Persistent storage — swap the in-memory store for Redis/SQLite (the store is
  already structured as a drop-in interface).
• A library of pre-built workflow templates (research summaries, multimodal
  sentiment, document Q&A) seeded by coding agents.
• Deeper UiPath integration — expose QwenFlow as an external agent layer a
  UiPath Agent Builder / Maestro case / API Workflow invokes for multi-model
  decisions.
• Optional tool-calling — extend steps to invoke real tools/functions, turning
  the reasoning chain into a fuller tool-using agent.
```

---

## 10. Built With  *(Devpost → tech tags; tick these)*

```
TypeScript
Node.js
Express
Zod
Vitest
Qwen / Qwen Cloud (DashScope)
Google Gemini (@google/generative-ai)
Slack (@slack/bolt)
Docker
```

---

## 11. Links  *(Devpost → "Links")*

```
GitHub repo:  https://github.com/aggreyeric/qwenflow
Hackathon:    https://uipath-agenthack.devpost.com/   (challenge_id 29624)
```

Demo assets (attach to the Devpost gallery; all already in the repo under `docs/`):

```
docs/screenshot-slack-ui.png   — /qwenflow slash-command interaction in Slack
docs/screenshot-ui.png         — dark-theme workflow editor
docs/uipath-screenshot.png     — UiPath AgentHack demo dashboard
docs/uipath-demo.html          — live, self-contained demo dashboard (open in browser)
```

---

## 12. Devpost Submission Checklist  *(tick every box before clicking Submit)*

**Content**
- [ ] Project Name = `QwenFlow`
- [ ] Subtitle/tagline pasted (Section 2)
- [ ] Short description pasted (Section 3)
- [ ] "What it does" pasted (Section 4)
- [ ] "How we built it" pasted (Section 5)
- [ ] "Challenges" pasted (Section 6)
- [ ] "Accomplishments" pasted (Section 7)
- [ ] "What we learned" pasted (Section 8)
- [ ] "What's next" pasted (Section 9)
- [ ] "Built With" tech tags ticked (Section 10)
- [ ] No claim of tool-calling / multi-agent communication anywhere on the form

**Links & media**
- [ ] GitHub repo URL set: https://github.com/aggreyeric/qwenflow
- [ ] Submitted to the correct challenge (challenge_id 29624, UiPath AgentHack)
- [ ] At least one screenshot uploaded (docs/screenshot-slack-ui.png + screenshot-ui.png)
- [ ] Demo dashboard / video linked or embedded if required
- [ ] Optional demo video (3-min script in UIPATH_JUDGES_DEMO.md) recorded/linked

**Verification before submit**
- [ ] `npm test` shows 103/103 passing (paste this fact matches the description)
- [ ] `docker compose up` runs clean in mock mode (no keys needed)
- [ ] Live Slack `/qwenflow run` posts a ✅ complete result (per the 3-min demo)
- [ ] Read every field aloud once — nothing overstates the code
- [ ] **Eric's explicit approval to submit** ✅

**Post-submit**
- [ ] Submission marked "Submitted" on Devpost before the Jun 29 deadline
- [ ] Devpost URL captured and shared back to the team

---

## 13. Demo Script (judging) — pointer

The 3-minute live-demo script, judging-criteria coverage map, and reality check
live in `UIPATH_JUDGES_DEMO.md`. **Note:** that doc's "Reality Check" said
retry/fallback did not exist — that is now outdated; the code has retry+fallback
and 103 tests. The demo script itself is otherwise honest and usable as-is.
Recommended demo beat: show a step failing and recovering via fallback — that
single moment dominates the Technical Execution criterion.

---

_Notes for Eric: this package claims only what ARCHITECTURE.md + README.md say
the code does today — per-step multi-model routing, DAG/wave orchestration,
step→step reasoning chaining, retry+fallback, capability registry, Slack
control plane, REST API, mock mode, 103 tests. It does NOT claim tool-calling or
multi-agent communication. Two older docs (UIPATH_SUBMISSION.md,
UIPATH_JUDGES_DEMO.md) said retry/fallback was missing at 94 tests — that was
pre-implementation; the feature now exists and test count is 103. Confirm with
`npm test` before you submit. Awaiting your go. — hack_2_
