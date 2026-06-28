# QwenFlow — Judges Demo Script (3 minutes)

> **Goal:** in 180 seconds, prove QwenFlow is the most *Qwen-native* agent
> framework in the hackathon — not a generic LLM wrapper, but one built around
> Qwen Cloud's multi-model family (Qwen3 / Qwen-VL / Qwen-Audio) with a real
> orchestration engine: **multi-model chains**, **retry + fallback resilience**,
> and **per-step routing**.
>
> **Every claim below is backed by code.** Run it yourself:
> ```bash
> npm install
> npm test          # 103/103 green, offline-deterministic
> npm run dev       # http://localhost:3000
> ```
> `export DASHSCOPE_API_KEY=sk-...` for live Qwen Cloud calls. With **no key**,
> the router returns deterministic mocks, so the demo never stalls.

---

## The 3 capabilities this demo proves

| Capability | What it is | Where it lives | Test that proves it |
|---|---|---|---|
| **Multi-model chains** | Steps reference each other via `${steps.X.output}`; orchestrator resolves them topologically | `src/orchestrator.ts` | `resolves ${steps.X.output} references` |
| **Per-step routing** | Each step names its own model (Qwen3 / Qwen-VL / Qwen-Audio); router maps it to its DashScope model name | `src/models.ts`, `src/qwencloud.ts` | `runs a 3-step workflow to completion` (qwen3-4b → 8b → 32b) |
| **Retry + fallback resilience** | A failing step retries with exponential backoff, then transparently falls back to `fallbackModel` | `src/orchestrator.ts` | `retries a failing step with backoff then succeeds` · `falls back to fallbackModel when the primary always fails` |

---

## Before QwenFlow / After QwenFlow

### ❌ Before — you hand-write this glue. Again. For every pipeline.
```ts
// ~60 lines of fetch + retry + parallel scheduling + variable plumbing,
// reinvented per project. No retry. No fallback. No replay.
async function classify(review: string) {
  const r1 = await fetch(DASHSCOPE + "/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "qwen3-32b", messages: [{ role: "user", content: review }] }),
  });
  // ...parse, extract, handle 429/5xx yourself, pass output to the next call...
}
```

### ✅ After — you declare the graph once. QwenFlow runs it.
```jsonc
// One workflow: routed, parallelized, retried, with fallback, and replayable.
{ "name": "Judges Demo", "steps": [
  { "id": "analyze",   "model": "qwen3-32b", "prompt": "Classify sentiment:\n${inputs.review}" },
  { "id": "vision",    "model": "qwen-vl",   "prompt": "Describe visual elements for:\n${inputs.review}" },
  { "id": "summarize", "model": "qwen3-8b",  "prompt": "Verdict from analysis + vision:\n${steps.analyze.output}\n${steps.vision.output}" },
  { "id": "followup",  "model": "qwen3-32b", "prompt": "Draft an action from:\n${steps.summarize.output}",
                       "retryCount": 2, "fallbackModel": "qwen3-8b" }
]}
```

---

## Beat 1 — The Problem (0:00–0:30)

**Say:**
> "Qwen Cloud gives you a powerful, coherent model family — Qwen3 for text,
> Qwen-VL for vision, Qwen-Audio for speech — all behind one DashScope API.
> But it stops there. There's **no orchestration layer**. If you want one Qwen
> model to classify text, another to run in parallel, a third to fuse the
> results — and you want retries and fallback when an endpoint flakes — you
> hand-write the glue. Fetch calls. Retry loops. Variable substitution. Parallel
> scheduling. Every project reinvents it."

**Show:** the Before/After contrast above, side by side.

---

## Beat 2 — Live Run: multi-model chain + routing + parallel (0:30–1:25)

**Say:** "Watch one workflow route to four Qwen models, run two steps in
parallel, and fuse their outputs."

