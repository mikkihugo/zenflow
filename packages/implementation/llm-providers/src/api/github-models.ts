/**
 * @fileoverview GitHub Models API Integration
 *
 * GitHub Models API provides access to various AI models hosted by GitHub.
 * This is REAL API access, not just command suggestions.
 *
 * AVAILABLE NOW: https://docs.github.com/en/github-models
 *
 * @example Basic Usage
 * ```typescript`
 * const github = new GitHubModelsAPI({
 *   token: process.env.GITHUB_TOKEN,
 *   model: 'gpt-4o'  // GitHub hosts multiple models'
 * });
 *
 * const response = await github.execute({
 *   messages: [{ role: 'user', content: 'Create a React authentication system' }]'
 * });
 * ````
 */

import { getLogger } from '@claude-zen/foundation/logging';

import type {
  APIProvider,
  APIRequest,
  APIResult,
} from '../types/api-providers';

import { initializeGitHubModelsDB } from './github-models-db';

const logger = getLogger('GitHubModelsAPI');'

export interface GitHubModelsOptions {
  token: string;
  model?: 
    | 'openai/gpt-4.1''
    | 'openai/gpt-4o''
    | 'openai/gpt-5''
    | 'openai/o1''
    | 'meta/llama-3.3-70b-instruct''
    | 'mistral-ai/mistral-large-2411''
    | 'deepseek/deepseek-r1''
    | 'xai/grok-3;
  baseURL?: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * GitHub Models API Provider - Real agentic development
 *
 * Uses GitHub's hosted AI models for development tasks.'
 * Perfect for code generation, architecture design, and development planning.
 */
export class GitHubModelsAPI implements APIProvider {
  readonly id = 'github-models-api';
  readonly name = 'GitHub Models API';
  readonly type = 'api' as const;'

  private options: Required<GitHubModelsOptions>;

  constructor(options: GitHubModelsOptions) {
    this.options = {
      model: 'openai/gpt-4.1',
      baseURL: 'https://models.github.ai',
      maxTokens: 4000, // GitHub Models limit: 4k output tokens
      temperature: 0.7,
      ...options,
    };

    // Initialize database on first use
    this.initializeDatabase();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      await initializeGitHubModelsDB();
    } catch (error) {
      logger.warn('Failed to initialize GitHub Models database:', error);'
    }
  }

  /**
   * Execute development task using GitHub Models API
   */
  async execute(request: APIRequest): Promise<APIResult> {
    try {
      logger.info(
        `Executing GitHub Models API request with model: ${this.options.model}``
      );

      const response = await fetch(
        `${this.options.baseURL}/inference/chat/completions`,`
        {
          method: 'POST',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${this.options.token}`,`
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: this.options.model,
            messages: request.messages,
            max_tokens: this.options.maxTokens,
            temperature: this.options.temperature,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `GitHub Models API error: ${response.status} ${response.statusText}``
        );
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content||';

      return ok({
        content,
        metadata: {
          model: this.options.model,
          provider: 'github-models',
          tokens: data.usage?.total_tokens,
          executionTime: Date.now(),
        },
      });
    } catch (error) {
      logger.error('GitHub Models API execution failed:', error);'
      return err({
        code: API_ERROR_CODES.NETWORK_ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          provider: 'github-models',
          executionTime: Date.now(),
        },
        cause: error instanceof Error ? error : undefined,
      });
    }
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): APIProviderCapabilities {
    const models = githubModelsDB.getAllModels();
    const hasMultimodal = models.some((m) => m.supportsMultimodal);

    return {
      features: {
        streaming: false, // No streaming support yet
        multimodal: hasMultimodal, // Based on available models
        reasoning: true, // Advanced reasoning
        coding: true, // Excellent for coding
        planning: true, // Good for planning
        imageGeneration: false, // Text only
        webAccess: false, // No web browsing
        customTools: false, // No custom tools
      },
      models: models.map((m) => m.id),
      maxTokens: 4000, // GitHub Models output limit
      contextWindow: 8000, // GitHub Models input limit (most models)
      pricing: {
        inputTokens: 0.00025, // Approximate, varies by model
        outputTokens: 0.001, // Approximate, varies by model
        currency: 'USD',
      },
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: 0,
      lastRequestTime: Date.now(),
    };
  }

  /**
   * List available models from GitHub Models database (updated hourly)
   */
  async listModels(): Promise<string[]> {
    try {
      // Get models from database (updated hourly from 'gh models list')'
      const models = githubModelsDB.getAllModels();

      if (models.length === 0) {
        logger.warn('📋 No models in database, forcing update...');'
        await githubModelsDB.updateModels();
        const updatedModels = githubModelsDB.getAllModels();
        return updatedModels.map((m) => m.id);
      }

      const modelIds = models.map((m) => m.id);
      const stats = githubModelsDB.getStats();

      logger.info(`📋 GitHub Models from database: ${modelIds.length} models`);`
      logger.info(
        `📊 Categories: low:$stats.byCategory.low, medium:$stats.byCategory.medium, high:$stats.byCategory.high``
      );
      logger.info(`🖼️ Multimodal models: ${stats.multimodal}`);`
      logger.info(`🔄 Last updated: $stats.lastUpdate.toISOString()`);`

      return modelIds;
    } catch (error) {
      logger.error('Failed to list GitHub Models from database:', error);'

      // Emergency fallback with context sizes noted
      const emergencyModels = [
        'openai/gpt-4.1', // 8k context, 4k output'
        'openai/gpt-4o', // 8k context, 4k output, multimodal'
        'openai/gpt-5', // 8k context, 4k output'
        'openai/o1', // 8k context, 4k output'
        'meta/llama-3.3-70b-instruct', // 8k context, 4k output'
        'mistral-ai/mistral-large-2411', // 8k context, 4k output'
        'deepseek/deepseek-r1', // 8k context, 4k output'
        'xai/grok-3', // 8k context, 4k output'
      ];

      logger.info(
        `📋 Using emergency fallback: ${emergencyModels.length} models (all 8k/4k limits)``
      );
      return emergencyModels;
    }
  }

  /**
   * Health check for the provider
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Health check doesn't need auth for GitHub Models'
      const response = await fetch(`${this.options.baseURL}/models`, {`
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create GitHub Models API provider instance
 */
export function createGitHubModelsProvider(
  options: GitHubModelsOptions
): GitHubModelsAPI {
  return new GitHubModelsAPI(options);
}

/**
 * Execute task with GitHub Models API
 */
export async function executeGitHubModelsTask(
  prompt: string,
  options: GitHubModelsOptions
): Promise<string> {
  const provider = createGitHubModelsProvider(options);
  const response = await provider.execute({
    messages: [{ role: 'user', content: prompt }],
  });

  if (response.isErr()) {
    throw new Error(`GitHub Models task failed: ${response.error.message}`);`
  }

  return response.value.content;
}

/**
 * GitHub Models API configuration and metadata
 */
export const gitHubModelsConfig = {
  name: 'GitHub Models API',
  description: 'Access to GitHub Models marketplace - various AI models',
  version: '1.0.0',
  capabilities: {
    conversational: true,
    multimodal: true,
    reasoning: true,
    coding: true,
    planning: true,
  },
  authentication: {
    type: 'bearer-token',
    tokenFormat: 'ghp_xxx (Personal Access Token)',
    scopes: ['models'],
    requiredHeaders: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  },
  endpoints: {
    chat: 'https://models.github.ai/inference/chat/completions',
    models: 'https://models.github.ai/models',
  },
  modelFormat:
    'provider/model-name (e.g., openai/gpt-4.1, anthropic/claude-3-5-sonnet)',
};
