export type ModelId = "qwen3-4b" | "qwen3-8b" | "qwen3-32b" | "qwen-vl" | "qwen-audio" | "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash";

export interface WorkflowStep {
  id: string;
  model: ModelId;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
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
