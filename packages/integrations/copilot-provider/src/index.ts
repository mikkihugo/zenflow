/**
 * @fileoverview GitHub Copilot Provider for Claude Code Zen
 * 
 * Provides authenticated access to GitHub Copilot's chat completion API
 * with proper token management and VS Code compatibility.
 */

export { CopilotTokenManager } from './copilot-token-manager.js';
export { CopilotChatClient } from './copilot-chat-client.js';
export { CopilotAuth } from './copilot-auth.js';
export { GitHubModelsClient } from './github-models-client.js';
export { registerCopilotHandlers } from './copilot-events.js';

// Alias for compatibility with LLM provider
export { CopilotChatClient as CopilotProvider } from './copilot-chat-client.js';

export type {
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse
} from './copilot-chat-client.js';

export type { CopilotToken } from './copilot-token-manager.js';
export type { ModelInfo } from './github-models-client.js';

/**
 * Convenience function to create a configured Copilot client
 */
export async function createCopilotClient(githubToken: string) {
  const { CopilotChatClient } = await import('./copilot-chat-client.js');
  const client = new CopilotChatClient(githubToken);
  
  // Test the connection
  const test = await client.testConnection();
  if (!test.success) {
    throw new Error(`Failed to initialize Copilot client: ${test.error}`);
  }
  
  return client;
}