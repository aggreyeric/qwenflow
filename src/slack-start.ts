/**
 * Entry point that starts QwenFlow HTTP server + optional Slack integration.
 *
 * Usage: node dist/slack-start.js
 * Or: npm run start:slack
 */
import { app } from "./index.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

async function main(): Promise<void> {
  app.listen(PORT, async () => {
    console.log(`QwenFlow orchestrator running on http://localhost:${PORT}`);

    // Boot Slack integration (no-op if SLACK_BOT_TOKEN not set)
    const token = process.env.SLACK_BOT_TOKEN;
    if (token) {
      try {
        const { initSlack } = await import("./slack.js");
        // Dynamic import avoids TS resolution issues with slack/ directory outside src/
        const slackMod = await import("../slack/app.js") as any;
        const registerSlackCommands = slackMod.registerSlackCommands;
        const slackApp = initSlack();
        if (slackApp && registerSlackCommands) {
          registerSlackCommands(slackApp);
          await slackApp.start();
          console.log("[slack] /qwenflow command registered via Socket Mode");
        }
      } catch (e) {
        console.warn("[slack] Could not initialise Slack:", (e as Error).message);
      }
    }
  });
}

main().catch(console.error);
