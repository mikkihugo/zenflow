/**
 * @fileoverview LLM Providers - Enhanced Public API
 * 
 * ✅ TIER 1 COMPLIANT - Strategic facades and direct integrations only
 * 
 * Enhanced model registry system that:
 * - Preserves rich provider-specific metadata
 * - Uses infrastructure facade for database operations
 * - Provides intelligent model selection and comparison
 * - Maintains backward compatibility
 *
 * @package @claude-zen/llm-providers
 * @version 2.0.0
 * @access public
 *
 * @example Enhanced Usage
 * ```typescript`
 * // IN @claude-zen/intelligence facade:
 * import { LLMProvider, executeClaudeTask } from '@claude-zen/llm-providers';
 *
 * export async function getLLMProvider(type?: string) {
 *   // CLI tools for file operations + agentic development
 *   if (type === 'claude-cli') return new LLMProvider('claude-code');'
 *   if (type === 'copilot-cli') return new LLMProvider('github-copilot-cli');'
 *
 *   // Direct APIs for pure inference + conversational AI
 *   if (type === 'anthropic-api') return new LLMProvider('anthropic-direct');'
 *   if (type === 'copilot-api') return new LLMProvider('github-copilot-api');'
 *
 *   return new LLMProvider('claude-code'); // default'
 * }
 * ````
 */

// =============================================================================
// CORE LLM PROVIDER - Main provider abstraction
// =============================================================================
import {
  getGlobalLLM,
  LLMProvider,
  SWARM_AGENT_ROLES,
  setGlobalLLM,
} from './llm-provider';

export { LLMProvider, setGlobalLLM, getGlobalLLM, SWARM_AGENT_ROLES };
export type {
  CLIMessage,
  CLIRequest,
  CLIResponse,
  SwarmAgentRole,
} from './types/cli-providers';

// =============================================================================
// CLI INTEGRATIONS - File operations, agentic development
// =============================================================================

// Claude Code CLI (primary for file operations)
export {
  ClaudeTaskManager,
  cleanupGlobalInstances,
  executeClaudeTask,
  executeParallelClaudeTasks,
  executeSwarmCoordinationTask,
  filterMessagesForClaudeCode,
  getGlobalClaudeTaskManager,
  streamClaudeTask,
} from './claude/claude-sdk';
export type {
  CanUseTool,
  ClaudeAssistantMessage,
  ClaudeMessage,
  ClaudeResultMessage,
  ClaudeSDKOptions,
  ClaudeSystemMessage,
  ClaudeUserMessage,
  PermissionResult,
} from './claude/types';

// GitHub Copilot integrations (future - NO CLI, only APIs)
// export { GitHubCopilotChatAPI } from './api/github-copilot-chat';
// export { GitHubModelsAPI } from './api/github-models';           // ✅ Available now'
// export { VSCodeCopilotBridge } from './vscode/copilot-bridge';   // ✅ Promising'
// export type { GitHubCopilotOptions, GitHubModelsOptions } from './github/types';

// =============================================================================
// DIRECT API INTEGRATIONS - Pure inference, conversational AI
// =============================================================================

export type { GitHubCopilotOptions } from './api/github-copilot';
// GitHub Copilot Chat API (available now)
export {
  createGitHubCopilotProvider,
  executeGitHubCopilotTask,
  GitHubCopilotAPI,
  gitHubCopilotConfig,
} from './api/github-copilot';
export type { GitHubModelsOptions } from './api/github-models';
// GitHub Models API (available now)
export {
  createGitHubModelsProvider,
  executeGitHubModelsTask,
  GitHubModelsAPI,
} from './api/github-models';

// Future API integrations:
// export { AnthropicProvider } from './api/anthropic';
// export { OpenAIProvider } from './api/openai';
// export { GitHubCopilotChatProvider } from './api/github-copilot';
// export { GoogleAIProvider } from './api/google-ai';
// export { CohereProvider } from './api/cohere';

// =============================================================================
// PROVIDER REGISTRY - Factory and management
// =============================================================================

export type { GitHubModelsConfig } from './registry/github-models-setup';
// GitHub Models Setup with DI
export {
  GitHubModelsContainer,
  setupGitHubModels,
  setupGitHubModelsAdvanced,
  setupGitHubModelsDefault,
} from './registry/github-models-setup';
export type { ModelInfo, ModelRegistryConfig } from './registry/model-registry';
// Model Registry with DI support
export {
  createModelRegistryService,
  ModelRegistry,
  ModelRegistryFactory,
  ModelRegistryService,
} from './registry/model-registry';
export type {
  APIProvider,
  APIProviderCapabilities,
  APIProviderFactory,
  APIProviderRegistry,
} from './types/api-providers';
export type {
  CLIProvider,
  CLIProviderCapabilities,
  CLIProviderFactory,
  CLIProviderRegistry,
} from './types/cli-providers';

// =============================================================================
// CONVENIENCE FACTORIES - For intelligence facade use
// =============================================================================

