/**
 * Slack integration module for QwenFlow.
 *
 * Uses @slack/bolt to expose a `/qwenflow` slash command that lets
 * Slack users run workflows, check status, and list models — all
 * from chat.
 *
 * Requires environment variables:
 *   SLACK_BOT_TOKEN      — xoxb-… token from Slack App
 *   SLACK_SIGNING_SECRET — used to verify HTTP requests
 *   SLACK_APP_TOKEN      — xapp-… for Socket Mode (optional)
 *
 * Install: npm install @slack/bolt
 */
import { App, ExpressReceiver } from "@slack/bolt";

let _app: App | null = null;

export function initSlack(): App {
  if (_app) return _app;

  const signingSecret = process.env.SLACK_SIGNING_SECRET || "";
  const botToken = process.env.SLACK_BOT_TOKEN || "";
  const appToken = process.env.SLACK_APP_TOKEN || "";

  const socketMode = !!appToken;

  _app = new App({
    token: botToken,
    signingSecret,
    socketMode,
    appToken: socketMode ? appToken : undefined,
  });

  return _app;
}

/** Return the Bolt App instance (null if not initialised). */
export function getSlackApp(): App | null {
  return _app;
}

/** ExpressReceiver can be mounted on the existing Express server. */
export function getSlackReceiver(): ExpressReceiver | undefined {
  if (!_app) return undefined;
  // Bolt internally creates a receiver; expose it if using HTTP mode.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_app as any).receiver as ExpressReceiver | undefined;
}
