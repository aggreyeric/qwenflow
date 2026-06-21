#!/usr/bin/env node

/**
 * QwenFlow CLI — Run AI agent workflows from the terminal
 */

import type { ModelId, Workflow, WorkflowRun } from "./types.js";
import { Orchestrator } from "./orchestrator.js";
import { QWEN_MODELS } from "./types.js";
import crypto from "node:crypto";

const RESET = "\x1b[0m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function log(msg: string, color = ""): void {
  if (color) process.stdout.write(color);
  process.stdout.write(msg);
  if (color) process.stdout.write(RESET);
  process.stdout.write("\n");
}

function parseArgs(argv: string[]): { command: string; options: Record<string, string> } {
  const args = argv.slice(2);
  const command = args[0] || "help";
  const options: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        options[key] = value;
        i++;
      } else {
        options[key] = "true";
      }
    }
  }

  return { command, options };
}

function showHelp(): void {
  log(`${BOLD}QwenFlow CLI${RESET}`, CYAN);
  log("");
  log("Usage:", BOLD);
  log("  qwenflow run   --model <model> --prompt <text> [--name <name>]", DIM);
  log("  qwenflow models", DIM);
  log("  qwenflow serve", DIM);
  log("  qwenflow help", DIM);
  log("");
  log("Commands:", BOLD);
  log("  run      Execute a single-step workflow", DIM);
  log("  models   List available Qwen models", DIM);
  log("  serve    Start the Express server on port 3000", DIM);
  log("  help     Show this help message", DIM);
}

function listModels(): void {
  log(`${BOLD}Available Qwen Models:${RESET}\n`, CYAN);
  for (const model of QWEN_MODELS) {
    log(`  ${CYAN}${model.id}${RESET} — ${model.name}`);
    log(`    ${model.description}`);
    log(`    Context: ${model.contextWindow.toLocaleString()} tokens · Output: ${model.maxOutput.toLocaleString()} tokens`);
    log(`    Capabilities: ${model.capabilities.join(", ")}`);
    log("");
  }
}

async function runWorkflow(options: Record<string, string>): Promise<void> {
  const model = (options.model || "qwen3-8b") as ModelId;
  const prompt = options.prompt;

  if (!prompt) {
    log("Error: --prompt is required", RED);
    process.exit(1);
  }

  // Validate model
  if (!QWEN_MODELS.some((m) => m.id === model)) {
    log(`Error: unknown model "${model}"`, RED);
    log(`Available: ${QWEN_MODELS.map((m) => m.id).join(", ")}`, DIM);
    process.exit(1);
  }

  const name = options.name || "CLI Workflow";

  const workflow: Workflow = {
    id: crypto.randomUUID(),
    name,
    description: `CLI-generated workflow using ${model}`,
    steps: [{ id: "s1", model, prompt }],
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "ready",
  };

  log(`\n${BOLD}⚡ QwenFlow${RESET} — Running workflow: ${CYAN}${name}${RESET}`);
  log(`  Model: ${CYAN}${model}${RESET}`);
  log(`  Prompt: ${DIM}${prompt.substring(0, 100)}${prompt.length > 100 ? "..." : ""}${RESET}\n`);

  const start = Date.now();
  const orchestrator = new Orchestrator(workflow);
  const run: WorkflowRun = await orchestrator.run();
  const elapsed = Date.now() - start;

  if (run.status === "completed") {
    log(`${GREEN}✅ Workflow completed${RESET} in ${elapsed}ms\n`);
    for (const result of run.results) {
      log(`  ${CYAN}[${result.model}]${RESET} ${result.content}`);
      log(`  ${DIM}Tokens: ${result.tokens.prompt} prompt + ${result.tokens.completion} completion · ${result.latency}ms${RESET}`);
    }
  } else {
    log(`${RED}❌ Workflow failed:${RESET} ${run.error}`, RED);
    process.exit(1);
  }
}

async function serve(): Promise<void> {
  log(`${BOLD}⚡ Starting QwenFlow server...${RESET}`, CYAN);
  // Dynamic import to avoid circular deps — starts the Express server
  const { default: app } = await import("./index.js");
  log(`${GREEN}✅ QwenFlow server running${RESET} — ${CYAN}http://localhost:3000${RESET}`);
  log(`  API: ${DIM}/api/workflows · /api/models · /health${RESET}`);
  log(`  UI:  ${DIM}http://localhost:3000${RESET}\n`);
}

// Main
const { command, options } = parseArgs(process.argv);

switch (command) {
  case "run":
    runWorkflow(options).catch((e) => {
      log(`Error: ${e.message}`, RED);
      process.exit(1);
    });
    break;
  case "models":
    listModels();
    break;
  case "serve":
    serve().catch((e) => {
      log(`Error: ${e.message}`, RED);
      process.exit(1);
    });
    break;
  case "help":
  default:
    showHelp();
    break;
}
