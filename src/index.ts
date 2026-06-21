import express from "express";
import cors from "cors";
import { workflowRouter } from "./routes/workflows.js";
import { modelRouter } from "./routes/models.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", version: "0.1.0", uptime: process.uptime() });
});

app.use("/api/workflows", workflowRouter);
app.use("/api/models", modelRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: err.message });
});

export { app };

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`QwenFlow orchestrator running on http://localhost:${PORT}`);
  });
}
