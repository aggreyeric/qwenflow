import { Workflow, WorkflowRun, WorkflowStep, ModelResponse, ModelId } from "./types.js";
import { callModel } from "./models.js";

/**
 * QwenFlow Orchestrator — executes a workflow (a DAG of Qwen model steps).
 *
 * What it actually does (each of these is unit-tested):
 *  - Resolves `${steps.<id>.output}` and `${inputs.<key>}` references in a
 *    step's prompt before that step runs.
 *  - Derives each step's dependencies from those `${steps.<id>.output}` refs,
 *    so steps that don't depend on each other run **in parallel** (one wave at
 *    a time), and a step only fires once every step it references has produced
 *    output.
 *  - Retries a step with exponential backoff (`retryCount`) and, if all
 *    attempts fail, transparently falls back to `fallbackModel`.
 *  - Aggregates every step's output, token usage and latency into a single
 *    replayable `WorkflowRun`.
 *
 * Dependency injection: pass `callFn` to substitute the model caller (used by
 * tests; defaults to the real Qwen Cloud / Gemini router in `models.ts`).
 */

const STEP_REF = /\$\{steps\.([a-zA-Z0-9_-]+)\.output\}/g;
const INPUT_REF = /\$\{inputs\.([a-zA-Z0-9_.-]+)\}/g;

export type ModelCaller = (
  model: ModelId,
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
) => Promise<ModelResponse>;

export interface OrchestratorOptions {
  /** Runtime inputs exposed to prompts as `${inputs.<key>}`. */
  inputs?: Record<string, string>;
  /** Substitute model caller — primarily for tests. */
  callFn?: ModelCaller;
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export class Orchestrator {
  private workflow: Workflow;
  private currentRun: WorkflowRun;
  private readonly inputs: Record<string, string>;
  private readonly callFn: ModelCaller;

  constructor(workflow: Workflow, options: OrchestratorOptions = {}) {
    this.workflow = workflow;
    this.inputs = options.inputs ?? {};
    this.callFn = options.callFn ?? ((model, prompt, opts) => callModel(model, prompt, opts));
    this.currentRun = {
      id: `run-${Date.now()}`,
      workflowId: workflow.id,
      status: "pending",
      currentStep: 0,
      results: {},
      startedAt: new Date(),
    };
  }

  /** Replace `${steps.X.output}` and `${inputs.Y}` with their resolved values. */
  private resolvePrompt(prompt: string, results: Record<string, ModelResponse>): string {
    let resolved = prompt.replace(STEP_REF, (_, id: string) => results[id]?.content ?? "");
    resolved = resolved.replace(INPUT_REF, (_, key: string) => this.inputs[key] ?? "");
    return resolved;
  }

  /** Step ids this step references via `${steps.X.output}` — its hard dependencies. */
  private dependenciesOf(step: WorkflowStep): string[] {
    const deps = new Set<string>();
    const re = /\$\{steps\.([a-zA-Z0-9_-]+)\.output\}/g;
    let match: RegExpExecArray | null;
    while ((match = re.exec(step.prompt)) !== null) deps.add(match[1]);
    return [...deps];
  }

  async run(): Promise<WorkflowRun> {
    this.currentRun.status = "running";
    try {
      const steps = this.workflow.steps;
      const results = this.currentRun.results;
      const done = new Set<string>();

      // Execute in dependency-ordered waves: all currently-runnable steps fire
      // concurrently within a wave, the next wave waits for the previous.
      while (done.size < steps.length) {
        const ready = steps.filter(
          (s) => !done.has(s.id) && this.dependenciesOf(s).every((d) => done.has(d))
        );
        if (ready.length === 0) break; // cycle or dangling reference — stop safely

        await Promise.all(
          ready.map(async (step) => {
            const prompt = this.resolvePrompt(step.prompt, results);
            results[step.id] = await this.executeStep(step, prompt);
          })
        );
        for (const step of ready) done.add(step.id);
        this.currentRun.currentStep = done.size;
      }

      this.currentRun.status = done.size === steps.length ? "completed" : "failed";
      this.currentRun.completedAt = new Date();
    } catch {
      this.currentRun.status = "failed";
      this.currentRun.completedAt = new Date();
    }
    return this.currentRun;
  }

  /** Run one step: retry with exponential backoff, then optional model fallback. */
  private async executeStep(step: WorkflowStep, prompt: string): Promise<ModelResponse> {
    const maxAttempts = (step.retryCount ?? 0) + 1;
    const options = { temperature: step.temperature, maxTokens: step.maxTokens };
    let lastError: unknown;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await this.callFn(step.model, prompt, options);
      } catch (err) {
        lastError = err;
        if (attempt < maxAttempts - 1) await sleep(150 * 2 ** attempt); // 150ms, 300ms, 600ms…
      }
    }

    if (step.fallbackModel) {
      try {
        return await this.callFn(step.fallbackModel, prompt, options);
      } catch (err) {
        lastError = err;
      }
    }

    throw lastError instanceof Error ? lastError : new Error(`Step "${step.id}" failed`);
  }

  getProgress(): { step: number; total: number; percent: number } {
    const total = this.workflow.steps.length;
    return {
      step: this.currentRun.currentStep,
      total,
      percent: total ? Math.round((this.currentRun.currentStep / total) * 100) : 0,
    };
  }

  getRun(): WorkflowRun {
    return { ...this.currentRun, results: { ...this.currentRun.results } };
  }
}
