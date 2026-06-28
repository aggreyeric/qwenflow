import { describe, it, expect } from "vitest";
import { Orchestrator } from "../src/orchestrator";
import { Workflow } from "../src/types";

function makeTestWorkflow(): Workflow {
  return {
    id: "wf-test",
    name: "Test",
    description: "",
    steps: [
      { id: "s1", model: "qwen3-4b", prompt: "Step 1" },
      { id: "s2", model: "qwen3-8b", prompt: "Step 2" },
      { id: "s3", model: "qwen3-32b", prompt: "Step 3" },
    ],
    edges: [],
    createdAt: new Date(),
    status: "ready",
  };
}

describe("Orchestrator", () => {
  it("runs a 3-step workflow to completion", async () => {
    const orchestrator = new Orchestrator(makeTestWorkflow());
    const result = await orchestrator.run();
    expect(result.status).toBe("completed");
    expect(Object.keys(result.results)).toHaveLength(3);
    expect(result.results.s1.model).toBe("qwen3-4b");
    expect(result.results.s2.model).toBe("qwen3-8b");
    expect(result.results.s3.model).toBe("qwen3-32b");
  });

  it("tracks progress correctly", () => {
    const wf = makeTestWorkflow();
    wf.steps = Array.from({ length: 5 }, (_, i) => ({
      id: `s${i}`,
      model: "qwen3-4b" as const,
      prompt: `Step ${i}`,
    }));
    const orch = new Orchestrator(wf);
    const prog = orch.getProgress();
    expect(prog.total).toBe(5);
    expect(prog.step).toBe(0);
    expect(prog.percent).toBe(0);
  });

  it("getRun returns the current run state", () => {
    const orch = new Orchestrator(makeTestWorkflow());
    const run = orch.getRun();
    expect(run.workflowId).toBe("wf-test");
    expect(run.status).toBe("pending");
    expect(run.id).toMatch(/^run-/);
  });
});

// --- New: proves the documented features (resolution, parallelism, resilience) ---

type AnyCaller = (model: string, prompt: string) => Promise<unknown>;

function wf(id: string, steps: Array<Partial<Workflow["steps"][number]> & { id: string; prompt: string }>): Workflow {
  return { id, name: id, description: "", steps: steps as Workflow["steps"], edges: [], createdAt: new Date(), status: "ready" };
}

const resp = (model: string, content: string) => ({ model, content, tokens: { prompt: 0, completion: 0 }, latency: 0 });

describe("Orchestrator — variable resolution & inputs", () => {
  it("resolves ${steps.X.output} references between steps", async () => {
    const seen: string[] = [];
    const callFn: AnyCaller = async (m, p) => { seen.push(p); return resp(m, `OUT(${p})`); };
    const run = await new Orchestrator(wf("wf-res", [
      { id: "a", model: "qwen3-4b", prompt: "first" },
      { id: "b", model: "qwen3-8b", prompt: "then: ${steps.a.output}" },
    ]), { callFn: callFn as never }).run();
    expect(run.status).toBe("completed");
    expect(seen[0]).toBe("first");
    expect(seen[1]).toBe("then: OUT(first)");
  });

  it("resolves ${inputs.X} from run options", async () => {
    const seen: string[] = [];
    const callFn: AnyCaller = async (m, p) => { seen.push(p); return resp(m, p); };
    await new Orchestrator(wf("wf-in", [
      { id: "s", model: "qwen3-4b", prompt: "Review: ${inputs.topic}" },
    ]), { inputs: { topic: "Bitcoin" }, callFn: callFn as never }).run();
    expect(seen[0]).toBe("Review: Bitcoin");
  });

  it("fails the run (no crash, no infinite loop) on a dangling step reference", async () => {
    const callFn: AnyCaller = async (m, p) => resp(m, p);
    const run = await new Orchestrator(wf("wf-missing", [
      { id: "s", model: "qwen3-4b", prompt: "value=[${steps.nope.output}]" },
    ]), { callFn: callFn as never }).run();
    expect(run.status).toBe("failed");
  });

  it("fails the run on a dependency cycle instead of hanging", async () => {
    const callFn: AnyCaller = async (m, p) => resp(m, p);
    const run = await new Orchestrator(wf("wf-cycle", [
      { id: "a", model: "qwen3-4b", prompt: "${steps.b.output}" },
      { id: "b", model: "qwen3-8b", prompt: "${steps.a.output}" },
    ]), { callFn: callFn as never }).run();
    expect(run.status).toBe("failed");
  });
});

describe("Orchestrator — scheduling (parallel vs sequential)", () => {
  const tracker = () => {
    let active = 0; let maxActive = 0;
    const callFn: AnyCaller = async (m) => {
      active++; maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 20));
      active--;
      return resp(m, "x");
    };
    return { callFn, max: () => maxActive };
  };

  it("runs independent steps in parallel (max concurrency = N)", async () => {
    const t = tracker();
    await new Orchestrator(wf("wf-par", [
      { id: "x", model: "qwen3-4b", prompt: "a" },
      { id: "y", model: "qwen3-8b", prompt: "b" },
    ]), { callFn: t.callFn as never }).run();
    expect(t.max()).toBe(2);
  });

  it("runs dependent steps sequentially (max concurrency = 1)", async () => {
    const t = tracker();
    await new Orchestrator(wf("wf-seq", [
      { id: "x", model: "qwen3-4b", prompt: "a" },
      { id: "y", model: "qwen3-8b", prompt: "b ${steps.x.output}" },
    ]), { callFn: t.callFn as never }).run();
    expect(t.max()).toBe(1);
  });
});

describe("Orchestrator — resilience (retry + fallback)", () => {
  it("retries a failing step with backoff then succeeds", async () => {
    let calls = 0;
    const callFn: AnyCaller = async (m) => { calls++; if (calls < 3) throw new Error("boom"); return resp(m, "ok"); };
    const run = await new Orchestrator(wf("wf-retry", [
      { id: "s", model: "qwen3-4b", prompt: "go", retryCount: 2 },
    ]), { callFn: callFn as never }).run();
    expect(run.status).toBe("completed");
    expect(run.results.s.content).toBe("ok");
    expect(calls).toBe(3); // 1 initial + 2 retries
  });

  it("falls back to fallbackModel when the primary always fails", async () => {
    const seen: string[] = [];
    const callFn: AnyCaller = async (m) => {
      seen.push(m);
      if (m === "qwen3-8b") throw new Error("primary down");
      return resp(m, "recovered");
    };
    const run = await new Orchestrator(wf("wf-fb", [
      { id: "s", model: "qwen3-8b", prompt: "go", fallbackModel: "qwen3-4b" },
    ]), { callFn: callFn as never }).run();
    expect(run.status).toBe("completed");
    expect(run.results.s.model).toBe("qwen3-4b");
    expect(seen).toEqual(["qwen3-8b", "qwen3-4b"]);
  });

  it("marks the run failed when primary and fallback both fail", async () => {
    const callFn: AnyCaller = async () => { throw new Error("total outage"); };
    const run = await new Orchestrator(wf("wf-dead", [
      { id: "s", model: "qwen3-8b", prompt: "go", fallbackModel: "qwen3-4b" },
    ]), { callFn: callFn as never }).run();
    expect(run.status).toBe("failed");
  });
});
