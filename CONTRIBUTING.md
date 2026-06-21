# Contributing to QwenFlow 🌊

Thanks for your interest in making QwenFlow better! This project is built in the
open and contributions of all kinds — bug reports, feature ideas, docs, and code —
are welcome.

This document explains how to get a local copy running, how to verify your
changes, and how to submit them.

---

## Welcome

Whether you're fixing a typo in the README or wiring up a new Qwen model in the
Model Router, we're glad you're here. A few things to keep in mind:

- **Be kind.** QwenFlow is a small project maintained on limited time. Assume good
  intent, and be patient with reviews.
- **Small is beautiful.** Focused, well-scoped PRs land faster than mega-PRs.
- **Show your work.** If a change affects behavior, include a test or a clear
  example so reviewers can see what changed and why.

---

## Project setup

Full setup details live in the [README](./README.md) — this is the short version.

**Prerequisites:** Node.js 18+ and a [Qwen Cloud / DashScope API key](https://dashscope.console.aliyun.com/).

```bash
# 1. Fork & clone the repo, then install dependencies
git clone https://github.com/<your-username>/qwenflow.git
cd qwenflow
npm install

# 2. Provide your Qwen Cloud key (only needed for live API runs)
export DASHSCOPE_API_KEY=sk-your-key-here

# 3. Start the dev server (hot reload via tsx watch)
npm run dev
#    → http://localhost:3000
```

> You do **not** need a real API key to run the test suite — the tests use mocked
> Qwen Cloud responses. Only the live dev server and integration runs need
> `DASHSCOPE_API_KEY`.

---

## Running the tests

Tests are written with [Vitest](https://vitest.dev/). Before you open a PR,
please make sure these all pass:

```bash
# Run the full test suite once
npm test

# Watch mode while you iterate
npm run test:watch

# Type-check without emitting files
npm run typecheck
```

The CI pipeline (see [`.github/workflows/ci.yml`](./.github/workflows/ci.yml))
runs `npm test` followed by `npm run build` across **Node 18 and 20**, so running
those locally first saves you a round-trip. CI does **not** run `typecheck`
separately — but the `build` step will fail on type errors anyway, so don't
skip `npm run typecheck` locally while iterating.

### When you add new code

- **New feature → add a test.** If you add a step type, a retry policy, or a
  router branch, cover it in `tests/`.
- **Bug fix → add a regression test.** Demonstrate the bug first, then the fix.
- **Keep types tight.** QwenFlow is TypeScript-first with Zod schemas; prefer a
  schema over `any`.

---

## Coding conventions

- **TypeScript everywhere.** `strict` mode is on (see `tsconfig.json`) — don't
  weaken it to make a red squiggle go away. `noUnusedLocals`,
  `noUnusedParameters`, `noImplicitReturns`, and
  `noFallthroughCasesInSwitch` are also enabled, so unused imports and implicit
  `return` paths will fail the build.
- **ESM.** The project is `"type": "module"` with `module: "ESNext"` and
  `moduleResolution: "bundler"`. Use `import`/`export` syntax only — no
  `require()`, no `module.exports`.
- **Always include the `.js` extension in local imports.** Because the project
  is ESM + `isolatedModules`, TypeScript needs the resolved path to a real
  module. Source files are written in `.ts` but imported as `.js`:

  ```ts
  // ✅ correct — .js extension, even though the file is .ts
  import { ModelId } from "./types.js";
  import { callModel } from "../models.js";

  // ❌ wrong — will fail typecheck / runtime resolution under ESM
  import { ModelId } from "./types";
  import { callModel } from "../models";
  ```

  The compiled output in `dist/` is `.js`, so this keeps source and build
  paths aligned.
- **Type-only imports.** Use `import type { … }` for types that don't exist at
  runtime (e.g. `import type { ModelId } from "./types.js"`). The repo has
  `verbatimModuleSyntax: false`, so it's not strictly enforced, but mixing
  runtime and type-only imports into a single statement is discouraged.
- **Dependency discipline.** Add new runtime deps only when justified. Anything
  Qwen-Cloud-specific or Qwen-model-specific belongs in the Model Router; keep
  the orchestrator model-agnostic.
- **No secrets.** Never commit API keys, tokens, or `.env` files. See
  [SECURITY.md](./SECURITY.md).

---

## Extending QwenFlow

Three small integrations come up again and again: adding a new LLM provider,
registering a new model, and exposing a new API route. Each is mechanical once
you know the layout, so they're documented end-to-end below.

### Adding a new LLM provider (Gemini as the worked example)

QwenFlow is intentionally orchestrator-first: the orchestrator in
`src/orchestrator.ts` calls `callModel()` from `src/models.ts` and never talks
to a vendor SDK directly. To add a provider, you add a thin client module and
teach `callModel()` how to dispatch to it. Gemini is the canonical example —
the integration lives in [`src/gemini.ts`](./src/gemini.ts).

**Step 1 — Add the vendor SDK as a dependency**

```bash
npm install @google/generative-ai
```

**Step 2 — Write a provider client (`src/gemini.ts`)**

The module exports three things the rest of the project expects:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. The list of model IDs this provider exposes
export const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
];

// 2. A `call<Provider>(model, prompt, options?)` function.
//    Always fall back to a mock when the API key is missing — tests rely on this.
export async function callGemini(model, prompt, options?) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      content: `[Mock Gemini ${model}] Processed: ${prompt.slice(0, 100)}...`,
      model,
      tokens: /* … */,
    };
  }
  // … real SDK call, wrapped in try/catch, returning { content, model, tokens }
}

