import { Router, Request, Response } from "express";
import { Orchestrator } from "../orchestrator.js";
import { Workflow, WorkflowStep } from "../types.js";

export const workflowRouter = Router();

const store: Map<string, Workflow> = new Map();

workflowRouter.post("/", (req: Request, res: Response) => {
  const { name, description, steps } = req.body;
  if (!name || !steps || !Array.isArray(steps) || steps.length === 0) {
    res.status(400).json({ error: "name and non-empty steps array required" });
    return;
  }
  const workflow: Workflow = {
    id: `wf-${Date.now()}`,
    name,
    description: description || "",
    steps: steps.map((s: Partial<WorkflowStep>, i: number) => ({
      id: s.id || `step-${i}`,
      model: s.model || "qwen3-4b",
      prompt: s.prompt || "",
      temperature: s.temperature ?? 0.7,
      maxTokens: s.maxTokens ?? 1024,
    })),
    edges: [],
    createdAt: new Date(),
    status: "ready",
  };
  store.set(workflow.id, workflow);
  res.status(201).json(workflow);
});

workflowRouter.get("/", (_req: Request, res: Response) => {
  res.json(Array.from(store.values()));
});

workflowRouter.post("/:id/run", async (req: Request, res: Response) => {
  const workflow = store.get(req.params.id);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }
  const orchestrator = new Orchestrator(workflow);
  const run = await orchestrator.run();
  res.json(run);
});

workflowRouter.get("/:id/status", (req: Request, res: Response) => {
  const workflow = store.get(req.params.id);
  if (!workflow) {
    res.status(404).json({ error: "Workflow not found" });
    return;
  }
  res.json({ id: workflow.id, status: workflow.status, stepCount: workflow.steps.length });
});
