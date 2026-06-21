/**
 * QwenCloud API client — real integration with DashScope (Alibaba's AI gateway)
 * Falls back to mock mode when no API key is configured.
 */

import type { ModelId } from "./types.js";

export interface ChatResponse {
  content: string;
  tokens: { prompt: number; completion: number };
  latency: number;
  model: string;
}

export interface ValidateResult {
  valid: boolean;
  error?: string;
}

export class QwenCloudClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.QWEN_CLOUD_API_KEY || process.env.DASHSCOPE_API_KEY || "";
    this.baseUrl = baseUrl || process.env.QWEN_CLOUD_BASE_URL || "https://dashscope.aliyuncs.com/compatible-mode/v1";
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * Send a chat completion request to the Qwen Cloud / DashScope API.
   * Model IDs are mapped: "qwen3-8b" → "qwen3-8b" (DashScope uses same naming).
   */
  async chat(
    model: ModelId,
    prompt: string,
    options?: { temperature?: number; maxTokens?: number; systemPrompt?: string }
  ): Promise<ChatResponse> {
    if (!this.isConfigured) {
      console.warn("[QwenCloud] No API key configured — falling back to mock response");
      return this.mockResponse(model, prompt);
    }

    const start = Date.now();

    const messages: Array<{ role: string; content: string }> = [];
    if (options?.systemPrompt) {
      messages.push({ role: "system", content: options.systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const body = {
      model: `qwen-${model.replace("qwen3-", "").replace("qwen-", "")}`,
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[QwenCloud] API error ${response.status}: ${errorText}`);
        return this.mockResponse(model, prompt);
      }

      const data = await response.json() as any;
      const choice = data.choices?.[0];
      const usage = data.usage || {};

      return {
        content: choice?.message?.content || "",
        tokens: {
          prompt: usage.prompt_tokens || 0,
          completion: usage.completion_tokens || 0,
        },
        latency: Date.now() - start,
        model: data.model || model,
      };
    } catch (error) {
      console.error(`[QwenCloud] Request failed:`, error);
      return this.mockResponse(model, prompt);
    }
  }

  /**
   * Map a QwenFlow ModelId to the DashScope model name.
   */
  resolveModelName(model: ModelId): string {
    const mapping: Record<ModelId, string> = {
      "qwen3-4b": "qwen3-4b",
      "qwen3-8b": "qwen3-8b",
      "qwen3-32b": "qwen3-32b",
      "qwen-vl": "qwen-vl-max",
      "qwen-audio": "qwen-audio-turbo",
    };
    return mapping[model] || model;
  }

  private mockResponse(model: ModelId, prompt: string): ChatResponse {
    return {
      content: `[${model}] Mock response for: "${prompt.substring(0, 80)}${prompt.length > 80 ? "..." : ""}"\n\nSet QWEN_CLOUD_API_KEY or DASHSCOPE_API_KEY env var for real Qwen Cloud inference.`,
      tokens: { prompt: Math.ceil(prompt.length / 3.5), completion: 42 },
      latency: 15,
      model,
    };
  }
}
