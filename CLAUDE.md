# QwenFlow — CLAUDE.md

## Overview
QwenFlow is an AI agent orchestration framework for the Qwen Cloud hackathon. It is **multi-model** — supporting both **Qwen Cloud** (DashScope) and **Google Gemini** model families behind a unified interface.

## Tech Stack
- TypeScript, ESNext modules
- Express.js API server
- Zod for validation
- Vitest for testing
- Docker + docker-compose

## Commands
- `npm install` — install deps
- `npm run dev` — dev server with tsx watch (port 3000)
- `npm run build` (`npx tsc`) — TypeScript compile to dist/
- `npm test` — vitest run (94 test cases across 10 suites)
- `npm run test:ci` — vitest run with verbose reporter for CI output
- `npm start` (`node dist/index.js`) — production server (port 3000)

## Architecture
- src/index.ts — Express entrypoint, mounts routes
- src/types.ts — TypeScript interfaces
- src/schemas.ts — Zod validation schemas
- src/models.ts — model registry + DashScope API
- src/orchestrator.ts — multi-step workflow execution
- src/qwencloud.ts — Qwen Cloud API integration
- src/gemini.ts — Google Gemini API adapter (mirrors qwencloud.ts interface)
- src/routes/workflows.ts — CRUD + run workflow endpoints
- src/routes/models.ts — model listing endpoints
- src/cli.ts — CLI for local usage
- public/index.html — dark-theme single-page UI

## Slack Integration
QwenFlow exposes its orchestration capabilities through a Slack app targeting the **Slack Agent Builder ($42K prize)** hackathon track. The app runs a Bolt-for-JS server alongside the Express API, letting users trigger workflows and query status directly from Slack via slash commands.

### Slash Commands
- `/qwenflow run <prompt>` — execute a workflow from a natural-language prompt
- `/qwenflow status [run-id]` — show run status (latest, or a specific run ID)
- `/qwenflow models` — list available Qwen Cloud + Gemini models

### Files
- src/slack.ts — Bolt `App` factory; reads tokens from env, wires command handlers, exports the configured app instance
- src/slack-commands.ts — slash command handlers (`run`, `status`, `models`); calls into the orchestrator/model registry
- src/slack-start.ts — entry point that starts the Bolt receiver (Socket Mode) and optionally boots the Express server

### Tests
- tests/slack.test.ts — 10 tests covering command parsing, handler responses, token validation, and error cases (mocked Bolt app)

### Environment Variables
- SLACK_BOT_TOKEN — `xoxb-...` bot OAuth token (required)
- SLACK_SIGNING_SECRET — signing secret for request verification (required)
- SLACK_APP_TOKEN — `xapp-...` token for Socket Mode (required)

## API Endpoints
- GET /health — health check
- POST /api/workflows — create workflow
- GET /api/workflows/:id — get workflow
- POST /api/workflows/:id/run — execute workflow
- GET /api/models — list available models

## Testing
Tests in tests/ directory (10 suites: api, cli, gemini, orchestrator, qwencloud, routes, schemas, types, slack, extras). Run with `npx vitest run` or `npm test`; use `npm run test:ci` for verbose CI output. No live Qwen Cloud or Gemini calls — the model layer is mocked in CI.

## Environment
- PORT — server port (default 3000)
- QWEN_CLOUD_API_KEY — DashScope/Qwen Cloud API key (checked first)
- DASHSCOPE_API_KEY — accepted alias for the API key
- GEMINI_API_KEY — Google Gemini API key (optional; falls back to mock responses when absent)
- All keys are optional; if absent, qwencloud.ts and gemini.ts fall back to mock responses for local dev.

## Models
- Qwen Cloud: qwen-turbo, qwen-plus, qwen-max, etc. (via DashScope)
- Gemini: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash (via src/gemini.ts)

## Important Notes
- Package uses "type": "module" — all imports need .js extensions
- Orchestrator uses currentRun (not run) to avoid name collision with run() method
- CLI has @ts-nocheck due to type inference issues
- src/gemini.ts exposes the same call interface as qwencloud.ts so the orchestrator can dispatch to either provider transparently
