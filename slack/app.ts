/**
 * Slack slash command handlers for QwenFlow.
 *
 * Registers the `/qwenflow` command with three subcommands:
 *   /qwenflow run <name|id>    — Run a workflow, post result
 *   /qwenflow status <name|id> — Check workflow progress
 *   /qwenflow models           — List available models
 */
import { App } from "@slack/bolt";
import { getAllWorkflows, getWorkflow } from "../src/store.js";
import { Orchestrator } from "../src/orchestrator.js";
import { QWEN_MODELS } from "../src/types.js";

export function registerSlackCommands(slackApp: App): void {
  slackApp.command("/qwenflow", async ({ command, ack, respond }) => {
    await ack();
    const text = (command.text || "").trim();
    const parts = text.split(/\s+/);
    const sub = parts[0] || "help";
    const arg = parts.slice(1).join(" ");

    switch (sub) {
      case "run": {
        if (!arg) {
          await respond("⚠️ Usage: `/qwenflow run <workflow-id>`");
          return;
        }
        const wf = getWorkflow(arg);
        if (!wf) {
          await respond(`❌ Workflow \`${arg}\` not found. Use \`/qwenflow status\` to list.`);
          return;
        }
        await respond(`🚀 Starting workflow *${wf.name}* (\`${wf.id}\`)…`);
        try {
          const orch = new Orchestrator(wf);
          const result = await orch.run();
          const tokens = result.totalTokens ?? 0;
          const ms = result.latencyMs ?? 0;
          await respond(
            `✅ *${wf.name}* complete\n` +
            `📝 Steps: ${result.stepsCompleted ?? "?"}/${wf.steps.length}\n` +
            `🔥 Tokens: ${tokens} | ⏱ ${ms}ms\n` +
            `_Last output: ${(result.output || "").slice(0, 300)}_`
          );
        } catch (err: any) {
          await respond(`❌ Workflow failed: ${err.message || err}`);
        }
        break;
      }

      case "status": {
        if (arg) {
          const wf = getWorkflow(arg);
          if (!wf) {
            await respond(`❌ Workflow \`${arg}\` not found.`);
            return;
          }
          await respond(
            `📊 *${wf.name}* (\`${wf.id}\`)\n` +
            `Steps: ${wf.steps.length} | Status: pending`
          );
          return;
        }
        // List all workflows
        const all = getAllWorkflows();
        if (all.size === 0) {
          await respond("📭 No workflows registered yet.");
          return;
        }
        const lines: string[] = [`📋 *${all.size} workflow(s):*`];
        for (const [id, wf] of all) {
          lines.push(`• \`${id}\` — ${wf.name} (${wf.steps.length} steps)`);
        }
        await respond(lines.join("\n"));
        break;
      }

      case "models": {
        const modelLines = QWEN_MODELS.map(
          (m) => `• \`${m.id}\` — ${m.name}`
        );
        await respond(`🤖 *${QWEN_MODELS.length} models available:*\n${modelLines.join("\n")}`);
        break;
      }

      default: {
        await respond(
          "ℹ️ *QwenFlow Slack Commands:*\n" +
          "• `/qwenflow run <id>` — Run a workflow\n" +
          "• `/qwenflow status [id]` — List / check workflows\n" +
          "• `/qwenflow models` — Show available models"
        );
        break;
      }
    }
  });
}
