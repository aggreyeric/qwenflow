import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini model integration for QwenFlow
// Falls back to mock if no API key provided

export const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
];

export async function callGemini(model: string, prompt: string, options?: { temperature?: number; maxTokens?: number }): Promise<{ content: string; model: string; tokens: number }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Mock response
    return {
      content: `[Mock Gemini ${model}] Processed: ${prompt.slice(0, 100)}...`,
      model,
      tokens: Math.floor(Math.random() * 500 + 100),
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const genModel = genAI.getGenerativeModel({
      model,
      generationConfig: {
        ...(options?.temperature !== undefined && { temperature: options.temperature }),
        ...(options?.maxTokens !== undefined && { maxOutputTokens: options.maxTokens }),
      },
    });
    const result = await genModel.generateContent(prompt);
    const response = result.response.text();
    return { content: response, model, tokens: response.length };
  } catch (error) {
    throw new Error(`Gemini API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function listGeminiModels(): { id: string; provider: string; context: string }[] {
  return GEMINI_MODELS.map(id => ({
    id,
    provider: "Google",
    context: "128K context window",
  }));
}
