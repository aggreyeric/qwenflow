# SLACK SUBMISSION PACKAGE — QwenFlow for Slack

> **One copy-paste-ready doc.** Open Devpost → paste each block into its field.
> ⚠️ **Do NOT submit without Eric's approval.**

---

## TL;DR

| Field | Value |
|---|---|
| **Project** | QwenFlow for Slack — Multi-Model AI Agent in Your Workspace |
| **Tagline** | Run, monitor, and compare Qwen + Gemini models from any Slack channel with a single slash command. |
| **Hackathon** | Slack Agent Builder — https://slackhack.devpost.com · **$42K prize pool** |
| **Deadline** | **Jul 13, 2026** (~16 days from Jun 28) |
| **GitHub** | https://github.com/aggreyeric/qwenflow |
| **Tests** | **103 passing** (78 core + 12 Slack-command + 6 store + 7 resilience) |
| **Stack** | TypeScript · Node 18+ · `@slack/bolt` · Express · Qwen + Gemini · vitest |

---

## DEVPOST FIELDS — COPY/PASTE BLOCKS

### 📌 Project Name
```
QwenFlow for Slack — Multi-Model AI Agent in Your Workspace
```

### 🏷️ Tagline (≤60 chars)
```
Multi-model AI orchestration, driven from inside Slack.
```

### ✍️ Description / "What it does"

> _Paste this block. It's framed Slack-native — slash commands + in-channel workflows + multi-model orchestration, **not** "a bot that calls an API."_

```
QwenFlow for Slack is a multi-model AI orchestration agent that lives where your team already works. There's no new tab to open, no context to switch — from any channel, one slash command fires a real workflow across Qwen and Gemini models, and the result lands inline in the conversation.

Three commands make your channel the control plane for AI:

• /qwenflow run <workflow>  → execute a multi-model workflow (dependency-ordered parallel steps, retry with backoff, automatic model fallback)
• /qwenflow status <id>     → inspect a registered workflow's shape
• /qwenflow models          → list every available model and its capabilities

This is not a single-prompt chatbot wrapper. Under the hood, each run executes a DAG of model steps in parallel waves, resolves ${steps.<id>.output} references at runtime, retries failing steps with exponential backoff, and silently fails over to a configured fallback model. Token usage and latency telemetry are posted back with every result — so cost and performance are visible inline.

The same shared workflow store powers our web UI and the Slack surface — one source of truth, Slack is one more native surface. Socket Mode enables zero-config local dev; an HTTP receiver with signing secrets supports production. No changes to the core orchestrator were required: the integration is a clean, additive layer that makes multi-model AI a first-class citizen of chat.
```

### 🔧 "How we built it"
```
TypeScript + @slack/bolt for the Slack surface, with an Express receiver (HTTP + signing secret) for production and Socket Mode for zero-config local dev.

The /qwenflow command delegates to QwenFlow's existing Orchestrator class (run() / getProgress() / getRun()), which fans work across configured Qwen and Gemini models in dependency-ordered parallel waves. A shared in-memory store (src/store.ts) backs both the web routes and the Slack handlers, so workflows registered in the UI are immediately runnable from Slack — one source of truth.

The orchestrator handles the hard parts: ${steps.X.output} and ${inputs.Y} reference resolution at runtime, retry with exponential backoff on failing steps, and automatic fallbackModel switchover. Slack's ack()/respond() pattern keeps long runs responsive (3-second ack-safe): we acknowledge instantly, run async, then post the final result and token/latency summary inline.

Tested with vitest — 103 tests, including 12 Slack-command tests and resilience tests for retry and fallback.
```

### 🧗 "Challenges we ran into"
```
• Staying under Slack's 3-second ack window while running multi-model DAGs that can take seconds — solved with the ack()/respond() async pattern: acknowledge immediately, run in the background, post results when done.
• Making fallback feel invisible: a failing step had to retry with backoff, then silently switch to fallbackModel without the user ever seeing a partial or broken result.
• Sharing state between the web UI and Slack without duplicating logic — solved by a single shared store that both surfaces read/write.
• Keeping the integration clean: adding Slack required zero changes to the core orchestrator — discipline to not leak Slack specifics into the engine.
```

### 🏆 "Accomplishments that we're proud of"
```
• Real agent behavior, not a prompt→string wrapper: dependency-ordered parallel model execution, retry, and automatic fallback — all drivable from one slash command.
• Zero changes to the orchestrator to add Slack — the integration is a pure, additive surface.
• 103 passing tests, including resilience paths (retry, fallback) that are hard to get right and easy to skip.
• One shared store powers web + Slack — Slack is genuinely a native surface, not a bolt-on.
```

