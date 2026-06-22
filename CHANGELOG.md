# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — Slack Integration
### Added
- feat: shared workflow store (src/store.ts)
- feat: Slack Bolt integration (src/slack.ts, src/slack-commands.ts)
- feat: /qwenflow slash commands (run, status, models, help)
- feat: start:slack npm script
- test: 10 Slack integration tests (94 total)
- docs: Slack section in README, SLACK_SUBMISSION_FORM_FIELDS.md

## [0.1.0] - 2026-06-21
### Added
- Multi-model orchestration (Qwen + Gemini) with per-step routing
- Gemini adapter (src/gemini.ts) with @google/generative-ai integration
- 3 Gemini models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.0-flash
- Visual workflow editor (public/index.html) with model selector
- REST API (Express) with endpoints for workflows, models, health
- CLI tool (src/cli.ts) for headless workflow execution
- Zod schemas for workflow validation
- Docker support (Dockerfile)
- 78 tests across 8 suites (Vitest)
- SLACK_INTEGRATION_PLAN.md for Slack Agent Builder Challenge

### Fixed
- start script now uses compiled output (node dist/index.js)
- QWEN_MODELS export added to types.ts
- validate() method on QwenCloudClient
- ESM .js import extensions across all files
