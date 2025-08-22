/**
 * @fileoverview LLM Provider Strategic Facade - AI Language Model Integration
 *
 * STRATEGIC FACADE PURPOSE:
 * This facade provides unified access to all LLM providers including CLI tools
 * and direct APIs while delegating to the @claude-zen/llm-providers package.
 *
 * DELEGATION ARCHITECTURE:
 * • @claude-zen/llm-providers: CLI tools (Claude Code, Cursor, Gemini) and Direct APIs
 * • Claude Code CLI: Primary for file operations and agentic development
 * • GitHub Models API: Real agentic development (not command suggestions)
 * • Future: Anthropic API, OpenAI API, GitHub Copilot Chat API
 *
 * PROVIDER CAPABILITIES:
 * - CLI Tools: File operations, codebase awareness, tool calling
 * - Direct APIs: Pure inference, conversational AI, structured output
 * - Agentic Development: Real development tasks, not just command suggestions
 *
 * @example Basic LLM Provider Usage
 * ```typescript
 * import { getLLMProvider, executeClaudeTask } from '@claude-zen/intelligence';
 *
 * // Get provider by capability
 * const fileProvider = getLLMProvider('file-operations');    // Claude Code CLI
 * const chatProvider = getLLMProvider('inference');          // GitHub Models API
 *
 * // Execute development task
 * const result = await executeClaudeTask('Create a React authentication system');
 * ```
 *
 * @example Advanced Provider Selection
 * ```typescript
 * import { createLLMProvider, listLLMProviders } from '@claude-zen/intelligence';
 *
 * // List all available providers
 * const providers = listLLMProviders();
 * console.log(providers); // CLI tools + Direct APIs
 *
 * // Create specific provider
 * const githubProvider = createLLMProvider('github-models-api');
 * const result = await githubProvider.execute({
 *   messages: [{ role: 'user', content: 'Design a microservices architecture' }]
 * });
 * ```
 *
 * GRACEFUL DEGRADATION:
 * When @claude-zen/llm-providers is not available, provides basic fallback
 * implementations that maintain interface contracts for compilation compatibility.
 */

import { TypedEventBase } from '@claude-zen/foundation';
import { hasService } from '@claude-zen/foundation';
import { getLogger } from '@claude-zen/foundation';
import './module-declarations.d.ts';

const logger = getLogger('Intelligence/LLMProviders');

// Types re-exported from @claude-zen/llm-providers
export interface CLIMessage {
  role: 'system | user' | 'assistant';
  content: string;
}

export interface CLIRequest {
  messages: CLIMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, unknown>;
}

