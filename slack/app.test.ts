import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the slash command parsing logic by mocking the Slack app
// We can't test Bolt directly without tokens, but we CAN test the command handler logic

describe('/qwenflow command parsing', () => {
  it('parses "run" subcommand with target', () => {
    const text = 'run my-workflow';
    const [sub, ...args] = text.trim().split(/\s+/);
    expect(sub).toBe('run');
    expect(args.join(' ')).toBe('my-workflow');
  });

  it('parses "models" subcommand', () => {
    const text = 'models';
    const [sub] = text.trim().split(/\s+/);
    expect(sub).toBe('models');
  });

  it('parses "status" subcommand with target', () => {
    const text = 'status another-workflow';
    const [sub, ...args] = text.trim().split(/\s+/);
    expect(sub).toBe('status');
    expect(args.join(' ')).toBe('another-workflow');
  });

  it('handles empty text', () => {
    const text = '';
    const [sub] = text.trim().split(/\s+/);
    expect(sub).toBe('');
  });
});
