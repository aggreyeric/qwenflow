/**
 * Entry point that starts QwenFlow HTTP server + optional Slack integration.
 *
 * Usage: node dist/slack-start.js
 * Or: npm run start:slack
 */
import { app } from "./index.js";
import { startSlack } from "./slack-start.js";

const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, async () => {
  console.log(`QwenFlow orchestrator running on http://localhost:${PORT}`);

  // Boot Slack integration (no-op if SLACK_BOT_TOKEN not set)
  await startSlack();
});
