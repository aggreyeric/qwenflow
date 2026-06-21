import { Workflow } from "./types.js";

/**
 * Shared in-memory workflow store.
 *
 * Extracted from `routes/workflows.ts` so that BOTH the HTTP layer and the
 * upcoming Slack integration can read/write the same workflows without a
 * private module-local Map. This is a hackathon-grade store: it lives only
 * for the process lifetime and resets on restart (see SLACK_INTEGRATION_PLAN.md
 * "Risks / Notes" — flag Redis/SQLite for production).
 */
const store = new Map<string, Workflow>();

/** Return the underlying store (useful for iteration / listing). */
export function getAllWorkflows(): Map<string, Workflow> {
  return store;
}

/** Look up a single workflow by id. */
export function getWorkflow(id: string): Workflow | undefined {
  return store.get(id);
}

/** Insert or replace a workflow by id. */
export function setWorkflow(id: string, wf: Workflow): void {
  store.set(id, wf);
}

/** Remove a workflow by id. Returns true if a workflow was deleted. */
export function deleteWorkflow(id: string): boolean {
  return store.delete(id);
}
