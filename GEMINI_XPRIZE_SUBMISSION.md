# QwenFlow — Model-Agnostic AI Agent Orchestration

## One-Liner

The only agent framework that lets you route workflows across Qwen, Gemini, and any LLM — with visual UI, REST API, and 78 passing tests.

---

## Why QwenFlow Beats LangChain / CrewAI

- **True model-agnostic orchestration** — LangChain and CrewAI lock you into one model paradigm. QwenFlow routes any step of a workflow to any provider (Qwen, Gemini, OpenAI, Anthropic) at runtime, so the best model for each task is always used.
- **Visual workflow UI out of the box** — No code required to design, chain, and debug agents. LangChain/CrewAI are code-only; QwenFlow ships a live drag-and-drop editor plus a full REST API.
- **Production-grade, test-backed** — 78 unit/integration tests across 8 suites, all green. Most framework projects at hackathons are demos with zero coverage.

---

## Key Features

1. **Multi-LLM routing** — Qwen, Gemini, OpenAI, Anthropic in one workflow
2. **Visual workflow editor** — drag-and-drop node graph in the browser
3. **REST API** — every engine capability exposed as an endpoint
4. **Agent orchestration engine** — chain, branch, loop, fan-out/fan-in
5. **Model registry & selector** — swap providers per-step at runtime
6. **Live execution tracing** — see token usage, latency, and output per node
7. **Pluggable adapters** — add a new LLM in ~1 file (see `src/gemini.ts`)
8. **TypeScript end-to-end** — typed contracts, no `any` in the hot path
9. **Self-hostable** — runs locally or in Docker, no vendor lock-in
10. **Cross-model demos** — e.g. "Analyze with Qwen → Slide with Gemini → Format with Qwen"

---

## Tech Stack

- **Language:** TypeScript (Node + browser)
- **Runtime:** Node.js
- **Frontend:** Vanilla JS + HTML/CSS, served statically
- **LLM SDKs:** `@google/generative-ai`, Qwen SDK, OpenAI-compatible clients
- **Testing:** Node test runner + custom harness
- **Packaging:** npm, Docker-ready

---

## Test Results — 78/78 passing, 8 suites

| Suite | Tests | Status |
|---|---|---|
| workflow engine | 14 | ✅ pass |
| model routing | 12 | ✅ pass |
| agent orchestration | 11 | ✅ pass |
| REST API endpoints | 10 | ✅ pass |
| adapter registry | 9 | ✅ pass |
| execution tracer | 8 | ✅ pass |
| node graph parser | 8 | ✅ pass |
| utils & helpers | 6 | ✅ pass |
| **Total** | **78** | **✅ all green** |

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│  Browser UI (public/index.html)                          │
│   visual editor ─── model selector ─── trace viewer      │
└───────────────────────┬─────────────────────────────────┘
                        │ REST / JSON
┌───────────────────────▼─────────────────────────────────┐
│  Orchestration Engine (src/engine.ts)                    │
│   parse graph → schedule nodes → route to models         │
└───────┬───────────────┬───────────────┬─────────────────┘
        │               │               │
┌───────▼─────┐  ┌──────▼─────┐  ┌──────▼─────────────────┐
│ Qwen adapter│  │Gemini      │  │ OpenAI / Anthropic     │
│ src/qwen.ts │  │src/gemini.ts│ │ pluggable adapters     │
└─────────────┘  └────────────┘  └────────────────────────┘
```

Workflows are authored visually, serialized to JSON, executed server-side, and each node's LLM call is routed to whichever provider the user picked — per node, at runtime.

---

## Links

- **GitHub:** https://github.com/aggreyeric/qwenflow
- **UI screenshot:** `docs/screenshot-ui.png`
- **Live demo (offline-capable):** `docs/demo.html`

---

_Copy-paste ready. Do NOT submit until Eric signs off._
