import { describe, it, expect, beforeEach } from "vitest";
import {
  getAllWorkflows,
  getWorkflow,
  setWorkflow,
  deleteWorkflow,
} from "../src/store.js";
import type { Workflow } from "../src/types.js";

/**
 * The store is a module-level singleton Map, so its state persists across
 * tests within this file. Clear it before every case so that "initially
 * empty" assertions hold regardless of execution order.
 */
beforeEach(() => {
  getAllWorkflows().clear();
});

/** Build a minimal valid Workflow with a given id + name. */
function makeWorkflow(id: string, name: string): Workflow {
  return {
    id,
    name,
    description: `${name} workflow`,
    steps: [],
    edges: [],
    createdAt: new Date("2026-06-22T00:00:00Z"),
    status: "draft",
  };
}

describe("QwenFlow shared store", () => {
  it("getAllWorkflows returns empty Map initially", () => {
    expect(getAllWorkflows().size).toBe(0);
  });

  it("setWorkflow and getWorkflow roundtrip", () => {
    const wf = makeWorkflow("wf-1", "Roundtrip Workflow");
    setWorkflow("wf-1", wf);

    const got = getWorkflow("wf-1");
    expect(got).toBeDefined();
    expect(got?.name).toBe("Roundtrip Workflow");
  });

  it("deleteWorkflow removes entry", () => {
    setWorkflow("wf-2", makeWorkflow("wf-2", "Deleteable"));
    expect(getWorkflow("wf-2")).toBeDefined();

    const removed = deleteWorkflow("wf-2");
    expect(removed).toBe(true);
    expect(getWorkflow("wf-2")).toBeUndefined();
  });

  it("getAllWorkflows returns all entries", () => {
    setWorkflow("wf-a", makeWorkflow("wf-a", "Alpha"));
    setWorkflow("wf-b", makeWorkflow("wf-b", "Beta"));
    setWorkflow("wf-c", makeWorkflow("wf-c", "Gamma"));

    expect(getAllWorkflows().size).toBe(3);
  });
});
