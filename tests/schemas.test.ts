import { describe, it, expect } from "vitest";
import { CreateWorkflowSchema, WorkflowStepSchema, ModelIdSchema } from "../src/schemas.js";

describe("Schemas", () => {
  const validStep = {
    id: "step-1",
    model: "qwen3-8b",
    prompt: "Summarize this text",
  };

  it("accepts valid workflow step", () => {
    const result = WorkflowStepSchema.safeParse(validStep);
    expect(result.success).toBe(true);
  });

  it("rejects step without id", () => {
    const result = WorkflowStepSchema.safeParse({ ...validStep, id: "" });
    expect(result.success).toBe(false);
  });

  it("rejects step without prompt", () => {
    const result = WorkflowStepSchema.safeParse({ ...validStep, prompt: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid model", () => {
    const result = WorkflowStepSchema.safeParse({ ...validStep, model: "gpt-4" });
    expect(result.success).toBe(false);
  });

  it("accepts valid create workflow", () => {
    const result = CreateWorkflowSchema.safeParse({
      name: "My Workflow",
      steps: [validStep],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CreateWorkflowSchema.safeParse({
      name: "",
      steps: [validStep],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty steps array", () => {
    const result = CreateWorkflowSchema.safeParse({
      name: "My Workflow",
      steps: [],
    });
    expect(result.success).toBe(false);
  });

  it("validates temperature range (0-2)", () => {
    expect(WorkflowStepSchema.safeParse({ ...validStep, temperature: -0.1 }).success).toBe(false);
    expect(WorkflowStepSchema.safeParse({ ...validStep, temperature: 2.1 }).success).toBe(false);
    expect(WorkflowStepSchema.safeParse({ ...validStep, temperature: 1 }).success).toBe(true);
  });

  it("validates maxTokens range (1-32768)", () => {
    expect(WorkflowStepSchema.safeParse({ ...validStep, maxTokens: 0 }).success).toBe(false);
    expect(WorkflowStepSchema.safeParse({ ...validStep, maxTokens: 32769 }).success).toBe(false);
    expect(WorkflowStepSchema.safeParse({ ...validStep, maxTokens: 1024 }).success).toBe(true);
  });

  it("accepts optional fields as defaults", () => {
    const result = WorkflowStepSchema.parse(validStep);
    expect(result.temperature).toBe(0.7);
    expect(result.maxTokens).toBe(4096);
    expect(result.retryCount).toBe(0);
  });

  it("ModelIdSchema accepts all valid model ids", () => {
    const valid = ["qwen3-4b", "qwen3-8b", "qwen3-32b", "qwen-vl", "qwen-audio"];
    for (const id of valid) {
      expect(ModelIdSchema.safeParse(id).success).toBe(true);
    }
    expect(ModelIdSchema.safeParse("invalid").success).toBe(false);
  });
});
