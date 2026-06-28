# QwenFlow — 3-Minute Judges Demo Script (UiPath AgentHack)

> **Goal:** in 180 seconds, prove QwenFlow is an **agent orchestrator** — it plans, routes each step to the best model, chains reasoning across steps, and reports back — not a thin LLM wrapper.
>
> **It cannot fail live.** Every step below runs in **deterministic mock mode** (no API keys needed). The stale demo server may already be on :3000; otherwise start one with `npm start`.

---

## Pre-Demo Checklist (do this *before* the clock starts)

```bash
cd /Users/eric/hiclaw_manager/builds/qwencloud-agent

# 1) Prove the gate is green (the "built by coding agents" evidence)
npm test                     # expect: 94/94 passing, 10 suites

# 2) Start the server (skip if already running on :3000)
npm start &                  # listens on http://localhost:3000

# 3) Sanity: confirm models + health respond
curl -s localhost:3000/health | jq .
curl -s localhost:3000/api/models | jq '.[].id'
# expect 8 models: qwen3-4b qwen3-8b qwen3-32b qwen-vl qwen-audio
#                 gemini-1.5-flash gemini-1.5-pro gemini-2.0-flash

# 4) Open these two visuals (have them ready in tabs)
open docs/uipath-demo.html   # the "agent loop" dashboard
open docs/screenshot-slack-ui.png   # the Slack control plane
```

**Have on screen:** a terminal (left) + `uipath-demo.html` (right). Slack screenshot ready to flip to.

---

## The Demo — beat by beat

### 🕐 0:00–0:40 — "Meet the agent, from Slack"

**Show:** `screenshot-slack-ui.png` (or live Slack `/qwenflow`).

**Say:**
> "This is QwenFlow. Most LLM demos are a chat box — one prompt, one model, one
> answer. QwenFlow is an **agent control plane**. From Slack I don't ask a
> model a question — I tell an **orchestrator** to run a *workflow*: a planned,
> multi-step task where each step can use a *different* model.
>
> Three commands: `/qwenflow models` lists the brains, `/qwenflow run` kicks off
> an autonomous run, `/qwenflow status` watches it. I'm the human in the loop;
> the agent does the work."

**Punchline:** *control plane over autonomous execution* — that's the agent framing.

---

### 🕑 0:40–1:40 — "The agent picks the right model per step"

**Show:** terminal — list models, then create a multi-model workflow.

```bash
# The model roster — 5 Qwen + 3 Gemini, each with different capabilities
curl -s localhost:3000/api/models | jq '.[] | {id, supportsVision, supportsTools}'

# Define the agent's PLAN: 3 steps, 3 different models, 2 providers
curl -s -X POST localhost:3000/api/workflows -H 'content-type: application/json' -d '{
  "name": "Equity Research Brief",
  "steps": [
    { "id": "extract",  "model": "qwen3-32b",       "prompt": "Extract the 3 key financial claims from the earnings report." },
    { "id": "chart",    "model": "qwen-vl",         "prompt": "Read the revenue chart and describe the 2-year trend." },
    { "id": "summary",  "model": "gemini-2.0-flash","prompt": "Write a 2-sentence executive summary." }
  ]
}' | jq '.id, .steps[]'
```

**Say:**
> "Watch the plan: step 1 uses **Qwen3-32B** for reasoning over text, step 2
> uses **Qwen-VL** because it needs *vision* to read a chart, step 3 uses
> **Gemini 2.0 Flash** for a fast synthesis. One workflow, **two providers**.
> The Model Router will dispatch each step to the right brain — that's tool
> selection, not a single model call."

**Punchline:** *per-step, multi-provider routing by capability*.

---

### 🕒 1:40–2:30 — "Watch the multi-step run complete (with state)"

**Show:** run it, then inspect the chained result.

```bash
# Replace <ID> with the wf-... id printed above
ID=$(curl -s localhost:3000/api/workflows | jq -r '.[-1].id')
curl -s -X POST localhost:3000/api/workflows/$ID/run | jq '{
  status, currentStep,
  steps: (.results | keys),
  models: [.results[].model],
  tokens: ([.results[].tokens.completion] | add)
}'
```

**Say:**
> "Status went `pending → running → completed`. Three steps ran, **three
> different models executed**, and — here's the key agent behaviour — **the
> output of each step was threaded forward as context for the next**. Step 2
> saw step 1's claims; step 3 saw both. The agent *accumulated reasoning across
> steps* instead of answering in isolation. It also tracked tokens and progress
> the whole way."

**Flip to:** `uipath-demo.html` — point at the step flow + stats panel.

**Punchline:** *multi-step reasoning with carried state + full observability* —
the definition of an agent, not a wrapper.

---

### 🕓 2:30–3:00 — "Built and gated by coding agents"

**Show:** the test run from the pre-demo step (or re-run `npm test | tail -5`).

**Say:**
> "Finally — the theme is *building agents with coding agents*. QwenFlow is
> exactly that: coding agents wrote the adapters, the router, the Slack layer,
> and run a **94-test quality gate on every change** — generate, typecheck,
> test, deploy. That gate is why autonomous multi-model orchestration is safe
> to ship. An agent platform, built by agents, tested by agents, run from chat."

**Close:** "That's QwenFlow — plan, route, chain, observe. Thank you."

---

## The one-line answer if a judge asks "why is this an agent?"

> "Because it **decomposes a goal into steps, selects a different model per
> step, carries each step's output into the next as reasoning context, and
> reports structured results** — autonomously, from a Slack command. A wrapper
> sends one prompt to one model. QwenFlow plans and executes a workflow."

## Backup / Q&A

- **"Does it need API keys?"** — No. Adapters fall back to deterministic mock
  mode, so the agent loop runs end-to-end with zero config. With keys set, the
  same code calls live DashScope + Gemini.
- **"Can it run from Slack for real?"** — Yes; `@slack/bolt` Socket Mode, three
  slash commands. Screenshot shows the live interaction.
- **"How are models chosen?"** — Each step declares its model by capability
  (vision/audio/reasoning) from an 8-model registry; the router executes that
  choice across Qwen + Gemini in one pipeline.
- **"What about failures?"** — A failing step marks the run `failed` with state
  preserved; adapters also degrade gracefully to mock mode on API error.
- **Live API hiccup?** — Stay in mock mode; the orchestration structure
  (multi-step, multi-model, chained, observed) is fully visible without live calls.
