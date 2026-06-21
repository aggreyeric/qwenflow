import { Router, Request, Response } from "express";
import { listModels, getModelCapabilities, callModel } from "../models.js";
import { ModelId } from "../types.js";

export const modelRouter = Router();

modelRouter.get("/", (_req: Request, res: Response) => {
  res.json(listModels());
});

modelRouter.get("/:id/capabilities", (req: Request, res: Response) => {
  const capabilities = getModelCapabilities(req.params.id as ModelId);
  if (!capabilities) {
    res.status(404).json({ error: `Model ${req.params.id} not found` });
    return;
  }
  res.json(capabilities);
});

modelRouter.post("/chat", async (req: Request, res: Response) => {
  const { model, prompt } = req.body;
  if (!model || !prompt) {
    res.status(400).json({ error: "model and prompt required" });
    return;
  }
  const response = await callModel(model as ModelId, prompt);
  res.json(response);
});
