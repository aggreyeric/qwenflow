# QwenFlow for Slack — 3-Minute Judges Demo Script

> **Hackathon:** Slack Agent Builder ($42K) · Deadline Jul 13, 2026
> **Core message:** QwenFlow is a **multi-model orchestration agent you drive from inside Slack** with one slash command — a dependency-ordered DAG of models with parallel execution, retry, and automatic fallback — not a single-prompt chatbot wrapper.
> ⚠️ Every line below is verified against `src/slack-commands.ts`, `src/slack.ts`, `src/orchestrator.ts`. See the **Claim Verification** table at the bottom — nothing here overclaims the code.

---

## The Hook (0:00–0:20)

> *"Most AI tools make you leave Slack, open a tab, paste a prompt, copy the answer back. QwenFlow is an **agent that runs from your channel**: one slash command fires a real multi-model workflow — parallel steps, retries, automatic model fallback — and posts the result back inline. Same workflows our web UI runs."*

Show: Slack workspace open, a channel with `@qwenflow` present. No browser tabs.

---

## Demo Setup (0:20–0:35)

- Screen: Slack, `#ai-ops` channel
- Bot `@qwenflow` installed; slash command `/qwenflow` enabled
- Voice: *"Three commands. Multi-model orchestration. Zero context switching."*

---

## Act 1 — Run a Multi-Model Workflow (0:35–1:25)

Pre-registered workflow `summarize-and-refine` chains three model steps (draft → critique → format) using QwenFlow's `${steps.<id>.output}` references.

**Type in channel:**
```
/qwenflow run summarize-and-refine
```

**What the judges see (exactly what the code does):**
1. Bot acknowledges instantly: `🚀 Starting workflow *Summarize & Refine* (summarize-and-refine)…`
2. Workflow executes via the `Orchestrator`: steps run in **dependency-ordered parallel waves**, each `${steps.X.output}` resolved at runtime.
3. On any failing step: **retry with exponential backoff**, then **automatic `fallbackModel`** switchover — invisible to the user, resilient by design.
4. Final result posted inline:
   ```
   ✅ *Summarize & Refine* complete
   📝 Steps: 3/3
   🔥 Tokens: 1,240 | ⏱ 4.2s
   _Last output: <drafted + refined summary>_
   ```

**Voice:** *"Three models orchestrated as a DAG, not prompt-and-pray. Retry and fallback are built in. The work happened in our orchestrator — Slack is the control plane."*

---

## Act 2 — Inspect the Surface (1:25–2:10)

**Type:**
```
/qwenflow models
```
→ Bot lists **every available model** (`id — name`), so judges see the model choice is explicit and extensible, not hardcoded.

```
/qwenflow status summarize-and-refine
```
→ Bot reports the workflow's shape (name, id, step count).

**Voice:** *"`models` shows the model roster. `status` shows registered workflows. This is the same shared in-memory store that powers our web UI — one source of truth, Slack is one more native surface."*

---

## The Close (2:10–2:30)

> *"One slash command, three subcommands, a real orchestrator underneath with parallel steps, retries, and automatic fallback. Results and token/latency telemetry land inline where your team already works. **QwenFlow is the control plane for multi-model AI in Slack.**"*

[Show one-pager / repo QR]

---

## Claim Verification (✅ = in code · do NOT claim anything not listed here)

| Demo claim | Code source | Status |
|---|---|---|
| `/qwenflow` slash command registered via `@slack/bolt` | `src/slack-commands.ts` → `app.command("/qwenflow", …)` | ✅ |
| `/qwenflow run <id>` runs a registered workflow | `getWorkflow(arg)` → `new Orchestrator(wf).run()` | ✅ |
| Acknowledges then posts final result | `ack()` → `respond("🚀 Starting…")` → `orch.run()` → `respond("✅ … complete")` | ✅ |
| Steps run in **dependency-ordered parallel waves** | `src/orchestrator.ts` (unit-tested, 12 orchestrator tests) | ✅ |
| Resolves `${steps.X.output}` / `${inputs.Y}` at runtime | `Orchestrator.resolvePrompt()` | ✅ |
| **Retry with exponential backoff** | `Orchestrator` `retryCount` (test: "retries a failing step with backoff then succeeds") | ✅ |
| **Automatic model fallback** | `fallbackModel` switchover (tested) | ✅ |
| Token + latency summary posted inline | `respond` sums `result.results[].tokens` + `completedAt - startedAt` | ✅ |
| `/qwenflow models` lists all models | `QWEN_MODELS.map(…)` | ✅ |
| `/qwenflow status [id]` lists/inspects workflows | `getAllWorkflows()` / `getWorkflow()` | ✅ |
| Shared store with web UI | `src/store.ts` (Map shared by routes + Slack) | ✅ |
| Socket Mode (zero-config local dev) + HTTP receiver | `src/slack.ts` `socketMode`, `ExpressReceiver` | ✅ |
| **103 tests pass** (incl. 12 Slack-command + orchestrator resilience) | `npm test` | ✅ |

---

## Honest Gaps — What the Code Does NOT Do (don't overclaim to judges)

These features are **not** in the code today. Do **not** demo them as working:

1. **No free-text prompt run.** `/qwenflow run` takes a **registered workflow id**, not an arbitrary prompt. (To run ad-hoc text, you'd first register a workflow. This is a real extension opportunity.)
2. **No thread-based updates.** Results post to the channel via `respond()`; there is no `thread_ts` threading and no live per-step progress posts. (The handler blocks until the full run completes, then posts once.)
3. **No run history / run IDs surfaced to the user.** `status` lists **workflow definitions**, not past runs, cost, or model mix.
4. **No cost tracking.** Token counts and latency are reported; **no dollar cost** is computed.
5. **No conversational/thread-aware replies.** There is no `app.message` handler — the bot only answers the `/qwenflow` command. It cannot be @-mentioned for follow-up chat.
6. **In-memory store.** Resets on restart (production would need Redis/SQLite — flagged in `SLACK_INTEGRATION_PLAN.md`).

> If a judge asks about threads / live progress / cost — answer honestly: *"That's the next milestone — the orchestrator already supports progress tracking internally via `WorkflowRun`; surfacing it to Slack threads is a clean additive step."*

---

## Why This Wins (judge cheat-sheet — read silently)

| Slack rewards | QwenFlow delivers (verified) |
|---|---|
| Agent **native to Slack** | Slash command surface, no iframe bolt-on |
| **Real** agent behavior | DAG orchestration, parallel waves, retry, fallback — not prompt→string |
| **Extensibility** | Add a model = a line in `QWEN_MODELS`; add a step = a `${steps.X.output}` ref |
| **Production signals** | Shared store w/ web UI, typed `WorkflowRun`, 103 tests |

## Demo Failure Recovery

- Slack slow to ack? Pre-record Act 1's two messages; talk over them.
- A model API down? That **is** the demo — narrate the retry → fallback path as the feature.
- Never say "it usually works" — name the fallback as designed behavior.

---
_Verified against code 2026-06-27. Internal demo reference — do not submit without Eric's approval._
