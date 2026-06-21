import { Workflow, WorkflowRun, WorkflowStep, ModelResponse } from "./types";
import { callModel } from "./models";

export class Orchestrator {
  private workflow: Workflow;
  private run: WorkflowRun;

  constructor(workflow: Workflow) {
    this.workflow = workflow;
    this.run = {
      id: `run-${Date.now()}`,
      workflowId: workflow.id,
      status: "pending",
      currentStep: 0,
      results: {},
      startedAt: new Date(),
    };
  }

  async run(): Promise<WorkflowRun> {
    this.run.status = "running";
    try {
      for (let i = 0; i < this.workflow.steps.length; i++) {
        this.run.currentStep = i;
        const step = this.workflow.steps[i];
        const previousResult = i > 0 ? this.run.results[this.workflow.steps[i - 1].id]?.content : undefined;
        const inputPrompt = previousResult ? `${step.prompt}\n\nContext from previous step:\n${previousResult}` : step.prompt;
        const response = await this.executeStep(step, inputPrompt);
        this.run.results[step.id] = response;
      }
      this.run.status = "completed";
      this.run.completedAt = new Date();
    } catch (error) {
      this.run.status = "failed";
    }
    return this.run;
  }

  private async executeStep(step: WorkflowStep, prompt: string): Promise<ModelResponse> {
    return callModel(step.model, prompt, {
      temperature: step.temperature,
      maxTokens: step.maxTokens,
    });
  }

  getProgress(): { step: number; total: number; percent: number } {
    return {
      step: this.run.currentStep,
      total: this.workflow.steps.length,
      percent: Math.round((this.run.currentStep / this.workflow.steps.length) * 100),
    };
  }

  getRun(): WorkflowRun {
    return { ...this.run };
  }
}
