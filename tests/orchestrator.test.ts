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
