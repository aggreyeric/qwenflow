# Changelog

All notable changes to QwenFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-21

### Added
- Express server with workflow CRUD and model listing APIs
- Orchestrator engine for sequential multi-step AI agent workflows
- 5 Qwen model types (qwen3-4b, qwen3-8b, qwen3-32b, qwen-vl, qwen-audio)
- Dark-theme visual workflow builder UI (vanilla HTML+JS, no build step)
- Zod validation schemas for workflow creation
- Docker multi-stage build support
- Demo script (scripts/demo.sh) for automated walkthrough
- CI workflow (GitHub Actions)
- In-memory workflow store with TypeScript types

### Tested
- Type validation tests (5 cases)
- Orchestrator execution tests (6 cases)
- Schema validation tests (11 cases)
- Total: 22 passing tests
