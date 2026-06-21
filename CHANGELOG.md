# Changelog

All notable changes to QwenFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-21

First public release of QwenFlow — a visual, multi-step AI agent orchestrator
built around Qwen Cloud / DashScope models.

### Added

**Core scaffold & API**
- Initial scaffold with Express API server (`src/index.ts`) + vanilla HTML dark UI
- Workflow CRUD and model-listing REST endpoints (`src/routes/workflows.ts`, `src/routes/models.ts`)
- In-memory workflow store with TypeScript types (`src/types.ts`)
- 5 Qwen model types registered (qwen3-4b, qwen3-8b, qwen3-32b, qwen-vl, qwen-audio)

**Orchestration**
- Orchestrator engine for sequential multi-step agent execution (`src/orchestrator.ts`)
- Step chaining that threads each step's output into the next step's prompt

**Validation**
- Zod validation schemas for workflow creation (`src/schemas.ts`)

**Qwen Cloud integration**
- Real Qwen Cloud / DashScope API integration with mock fallback (`src/qwencloud.ts`)
- Automatic fallback to deterministic mock responses when no API key is present

**CLI**
- CLI (`run`, `models`, `serve`) with ANSI colors (`src/cli.ts`)

**UI**
- Dark-theme visual workflow builder UI (vanilla HTML+JS, no build step) (`public/index.html`)
- Static file serving from the Express server

**Packaging & deployment**
- Docker multi-stage build (`Dockerfile`) + `docker-compose.yml`
- `.dockerignore` and `.gitignore`

**Community & submission assets**
- GitHub maturity files: CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, LICENSE
- Issue/PR templates, FUNDING.yml
- Submission form fields (`SUBMISSION_FORM_FIELDS.md`) and demo video script (`DEMO_VIDEO_SCRIPT.md`)
- Automated demo walkthrough (`scripts/demo.sh`)
- CI workflow (GitHub Actions) (`.github/workflows/ci.yml`)

### Tested
- 22+ tests across 5 test suites
  - Type validation tests (`tests/types.test.ts`)
  - Orchestrator execution tests (`tests/orchestrator.test.ts`)
  - Schema validation tests (`tests/schemas.test.ts`)
  - API endpoint tests (`tests/api.test.ts`)
  - CLI tests (`tests/cli.test.ts`)
  - Qwen Cloud client integration tests (`tests/qwencloud.test.ts`)

### Commit history (v0.1.0)
- `b29453e` feat: QwenFlow AI agent orchestrator scaffold
- `6cafe83` feat: add Zod validation schemas + 11 tests
- `ae1c9d5` feat: add Zod validation schemas + 11 schema tests
- `4884431` feat: dark-theme workflow builder UI + static file serving
- `e072ff1` feat: Docker multi-stage build, demo script, submission form fields
- `24ca3b2` feat: CLI interface (run, models, serve) + 5 tests
- `aaf50b0` docs: badges, Why QwenFlow?, demo script, GitHub maturity files (issue/PR templates, FUNDING, COC)
- `7f80b5f` feat: real Qwen Cloud / DashScope API integration with mock fallback
- `6c33f6c` test: Qwen Cloud client integration tests
