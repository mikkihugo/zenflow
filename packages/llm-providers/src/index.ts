/**
 * @fileoverview LLM Providers Package - PRIVATE Internal Package
 *
 * PRIVATE PACKAGE: Used internally by @claude-zen/intelligence facade only.
 * Provides unified interface for LLM providers: CLI tools AND direct APIs.
 *
 * PROVIDER TYPES:
 * - CLI Tools: Claude Code CLI, Cursor CLI, Gemini CLI (NO GitHub CLI - only command suggestions)
 * - Direct APIs: Anthropic, OpenAI, GitHub Copilot Chat, Google AI, Cohere
 *
 * ARCHITECTURE:
 * - Foundation: Core utilities and primitives 
 * - LLM Providers: All LLM integrations (this PRIVATE package)
 * - Intelligence Facade: PUBLIC API for LLM access
 *
 * @package @claude-zen/llm-providers (PRIVATE)
 * @version 1.0.0
 * @access private
 *
 * @example Usage (Intelligence Facade Only)
 * ```typescript
 * // IN @claude-zen/intelligence facade:
 * import { LLMProvider, executeClaudeTask } from '@claude-zen/llm-providers';
 *
 * export async function getLLMProvider(type?: string) {
 *   // CLI tools for file operations + agentic development
 *   if (type === 'claude-cli') return new LLMProvider('claude-code');
 *   if (type === 'copilot-cli') return new LLMProvider('github-copilot-cli');
 *   
 *   // Direct APIs for pure inference + conversational AI
 *   if (type === 'anthropic-api') return new LLMProvider('anthropic-direct');
 *   if (type === 'copilot-api') return new LLMProvider('github-copilot-api');
 *   
 *   return new LLMProvider('claude-code'); // default
 * }
 * ```
 */

// =============================================================================
// CORE LLM PROVIDER - Main provider abstraction
// =============================================================================
export {
  LLMProvider,
  setGlobalLLM,
  getGlobalLLM,
  SWARM_AGENT_ROLES,
} from './llm-provider';
export type { CLIMessage, CLIRequest, CLIResponse, SwarmAgentRole } from './types/cli-providers';

// =============================================================================
// CLI INTEGRATIONS - File operations, agentic development
// =============================================================================

// Claude Code CLI (primary for file operations)
export {
  executeClaudeTask,
  executeSwarmCoordinationTask,
  ClaudeTaskManager,
  getGlobalClaudeTaskManager,
  streamClaudeTask,
  executeParallelClaudeTasks,
  filterMessagesForClaudeCode,
  cleanupGlobalInstances,
} from './claude/claude-sdk';
export type {
  ClaudeSDKOptions,
  ClaudeMessage,
  ClaudeAssistantMessage,
  ClaudeUserMessage,
  ClaudeResultMessage,
  ClaudeSystemMessage,
  PermissionResult,
  CanUseTool,
} from './claude/types';

// GitHub Copilot integrations (future - NO CLI, only APIs)
// export { GitHubCopilotChatAPI } from './api/github-copilot-chat';
// export { GitHubModelsAPI } from './api/github-models';           // ✅ Available now
// export { VSCodeCopilotBridge } from './vscode/copilot-bridge';   // ✅ Promising
// export type { GitHubCopilotOptions, GitHubModelsOptions } from './github/types';

// =============================================================================
// DIRECT API INTEGRATIONS - Pure inference, conversational AI
// =============================================================================

// GitHub Models API (available now)
export {
  GitHubModelsAPI,
  createGitHubModelsProvider,
  executeGitHubModelsTask,
} from './api/github-models';
export type { GitHubModelsOptions } from './api/github-models';

// Future API integrations:
// export { AnthropicProvider } from './api/anthropic';
// export { OpenAIProvider } from './api/openai';
// export { GitHubCopilotChatProvider } from './api/github-copilot';
// export { GoogleAIProvider } from './api/google-ai';
// export { CohereProvider } from './api/cohere';

// =============================================================================
// PROVIDER REGISTRY - Factory and management  
// =============================================================================
// Note: Provider registry functions are defined in separate modules
// Future: Add provider registry exports when implemented

// Future GitHub Copilot factories:
// export { createGitHubCopilotCLI, createGitHubCopilotAPI } from './github';

export type {
  CLIProvider,
  CLIProviderRegistry,
  CLIProviderFactory,
  CLIProviderCapabilities,
} from './types/cli-providers';

// =============================================================================
// CONVENIENCE FACTORIES - For intelligence facade use
// =============================================================================

/**
 * Create an LLM provider instance (INTERNAL USE ONLY)
 * Supports CLI tools (file ops) and direct APIs (inference)
 */
export function createLLMProvider(
  providerId: 'claude-code' | 'cursor-cli' | 'gemini-cli' | 'github-models-api' | 'github-copilot-api' | 'anthropic-api' | 'openai-api' = 'claude-code'
): LLMProvider {
  return new LLMProvider(providerId);
}

/**
 * List all available LLM providers (INTERNAL USE ONLY)
 * Includes CLI tools and direct APIs
 */
export function listLLMProviders(): Array<{ 
  id: string; 
  name: string; 
  type: 'cli' | 'api'; 
  category: 'file-operations' | 'agentic-dev' | 'inference' | 'conversational';
  available: boolean;
}> {
  const cliProviders = [
    { id: 'claude-code', name: 'Claude Code CLI', type: 'cli' as const, category: 'file-operations' as const, available: true },
    { id: 'cursor-cli', name: 'Cursor CLI', type: 'cli' as const, category: 'agentic-dev' as const, available: false },
    { id: 'gemini-cli', name: 'Gemini CLI', type: 'cli' as const, category: 'agentic-dev' as const, available: false }
  ];
  
  // Future: Add direct API providers
  // const apiProviders = [
  //   { id: 'anthropic-api', name: 'Anthropic API', type: 'api', category: 'inference', available: false },
  //   { id: 'github-copilot-api', name: 'GitHub Copilot Chat API', type: 'api', category: 'conversational', available: false },
  // ];
  
  return cliProviders;
}

/**
 * Get provider by capability (INTERNAL USE ONLY)
 */
export function getLLMProviderByCapability(
  capability: 'file-operations' | 'agentic-development' | 'code-completion' | 'chat' | 'inference'
): LLMProvider {
  switch (capability) {
    case 'file-operations':
      return new LLMProvider('claude-code');           // Best for file ops
    case 'agentic-development': 
      return new LLMProvider('github-copilot-api');    // Future: Real agentic development
    case 'code-completion':
      return new LLMProvider('github-copilot-api');    // Future: Best for autocomplete
    case 'chat':
      return new LLMProvider('github-copilot-api');    // Future: Conversational
    case 'inference':
    default:
      return new LLMProvider('claude-code');           // Default
  }
}

// =============================================================================
// TYPES - Re-export all LLM provider types
// =============================================================================
export type * from './types/cli-providers';
export type * from './claude/types';
// Future: export type * from './github/types';
// Future: export type * from './api/types';