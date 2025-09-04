/**
 * @fileoverview LLM Providers - Central Orchestration Layer
 * 
 * This package provides a unified interface for all AI LLM providers
 * including Claude, Gemini, GitHub Copilot, and GitHub Models.
 */

// Main provider orchestrator
// Convenience factory functions
import { LlmProvider, LLMProviderConfig, LLMProviderType } from './llm-provider.js';

export { LlmProvider, LLMProviderType } from './llm-provider.js';
export type { 
  LLMProviderConfig, 
  ChatMessage, 
  ChatCompletionRequest, 
  ChatCompletionResponse 
} from './llm-provider.js';

// Registry components  
export { GithubModelsSetup } from './registry/github-models-setup.js';
export { ModelRegistry } from './registry/model-registry.js';

export function createLLMProvider(config: LLMProviderConfig): LlmProvider {
  return new LlmProvider(config);
}

// Provider-specific convenience factories
export function createGitHubCopilotProvider(token: string): LlmProvider {
  return new LlmProvider({
    type: LLMProviderType.GITHUB_COPILOT,
    token
  });
}

export function createGitHubModelsProvider(token: string): LlmProvider {
  return new LlmProvider({
    type: LLMProviderType.GITHUB_MODELS,
    token
  });
}

export function createClaudeProvider(apiKey: string, endpoint?: string): LlmProvider {
  return new LlmProvider({
    type: LLMProviderType.CLAUDE,
    apiKey,
    endpoint
  });
}

export function createGeminiProvider(apiKey: string): LlmProvider {
  return new LlmProvider({
    type: LLMProviderType.GEMINI,
    apiKey
  });
}
