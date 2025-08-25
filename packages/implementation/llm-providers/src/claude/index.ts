/**
 * @fileoverview Claude Code CLI Integration - Subpackage Exports
 *
 * Complete Claude Code CLI integration including SDK and provider implementation.
 */

// SDK Integration
import { ClaudeProvider } from './claude-provider';

export * from './claude-sdk';
export { executeClaudeTask, type ClaudeSDKOptions } from './claude-sdk';

// Provider Implementation
export { ClaudeProvider, CLAUDE_SWARM_AGENT_ROLES } from './claude-provider';

// Default provider instance
export function createClaudeProvider(): ClaudeProvider {
  return new ClaudeProvider();
}