// 3. A `list<Provider>Models()` helper used by the models route.
export function listGeminiModels() {
  return GEMINI_MODELS.map(id => ({ id, provider: "Google", context: "128K" }));
}
```

The conventions that matter:

- **Mock fallback when no API key is set.** CI has no `GEMINI_API_KEY`, so tests
  must work without one. Pattern: read `process.env.<PROVIDER>_API_KEY`; if
  empty, return a deterministic mock.
- **Throw, don't crash, on API errors.** Wrap the real call in `try/catch` and
  re-throw a typed `Error` with the provider name in the message.
- **Export a model-ID constant** (`GEMINI_MODELS`) so it can be reused by the
  registry and tests.

**Step 3 — Register model IDs in the type system (`src/types.ts`)**

`ModelId` is a string-literal union — it's the single source of truth for what
models exist:

```ts
export type ModelId =
  | "qwen3-4b" | "qwen3-8b" | "qwen3-32b"
  | "qwen-vl" | "qwen-audio"
  | "gemini-1.5-flash" | "gemini-1.5-pro" | "gemini-2.0-flash";
```

Add your new IDs to this union, and also to the parallel `QWEN_MODELS` array
further down in `types.ts` (used by the CLI and the models route for display
metadata: `name`, `description`, `capabilities`).

**Step 4 — Wire the provider into the router (`src/models.ts`)**

`callModel()` dispatches on a naming convention — anything starting with
`gemini-` goes to `callGemini`, everything else to the Qwen Cloud client:

```ts
import { callGemini } from "./gemini.js";

export async function callModel(model: ModelId, prompt, options?) {
  if (model.startsWith("gemini-")) {
    const result = await callGemini(model, prompt, options);
    return { model, content: result.content, tokens: { … }, latency: 0 };
  }
  // default: Qwen Cloud / DashScope
  return qwenClient.chat(model, prompt, options);
}
```

If your provider can't be sniffed from a model-ID prefix, add an explicit
provider field to `ModelCapabilities` and dispatch on that instead.

**Step 5 — Add capability entries to the registry**

See [Adding a new model to the registry](#adding-a-new-model-to-the-registry)
below — each new provider model needs an entry in `MODEL_REGISTRY`.

**Step 6 — Tests**

Mirror `tests/gemini.test.ts`:

- `vi.mock("<vendor-sdk>", …)` to stub the SDK.
- Assert `GEMINI_MODELS` membership / length.
- Assert mock-mode behaviour when the API key is unset.
- Assert the real path returns the expected shape.

### Adding a new model to the registry

A "model" here means a model that's already reachable through an existing
provider (e.g. exposing `qwen3-110b` through the existing Qwen Cloud client).
Two files change:

**1. `src/types.ts` — declare the ID**

```ts
export type ModelId = /* …existing… */ | "qwen3-110b";

