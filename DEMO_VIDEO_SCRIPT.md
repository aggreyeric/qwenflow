# 🎬 QwenFlow — Demo Video Script (2:30)

> **Title:** QwenFlow — Composable AI Workflows on Qwen Cloud
> **Hackathon:** Qwen Cloud AI Hackathon
> **Runtime:** ~2:30 (150s)
> **Format:** Screen-capture + voiceover. Two windows — a browser on the
> QwenFlow visual builder, and a terminal for the CLI + Docker cuts. Brief
> code-viewer cut to the README architecture diagram.
>
> **Recording tip:** the whole demo runs locally — no live Qwen Cloud key
> required. Prereq:
> ```bash
> cd qwencloud-agent && npm install && export DASHSCOPE_API_KEY=sk-your-key
> npm run dev   # serves the UI at http://localhost:3000
> ```
> (Run `bash scripts/demo.sh` once before recording to warm up the server and
> pre-create the workflow so the on-camera run is snappy. With no key the server
> still starts and every endpoint responds — the run step reports whatever the
> Model Router returns without crashing.)

---

## SEGMENT 1 — Intro: What is QwenFlow? (0:00 – 0:20)

**On screen:** Title card →
*QwenFlow — Chain Qwen model calls into intelligent workflows.*
Then the architecture diagram from the README (Workflow JSON → Orchestrator →
Model Router → Qwen Cloud API → Response Aggregator).

**Voiceover:**
> "Most agent frameworks are model-agnostic to a fault — they treat every LLM as
> a black box. **QwenFlow** goes the other way. It's an orchestration framework
> opinionated about Qwen Cloud's multi-model strengths: Qwen3 for reasoning,
> Qwen-VL for vision, Qwen-Audio for speech. You declare a workflow — a directed
> graph of model steps — and QwenFlow handles scheduling, retries, fallbacks, and
> live observability. One UI, one CLI, one JSON spec."

**Cut to:** browser, QwenFlow UI open at `http://localhost:3000`.

---

## SEGMENT 2 — The visual builder: dark UI + 2 steps (0:20 – 0:50)

**On screen:** The QwenFlow dark UI loads — empty canvas, step palette on the
left, properties panel on the right.

**Actions:**

1. Drag a **first step** onto the canvas. In the properties panel set:
   - `id`: `analyze-text`
   - `model`: `qwen3-8b`
   - `prompt`: `Analyze the market sentiment for Bitcoin today`
2. Drag a **second step** onto the canvas. Set:
   - `id`: `summarize`
   - `model`: `qwen3-4b`
   - `prompt`: `Summarize the analysis in one sentence`
3. Draw the connector arrow from `analyze-text` → `summarize`.

**Voiceover:**
> "The workflow builder is a dark, low-distraction canvas. I drop two steps onto
> it — first, Qwen3-8B to analyze Bitcoin sentiment; second, Qwen3-4B to
> summarize. Each step is model-routed to the correct Qwen Cloud endpoint. The
> whole graph is serializable to plain JSON, so I can version it, diff it, and
> share it like code."

---

## SEGMENT 3 — Run the workflow (0:50 – 1:20)

**On screen:** Click the **Run Workflow** button in the top bar.

**What appears, step by step** (this is the core 30 seconds — let each beat land):

- `analyze-text` lights up **amber → green** as it runs, with a live latency +
  token counter ticking beside it.
- The connector arrow animates as output flows downstream.
- `summarize` lights up next.
- The **results panel** slides in on the right, showing per-step output, latency,
  token usage, and cost in a single trace.

**Voiceover:**
> "Hit **Run**. Watch the steps light up in dependency order — the orchestrator
> schedules each step, the Model Router dispatches to Qwen Cloud, and the
> Response Aggregator streams per-step status, latency, and token usage live into
> the trace panel. If a step fails or blows its budget, the retry policy kicks in
> with exponential backoff and an automatic model fallback — no manual wiring."

---

## SEGMENT 4 — The CLI (1:20 – 1:50)

**On screen:** Cut to terminal, prompt ready in `qwencloud-agent/`.

```bash
qwenflow models
```

Console prints the full Qwen model table — `qwen3-8b`, `qwen3-4b`, `qwen-vl-max`,
`qwen-audio` — each with its context window, max output, and capabilities.

Then:

```bash
qwenflow run --model qwen3-8b --prompt "Analyze Bitcoin sentiment"
```

