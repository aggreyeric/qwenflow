import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../src/index";

describe("QwenFlow API", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.version).toBe("0.1.0");
  });

  it("POST /api/workflows creates a workflow", async () => {
    const res = await request(app).post("/api/workflows").send({
      name: "Test Flow",
      steps: [{ id: "s1", model: "qwen3-4b", prompt: "Hello" }],
    });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Flow");
    expect(res.body.steps).toHaveLength(1);
    expect(res.body.id).toMatch(/^wf-/);
  });

  it("POST /api/workflows rejects missing name", async () => {
    const res = await request(app).post("/api/workflows").send({
      steps: [{ model: "qwen3-4b", prompt: "Hello" }],
    });
    expect(res.status).toBe(400);
  });

  it("GET /api/models lists all Qwen models", async () => {
    const res = await request(app).get("/api/models");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(5);
    expect(res.body[0].id).toBeDefined();
  });

  it("POST /api/workflows/:id/run executes a workflow", async () => {
    const created = await request(app).post("/api/workflows").send({
      name: "Run Test",
      steps: [
        { id: "s1", model: "qwen3-4b", prompt: "Analyze this" },
        { id: "s2", model: "qwen3-8b", prompt: "Summarize" },
      ],
    });
    const res = await request(app).post(`/api/workflows/${created.body.id}/run`);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("completed");
    expect(res.body.results.s1).toBeDefined();
    expect(res.body.results.s2).toBeDefined();
  });
});
