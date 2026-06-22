# Devpost Submission Form Fields — QwenFlow for Slack

> ⚠️ **OPTIONAL / DRAFT — Eric decides whether to build this.**
> Hackathon: [Slack AI & Agents Challenge](https://slackhack.devpost.com/) · Deadline: **Jul 13, 2026**
> This file is a content reference for the Devpost form. **Do NOT submit** without Eric's approval.

---

**Project Name**
QwenFlow for Slack — Multi-Model AI Agent in Your Workspace

**Tagline**
Run, monitor, and compare Qwen + Gemini models from any Slack channel with a single slash command.

**Description**

QwenFlow for Slack brings multi-model AI orchestration directly into your team's workspace. From any channel, `/qwenflow run` executes a workflow across Qwen and Gemini models, `/qwenflow status` reports live progress, and `/qwenflow models` lists every available model with its capabilities — no context switching, no leaving the conversation where your team already works.

Slack is where collaboration already happens, so it's the natural control plane for AI agents. QwenFlow makes multi-model workflows a first-class citizen of chat: an async, 3-second-ack-safe pattern keeps long runs responsive, results and token/latency summaries land inline, and the same shared workflow store powers the web UI and the Slack surface — one source of truth.

Under the hood, a `@slack/bolt` app registers the `/qwenflow` command and delegates to the existing QwenFlow `Orchestrator` class (`run()` / `getProgress()` / `getRun()`), which fans work across configured models and returns a typed `WorkflowRun`. Socket Mode enables zero-config local dev; HTTP receiver + signing secret support production. No changes to the orchestrator were required — the integration is a clean, additive surface.

**Tech Stack**
TypeScript · Node 18+ · Express 4 · `@slack/bolt` · QwenFlow orchestrator · Qwen models · Google Gemini · tsx · vitest

**Demo Video URL**
[Eric: add YouTube/Drive link — see `scripts/demo.sh` to record locally]

**GitHub URL**
https://github.com/aggreyeric/qwenflow

**Screenshots**
- `docs/screenshot-gemini-ui.png` — Gemini model in the web UI
- `docs/screenshot-ui.png` — QwenFlow dashboard overview

**Built With**
typescript, slack-bolt, qwen, gemini, express, nodejs, vitest

## Screenshots
- `docs/screenshot-ui.png` — QwenFlow dashboard
- `docs/screenshot-gemini-ui.png` — Gemini model selector
- `docs/screenshot-slack-ui.png` — QwenFlow web UI (for Slack integration context)