export const QWEN_MODELS = [
  // …existing entries…
  { id: "qwen3-110b", name: "Qwen 3 110B", description: "Frontier model", capabilities: ["text"] },
];
```

**2. `src/models.ts` — add a capability entry**

```ts
const MODEL_REGISTRY: Record<ModelId, ModelCapabilities> = {
  // …existing entries…
  "qwen3-110b": {
    id: "qwen3-110b",
    maxContextTokens: 131072,
    supportsVision: false,
    supportsAudio: false,
    supportsTools: true,
    costPerMillionTokens: 0,
  },
};
```

**3. `src/qwencloud.ts` — add a DashScope name mapping**

If the upstream model name differs from the QwenFlow ID (e.g. `qwen-vl` →
`qwen-vl-max`), extend the `resolveModelName()` mapping table:

```ts
const mapping: Record<ModelId, string> = {
  // …
  "qwen3-110b": "qwen3-110b",
};
```

**4. Test it**

`tests/types.test.ts` asserts the `ModelId` union is in sync with
`QWEN_MODELS`. If you add an ID to one but not the other, that test fails —
keep them aligned.

### Adding a new API route

API routes are Express routers under `src/routes/`, mounted in
`src/index.ts`. There are two existing examples to copy from:
[`routes/models.ts`](./src/routes/models.ts) and
[`routes/workflows.ts`](./src/routes/workflows.ts).

**Step 1 — Create the router (`src/routes/<resource>.ts`)**

```ts
import { Router, Request, Response } from "express";
import { Workflow /* etc. */ } from "../types.js";  // note the .js extension

export const thingRouter = Router();

thingRouter.get("/", (_req: Request, res: Response) => {
  res.json(/* list of things */);
});

thingRouter.post("/", (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: "name required" });
    return;                          // return, don't next() — Express 4 typing
  }
  // …create + 201 Created
});
```

Conventions:

- Export a named `<resource>Router` from the module.
- Validate inputs and return `400` with a `{ error: string }` body.
- Return `404` with the same shape for missing resources.
- Type `req`/`res` as `express.Request` / `express.Response`.

**Step 2 — Mount it in `src/index.ts`**

```ts
import { thingRouter } from "./routes/thing.js";

app.use("/api/things", thingRouter);
```

Routes are mounted under `/api/<resource>`. The `/health` endpoint at the root
is intentionally outside `/api`.

**Step 3 — Test it (`tests/routes.test.ts` or a new `tests/<resource>.test.ts`)**

Use `supertest` against the exported `app`. The pattern from the existing
suite:

```ts
import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/index.js";

describe("GET /api/things", () => {
  it("returns 200 and an array", async () => {
    const res = await request(app).get("/api/things");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

The `app` is only started inside `index.ts` when `NODE_ENV !== "test"`, so
importing it in a test will **not** spawn a listening server — perfect for
`supertest`.

---



1. **Open an issue first for big changes.** New step types, model integrations, or
   anything that changes the public workflow JSON schema — file an issue so we can
   align on the design before you write 500 lines.
2. **Branch from `main`.** Use a descriptive branch name, e.g.
   `feat/qwen-vl-audio-step` or `fix/retry-backoff-jitter`.
3. **Write a clear PR description.** What changed, why, and how to test it. Link
   any related issue (`Closes #123`). Fill out the sections in the
   [PR template](./.github/PULL_REQUEST_TEMPLATE.md) — **Description**, **Type of
   Change** (bug fix / new feature / breaking change / docs), and **Testing**
   (confirm tests pass). The template is auto-loaded when you open a PR against
   this repo; if it isn't, copy it manually from `.github/PULL_REQUEST_TEMPLATE.md`.
4. **Make sure the checks are green.** `npm test`, `npm run typecheck`, and
   `npm run build` should all pass (CI runs `test` + `build`; typecheck is a
   fast local sanity check that `build` will catch anyway).
5. **Keep commits readable.** Squash noisy WIP commits before requesting review.

A maintainer will review as time allows. Reviews may ask for changes — that's
normal, not a rejection.

---

## Reporting bugs

Use [GitHub Issues](../../issues). Include:

- QwenFlow version (`git rev-parse --short HEAD` or the release tag)
- Node.js version and OS
- A minimal reproduction (a workflow JSON + the command you ran)
- Expected vs. actual behavior
- Relevant logs (redact any API keys first!)

---

## Code of conduct

Be respectful and constructive. Harassment, personal attacks, and
discrimination are not tolerated. If a contribution or comment crosses a line,
reach out to a maintainer privately.

---

## License

By contributing, you agree that your contributions will be licensed under the
**MIT License** that covers this project (see [LICENSE](./LICENSE)).

Thanks again for helping QwenFlow grow. 🌊
