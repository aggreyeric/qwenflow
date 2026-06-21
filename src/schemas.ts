import { z } from "zod";

export const ModelIdSchema = z.enum(["qwen3-4b", "qwen3-8b", "qwen3-32b", "qwen-vl", "qwen-audio"]);

export const WorkflowStepSchema = z.object({
  id: z.string().min(1),
  model: ModelIdSchema,
  prompt: z.string().min(1),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  maxTokens: z.number().min(1).max(32768).optional().default(4096),
  retryCount: z.number().min(0).max(5).optional().default(0),
  fallbackModel: ModelIdSchema.optional(),
});

export const CreateWorkflowSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().default(""),
  steps: z.array(WorkflowStepSchema).min(1).max(20),
});

export const RunWorkflowSchema = z.object({
  inputs: z.record(z.string()).optional().default({}),
});
