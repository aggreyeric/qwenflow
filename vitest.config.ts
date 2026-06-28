import { defineConfig } from "vitest/config";
import path from "path";

// Force test mode before any test file is loaded.
// src/index.ts calls `app.listen(PORT)` unless NODE_ENV === "test"; if that
// side-effect runs inside the vitest worker it collides with any process that
// already holds PORT (e.g. a leftover `npm start` / `node dist/index.js`),
// which made the suite fail flakily with spurious 404s. Setting this here
// (main process, inherited by forked workers) makes `npm test` deterministic.
process.env.NODE_ENV = "test";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
