/**
 * @fileoverview GitHub Models Provider - Complete Package Exports
 *
 * Provides enterprise-grade integration with GitHub's Models API
 * for accessing AI models through GitHub's official service.
 */

// Main Provider
export { GitHubModelsProvider } from './github-models-provider.js';
export type { GitHubModelsProviderOptions } from './github-models-provider.js';

// Event Handlers
export { registerGitHubModelsHandlers } from './github-models-events.js';

// Client
export { GitHubModelsClient } from './github-models-client.js';
export type { 
  ChatMessage,
  ChatCompletionRequest, 
  ChatCompletionResponse, 
  GitHubModel 
} from './github-models-client.js';

// Authentication
export { GitHubModelsAuth } from './github-models-auth.js';
export type { GitHubModelsAuthOptions } from './github-models-auth.js';

// Convenience factory function
import { GitHubModelsProvider } from './github-models-provider.js';
export function createGitHubModelsProvider(token?: string): GitHubModelsProvider {
  return new GitHubModelsProvider({ 
    token, 
    autoInitialize: !!token 
  });
}

// Re-export default provider
export { GitHubModelsProvider as default };