```bash
# 1. Health + available models (proves per-step routing is model-aware)
curl -s http://localhost:3000/health
curl -s http://localhost:3000/api/models        # qwen3-4b/8b/32b, qwen-vl, qwen-audio

# 2. Create the multi-model workflow shown above
curl -s -X POST http://localhost:3000/api/workflows \
  -H "Content-Type: application/json" \
  -d '{ "name":"Judges Demo",
        "steps":[
          {"id":"analyze","model":"qwen3-32b","prompt":"Classify the sentiment of this text:\n${inputs.review}","temperature":0.3},
          {"id":"vision","model":"qwen-vl","prompt":"Describe the key visual elements relevant to:\n${inputs.review}"},
          {"id":"summarize","model":"qwen3-8b","prompt":"Using analysis and vision notes, write a one-line verdict.\nAnalysis: ${steps.analyze.output}\nVision: ${steps.vision.output}"},
          {"id":"followup","model":"qwen3-32b","prompt":"Draft a follow-up action from:\n${steps.summarize.output}","retryCount":2,"fallbackModel":"qwen3-8b"}
        ]}'
#   → returns { "id": "wf-<timestamp>", ... }; copy the id

# 3. Run it, injecting the runtime input the prompts reference
curl -s -X POST http://localhost:3000/api/workflows/wf-<id>/run \
  -H "Content-Type: application/json" \
  -d '{ "inputs": { "review": "The new UI is fast, but the checkout button overlaps on mobile." } }'
```

**What judges see in the response:**
- `status: "completed"`, with `results` for **all four steps** — analyze (`qwen3-32b`), vision (`qwen-vl`), summarize (`qwen3-8b`), followup (`qwen3-32b`).
- `summarize` only ran **after** `analyze` and `vision` finished, because it
  references `${steps.analyze.output}` and `${steps.vision.output}`.
- Each result carries real `tokens` and `latency` — the replayable trace.

> **Routing note (honest scope):** the router selects the correct Qwen model per
> step and maps each to its DashScope model name; steps send a chat-completion
> text prompt. The engine routes any step to Qwen3 / Qwen-VL / Qwen-Audio by ID.

---

## Beat 3 — Resilience: retry with backoff + fallback (1:25–2:10)

**Say:** "Endpoints flake. QwenFlow retries a failing step with exponential
backoff, and if it still fails, transparently switches to a fallback model.
This is unit-tested — not just demoed."

```bash
# The resilience tests (deterministic, no API key needed)
npm test -- orchestrator 2>&1 | grep -Ei "backoff|fallback|retr"
```

**Expected output (from `tests/orchestrator.test.ts`):**
```
✓ retries a failing step with backoff then succeeds  (~450ms — real backoff sleep)
✓ falls back to fallbackModel when the primary always fails
✓ marks the run failed when primary and fallback both fail
```

**The workflow in Beat 2 already shows it:** the `followup` step is declared
with `"retryCount": 2, "fallbackModel": "qwen3-8b"`. If its primary model
(`qwen3-32b`) fails repeatedly, QwenFlow backs off, retries, then switches to
`qwen3-8b` — the pipeline completes instead of dying.

---

## Beat 4 — Replayable trace + recap (2:10–2:50)

**Say:** "Every run is replayable. Token usage and latency per step, captured."

```bash
# Inspect any workflow and its last run
curl -s http://localhost:3000/api/workflows/wf-<id>
curl -s http://localhost:3000/api/workflows/wf-<id>/status
```

Each `ModelResponse` in the run = `{ model, content, tokens:{prompt,completion}, latency }`.
One trace, every Qwen call accounted for.

**Recap (15s):**
> "QwenFlow is the orchestration layer Qwen Cloud is missing. In one JSON
> workflow we routed four Qwen models, ran independent steps in parallel,
> resolved cross-step variables, and survived failures with retry + fallback —
> all backed by 103 passing tests. **Before: 60 lines of glue. After: one graph.**"

---

## Beat 5 — CTA (2:50–3:00)

```bash
bash scripts/demo.sh     # full end-to-end HTTP demo, self-contained
npm test                  # 103/103 green
```

> "QwenFlow. Qwen-native orchestration. Built for Qwen Cloud."

---

### What this demo does **not** claim (verified against code)
- It does **not** claim image/audio *bytes* are attached to Qwen-VL / Qwen-Audio
  steps — steps send chat-completion text prompts; the router selects the model.
- The aggregate trace captures **tokens + latency**, not a cost total
  (`costPerMillionTokens` is defined as 0 and is not summed).

_Prepared by hack_2. Awaits operator (Eric) approval. Not submitted anywhere._
