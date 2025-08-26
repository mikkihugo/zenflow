/**
 * @fileoverview Claude Code CLI Integration - Subpackage Exports
 *
 * Complete Claude Code CLI integration including SDK and provider implementation.
 */

// SDK Integration
import { ClaudeProvider } from './claude-provider';

// Provider Implementation
export { CLAUDE_SWARM_AGENT_ROLES, ClaudeProvider } from './claude-provider';
export * from './claude-sdk';
export { type ClaudeSDKOptions, executeClaudeTask } from './claude-sdk';

// Default provider instance
export function createClaudeProvider(): ClaudeProvider {
  return new ClaudeProvider();
}
