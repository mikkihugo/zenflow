/**
 * @fileoverview Anthropic Claude Provider for Claude Code Zen
 * 
 * Provides authenticated access to Anthropic's Claude API
 * with OpenAI-compatible interfaces.
 */

export { ClaudeProvider } from './claude-provider.js';
export { ClaudeAuth } from './claude-auth.js';
export { ClaudeMcpClient } from './mcp-client.js';
export { registerClaudeHandlers } from './claude-events.js';

export type {
  ClaudeConfig,
  ClaudeMessage,
  ClaudeCompletionRequest,
  ClaudeCompletionResponse
} from './claude-provider.js';

export type { McpServerConfig } from './mcp-client.js';
export type { ClaudeRequest, ClaudeResponse, ClaudeStreamChunk } from './claude-events.js';

/**
 * Convenience function to create a configured Claude client
 */
export async function createClaudeClient(apiKey: string, baseURL?: string) {
  const { ClaudeProvider } = await import('./claude-provider.js');
  const provider = new ClaudeProvider({ apiKey, ...(baseURL ? { baseURL } : {}) });
  await provider.initialize();
  
  // Test the connection
  const test = await provider.testConnection();
  if (!test.success) {
    throw new Error(`Failed to initialize Claude client: ${test.error}`);
  }
  
  return provider;
}