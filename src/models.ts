import { ModelId, ModelCapabilities, ModelResponse } from "./types";

const MODEL_REGISTRY: Record<ModelId, ModelCapabilities> = {
  "qwen3-4b": { id: "qwen3-4b", maxContextTokens: 32768, supportsVision: false, supportsAudio: false, supportsTools: true, costPerMillionTokens: 0 },
  "qwen3-8b": { id: "qwen3-8b", maxContextTokens: 65536, supportsVision: false, supportsAudio: false, supportsTools: true, costPerMillionTokens: 0 },
  "qwen3-32b": { id: "qwen3-32b", maxContextTokens: 131072, supportsVision: false, supportsAudio: false, supportsTools: true, costPerMillionTokens: 0 },
  "qwen-vl": { id: "qwen-vl", maxContextTokens: 32768, supportsVision: true, supportsAudio: false, supportsTools: true, costPerMillionTokens: 0 },
  "qwen-audio": { id: "qwen-audio", maxContextTokens: 32768, supportsVision: false, supportsAudio: true, supportsTools: false, costPerMillionTokens: 0 },
};

export function getModelCapabilities(model: ModelId): ModelCapabilities {
  return MODEL_REGISTRY[model];
}

export function listModels(): ModelCapabilities[] {
  return Object.values(MODEL_REGISTRY);
}

export async function callModel(model: ModelId, prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<ModelResponse> {
  const start = Date.now();
  // Placeholder — in production, this calls Qwen Cloud API
  const content = `[Qwen Cloud] Model ${model} processed: "${prompt.slice(0, 50)}..."`;
  const latency = Date.now() - start;
  return {
    model,
    content,
    tokens: { prompt: Math.ceil(prompt.length / 4), completion: Math.ceil(content.length / 4) },
    latency,
  };
}
