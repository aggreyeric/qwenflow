// Slack slash command handlers for QwenFlow
// /qwenflow run <name|id> — run a workflow
// /qwenflow status <name|id> — check workflow progress
// /qwenflow models — list available models

import { getWorkflow, getAllWorkflows } from '../src/store.js';
import { QWEN_MODELS } from '../src/types.js';

export function registerSlackCommands(slackApp: any) {
  slackApp.command('/qwenflow', async ({ command, ack, respond }: any) => {
    await ack();
    const text = (command.text || '').trim();
    const [sub, ...args] = text.split(/\s+/);
    const target = args.join(' ');

    switch (sub) {
      case 'run': {
        if (!target) {
          await respond('Usage: `/qwenflow run <workflow-name>`');
          return;
        }
        const wf = findWorkflow(target);
        if (!wf) {
          await respond(`❌ Workflow "${target}" not found. Use \`/qwenflow models\` to see options.`);
          return;
        }
        await respond(`🚀 Starting workflow: *${wf.name}*\n_Status: Initializing..._`);
        // TODO: instantiate Orchestrator, await run(), respond with results
        // const orch = new Orchestrator(wf);
        // const result = await orch.run();
        // await respond(formatResult(result));
        break;
      }
      case 'status': {
        if (!target) {
          await respond('Usage: `/qwenflow status <workflow-name>`');
          return;
        }
        const wf = findWorkflow(target);
        if (!wf) {
          await respond(`❌ Workflow "${target}" not found.`);
          return;
        }
        await respond(`📊 *${wf.name}*\n_Status: Ready_ — use \`/qwenflow run ${wf.name}\` to start.`);
        break;
      }
      case 'models': {
        const lines = QWEN_MODELS.map((m: any) =>
          `• \`qwen/${m.id}\` — ${m.name} (${m.capabilities?.join(', ') || 'general'})`
        );
        await respond(`📋 *Available QwenFlow Models:*\n${lines.join('\n')}`);
        break;
      }
      case 'list': {
        const wfs = getAllWorkflows();
        const lines: string[] = [];
        wfs.forEach((wf: any, id: string) => {
          lines.push(`• ${id}: ${wf.name || 'Untitled'}`);
        });
        await respond(lines.length
          ? `📁 *Workflows:*\n${lines.join('\n')}`
          : 'No workflows registered yet.');
        break;
      }
      default:
        await respond(`🤖 *QwenFlow Slack Commands:*\n• \`/qwenflow run <name>\` — Run a workflow\n• \`/qwenflow status <name>\` — Check status\n• \`/qwenflow models\` — List models\n• \`/qwenflow list\` — List workflows`);
    }
  });
}

function findWorkflow(name: string): any {
  const all = getAllWorkflows();
  // Try exact match
  for (const [id, wf] of all) {
    if (id === name || (wf as any).name === name) return wf;
  }
  // Try partial match
  for (const [id, wf] of all) {
    if (id.includes(name) || name.includes(id)) return wf;
  }
  return null;
}
