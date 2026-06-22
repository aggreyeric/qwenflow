/**
 * Unit tests for the Slack `/qwenflow` slash-command integration.
 *
 * `@slack/bolt` is mocked with `vi.mock` so we never spin up a real Bolt
 * App (no socket connections, no signing-secret checks). Instead we build
 * a fake `App` whose `.command()` method captures the handler registered by
 * `registerSlackCommands`, then invoke that handler directly with synthetic
 * `command` / `ack` / `respond` stubs.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock @slack/bolt so no real App / ExpressReceiver is instantiated.
vi.mock("@slack/bolt", () => ({
  App: vi.fn().mockImplementation(() => ({
    command: vi.fn(),
  })),
  ExpressReceiver: vi.fn(),
}));

// Mock QwenCloudClient so Orchestrator.run() completes without real API calls.
vi.mock("../src/qwen.js", () => ({
  QwenCloudClient: vi.fn().mockImplementation(() => ({
    callModel: vi.fn().mockResolvedValue({
      content: "mocked output",
      model: "qwen3-4b",
      tokens: { input: 10, output: 20, total: 30 },
      latencyMs: 150,
    }),
  })),
}));

import type { App } from "@slack/bolt";
import { registerSlackCommands } from "../src/slack-commands";
import { getAllWorkflows, setWorkflow } from "../src/store";
import { QWEN_MODELS, type Workflow } from "../src/types";

/** Minimal shape of the handler registered via `app.command("/qwenflow", fn)`. */
type CommandHandler = (args: {
  command: { text: string; [k: string]: unknown };
  ack: () => Promise<void>;
  respond: (msg: string) => Promise<void>;
}) => Promise<void>;

/**
 * Build a fake Bolt App whose `.command()` call captures the handler so the
 * test can invoke it directly.
 */
function createMockApp() {
  let handler: CommandHandler = async () => {};
  const command = vi.fn((_name: string, fn: CommandHandler) => {
    handler = fn;
  });
  const app = { command } as unknown as App;
  return { app, command, getHandler: () => handler };
}

/** Invoke the captured handler with a synthetic slash-command payload. */
async function runCommand(handler: CommandHandler, text: string) {
  const ack = vi.fn().mockResolvedValue(undefined);
  const respond = vi.fn().mockResolvedValue(undefined);
  await handler({
    command: { text, command: "/qwenflow", user_id: "U_TEST", channel_id: "C_TEST" },
    ack,
    respond,
  });
  return { ack, respond };
}

describe("Slack /qwenflow integration", () => {
  let getHandler: () => CommandHandler;
  let mockApp: App;

  beforeEach(() => {
    // Isolate the shared in-memory workflow store between tests.
    getAllWorkflows().clear();

    const built = createMockApp();
    mockApp = built.app;
    getHandler = built.getHandler;
    registerSlackCommands(mockApp);
  });

  it("registerSlackCommands registers /qwenflow command", () => {
    expect(mockApp.command).toHaveBeenCalledWith("/qwenflow", expect.any(Function));
    expect(getHandler()).toBeInstanceOf(Function);
  });

  it("/qwenflow models returns all models", async () => {
    const { ack, respond } = await runCommand(getHandler(), "models");

    expect(ack).toHaveBeenCalledTimes(1);
    expect(respond).toHaveBeenCalledTimes(1);

    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain(`${QWEN_MODELS.length} models`);
    for (const m of QWEN_MODELS) {
      expect(msg).toContain(m.id);
      expect(msg).toContain(m.name);
    }
  });

  it("/qwenflow status with no workflows returns empty", async () => {
    const { respond } = await runCommand(getHandler(), "status");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toMatch(/No workflows/i);
  });

  it("/qwenflow status lists existing workflows", async () => {
    const wf: Workflow = {
      id: "wf-demo",
      name: "Demo Flow",
      description: "a sample workflow",
      steps: [
        { id: "s1", model: "qwen3-4b", prompt: "Hello" },
        { id: "s2", model: "qwen3-8b", prompt: "World" },
      ],
      edges: [],
      createdAt: new Date(),
      status: "ready",
    };
    setWorkflow(wf.id, wf);

    const { respond } = await runCommand(getHandler(), "status");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("1 workflow(s)");
    expect(msg).toContain(wf.id);
    expect(msg).toContain(wf.name);
    expect(msg).toContain(`${wf.steps.length} steps`);
  });

  it("/qwenflow run missing id returns error", async () => {
    const { respond } = await runCommand(getHandler(), "run nope-123");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("not found");
    expect(msg).toContain("nope-123");
  });

  it("/qwenflow help shows usage", async () => {
    // Empty text → sub defaults to "help" (default branch).
    const { respond } = await runCommand(getHandler(), "");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("QwenFlow Slack Commands");
    expect(msg).toContain("/qwenflow run");
    expect(msg).toContain("/qwenflow status");
    expect(msg).toContain("/qwenflow models");
  });

  it("/qwenflow run executes workflow and returns summary", async () => {
    const wf: Workflow = {
      id: "wf-run-test",
      name: "Run Test Flow",
      description: "a workflow to run",
      steps: [
        { id: "s1", model: "qwen3-4b", prompt: "Say hello" },
      ],
      edges: [],
      createdAt: new Date(),
      status: "ready",
    };
    setWorkflow(wf.id, wf);

    const { respond } = await runCommand(getHandler(), "run wf-run-test");

    expect(respond).toHaveBeenCalledTimes(2); // ack + final result
    const msg = respond.mock.calls[1][0] as string;
    expect(msg).toContain("complete");
    expect(msg).toContain("Run Test Flow");
  });

  it("/qwenflow status with specific id returns workflow details", async () => {
    const wf: Workflow = {
      id: "wf-status-id",
      name: "Specific Status Flow",
      description: "test",
      steps: [
        { id: "s1", model: "qwen3-4b", prompt: "test" },
        { id: "s2", model: "qwen3-8b", prompt: "test2" },
        { id: "s3", model: "qwen-vl-max", prompt: "test3" },
      ],
      edges: [],
      createdAt: new Date(),
      status: "ready",
    };
    setWorkflow(wf.id, wf);

    const { respond } = await runCommand(getHandler(), "status wf-status-id");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("Specific Status Flow");
    expect(msg).toContain("wf-status-id");
    expect(msg).toContain("Steps: 3");
  });

  it("/qwenflow run with missing arg returns usage error", async () => {
    const { respond } = await runCommand(getHandler(), "run");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("Usage");
    expect(msg).toContain("/qwenflow run");
  });

  it("/qwenflow status with specific id returns workflow details", async () => {
    const wf: Workflow = {
      id: "wf-specific",
      name: "Specific Flow",
      description: "test",
      steps: [{ id: "s1", model: "qwen3-4b", prompt: "test" }],
      edges: [],
      createdAt: new Date(),
      status: "ready",
    };
    setWorkflow(wf.id, wf);

    const { respond } = await runCommand(getHandler(), "status wf-specific");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("Specific Flow");
    expect(msg).toContain("wf-specific");
    expect(msg).toContain("Steps: 1");
  });

  it("/qwenflow unknown subcommand shows help", async () => {
    const { respond } = await runCommand(getHandler(), "foobar");

    expect(respond).toHaveBeenCalledTimes(1);
    const msg = respond.mock.calls[0][0] as string;
    expect(msg).toContain("QwenFlow Slack Commands");
  });

  it("getAllWorkflows().clear() resets between tests", () => {
    // Verify store isolation works
    expect(getAllWorkflows().size).toBe(0);
  });
});
