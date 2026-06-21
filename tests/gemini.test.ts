import { describe, it, expect, vi, beforeEach } from "vitest";
import { GEMINI_MODELS, listGeminiModels, callGemini } from "../src/gemini.js";

// Mock the @google/generative-ai module
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: vi.fn().mockResolvedValue({
        response: { text: () => "Gemini response text" },
      }),
    }),
  })),
}));

describe("GEMINI_MODELS", () => {
  it("contains gemini-1.5-flash", () => {
    expect(GEMINI_MODELS).toContain("gemini-1.5-flash");
  });

  it("contains gemini-1.5-pro", () => {
    expect(GEMINI_MODELS).toContain("gemini-1.5-pro");
  });

  it("contains gemini-2.0-flash", () => {
    expect(GEMINI_MODELS).toContain("gemini-2.0-flash");
  });

  it("has exactly 3 models", () => {
    expect(GEMINI_MODELS).toHaveLength(3);
  });
});

describe("listGeminiModels", () => {
  it("returns array with provider 'Google'", () => {
    const models = listGeminiModels();
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    expect(models.every(m => m.provider === "Google")).toBe(true);
  });

  it("each model has id, provider, context", () => {
    const models = listGeminiModels();
    for (const m of models) {
      expect(m).toHaveProperty("id");
      expect(typeof m.id).toBe("string");
      expect(m.id.length).toBeGreaterThan(0);
      expect(m).toHaveProperty("provider");
      expect(typeof m.provider).toBe("string");
      expect(m).toHaveProperty("context");
      expect(typeof m.context).toBe("string");
    }
  });

  it("context mentions 128K", () => {
    const models = listGeminiModels();
    for (const m of models) {
      expect(m.context).toMatch(/128K/i);
    }
  });

  it("returns one entry per GEMINI_MODELS id", () => {
    const models = listGeminiModels();
    expect(models).toHaveLength(GEMINI_MODELS.length);
    const ids = models.map(m => m.id);
    for (const id of GEMINI_MODELS) {
      expect(ids).toContain(id);
    }
  });
});

describe("callGemini (mock mode)", () => {
  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns mock response when no API key", async () => {
    const result = await callGemini("gemini-1.5-flash", "Hello world");
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("model");
    expect(result).toHaveProperty("tokens");
    expect(result.content).toContain("Mock");
  });

  it("mock response includes model name", async () => {
    const model = "gemini-2.0-flash";
    const result = await callGemini(model, "Hello world");
    expect(result.model).toBe(model);
    expect(result.content).toContain(model);
  });

  it("mock response includes tokens number", async () => {
    const result = await callGemini("gemini-1.5-pro", "Hello world");
    expect(typeof result.tokens).toBe("number");
    expect(result.tokens).toBeGreaterThan(0);
    // Math.floor(Math.random() * 500 + 100) -> range [100, 599]
    expect(result.tokens).toBeGreaterThanOrEqual(100);
    expect(result.tokens).toBeLessThanOrEqual(599);
  });

  it("truncates long prompts to 100 chars in content", async () => {
    const longPrompt = "x".repeat(250);
    const result = await callGemini("gemini-1.5-flash", longPrompt);
    // content = `[Mock Gemini ${model}] Processed: ${prompt.slice(0, 100)}...`
    expect(result.content).toContain("Processed:");
    expect(result.content).toContain("...");
  });

  it("passes through options without throwing in mock mode", async () => {
    const result = await callGemini("gemini-2.0-flash", "Hi", {
      temperature: 0.7,
      maxTokens: 256,
    });
    expect(result.content).toContain("Mock");
  });
});