Console prints the run: model routed, latency, token usage, and the final output
text — a clean one-step workflow executed headlessly from the shell.

**Voiceover:**
> "Same engine, no UI. `qwenflow models` lists the Qwen family with context
> windows and capabilities. Then `qwenflow run` executes a single-step workflow
> straight from the terminal — `--model qwen3-8b --prompt 'Analyze Bitcoin
> sentiment'`. Same orchestrator, same router, same trace. Great for cron jobs,
> CI pipelines, and scripting."

---

## SEGMENT 5 — Docker, API docs, architecture — close (1:50 – 2:30)

**On screen:** Back in the terminal.

```bash
docker compose up --build
```

Containers build and start — QwenFlow comes up containerized. Then open the API
docs in the browser:

```
http://localhost:3000/api-docs
```

Show the REST surface — `POST /api/workflows`, `POST /api/workflows/:id/run`,
`GET /health`, `GET /api/models` — and cut briefly to the README architecture
diagram (Workflow JSON → Orchestrator → Model Router → Qwen Cloud → Response
Aggregator).

**End card:**

> **QwenFlow — Composable AI Workflows on Qwen Cloud**
> Qwen3 · Qwen-VL · Qwen-Audio in one graph
> Built for the **Qwen Cloud AI Hackathon**
> MIT · `bash scripts/demo.sh`

**Voiceover:**
> "Deploying is one command — `docker compose up` brings the whole stack up
> containerized, key read from the environment, no setup wizard. The REST API is
> self-documented at `/api-docs`. Underneath: five clean layers — Qwen Cloud API,
> Model Router, Orchestrator, Step Executor, Response Aggregator — each swappable
> without touching the scheduler. Built for the Qwen Cloud AI Hackathon. QwenFlow
> — chain Qwen model calls into intelligent workflows."

**End card:** repo URL · `bash scripts/demo.sh` · `npm test`

---

## 🎬 Shot list / recording checklist

| # | Segment | Window | Command / action | Duration |
|---|---------|--------|------------------|----------|
| 1 | Intro | — | Title card + README architecture diagram | 20s |
| 2 | Visual builder | Browser `localhost:3000` | Drag 2 steps (qwen3-8b → qwen3-4b), wire them | 30s |
| 3 | Run workflow | Browser | Click **Run Workflow**, show live trace + results panel | 30s |
| 4 | CLI | Terminal | `qwenflow models` then `qwenflow run --model qwen3-8b --prompt "Analyze Bitcoin sentiment"` | 30s |
| 5 | Docker + close | Terminal + Browser | `docker compose up --build` → `localhost:3000/api-docs` → architecture diagram → end card | 40s |

**If you need to save 15s:** trim the second CLI command in Segment 4 to just
`qwenflow models`, and skip the API-docs browser cut in Segment 5 (mention it in
voiceover only).

**Captions / lower-thirds to prepare:**
- "Qwen3 · Qwen-VL · Qwen-Audio in one graph"
- "Workflow JSON — version it, diff it, share it"
- "Retry with exponential backoff + automatic model fallback"
- "Per-step latency · tokens · cost — streamed live"
- "One command: `docker compose up`"
- "MIT · Qwen Cloud AI Hackathon"

**Eric's talking points (cheat sheet):**

- **Segment 1 — the wedge:** "Most agent frameworks are model-agnostic to a
  fault. QwenFlow is *opinionated* about Qwen's multi-model strengths — text,
  vision, audio composed, not just called."
- **Segment 2 — the canvas:** emphasize the graph is plain JSON — "version it,
  diff it, share it like code." Two steps, two models, one wire.
- **Segment 3 — the magic:** name the five layers as the trace fills in —
  "orchestrator schedules, router dispatches, aggregator streams." Drop the line:
  "retry with backoff and automatic model fallback — no manual wiring."
- **Segment 4 — the headless path:** "same engine, no UI" — pitch cron / CI /
  scripting. The two commands are the whole CLI surface; keep it tight.
- **Segment 5 — ship it:** one `docker compose up`, self-documented API, swappable
  layers. Close hard on "Built for the Qwen Cloud AI Hackathon."

**Prerecord fallback:** if a live Qwen Cloud key isn't available on camera, the
server still starts and every endpoint responds — narrate the run as "queued /
executing" and cut to a pre-recorded successful trace from a prior `demo.sh` run.
No secrets, no setup wizard, no crash.
