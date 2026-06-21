# QwenFlow 🌊

![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6) ![Qwen Cloud](https://img.shields.io/badge/platform-Qwen%20Cloud-blue) ![Express](https://img.shields.io/badge/framework-Express-000000) ![Tests](https://img.shields.io/badge/tests-65%20passed-success) ![Docker](https://img.shields.io/badge/Docker-ready-2496ED) ![License](https://img.shields.io/badge/license-MIT-green) ![CI](https://img.shields.io/badge/CI-passing-brightgreen)

## 📸 Screenshot

![QwenFlow UI](docs/screenshot-ui.png)

*QwenFlow orchestrates multi-step AI workflows using Qwen Cloud's model API.*

> AI agent orchestration framework optimized for Qwen Cloud — chain Qwen model calls into intelligent workflows with retry, fallback, and observability.

QwenFlow turns Qwen Cloud's model family into **composable building blocks**. Instead of writing one-off API calls, you declare a workflow — a directed graph of model steps — and QwenFlow handles execution, retries, fallbacks, and live observability for you.

Most agent frameworks are model-agnostic to a fault. QwenFlow goes the other way: it is opinionated about Qwen's multi-model strengths (Qwen3 for reasoning, Qwen-VL for vision, Qwen-Audio for speech) so you can build pipelines that actually exploit them.

---

## 💡 Why QwenFlow?

- **Qwen Cloud is Alibaba's serverless AI platform but lacks a developer-friendly orchestration layer.** You get powerful raw model endpoints, but no way to compose them into pipelines.
- **QwenFlow fills that gap:** chain multiple Qwen models (text, vision, audio) into executable workflows that handle scheduling, retries, and fallbacks for you.
- **Unlike LangChain/LangGraph, QwenFlow is purpose-built for Qwen Cloud's multi-model strengths** — it knows about Qwen3, Qwen-VL, and Qwen-Audio natively rather than treating models as interchangeable black boxes.
- **Zero external LLM dependencies** — runs in mock mode for local development, then connects to the Qwen Cloud API for production. No vendor lock-in to a third orchestrator.
- **Visual workflow builder included** — a dark-themed, no-build-step drag-and-drop canvas for designing and debugging pipelines before they ever touch the API.

---

## ✨ Features

- **Visual workflow builder** — drag-and-drop model chaining, with the full graph serializable to/from JSON
- **Multi-model orchestration** — Qwen3, Qwen-VL, and Qwen-Audio in a single workflow, each step routed to the right model
- **Smart retry** — exponential backoff with automatic model fallback when a step exceeds its budget or rate limit
- **Real-time execution observability** — per-step status, latency, token usage, and cost streamed live
- **Zero-config local development** — reads `DASHSCOPE_API_KEY` from the environment, no setup wizard
- **TypeScript-first** — full type safety on workflow definitions, inputs, and outputs via Zod schemas

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Optional: Qwen Cloud API key (DashScope) for real AI inference

### Install & Run
```bash
git clone https://github.com/aggreyeric/qwenflow.git
cd qwenflow
npm install
npm run build
npm start
```

The server starts at http://localhost:3000

### With Docker
```bash
docker compose up --build
```

### Demo (Mock Mode)
No API key needed — the mock fallback simulates Qwen Cloud responses:
```bash
npm start
# Then visit http://localhost:3000 or use the CLI:
node dist/cli.js run --name "test" --prompt "Hello"
```

### Environment Variables
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| PORT | No | 3000 | Server port |
| DASHSCOPE_API_KEY | No | — | Qwen Cloud/DashScope API key |

---

## 🏗️ Architecture

QwenFlow is a pipeline-oriented orchestrator. A **workflow** is a DAG of **steps**; each step names a Qwen model, a prompt template, and an optional retry/fallback policy. Execution flows through five layers:

1. **Qwen Cloud API** — the underlying DashScope-compatible model endpoints (Qwen3, Qwen-VL, Qwen-Audio).
2. **QwenFlow Orchestrator** — owns the workflow graph, schedules steps in dependency order, and resolves variable references between steps (e.g. `${steps.analyze.output}`).
3. **Model Router** — maps each step's `model` field to the correct Qwen Cloud endpoint and serializes the request (text, image, or audio payload).
4. **Step Executor** — runs a single step with its retry policy: exponential backoff on transient failures, automatic fallback to a cheaper/different model when configured.
5. **Response Aggregator** — collects each step's output, tokens, latency, and cost into a single trace you can inspect or replay.

```
                        ┌─────────────────────────┐
                        │      Qwen Cloud API      │
                        │  (Qwen3 / Qwen-VL /      │
                        │       Qwen-Audio)        │
                        └────────────▲────────────┘
                                     │ HTTPS
                        ┌────────────┴────────────┐
                        │      Model Router        │
                        │  endpoint + payload mux  │
                        └────────────▲────────────┘
                                     │
   ┌─────────────────┐    ┌──────────┴────────────┐    ┌─────────────────────┐
   │  Workflow JSON  │───▶│  QwenFlow Orchestrator │───▶│   Step Executor     │
   │  (DAG of steps) │    │  schedule + resolve    │    │  retry + fallback   │
   └─────────────────┘    └──────────┬────────────┘    └──────────┬──────────┘
                                     │                            │
                                     └────────────┬───────────────┘
                                                  ▼
                                     ┌─────────────────────────┐
                                     │  Response Aggregator     │
                                     │  outputs · tokens ·      │
                                     │  latency · cost · trace  │
                                     └─────────────────────────┘
```

**Why this shape?** Keeping routing, execution, and aggregation in separate layers means you can swap the Model Router for a local model, or replace the Aggregator with an OpenTelemetry exporter, without touching the orchestrator's core scheduling logic.

---

## 🚀 Quick Start

**Prerequisites:** Node.js 18+ and a [Qwen Cloud / DashScope API key](https://dashscope.console.aliyun.com/).

```bash
# 1. Install dependencies
npm install

# 2. Provide your Qwen Cloud key
export DASHSCOPE_API_KEY=sk-your-key-here

# 3. Start the dev server (hot reload via tsx watch)
npm run dev

# 4. Open the UI
#    → http://localhost:3000
```

From the UI you can drag steps onto the canvas, wire them together, and hit **Run** to execute the workflow against Qwen Cloud with a live trace panel. You can also drive QwenFlow headlessly from the CLI:

```bash
npx qwenflow run ./workflows/sentiment.json
```

Other useful scripts:

| Command              | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run build`      | Type-check and compile to `dist/`        |
| `npm run typecheck`  | Type-check only, no emit                 |
| `npm test`           | Run the Vitest suite once                |
| `npm run test:watch` | Run tests in watch mode                  |

---

## 📊 Workflow Example

Workflows are plain JSON — version them, diff them, and share them. Here's a **multimodal sentiment-analysis pipeline**: Qwen3 classifies the text, Qwen-VL inspects an attached image for visual sentiment cues, and Qwen3 fuses both into a final summary.

```json
{
  "name": "multimodal-sentiment",
  "version": "1.0.0",
  "inputs": {
    "text":  { "type": "string" },
    "image": { "type": "image-url" }
  },
  "steps": [
    {
      "id": "analyze-text",
      "model": "qwen3-72b-instruct",
      "prompt": "Classify the sentiment of this text as positive, neutral, or negative. Explain in one sentence.\n\nText: ${inputs.text}",
      "retry": { "maxAttempts": 3, "backoffMs": 500, "factor": 2 }
    },
    {
      "id": "analyze-image",
      "model": "qwen-vl-max",
      "prompt": "Describe the emotional tone of this image in one sentence.",
      "image": "${inputs.image}",
      "fallback": "qwen-vl-plus"
    },
    {
      "id": "summarize",
      "model": "qwen3-72b-instruct",
      "prompt": "Combine the text sentiment and image tone into a single brand-safety verdict (safe / review / block) with a one-line rationale.\n\nText sentiment: ${steps.analyze-text.output}\nImage tone: ${steps.analyze-image.output}"
    }
  ],
  "output": "${steps.summarize.output}"
}
```

Run it:

```bash
npx qwenflow run ./workflows/sentiment.json \
  --input text="The new update broke everything 😡" \
  --input image="https://example.com/screenshot.png"
```

QwenFlow executes `analyze-text` and `analyze-image` in parallel (they share no dependencies), waits for both, then runs `summarize`. The returned trace shows per-step latency, token counts, and which (if any) fallback model was used.

---

## 🧪 Testing

The suite uses [Vitest](https://vitest.dev/) and covers the orchestrator's scheduler, the retry/fallback executor, variable resolution, and the response aggregator. No live Qwen Cloud calls are made in CI — the Model Router is mocked.

```bash
npm test          # one-shot
npm run test:watch
```

---

## 🎯 Hackathon Tracks

Built for the **Qwen Cloud AI Hackathon** — a $70K prize pool across 5 tracks. QwenFlow targets the multi-model orchestration and developer-tooling tracks, showcasing how Qwen Cloud's text, vision, and audio models compose into something greater than the sum of their parts.

---

## License

MIT © QwenFlow Contributors

## 🤖 AI Assistants

→ See [CLAUDE.md](./CLAUDE.md) for AI coding assistant context.