// API Provider Factory
export {
  createAPIProvider,
  listAPIProviders,
} from './factories/api-provider-factory';

/**
 * Create a CLI provider instance (INTERNAL USE ONLY)
 * Supports CLI tools only (file ops, agentic development)
 */
export function createLLMProvider(
  providerId: 'claude-code' | 'cursor-cli' | 'gemini-cli' = 'claude-code''
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
  type: 'cli' | 'api;
  category: 'file-operations' | 'agentic-dev' | 'inference' | 'conversational;
  available: boolean;
}> {
  const cliProviders = [
    {
      id: 'claude-code',
      name: 'Claude Code CLI',
      type: 'cli' as const,
      category: 'file-operations' as const,
      available: true,
    },
    {
      id: 'cursor-cli',
      name: 'Cursor CLI',
      type: 'cli' as const,
      category: 'agentic-dev' as const,
      available: false,
    },
    {
      id: 'gemini-cli',
      name: 'Gemini CLI',
      type: 'cli' as const,
      category: 'agentic-dev' as const,
      available: false,
    },
  ];

  const apiProviders = [
    {
      id: 'github-models-api',
      name: 'GitHub Models API',
      type: 'api' as const,
      category: 'inference' as const,
      available: true,
    },
    {
      id: 'github-copilot-api',
      name: 'GitHub Copilot Chat API',
      type: 'api' as const,
      category: 'conversational' as const,
      available: true,
    },
    // Future API providers:
    // { id: 'anthropic-api', name: 'Anthropic API', type: 'api', category: 'inference', available: false },
    // { id: 'openai-api', name: 'OpenAI API', type: 'api', category: 'inference', available: false },
  ];

  return [...cliProviders, ...apiProviders];
}

/**
 * Get provider by capability (INTERNAL USE ONLY)
 */
export function getLLMProviderByCapability(
  capability: 
    | 'file-operations''
    | 'agentic-development''
    | 'code-completion''
    | 'chat''
    | 'inference''
): LLMProvider {
  switch (capability) {
    case 'file-operations':'
      return new LLMProvider('claude-code'); // Best for file ops'
    case 'agentic-development':'
      return new LLMProvider('github-copilot-api'); // Future: Real agentic development'
    case 'code-completion':'
      return new LLMProvider('github-copilot-api'); // Future: Best for autocomplete'
    case 'chat':'
      return new LLMProvider('github-copilot-api'); // Future: Conversational'
    case 'inference':'
    default:
      return new LLMProvider('github-copilot-api'); // Copilot should be default for inference'
  }
}

// =============================================================================
// ENHANCED EXPORTS - Rich Metadata & Infrastructure Integration
// =============================================================================

// ✅ TIER 1 COMPLIANT ENHANCED EXPORTS

export type * from './claude/types';
// Enhanced Registry (Rich metadata preservation)
export {
  createEnhancedModelRegistryService,
  EnhancedModelRegistry,
  type EnhancedModelRegistryEvents,
  enhancedModelRegistry,
} from './registry/enhanced-model-registry';
// Infrastructure-Aware Registry (✅ Uses @claude-zen/infrastructure)
export {
  createInfrastructureAwareModelRegistry,
  InfrastructureAwareModelRegistry,
  type InfrastructureAwareRegistryEvents,
} from './registry/infrastructure-aware-registry';

// Provider Database Registry (Manages provider-specific DBs)
export {
  ProviderDatabaseRegistry,
  type ProviderDatabaseRegistryEvents,
  providerDatabaseRegistry,
} from './registry/provider-database-registry';
export type * from './types/api-providers';
// =============================================================================
// TYPES - Re-export all LLM provider types
// =============================================================================
export type * from './types/cli-providers';
// Enhanced Types (Rich Metadata)
export type {
  BaseModelInfo,
  ModelComparison,
  ModelQuery,
  ModelRecommendation,
  ProviderDatabase,
  ProviderMetadata,
  RichModelInfo,
  TaskRequirements,
} from './types/enhanced-models';
// Future: export type * from './github/types';

/**
 * ✨ ENHANCED MODEL REGISTRY - The Better Way
 * 
 * Use this instead of the legacy for:
 * - Rich provider-specific metadata access
 * - Infrastructure database integration  
 * - Intelligent model recommendations
 * - Advanced querying capabilities
 * 
 * @example
 * ```typescript`
 * import { createInfrastructureAwareModelRegistry } from '@claude-zen/llm-providers';
 * 
 * const registry = await createInfrastructureAwareModelRegistry();
 * 
 * // Rich metadata access
 * const richModel = registry.getRichModel('github-copilot:gpt-4');'
 * const copilotFeatures = richModel?.providerMetadata;
 * 
 * // Intelligent recommendations
 * const recommendation = await registry.recommendModel({
 *   task: 'coding',
 *   needsToolCalls: true,
 *   priority: 'quality',
 * });
 * ````
 */
// Future: export type * from './api/types';
