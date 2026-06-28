export type ModelId = "qwen3-4b" | "qwen3-8b" | "qwen3-32b" | "qwen-vl" | "qwen-audio" | "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash";

export const QWEN_MODELS: { id: ModelId; name: string; description: string; capabilities: string[] }[] = [
  { id: "qwen3-4b", name: "Qwen 3 4B", description: "Fast lightweight model", capabilities: ["text"] },
  { id: "qwen3-8b", name: "Qwen 3 8B", description: "Balanced model", capabilities: ["text"] },
  { id: "qwen3-32b", name: "Qwen 3 32B", description: "High-quality model", capabilities: ["text"] },
  { id: "qwen-vl", name: "Qwen VL", description: "Vision-language model", capabilities: ["text", "vision"] },
  { id: "qwen-audio", name: "Qwen Audio", description: "Audio model", capabilities: ["text", "audio"] },
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast multimodal model", capabilities: ["text", "vision"] },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "High-quality multimodal", capabilities: ["text", "vision"] },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", description: "Latest fast model", capabilities: ["text", "vision"] },
];

export interface WorkflowStep {
  id: string;
  model: ModelId;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  /** Number of retries after the first attempt (exponential backoff). */
  retryCount?: number;
  /** Model to fall back to if every attempt on `model` fails. */
  fallbackModel?: ModelId;
}

export interface WorkflowEdge {
  from: string;
  to: string;
  condition?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  createdAt: Date;
  status: "draft" | "ready" | "running" | "completed" | "failed";
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  currentStep: number;
  results: Record<string, ModelResponse>;
  startedAt: Date;
  completedAt?: Date;
}

export interface ModelResponse {
  model: ModelId;
  content: string;
  tokens: { prompt: number; completion: number };
  latency: number;
}

export interface ModelCapabilities {
  id: ModelId;
  maxContextTokens: number;
  supportsVision: boolean;
  supportsAudio: boolean;
  supportsTools: boolean;
  costPerMillionTokens: number;
}
