# QwenFlow — 3-Minute Live Demo Script (UiPath AgentHack)

> **For Eric & presenter.** Live-demo judging is part of the rubric. This script is
> timed to **3:00**, maps every beat to a UiPath judging criterion, and — critically —
> only claims what the code actually does. See the **Reality Check** appendix before
> presenting; several phrases in `UIPATH_SUBMISSION.md` (retry/fallback, scheduler,
> aggregator) are *aspirational and NOT yet in the code* — do not say them live.

---

## Setup (do this *before* the clock starts)

1. Two windows side-by-side:
   - **Left:** Slack, with `/qwenflow` available (Socket Mode connected).
   - **Right:** terminal running `npm test` once, scrolled to `Tests  94 passed (94)`.
2. `docker compose up` already running; API on `http://localhost:3000`.
3. A saved workflow with **3 steps across 2 providers** ready to fire, e.g.:
   - step-1 `qwen3-32b` (reason) → step-2 `qwen-vl` (vision) → step-3 `gemini-2.0-flash` (summarize).
4. Have the dark-theme workflow editor screenshot (`docs/screenshot-ui.png`) queued as a fallback if Slack lags.

---

## The 3:00 Script

### Beat 1 — The Problem & The Hook (0:00–0:25)
> **Say:** "RPA bots automate *clicks*. But today's work is judgment — reading a
> screenshot, choosing the right model, chaining decisions. That needs **agents**,
> not bots. QwenFlow is an agent orchestration platform that runs multi-step,
> multi-model task chains autonomously — and you operate it from Slack like an RPA
> bot, or from any system over REST."
- **Shows:** workflow editor screenshot.
- **Hits criterion:** Presentation (problem→solution), Originality (RPA→agent framing).

### Beat 2 — Autonomous Multi-Model Task Chain (0:25–1:10)  ← THE CORE
> **Say:** "Watch one trigger run the whole chain with no human in the middle."
- **Do:** in Slack type `/qwenflow run <wf-id>` and hit enter.
- **Say while it runs:** "Three steps, three different models — Qwen-32B for
> reasoning, Qwen-VL for vision, Gemini-2.0-Flash for synthesis. The orchestrator
> runs them **autonomously in sequence**, and each step's output flows into the
> next as context. QwenFlow routes **per step** to the right provider."
- **The result posts:** `✅ complete — Steps: 3/3 | Tokens: N | ⏱ Nms`.
> **Say:** "That's an autonomous task chain — one command, end-to-end execution,
> with progress, token, and latency telemetry. This is what an RPA bot looks like
> when every step is an LLM decision."
- **Hits criterion:** Technical Execution (live run, telemetry), UiPath Platform Usage (external-agent orchestration pattern).

### Beat 3 — The Integration Surface = "Blend with UiPath" (1:10–1:45)
> **Say:** "Everything you just saw is also a REST API." 
- **Do:** switch to terminal, run:
> `curl -X POST localhost:3000/api/workflows/<id>/run`
- **Say:** "Same autonomous run, callable from **any** system. This is the seam
> UiPath is asking about — QwenFlow is the **external agent layer** that a
> UiPath-native agent, Maestro case, or API Workflow can invoke to get a
> multi-model decision. Coding agents + low-code, external agents blended with
> UiPath — exactly the bonus the judges flagged."
- **Hits criterion:** UiPath Platform Usage (external frameworks + API Workflows hook), Business Relevance (integrates into real stacks).

### Beat 4 — Built & Verified by Coding Agents (1:45–2:30)
> **Say:** "The theme is *building agents with coding agents*. QwenFlow is itself
> that product: coding agents generate workflow scaffolds, wire new model adapters,
> and — most importantly — run the quality gate."
- **Do:** point terminal at the green `94 passed (94)` line.
> **Say:** "Ninety-four tests across ten suites — orchestrator, model routing,
> variable resolution, REST API, Slack command layer — all green, all in
> deterministic mock mode so CI never burns model budget. Every commit is
> generate → typecheck → test → ship. That loop is what makes autonomous agent
> orchestration safe enough to actually deploy."
- **Hits criterion:** Technical Execution (test coverage, edge cases), Originality (meta: agent platform built by agents).

### Beat 5 — Close: Impact (2:30–3:00)
> **Say:** "So: autonomous multi-model task chains, operated live from Slack or any
> system via REST, built and continuously verified by coding agents. QwenFlow turns
> eight models across two providers into reliable, observable automation — the
> decision layer RPA has been missing. Thank you."
- **Do:** leave the green test count + the Slack `✅ complete` post on screen.
- **Hits criterion:** Business Relevance (scalability, production viability), Presentation (clean close).

---

## Judging-Criteria Coverage Map

| UiPath Criterion | Where it's hit in this demo |
|---|---|
| **1. Technical Execution** (exceptions, failures, edge cases) | Beat 4 (94 tests, mock-mode CI); **but see gap below — resilience is weak.** |
| **2. Presentation & Demo** (problem→solution→impact) | Beats 1 & 5; live run in Beat 2. |
| **3. UiPath Platform Usage** (Agent Builder/Maestro/API Workflows/coded agents/external frameworks) | Beat 3 — positioned as the **external agent layer** invokable via REST; blends with UiPath-native agents (the stated bonus). |
| **4. Originality / Innovation** (novel orchestration, creative framing) | Beats 1 & 4 — RPA→agent reframing; agent-platform-built-by-agents meta-loop. |
| **5. Business / Real-World Relevance** | Beats 3 & 5 — REST integration into real stacks; scalability via per-step routing. |

---

## ⚠️ Reality Check — Read Before Presenting (gap analysis)

The code is solid and the demo above is truthful, but **criterion #1 (Technical
Execution — exception/failure handling) is the weakest fit** and the existing
`UIPATH_SUBMISSION.md` overstates several features. Do not present these as done:

| Submission claims… | Reality in code | Risk |
|---|---|---|
| "retry / fallback executor" | ❌ None. `orchestrator.ts` calls the model once; on throw the **entire run fails**. | High — judges may click through; also the literal topic of criterion #1. |
| "cross-provider fallback when a step exceeds budget / rate limits" | ❌ None. Per-step routing exists, no fallback path. | High. |
| "scheduler" | ❌ Plain sequential `for` loop. | Medium — cosmetic. |
| "response aggregator" | ❌ None; stores per-step results, slices last output. | Medium. |
| "tool-calling" / "multi-agent" | ❌ Steps are prompts, not tool/function calls. It's **multi-model**, one chain — not multi-agent. | High for "agent" framing — pitch as *autonomous multi-model task chain*, not tool-calling. |

### Recommended pre-submission fixes (priority order)
1. **Add a retry + cross-provider fallback in `executeStep`** (e.g., 2 retries, then
   swap to a fallback model from the registry). This is ~30 lines and turns the #1
   rubric weakness into a strength. **Do this before submitting.**
2. **Soften `UIPATH_SUBMISSION.md`** language (remove scheduler/aggregator claims)
   OR implement them — pick one, don't ship the mismatch.
3. Keep the demo language in this file (already honest) as the source of truth.

---

_Notes for Eric: demo is ready and truthful as-is. Strongest single improvement
before deadline = add retry/fallback (item 1) so the live demo can *show* a step
failing and recovering — that single beat would dominate the Technical Execution
criterion. Say the word and I'll build it. — hack_1_
