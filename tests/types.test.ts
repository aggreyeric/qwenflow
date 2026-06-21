import { describe, it, expect } from "vitest";
import { listModels, getModelCapabilities } from "../src/models.js";
import type { Workflow, ModelId } from "../src/types.js";

describe("QwenFlow Types", () => {
  it("model registry has all 8 models (5 Qwen + 3 Gemini)", () => {
    const models = listModels();
    expect(models.length).toBeGreaterThanOrEqual(8);
    const ids = models.map((m) => m.id);
    expect(ids).toContain("qwen3-4b");
    expect(ids).toContain("qwen3-8b");
    expect(ids).toContain("qwen3-32b");
    expect(ids).toContain("qwen-vl");
    expect(ids).toContain("qwen-audio");
    expect(ids).toContain("gemini-1.5-flash");
    expect(ids).toContain("gemini-1.5-pro");
    expect(ids).toContain("gemini-2.0-flash");
  });

  it("each model has required capabilities", () => {
    const models = listModels();
    for (const model of models) {
      expect(model.id).toBeTruthy();
      expect(model.maxContextTokens).toBeGreaterThan(0);
      expect(typeof model.supportsVision).toBe("boolean");
      expect(typeof model.supportsAudio).toBe("boolean");
      expect(typeof model.supportsTools).toBe("boolean");
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
    const byContext = [...listModels()].sort((a, b) => a.maxContextTokens - b.maxContextTokens);
    expect(byContext[0].maxContextTokens).toBeLessThanOrEqual(byContext[byContext.length - 1].maxContextTokens);
  });
});