export interface CLIResponse {
  success: boolean;
  content: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface SwarmAgentRole {
  role: string;
  systemPrompt: string;
  capabilities: string[];
}

export interface LLMProviderInfo {
  id: string;
  name: string;
  type: 'cli''' | '''api';
  category: 'file-operations''' | '''agentic-dev''' | '''inference''' | '''conversational';
  available: boolean;
}

/**
 * LLM Provider - Main abstraction for all language model integrations
 *
 * Delegates to @claude-zen/llm-providers package when available.
 * Provides fallback implementations for compilation compatibility.
 */
export class LLMProvider extends TypedEventBase {
  private realInstance: any = null;
  private providerId: string;

  constructor(providerId = 'claude-code') {
    super();
    this.providerId = providerId;
    this.initializeProvider();
  }

  private async initializeProvider(): Promise<void> {
    try {
      if (hasService('@claude-zen/llm-providers')) {
        const llmModule = await import('@claude-zen/llm-providers');
        this.realInstance = new llmModule.LLMProvider(this.providerId);
        logger.info(
          `✅ Successfully loaded real @claude-zen/llm-providers package with provider: ${this.providerId}`,
        );
      } else {
        logger.warn(
          '⚠️ Using fallback LLM provider implementation - @claude-zen/llm-providers not available',
        );
      }
    } catch (error) {
      logger.error('Failed to initialize LLM provider:', error);
    }
  }

  async execute(request: CLIRequest): Promise<CLIResponse> {
    if (this.realInstance) {
      return await this.realInstance.execute(request);
    }

    // No fallback - fail clearly when real providers not available
    throw new Error(
      `LLM Provider ${this.providerId} not available - @claude-zen/llm-providers package required`,
    );
  }

  setRole(role: string): void {
    if (this.realInstance?.setRole) {
      this.realInstance.setRole(role);
    } else {
      logger.debug(`Fallback: Setting role to ${role} (no-op)`);
    }
  }

  getRole(): SwarmAgentRole'' | ''undefined {
    if (this.realInstance?.getRole) {
      return this.realInstance.getRole();
    }
    return undefined;
  }
}

/**
 * Execute Claude Code CLI task
 *
 * Delegates to @claude-zen/llm-providers when available.
 * Primary interface for file operations and agentic development.
 */
export async function executeClaudeTask(
  prompt: string,
  options?: Record<string, unknown>,
): Promise<string> {
  try {
    const { executeClaudeTask: realExecuteClaudeTask } = await import('@claude-zen/llm-providers');
    return await realExecuteClaudeTask(prompt, options);
  } catch (error) {
    // No fallback - fail clearly when real providers not available
    throw new Error(
      `Claude task execution failed - @claude-zen/llm-providers package required: ${error}`,
    );
  }
}

/**
 * Get LLM provider by capability
 *
 * Delegates to @claude-zen/llm-providers for intelligent provider selection.
 */
export function getLLMProvider(
  capability:'' | '''file-operations''' | '''agentic-development''' | '''code-completion''' | '''chat''' | '''inference' = 'file-operations',
): LLMProvider {
  try {
    const { getLLMProviderByCapability } = require('@claude-zen/llm-providers');
    logger.info(`🔍 Requesting LLM provider for capability: ${capability}`);
    const provider = getLLMProviderByCapability(capability);
    logger.info(
      `✅ Selected LLM provider: ${provider.constructor.name} for capability: ${capability}`,
    );
    return provider;
  } catch (error) {
    // No fallback - fail clearly when real providers not available
    logger.error(
      `❌ LLM Provider with capability '${capability}' not available`,
    );
    throw new Error(
      `LLM Provider with capability '${capability}'not available - @claude-zen/llm-providers package required: ${error}`,
    );
  }
}

/**
 * Create LLM provider instance
 *
 * Supports both CLI tools (file operations) and direct APIs (inference).
 */
export function createLLMProvider(
  providerId:'' | '''claude-code''' | '''cursor-cli''' | '''gemini-cli''' | '''github-models-api''' | '''github-copilot-api''' | '''anthropic-api''' | '''openai-api' = 'claude-code',
): LLMProvider {
  try {
    const { createLLMProvider } = require('@claude-zen/llm-providers');
    logger.info(`🔍 Creating LLM provider: ${providerId}`);
    const provider = createLLMProvider(providerId);
    logger.info(
      `✅ Created LLM provider: ${provider.constructor.name} (ID: ${providerId})`,
    );
    return provider;
  } catch (error) {
    // No fallback - fail clearly when real providers not available
    logger.error(`❌ LLM Provider '${providerId}' not available`);
    throw new Error(
      `LLM Provider '${providerId}' not available - @claude-zen/llm-providers package required: ${error}`,
    );
  }
}

/**
 * List all available LLM providers
 *
 * Includes CLI tools (file operations) and direct APIs (inference).
 */
export function listLLMProviders(): LLMProviderInfo[] {
  try {
    const { listLLMProviders } = require('@claude-zen/llm-providers');
    const providers = listLLMProviders();
    logger.info(`📋 Available LLM providers (${providers.length}):`);
    providers.forEach((provider: any) => {
      logger.info(
        `  - ${provider.name} (${provider.type}, ${provider.category}): ${provider.available ? '✅ Available' : '❌ Unavailable'}`,
      );
    });
    return providers;
  } catch (error) {
    // No fallback - fail clearly when real providers not available
    logger.error('❌ LLM Provider listing failed');
    throw new Error(
      `LLM Provider listing failed - @claude-zen/llm-providers package required: ${error}`,
    );
  }
}

/**
 * Execute GitHub Models API task for real agentic development
 *
 * Unlike GitHub CLI (which only provides command suggestions),
 * this provides actual API access to GitHub's hosted AI models.
 */
export async function executeGitHubModelsTask(
  prompt: string,
  options: { token: string; model?: string } = { token: '' },
): Promise<string> {
  try {
    const { executeGitHubModelsTask } = await import(
      '@claude-zen/llm-providers'
    );
    return executeGitHubModelsTask(prompt, options);
  } catch (error) {
    // No fallback - fail clearly when real providers not available
    throw new Error(
      `GitHub Models task execution failed - @claude-zen/llm-providers package required: ${error}`,
    );
  }
}

// Compatibility exports for swarm coordination
export async function executeSwarmCoordinationTask(
  task: string,
  options?: Record<string, unknown>,
): Promise<string> {
  try {
    const { executeSwarmCoordinationTask } = await import(
      '@claude-zen/llm-providers'
    );
    return executeSwarmCoordinationTask(task, options);
  } catch (error) {
    // No fallback - fail clearly when real providers not available
    throw new Error(
      `Swarm coordination task execution failed - @claude-zen/llm-providers package required: ${error}`,
    );
  }
}

/**
 * Strategic facade metadata for intelligence LLM providers
 */
export const llmProvidersFacade = {
  name: '@claude-zen/intelligence/llm-providers',
  description:
    'Strategic facade for @claude-zen/llm-providers with CLI tools and direct APIs',
  version: '1.0.0',
  capabilities: [
    'Claude Code CLI integration for file operations',
    'GitHub Models API for real agentic development',
    'Direct API access to multiple LLM providers',
    'Intelligent provider selection by capability',
    'Swarm coordination task execution',
    'CLI and API provider unified interface',
  ],
  delegation: {
    target: '@claude-zen/llm-providers',
    fallback: 'Compatibility implementations for compilation safety',
  },
};
