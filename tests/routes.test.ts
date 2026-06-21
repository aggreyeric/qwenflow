import { describe, it, expect } from "vitest";
import { CreateWorkflowSchema, WorkflowStepSchema, ModelIdSchema, RunWorkflowSchema } from "../src/schemas.js";

describe("ModelIdSchema", () => {
  it("accepts qwen3-4b", () => {
    expect(ModelIdSchema.parse("qwen3-4b")).toBe("qwen3-4b");
  });

  it("accepts qwen-audio", () => {
    expect(ModelIdSchema.parse("qwen-audio")).toBe("qwen-audio");
  });

  it("rejects unknown model", () => {
    expect(() => ModelIdSchema.parse("gpt-4")).toThrow();
  });

  it("rejects empty string", () => {
    expect(() => ModelIdSchema.parse("")).toThrow();
  });
});

describe("WorkflowStepSchema", () => {
  const validStep = { id: "step1", model: "qwen3-8b", prompt: "Analyze this code" };

  it("accepts valid step with required fields only", () => {
    const result = WorkflowStepSchema.parse(validStep);
    expect(result.model).toBe("qwen3-8b");
    expect(result.temperature).toBe(0.7);
    expect(result.maxTokens).toBe(4096);
    expect(result.retryCount).toBe(0);
  });

  it("accepts step with optional fields", () => {
    const step = { ...validStep, temperature: 0.3, maxTokens: 1024, retryCount: 2 };
    const result = WorkflowStepSchema.parse(step);
    expect(result.temperature).toBe(0.3);
    expect(result.maxTokens).toBe(1024);
    expect(result.retryCount).toBe(2);
  });

  it("rejects missing id", () => {
    expect(() => WorkflowStepSchema.parse({ model: "qwen3-8b", prompt: "test" })).toThrow();
  });

  it("rejects missing model", () => {
    expect(() => WorkflowStepSchema.parse({ id: "s1", prompt: "test" })).toThrow();
  });

  it("rejects missing prompt", () => {
    expect(() => WorkflowStepSchema.parse({ id: "s1", model: "qwen3-8b" })).toThrow();
  });

  it("rejects invalid model", () => {
    expect(() => WorkflowStepSchema.parse({ ...validStep, model: "claude-3" })).toThrow();
  });

  it("rejects temperature out of range (negative)", () => {
    expect(() => WorkflowStepSchema.parse({ ...validStep, temperature: -0.5 })).toThrow();
  });

  it("rejects temperature out of range (too high)", () => {
    expect(() => WorkflowStepSchema.parse({ ...validStep, temperature: 5.0 })).toThrow();
  });

  it("rejects empty string id", () => {
    expect(() => WorkflowStepSchema.parse({ ...validStep, id: "" })).toThrow();
  });

  it("rejects empty string prompt", () => {
    expect(() => WorkflowStepSchema.parse({ ...validStep, prompt: "" })).toThrow();
  });

  it("accepts fallbackModel", () => {
    const step = { ...validStep, fallbackModel: "qwen3-4b" };
    expect(WorkflowStepSchema.parse(step).fallbackModel).toBe("qwen3-4b");
  });

  it("rejects invalid fallbackModel", () => {
    expect(() => WorkflowStepSchema.parse({ ...validStep, fallbackModel: "invalid" })).toThrow();
  });
});

describe("CreateWorkflowSchema", () => {
  const validWorkflow = {
    name: "Code Review Pipeline",
    steps: [{ id: "s1", model: "qwen3-8b", prompt: "Review this code" }],
  };

  it("accepts valid workflow with single step", () => {
    const result = CreateWorkflowSchema.parse(validWorkflow);
    expect(result.name).toBe("Code Review Pipeline");
    expect(result.description).toBe("");
    expect(result.steps).toHaveLength(1);
  });

  it("accepts workflow with description and multiple steps", () => {
    const workflow = {
      name: "Multi-step Pipeline",
      description: "Analyzes code then generates docs",
      steps: [
        { id: "s1", model: "qwen3-8b", prompt: "Analyze code" },
        { id: "s2", model: "qwen-vl", prompt: "Generate diagram" },
        { id: "s3", model: "qwen3-32b", prompt: "Write docs" },
      ],
    };
    const result = CreateWorkflowSchema.parse(workflow);
    expect(result.steps).toHaveLength(3);
    expect(result.description).toBe("Analyzes code then generates docs");
  });

  it("rejects missing name", () => {
    expect(() => CreateWorkflowSchema.parse({ steps: validWorkflow.steps })).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => CreateWorkflowSchema.parse({ name: "", steps: validWorkflow.steps })).toThrow();
  });

  it("rejects missing steps", () => {
    expect(() => CreateWorkflowSchema.parse({ name: "test" })).toThrow();
  });

  it("rejects empty steps array", () => {
    expect(() => CreateWorkflowSchema.parse({ name: "test", steps: [] })).toThrow();
  });

  it("rejects more than 20 steps", () => {
    const steps = Array.from({ length: 21 }, (_, i) => ({
      id: `s${i}`,
      model: "qwen3-4b" as const,
      prompt: `Step ${i}`,
    }));
    expect(() => CreateWorkflowSchema.parse({ name: "big", steps })).toThrow();
  });

  it("accepts exactly 20 steps", () => {
    const steps = Array.from({ length: 20 }, (_, i) => ({
      id: `s${i}`,
      model: "qwen3-4b" as const,
      prompt: `Step ${i}`,
    }));
    const result = CreateWorkflowSchema.parse({ name: "max", steps });
    expect(result.steps).toHaveLength(20);
  });

  it("rejects name over 200 chars", () => {
    const longName = "x".repeat(201);
    expect(() => CreateWorkflowSchema.parse({ name: longName, steps: validWorkflow.steps })).toThrow();
  });

  it("accepts name at exactly 200 chars", () => {
    const name = "x".repeat(200);
    const result = CreateWorkflowSchema.parse({ name, steps: validWorkflow.steps });
    expect(result.name).toHaveLength(200);
  });
});

describe("RunWorkflowSchema", () => {
  it("accepts empty inputs", () => {
    const result = RunWorkflowSchema.parse({});
    expect(result.inputs).toEqual({});
  });

  it("accepts string-keyed inputs", () => {
    const result = RunWorkflowSchema.parse({ inputs: { file: "main.ts", action: "review" } });
    expect(result.inputs).toEqual({ file: "main.ts", action: "review" });
  });

  it("accepts explicit inputs with default", () => {
    const result = RunWorkflowSchema.parse({ inputs: {} });
    expect(result.inputs).toEqual({});
  });
});
