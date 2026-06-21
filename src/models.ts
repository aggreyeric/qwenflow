import { ModelId, ModelCapabilities, ModelResponse } from "./types.js";
import { QwenCloudClient } from "./qwencloud.js";

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

// Shared Qwen Cloud client instance
const qwenClient = new QwenCloudClient();

export async function callModel(model: ModelId, prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<ModelResponse> {
  const result = await qwenClient.chat(model, prompt, options);
  return {
    model,
    content: result.content,
    tokens: result.tokens,
    latency: result.latency,
  };
}

export { QwenCloudClient };
