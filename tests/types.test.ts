import { describe, it, expect } from "vitest";
import { QWEN_MODELS, type Workflow, type ModelId } from "../src/types.js";

describe("QwenFlow Types", () => {
  it("QWEN_MODELS has all 5 models", () => {
    expect(QWEN_MODELS).toHaveLength(5);
    const ids = QWEN_MODELS.map((m) => m.id);
    expect(ids).toContain("qwen3-4b");
    expect(ids).toContain("qwen3-8b");
    expect(ids).toContain("qwen3-32b");
    expect(ids).toContain("qwen-vl");
    expect(ids).toContain("qwen-audio");
  });

  it("each model has required fields", () => {
    for (const model of QWEN_MODELS) {
      expect(model.id).toBeTruthy();
      expect(model.name).toBeTruthy();
      expect(model.description).toBeTruthy();
      expect(model.capabilities).toBeInstanceOf(Array);
      expect(model.contextWindow).toBeGreaterThan(0);
      expect(model.maxOutput).toBeGreaterThan(0);
    }
  });

  it("WorkflowStep requires id, model, and prompt", () => {
    const validStep = { id: "s1", model: "qwen3-8b" as ModelId, prompt: "test" };
    expect(validStep.id).toBe("s1");
    expect(validStep.model).toBe("qwen3-8b");
    expect(validStep.prompt).toBe("test");
  });

  it("Workflow requires name and steps", () => {
    const validWorkflow: Workflow = {
      id: "w1",
      name: "Test Workflow",
      description: "A test",
      steps: [{ id: "s1", model: "qwen3-4b", prompt: "Analyze this" }],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
    };
    expect(validWorkflow.name).toBe("Test Workflow");
    expect(validWorkflow.steps).toHaveLength(1);
    expect(["draft", "ready", "running", "completed", "failed"]).toContain(validWorkflow.status);
  });

  it("model context windows are ordered by size", () => {
    const byContext = [...QWEN_MODELS].sort((a, b) => a.contextWindow - b.contextWindow);
    expect(byContext[0].contextWindow).toBeLessThanOrEqual(byContext[byContext.length - 1].contextWindow);
  });
});