### 📚 "What we learned"
```
• Slack is the natural control plane for AI agents: collaboration already happens there, so orchestration should meet teams in-channel, not in a separate tab.
• The ack()/respond() async pattern unlocks arbitrarily long agent runs inside Slack's constraints.
• A clean separation between orchestration engine and delivery surface makes adding new surfaces (Slack, web, future) trivial.
```

### 🚀 "What's next"
```
• Thread-based live per-step progress posts (the orchestrator already tracks WorkflowRun progress internally).
• Run history and cost tracking surfaced to the user.
• @-mention conversational follow-ups via an app.message handler.
• Persistent store (Redis/SQLite) for production multi-instance deploys.
```

### 🛠️ Tech Stack / "Built With"
```
typescript, slack-bolt, qwen, gemini, express, nodejs, vitest
```

### 🔗 GitHub URL
```
https://github.com/aggreyeric/qwenflow
```

### 🎥 Demo Video URL
```
[Eric: add YouTube/Drive link — see scripts/demo.sh to record locally]
```

### 📸 Screenshots
```
• docs/screenshot-slack-ui.png  — QwenFlow web UI (Slack integration context)
• docs/screenshot-ui.png        — QwenFlow dashboard overview
• docs/screenshot-gemini-ui.png — Gemini model selector
```

---

## DEMO INSTRUCTIONS — what `SLACK_JUDGES_DEMO.md` shows (3 min)

**Core message:** QwenFlow is a *multi-model orchestration agent you drive from inside Slack* — a dependency-ordered DAG of models with parallel execution, retry, and automatic fallback — **not** a single-prompt chatbot wrapper.

| Act | Time | What judges see |
|---|---|---|
| **Hook** | 0:00–0:20 | Slack workspace open, `#ai-ops` channel, `@qwenflow` present. No browser tabs. |
| **Setup** | 0:20–0:35 | *"Three commands. Multi-model orchestration. Zero context switching."* |
| **Act 1 — Run** | 0:35–1:25 | `/qwenflow run summarize-and-refine` → instant `🚀 Starting…` ack → DAG runs (draft→critique→format in parallel waves) → `✅ complete` with token + latency telemetry posted inline. |
| **Act 2 — Inspect** | 1:25–2:10 | `/qwenflow models` (full model roster) + `/qwenflow status summarize-and-refine` (workflow shape). Same shared store as web UI. |
| **Close** | 2:10–2:30 | *"One slash command, three subcommands, a real orchestrator underneath. QwenFlow is the control plane for multi-model AI in Slack."* |

**Every demo claim is verified against code** (`src/slack-commands.ts`, `src/slack.ts`, `src/orchestrator.ts`) — see the Claim Verification table in `SLACK_JUDGES_DEMO.md`. **Honest gaps** (no free-text prompts, no threading, no cost tracking, in-memory store) are also documented there — **do not overclaim**.

---

## SUBMISSION CHECKLIST

**Before you paste:**
- [ ] Read `SLACK_JUDGES_DEMO.md` — know the honest gaps cold
- [ ] Confirm repo is public: https://github.com/aggreyeric/qwenflow
- [ ] Run `npm test` → confirm **103 passing**

**Devpost form:**
- [ ] Project Name → pasted
- [ ] Tagline → pasted (≤60 chars)
- [ ] Description ("What it does") → pasted
- [ ] "How we built it" → pasted
- [ ] "Challenges" → pasted
- [ ] "Accomplishments" → pasted
- [ ] "What we learned" → pasted
- [ ] "What's next" → pasted
- [ ] "Built With" tags → selected
- [ ] GitHub URL → https://github.com/aggreyeric/qwenflow
- [ ] Demo video → **upload link** (`scripts/demo.sh` to record)
- [ ] Screenshots → upload the 3 PNGs from `docs/`

**Final:**
- [ ] **Eric approves** before clicking Submit
- [ ] Submit before **Jul 13, 2026**

---

## THE FRAMING (read before you write anything)

> **QwenFlow is Slack-native — not "a bot that calls an API."**

Lead every field with this:
1. **In-channel workflows** — the result lands where the team already works, not in a new tab.
2. **Slash commands** — `/qwenflow` is the control surface; no @-mention ping-pong, no iframe.
3. **Multi-model orchestration from Slack** — a real DAG with parallel steps, retry, fallback — driven from chat.

If a field reads like "we built a Slack bot that calls an LLM," rewrite it. The differentiator is **orchestration as a first-class Slack citizen**.

---
_Verified against repo 2026-06-28. Internal reference — **do not submit without Eric's approval.**_
