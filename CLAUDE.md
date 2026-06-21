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
- `npm run build` — TypeScript compile to dist/
- `npm test` — vitest run (78 test cases across 8 suites)
- `npm run test:ci` — vitest run with verbose reporter for CI output
- `npm start` — production (runs src/index.ts via tsx, port 3000)

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

## API Endpoints
- GET /health — health check
- POST /api/workflows — create workflow
- GET /api/workflows/:id — get workflow
- POST /api/workflows/:id/run — execute workflow
- GET /api/models — list available models

## Testing
Tests in tests/ directory (8 suites: api, cli, gemini, orchestrator, qwencloud, routes, schemas, types). Run with `npx vitest run` or `npm test`; use `npm run test:ci` for verbose CI output. No live Qwen Cloud or Gemini calls — the model layer is mocked in CI.

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
